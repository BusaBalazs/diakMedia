import { articles } from '../data/articles.js';
import { categories, categoryById } from '../data/categories.js';
import { DEMO_SCHOOL_ID, schoolById } from '../data/schools.js';
import { authorById } from '../data/authors.js';
import { summaries, quotes, stories } from '../data/quick.js';

export const isPublished = (article) => article.visibility.school;

const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export function getArticles() {
  return articles.filter(isPublished).sort(byDateDesc);
}

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug) || null;
}

export function getBySlot(slot) {
  return getArticles().filter((article) => article.slots?.includes(slot));
}

export function getRelated(article, limit = 3) {
  return articles
    .filter((item) => item.id !== article.id && isPublished(item))
    .map((item) => ({
      item,
      score:
        (item.categoryId === article.categoryId ? 3 : 0) +
        item.tags.filter((tag) => article.tags.includes(tag)).length * 2,
    }))
    .sort((a, b) => b.score - a.score || byDateDesc(a.item, b.item))
    .slice(0, limit)
    .map(({ item }) => item);
}

export function categoryCounts() {
  const list = getArticles();
  return Object.fromEntries(categories.map((category) => [
    category.id,
    list.filter((article) => article.categoryId === category.id).length,
  ]));
}

export function enrich(article) {
  return {
    ...article,
    category: categoryById[article.categoryId],
    school: schoolById[article.schoolId],
    author: authorById[article.authorId],
  };
}

export function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function searchArticles(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return getArticles();
  return getArticles().filter((article) => {
    const enriched = enrich(article);
    const haystack = normalize([
      article.title,
      article.excerpt,
      enriched.category.name,
      enriched.school.name,
      enriched.school.city,
      enriched.author.name,
      article.tags.join(' '),
    ].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
}

export function publicationLabels(article) {
  return article.visibility.school
    ? [{ id: 'school', text: schoolById[article.schoolId].publication.name }]
    : [];
}

const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
export function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${year}. ${MONTHS[month - 1]} ${day}.`;
}

export const QUICK_KINDS = [
  { id: 'all', label: 'Mind' },
  { id: 'summary', label: 'Röviden' },
  { id: 'quote', label: 'Idézetek' },
  { id: 'story', label: 'Képes történetek' },
];

export const getSummary = (articleId) => summaries[articleId] || null;
export const getQuoteFor = (articleId) => quotes.find((quote) => quote.articleId === articleId) || null;
export const getStoryBySlug = (slug) => stories.find((story) => story.slug === slug) || null;
const articleById = (id) => articles.find((article) => article.id === id);

export function getQuickItems(kind = 'all') {
  const items = [];
  if (kind === 'all' || kind === 'summary') {
    getArticles().forEach((article) => {
      if (summaries[article.id]) items.push({ type: 'summary', id: `s-${article.id}`, date: article.date, article, points: summaries[article.id] });
    });
  }
  if (kind === 'all' || kind === 'quote') {
    quotes.forEach((quote) => {
      const article = articleById(quote.articleId);
      if (article && isPublished(article)) items.push({ type: 'quote', id: quote.id, date: article.date, article, quote });
    });
  }
  if (kind === 'all' || kind === 'story') {
    stories.filter((story) => story.visibility.school).forEach((story) => items.push({ type: 'story', id: story.id, date: story.date, story }));
  }
  return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
