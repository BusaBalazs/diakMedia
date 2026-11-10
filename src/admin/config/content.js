// Content rules shared by the editor, the card editor and the data layer:
// field limits, character counting, validation and the content <-> card relationship.
import { FORMATS } from './formats.js';

// Field-specific limits (kept separate from the per-format TOTAL limit, which is configurable in the settings).
export const FIELD_LIMITS = {
  title: 120, intro: 300, pollQuestion: 300, pollOption: 120, quote: 500, quoteSource: 120, explanation: 1000, caption: 200,
  closing: 300, sources: 1000, authorDisplayName: 60, cardTitle: 90, cardDescription: 200,
};
export const MAX_STORY_IMAGES = 12;

const len = (s) => (s || '').trim().length;

// Characters counted against the format's total limit (title, sources and card texts have their own limits).
export function usedChars(format, d = {}) {
  switch (format) {
    case 'short_article':
    case 'poll': return len(d.intro) + len(d.body) + len(d.question) + (d.options || []).reduce((n, option) => n + len(option), 0);
    case 'one_thought': return len(d.quote) + len(d.explanation);
    case 'visual_story': return len(d.intro) + (d.images || []).reduce((n, i) => n + len(i.caption), 0) + len(d.closing);
    case 'opinion': return len(d.intro) + len(d.body);
    default: return 0;
  }
}
export const limitFor = (format, limits) => limits?.[format] ?? FORMATS[format].defaultLimit;

export function emptyContentData(format) {
  switch (format) {
    case 'short_article': return { intro: '', body: '', sources: '', imageUrl: '', imageAlt: '' };
    case 'poll': return { intro: '', body: '', sources: '', imageUrl: '', imageAlt: '', question: '', options: ['', ''], endsAt: '' };
    case 'one_thought': return { quote: '', explanation: '', isOwn: true, quoteSource: '', imageUrl: '' };
    case 'visual_story': return { intro: '', images: [], closing: '' };
    case 'opinion': return { intro: '', body: '', sources: '', authorDisplayName: '' };
    default: return {};
  }
}

export function deriveTitle(format, title, d = {}) {
  if (format === 'one_thought') {
    const q = (d.quote || '').trim();
    return q.length > 70 ? `${q.slice(0, 67).trimEnd()}…` : q;
  }
  return (title || '').trim();
}

export const featuredImage = (format, d = {}) => (format === 'visual_story' ? d.images?.[0]?.url || '' : d.imageUrl || '');
export const subtitleOf = (format, d = {}) => (format === 'one_thought' ? d.explanation || '' : d.intro || '');
const cardDescriptionFromContent = (content) => {
  const d = content.contentData || {};
  return (subtitleOf(content.format, d) || d.body || d.quote || d.images?.[0]?.caption || content.title || '').trim().slice(0, FIELD_LIMITS.cardDescription);
};

// Returns { ok, errors: { field: message } }. `soft` skips required-field checks (used for saving drafts).
export function validateContent({ format, category, title, contentData: d }, limits, { soft = false } = {}) {
  const e = {};
  const need = (cond, key, msg) => { if (!soft && cond) e[key] = msg; };
  const over = (value, max, key) => { if (len(value) > max) e[key] = `Legfeljebb ${max} karakter lehet.`; };
  need(!category, 'category', 'Válassz kategóriát.');
  if (format !== 'one_thought') { need(!len(title), 'title', 'A cím kötelező.'); over(title, FIELD_LIMITS.title, 'title'); }
  if (format === 'short_article' || format === 'poll') {
    need(!len(d.intro), 'intro', 'A bevezető kötelező.'); over(d.intro, FIELD_LIMITS.intro, 'intro');
    need(!len(d.body), 'body', 'A teljes szöveg kötelező.');
  }
  if (format === 'poll') {
    need(!len(d.question), 'question', 'A szavazás kérdése kötelező.');
    over(d.question, FIELD_LIMITS.pollQuestion, 'question');
    const options = (d.options || []).map((option) => (option || '').trim());
    if (options.length > 6) e.options = 'Legfeljebb hat válaszlehetőség adható meg.';
    else if (!soft && (options.length < 2 || options.filter(Boolean).length < 2)) e.options = 'Adj meg legalább két válaszlehetőséget.';
    else if (!soft && options.some((option) => !option)) e.options = 'Töltsd ki az összes válaszlehetőséget.';
    else if (!soft && new Set(options.map((option) => option.toLocaleLowerCase('hu-HU'))).size !== options.length) e.options = 'A válaszlehetőségek legyenek különbözőek.';
    if (options.some((option) => option.length > FIELD_LIMITS.pollOption)) e.options = `Egy válasz legfeljebb ${FIELD_LIMITS.pollOption} karakter lehet.`;
    const endDate = d.endsAt?.toDate ? d.endsAt.toDate() : d.endsAt instanceof Date ? d.endsAt : new Date(d.endsAt);
    need(!d.endsAt || Number.isNaN(endDate.getTime()) || endDate.getTime() <= Date.now(), 'endsAt', 'Adj meg egy jövőbeli lezárási időpontot.');
  }
  if (format === 'one_thought') {
    need(!len(d.quote), 'quote', 'A gondolat vagy idézet kötelező.'); over(d.quote, FIELD_LIMITS.quote, 'quote');
    over(d.explanation, FIELD_LIMITS.explanation, 'explanation');
    need(!d.isOwn && !len(d.quoteSource), 'quoteSource', 'Add meg, kitől származik az idézet.');
  }
  if (format === 'visual_story') {
    need(!(d.images || []).length, 'images', 'Legalább egy kép kötelező.');
    over(d.intro, FIELD_LIMITS.intro, 'intro'); over(d.closing, FIELD_LIMITS.closing, 'closing');
    (d.images || []).forEach((img, i) => over(img.caption, FIELD_LIMITS.caption, `caption-${i}`));
  }
  if (format === 'opinion') {
    need(!len(d.body), 'body', 'A véleményed kifejtése kötelező.'); over(d.intro, FIELD_LIMITS.intro, 'intro');
    need(!len(d.authorDisplayName), 'authorDisplayName', 'Add meg a neved vagy a választott megjelenési neved.');
    if (category && category !== 'velemeny') e.category = 'A vélemény mindig a Vélemény rovatba kerül.';
  }
  over(d.sources, FIELD_LIMITS.sources, 'sources');
  if (usedChars(format, d) > limitFor(format, limits)) e.total = `Túllépted a ${limitFor(format, limits)} karakteres korlátot.`;
  return { ok: Object.keys(e).length === 0, errors: e };
}

export function initialCard(content) {
  const img = featuredImage(content.format, content.contentData);
  const description = cardDescriptionFromContent(content);
  return {
    title: content.title,
    description,
    imageUrl: img,
    // What the card was last synchronised with: lets us warn the editor when the article changes afterwards.
    snapshot: { title: content.title, description, imageUrl: img },
  };
}

export function cardOutOfSync(content) {
  const c = content.cardData;
  if (!c?.snapshot) return null;
  const img = featuredImage(content.format, content.contentData);
  const description = cardDescriptionFromContent(content);
  const changed = [];
  if ((c.snapshot.title || '') !== (content.title || '')) changed.push('cím');
  if (c.snapshot.description !== undefined && c.snapshot.description !== description) changed.push('bevezető');
  if ((c.snapshot.imageUrl || '') !== (img || '')) changed.push('kiemelt kép');
  return changed.length ? changed : null;
}

export function validateCard(content) {
  const c = content.cardData || {};
  const e = {};
  if (!len(c.title)) e.title = 'A kártya címe kötelező.';
  else if (len(c.title) > FIELD_LIMITS.cardTitle) e.title = `Legfeljebb ${FIELD_LIMITS.cardTitle} karakter lehet.`;
  if (!len(c.description)) e.description = 'A kártya leírása kötelező: ez a rövid felvezető jelenik meg a főoldalon.';
  else if (len(c.description) > FIELD_LIMITS.cardDescription) e.description = `Legfeljebb ${FIELD_LIMITS.cardDescription} karakter lehet.`;
  return { ok: Object.keys(e).length === 0, errors: e };
}

// A content item can only enter the editorial workflow with valid content AND a valid card.
export function validatePublication(content, limits) {
  const a = validateContent(content, limits);
  const b = validateCard(content);
  return { ok: a.ok && b.ok, contentErrors: a.errors, cardErrors: b.errors };
}
