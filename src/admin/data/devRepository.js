// Temporary development data layer: in-memory state persisted to localStorage, same async API as the Firestore repository.
// It enforces the same visibility and workflow rules as the security rules do, so the whole feature set can be tried
// without a Firebase project. Use "Fejlesztői adatok visszaállítása" in the user menu to reset it.
import { seesAllSchoolContent } from '../config/roles.js';
import { assertAllowed, canEditContent } from '../config/transitions.js';
import { validatePublication, deriveTitle, emptyContentData } from '../config/content.js';
import { devContent, devMembers, devNotes, devSchools, devSettings, devSuggestions, devTopics } from './devSeed.js';

const KEY = 'diakmedia.admin.dev.v4';
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));
const now = () => new Date().toISOString();
const rid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
let memoryVoterId;
function pollVoterId() {
  try {
    let id = window.localStorage.getItem('diakmedia.poll.voter');
    if (!id) { id = rid('v'); window.localStorage.setItem('diakmedia.poll.voter', id); }
    return id;
  } catch {
    memoryVoterId ||= rid('v');
    return memoryVoterId;
  }
}

const seed = () => clone({ content: devContent, notes: devNotes, topics: devTopics, suggestions: devSuggestions, settings: devSettings });
let state;
function load() {
  if (state) return state;
  try { const raw = window.localStorage.getItem(KEY); state = raw ? JSON.parse(raw) : seed(); } catch { state = seed(); }
  return state;
}
function save() { try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota: keep working in memory */ } }

const canSee = (c, { role, uid }) => (role === 'author' ? c.authorId === uid : true);

export const devRepository = {
  mode: 'dev',
  resetDev() { state = seed(); save(); },

  async getSchool(id) { await delay(100); return devSchools[id] || null; },
  async listMembers({ schoolId }) { await delay(100); return devMembers.filter((m) => m.schoolId === schoolId); },

  // ---- content ----
  async listContent({ schoolId, role, uid }) {
    await delay();
    return clone(load().content.filter((c) => c.schoolId === schoolId && canSee(c, { role, uid })));
  },
  async reassignDraft(id, memberUid, { user }) {
    await delay(120);
    if (!['editor', 'teacher'].includes(user.role)) throw new Error('Piszkozatot csak szerkesztő vagy tanár ruházhat át.');
    const s = load();
    const c = s.content.find((x) => x.id === id && x.schoolId === user.schoolId);
    const member = devMembers.find((x) => x.uid === memberUid && x.schoolId === user.schoolId);
    if (!c || c.status !== 'draft') throw new Error('Csak piszkozatot lehet átruházni.');
    if (!member || !['editor', 'author'].includes(member.role)) throw new Error('Tanárnak nem lehet piszkozatot kijelölni.');
    Object.assign(c, { authorId: member.uid, authorName: member.displayName, updatedAt: now() });
    const topic = c.topicId && s.topics.find((x) => x.id === c.topicId);
    if (topic?.contentId === c.id) Object.assign(topic, { claimedBy: member.uid, claimedByName: member.displayName });
    save();
    return clone(c);
  },
  async getContent(id, ctx) {
    await delay(150);
    const c = load().content.find((x) => x.id === id);
    return c && c.schoolId === ctx.schoolId && canSee(c, ctx) ? clone(c) : null;
  },
  // Create or update a draft. Only the author can edit, and only while the item is a draft / has requested changes.
  async saveContent(input, { user }) {
    await delay(150);
    const s = load();
    const title = deriveTitle(input.format, input.title, input.contentData);
    if (input.id) {
      const c = s.content.find((x) => x.id === input.id);
      if (!c || !canEditContent(user, c)) throw new Error('Ezt a tartalmat most nem szerkesztheted.');
      Object.assign(c, { title, category: input.category, contentData: input.contentData, cardData: input.cardData ?? c.cardData, topicId: input.topicId ?? c.topicId, updatedAt: now() });
      save();
      return clone(c);
    }
    const c = {
      id: rid('c'), schoolId: user.schoolId, authorId: user.uid, authorName: user.displayName, title, format: input.format, category: input.category,
      status: 'draft', contentData: input.contentData, cardData: null, topicId: input.topicId || null,
      createdAt: now(), updatedAt: now(), submittedAt: null, publishedAt: null,
    };
    s.content.unshift(c);
    if (c.topicId) { const t = s.topics.find((x) => x.id === c.topicId); if (t) t.contentId = c.id; }
    save();
    return clone(c);
  },
  async saveCard(id, cardData, { user }) {
    await delay(120);
    const c = load().content.find((x) => x.id === id);
    if (!c || !canEditContent(user, c)) throw new Error('A kártyát most nem szerkesztheted.');
    c.cardData = cardData; c.updatedAt = now(); save();
    return clone(c);
  },
  // Entering the editorial workflow: needs valid content AND a valid card.
  async submitContent(id, { user }) {
    await delay(200);
    const s = load();
    const c = s.content.find((x) => x.id === id);
    if (!c || !canEditContent(user, c)) throw new Error('Ezt a tartalmat most nem lehet beküldeni.');
    const v = validatePublication(c, s.settings.limits);
    if (!v.ok) throw new Error('A tartalom vagy a kártya hiányos, ezért nem küldhető be.');
    c.status = 'submitted'; c.submittedAt = now(); c.updatedAt = now(); c.feedback = null;
    save();
    return clone(c);
  },
  async publishContent(id, { user }) {
    await delay(200);
    const s = load();
    const c = s.content.find((x) => x.id === id);
    if (user.role !== 'teacher' || !c || !canEditContent(user, c)) throw new Error('Közvetlenül csak a saját tartalmadat publikálhatod tanári jogosultsággal.');
    const v = validatePublication(c, s.settings.limits);
    if (!v.ok) throw new Error('A tartalom vagy a kártya hiányos, ezért nem publikálható.');
    c.status = 'published'; c.submittedAt = now(); c.publishedAt = c.submittedAt; c.updatedAt = c.submittedAt; c.feedback = null;
    const topic = c.topicId ? s.topics.find((x) => x.id === c.topicId) : null;
    if (topic) topic.status = 'done';
    save();
    return clone(c);
  },
  async transition(id, actionId, { user, note }) {
    await delay(200);
    const s = load();
    const c = s.content.find((x) => x.id === id);
    if (!c || c.schoolId !== user.schoolId) throw new Error('A tartalom nem található.');
    const a = assertAllowed(user, c, actionId);
    if (a.note === 'required' && !(note || '').trim()) throw new Error('Ehhez a művelethez meg kell adni egy megjegyzést.');
    c.status = a.to; c.updatedAt = now();
    if (a.to === 'published') c.publishedAt = now();
    if (a.id === 'restore_to_draft') { c.feedback = null; c.publishedAt = null; c.submittedAt = null; }
    if (a.feedback) c.feedback = note.trim(); else if (a.to === 'published') c.feedback = null;
    if ((note || '').trim()) s.notes.push({ id: rid('n'), contentId: id, schoolId: c.schoolId, authorId: user.uid, authorName: user.displayName, type: a.feedback ? 'feedback' : 'internal', text: note.trim(), createdAt: now() });
    // Topic list rules: published -> the idea disappears; withdrawn -> the claimed idea becomes free again.
    const t = c.topicId ? s.topics.find((x) => x.id === c.topicId) : null;
    if (t) {
      if (a.to === 'published') t.status = 'done';
      if (a.to === 'withdrawn' && t.status === 'claimed') Object.assign(t, { status: 'open', claimedBy: null, claimedByName: null, contentId: null });
    }
    save();
    return clone(c);
  },
  async listPublishedPolls({ schoolId }) {
    await delay(100);
    return clone(load().content.filter((c) => c.schoolId === schoolId && c.status === 'published' && c.format === 'poll'));
  },
  async listPublishedContent({ schoolId }) {
    await delay(100);
    return clone(load().content
      .filter((c) => c.schoolId === schoolId && c.status === 'published' && c.cardData)
      .sort((a, b) => Date.parse(b.publishedAt || b.submittedAt || b.createdAt) - Date.parse(a.publishedAt || a.submittedAt || a.createdAt)));
  },
  async getPublishedContent(id) {
    await delay(100);
    const content = load().content.find((item) => item.id === id && item.status === 'published');
    return content ? clone(content) : null;
  },
  async getPollState(contentId, poll) {
    await delay(80);
    const votes = load().pollVotes || [];
    const voterId = pollVoterId();
    const voterVote = votes.find((v) => v.pollId === contentId && v.voterId === voterId);
    return {
      counts: (poll.options || []).map((option) => votes.filter((v) => v.pollId === contentId && v.option === option).length),
      votedOptionIndex: voterVote ? (poll.options || []).indexOf(voterVote.option) : null,
    };
  },
  async votePoll(contentId, optionIndex) {
    await delay(120);
    const s = load();
    const poll = s.content.find((c) => c.id === contentId);
    if (!poll || poll.status !== 'published' || poll.format !== 'poll') throw new Error('Ez a szavazás nem érhető el.');
    if (!poll.contentData.endsAt || Date.parse(poll.contentData.endsAt) <= Date.now()) throw new Error('A szavazás lezárult.');
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.contentData.options.length) throw new Error('Érvénytelen válaszlehetőség.');
    s.pollVotes ||= [];
    const voterId = pollVoterId();
    if (s.pollVotes.some((v) => v.pollId === contentId && v.voterId === voterId)) throw new Error('Erre a szavazásra már leadtad a szavazatodat.');
    s.pollVotes.push({ pollId: contentId, option: poll.contentData.options[optionIndex], voterId });
    save();
    return this.getPollState(contentId, poll.contentData);
  },

  // ---- notes ----
  async listNotes(contentId, { role }) {
    await delay(100);
    return clone(load().notes.filter((n) => n.contentId === contentId && (role !== 'author' || n.type === 'feedback')).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)));
  },
  async addNote(contentId, text, { user }) {
    await delay(120);
    if (!['editor', 'teacher'].includes(user.role)) throw new Error('Belső jegyzetet csak szerkesztő vagy tanár írhat.');
    const n = { id: rid('n'), contentId, schoolId: user.schoolId, authorId: user.uid, authorName: user.displayName, type: 'internal', text: text.trim(), createdAt: now() };
    load().notes.push(n); save();
    return clone(n);
  },

  // ---- topic ideas (notebook) ----
  async listTopics({ schoolId }) {
    await delay(150);
    return clone(load().topics.filter((t) => t.schoolId === schoolId && t.status !== 'done').sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  },
  async createTopic({ title, note, category }, { user }) {
    await delay(120);
    if (!['editor', 'teacher', 'author'].includes(user.role)) throw new Error('Témát csak szerkesztőségi tag javasolhat.');
    const t = { id: rid('t'), schoolId: user.schoolId, title: title.trim(), note: (note || '').trim(), category: category || '', status: 'open', createdBy: user.uid, createdByName: user.displayName, createdAt: now(), claimedBy: null, claimedByName: null, contentId: null };
    load().topics.unshift(t); save();
    return clone(t);
  },
  async assignTopic(id, memberUid, { user }) {
    await delay(150);
    if (!['editor', 'teacher'].includes(user.role)) throw new Error('Témát csak szerkesztő vagy tanár jelölhet ki.');
    const s = load();
    const t = s.topics.find((x) => x.id === id && x.schoolId === user.schoolId);
    const member = devMembers.find((x) => x.uid === memberUid && x.schoolId === user.schoolId);
    if (!t || t.status !== 'open') throw new Error('Csak szabad témát lehet kijelölni.');
    if (!member || !['editor', 'author'].includes(member.role)) throw new Error('Tanárnak nem lehet témát kijelölni.');
    if (t.contentId) throw new Error('Ehhez a témához már tartozik piszkozat.');
    const timestamp = now();
    const c = {
      id: rid('c'), schoolId: user.schoolId, authorId: member.uid, authorName: member.displayName,
      title: t.title, format: 'short_article', category: t.category || '', status: 'draft',
      contentData: emptyContentData('short_article'), cardData: null, topicId: t.id,
      createdAt: timestamp, updatedAt: timestamp, submittedAt: null, publishedAt: null,
    };
    s.content.unshift(c);
    Object.assign(t, { status: 'claimed', claimedBy: member.uid, claimedByName: member.displayName, claimedAt: timestamp, contentId: c.id });
    save();
    return clone(c);
  },
  async claimTopic(id, { user }) {
    await delay(150);
    const t = load().topics.find((x) => x.id === id);
    if (!t || t.status === 'done') throw new Error('Ez a téma már nem elérhető.');
    if (t.status === 'claimed' && t.claimedBy !== user.uid) throw new Error(`Ezt a témát ${t.claimedByName} már lefoglalta.`);
    Object.assign(t, { status: 'claimed', claimedBy: user.uid, claimedByName: user.displayName, claimedAt: now() });
    save();
    return clone(t);
  },
  async releaseTopic(id, { user }) {
    await delay(120);
    const t = load().topics.find((x) => x.id === id);
    if (!t) throw new Error('A téma nem található.');
    if (t.claimedBy !== user.uid && user.role !== 'teacher') throw new Error('Csak a lefoglaló vagy a tanár szabadíthatja fel.');
    Object.assign(t, { status: 'open', claimedBy: null, claimedByName: null, contentId: null });
    save();
    return clone(t);
  },
  async discardTopic(id, { user }) {
    await delay(120);
    const s = load();
    const t = s.topics.find((x) => x.id === id);
    if (!t) throw new Error('A téma nem található.');
    if (t.status === 'claimed' && t.claimedBy !== user.uid && user.role !== 'teacher') throw new Error(`Ezt a témát ${t.claimedByName} lefoglalta, ezért nem vetheted el.`);
    s.topics = s.topics.filter((x) => x.id !== id); save();
  },
  async countOpenTopics({ schoolId }) { await delay(80); return load().topics.filter((t) => t.schoolId === schoolId && t.status === 'open').length; },

  // ---- student suggestions ----
  async listSuggestions({ schoolId }) {
    await delay(150);
    return clone(load().suggestions.filter((x) => x.schoolId === schoolId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  },
  async createSuggestion({ category, title, text }, { user }) {
    await delay(150);
    const x = { id: rid('s'), schoolId: user.schoolId, authorId: user.uid, authorName: user.displayName, category, title: title.trim(), text: (text || '').trim(), status: 'new', note: '', createdAt: now() };
    load().suggestions.unshift(x); save();
    return clone(x);
  },
  async updateSuggestion(id, patch, { user }) {
    await delay(120);
    if (!['editor', 'teacher'].includes(user.role)) throw new Error('A javaslatokat a szerkesztőség kezeli.');
    const x = load().suggestions.find((s) => s.id === id);
    if (!x) throw new Error('A javaslat nem található.');
    Object.assign(x, { status: patch.status ?? x.status, note: patch.note ?? x.note, reviewedBy: user.displayName }); save();
    return clone(x);
  },
  async countNewSuggestions({ schoolId }) { await delay(100); return load().suggestions.filter((s) => s.schoolId === schoolId && s.status === 'new').length; },

  // ---- settings ----
  async getSettings(schoolId) { await delay(80); return clone(load().settings.schoolId === schoolId ? load().settings : { schoolId, limits: {} }); },
  async saveSettings(settings, { user }) {
    if (user.role !== 'teacher') throw new Error('A beállításokat csak a tanár módosíthatja.');
    await delay(120); load().settings = { ...settings, schoolId: user.schoolId }; save();
    return clone(load().settings);
  },

  // ---- images ----
  // Development mode keeps the (already compressed) image as a data URL; Firebase mode uploads to Storage.
  async uploadImage(file) { await delay(150); return file.dataUrl; },
};
