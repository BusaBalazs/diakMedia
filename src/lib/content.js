import { articles } from '../data/articles.js';
import { categories, categoryById } from '../data/categories.js';
import { schools, schoolById, DEMO_SCHOOL_ID } from '../data/schools.js';
import { authorById } from '../data/authors.js';
import { topicById } from '../data/topics.js';

// ---- Publication scopes -------------------------------------------------
// national: articles selected for the nationwide publication.
// school:   articles visible in ONE school's own publication (the schoolId passed in).
//           Articles that belong to another school never match.
// all:      national plus the chosen school's own publication.
export const SCOPES = {
  all: { id: 'all', param: 'mind', test: (a, sid) => a.visibility.national || (a.visibility.school && a.schoolId === sid) },
  national: { id: 'national', param: 'orszagos', test: (a) => a.visibility.national },
  school: { id: 'school', param: 'iskolai', test: (a, sid) => a.visibility.school && a.schoolId === sid },
};

export function scopeLabel(scopeId, schoolId = DEMO_SCHOOL_ID) {
  if (scopeId === 'national') return 'Országos lap';
  if (scopeId === 'school') return schoolById[schoolId]?.publication?.name || 'Iskolai lap';
  return 'Mind';
}

export function scopeFromParam(param) {
  return Object.values(SCOPES).find((s) => s.param === param) || SCOPES.all;
}

// An article can be opened if it appears in the nationwide or in its own school's publication.
export const isPublished = (a) => a.visibility.national || a.visibility.school;

// ---- Selectors ------------------------------------------------------------
const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export function getArticles(scopeId = 'all', schoolId = DEMO_SCHOOL_ID) {
  return articles.filter((a) => SCOPES[scopeId].test(a, schoolId)).sort(byDateDesc);
}

export function getArticleBySlug(slug) {
  return articles.find((a) => a.slug === slug) || null;
}

export function getBySlot(slot, scopeId = 'all', schoolId = DEMO_SCHOOL_ID) {
  return getArticles(scopeId, schoolId).filter((a) => a.slots?.includes(slot));
}

export function getRelated(article, limit = 3) {
  // Only what a reader of this article's context could see anyway.
  const pool = articles.filter((a) => a.id !== article.id && (a.visibility.national || (a.visibility.school && a.schoolId === article.schoolId)));
  const score = (a) =>
    (a.topicId && a.topicId === article.topicId ? 4 : 0) +
    (a.categoryId === article.categoryId ? 3 : 0) +
    a.tags.filter((t) => article.tags.includes(t)).length * 2 +
    (a.schoolId === article.schoolId ? 1 : 0);
  return pool
    .map((a) => ({ a, s: score(a) }))
    .sort((x, y) => y.s - x.s || byDateDesc(x.a, y.a))
    .slice(0, limit)
    .map((x) => x.a);
}

export function getTopicArticles(topicId) {
  return articles.filter((a) => a.topicId === topicId && a.visibility.national).sort(byDateDesc);
}

export function categoryCounts(scopeId = 'all', schoolId = DEMO_SCHOOL_ID) {
  const list = getArticles(scopeId, schoolId);
  return Object.fromEntries(categories.map((c) => [c.id, list.filter((a) => a.categoryId === c.id).length]));
}

// Number of nationwide articles per school.
export function schoolCounts() {
  const list = getArticles('national');
  return Object.fromEntries(schools.map((s) => [s.id, list.filter((a) => a.schoolId === s.id).length]));
}

// Number of articles in each school's own publication.
export function publicationCounts() {
  return Object.fromEntries(schools.map((s) => [s.id, articles.filter((a) => a.visibility.school && a.schoolId === s.id).length]));
}

export function enrich(article) {
  return {
    ...article,
    category: categoryById[article.categoryId],
    school: schoolById[article.schoolId],
    author: authorById[article.authorId],
    topic: article.topicId ? topicById[article.topicId] : null,
  };
}

// ---- Search ---------------------------------------------------------------
export function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function searchArticles(query, scopeId = 'all', schoolId = DEMO_SCHOOL_ID) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return getArticles(scopeId, schoolId);
  return getArticles(scopeId, schoolId).filter((a) => {
    const e = enrich(a);
    const haystack = normalize(
      [a.title, a.excerpt, e.category.name, e.school.name, e.school.city, e.author.name, a.tags.join(' ')].join(' ')
    );
    return terms.every((t) => haystack.includes(t));
  });
}

// Live filtering for the school picker: name, city and publication name.
export function filterSchools(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return schools;
  return schools.filter((s) => {
    const hay = normalize(`${s.name} ${s.city} ${s.publication.name}`);
    return terms.every((t) => hay.includes(t));
  });
}

// ---- Publication labels ---------------------------------------------------
export function publicationLabels(article) {
  const labels = [];
  if (article.visibility.school) labels.push({ id: 'school', text: schoolById[article.schoolId].publication.name });
  if (article.visibility.national) labels.push({ id: 'national', text: 'Országos lap' });
  return labels;
}

// ---- Dates ------------------------------------------------------------------
const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}. ${MONTHS[m - 1]} ${d}.`;
}

export { DEMO_SCHOOL_ID };
