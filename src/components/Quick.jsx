import { Link } from 'react-router-dom';
import ArticleImage from './ArticleImage.jsx';
import { SchoolTag } from './Tags.jsx';
import { authorById } from '../data/authors.js';
import { categoryById } from '../data/categories.js';
import { schoolById } from '../data/schools.js';
import { enrich, formatDate } from '../lib/content.js';
import { useReveal } from '../lib/hooks.js';

const QUOTE_COLORS = [
  { bg: '#2D3CF0', fg: '#FFFFFF' }, { bg: '#D4F23A', fg: '#101426' }, { bg: '#FF8FD0', fg: '#101426' },
  { bg: '#FFD23F', fg: '#101426' }, { bg: '#5FE0F0', fg: '#101426' }, { bg: '#7B4DFF', fg: '#FFFFFF' },
];

function useCardReveal(index) {
  const [ref, shown] = useReveal();
  return { ref, className: `reveal${shown ? ' is-in' : ''}`, style: { '--i': index % 4 } };
}

// 30-second summary of an article.
export function SummaryCard({ article, points, index = 0 }) {
  const a = enrich(article);
  const r = useCardReveal(index);
  return (
    <Link ref={r.ref} to={`/cikk/${a.slug}`} aria-label={`Olvasd el a teljes cikket: ${a.title}`} className={`quick-card quick-card--summary ${r.className}`} style={r.style}>
      <span className="sticker sticker--lime quick-card__sticker">Röviden, 30 mp</span>
      <p className="quick-card__cat">{a.category.name}</p>
      <h3 className="quick-card__title">{a.title}</h3>
      <ul className="quick-card__points" style={{ '--mark': a.category.color }}>
        {points.map((p) => (<li key={p}>{p}</li>))}
      </ul>
      <div className="quick-card__foot">
        <SchoolTag school={a.school} size="sm" />
        <span className="text-link">A teljes cikk ({a.readingMinutes} perc)</span>
      </div>
    </Link>
  );
}

export function QuoteCard({ quote, article, index = 0, colorIndex }) {
  const a = enrich(article);
  const c = QUOTE_COLORS[(colorIndex ?? index) % QUOTE_COLORS.length];
  const r = useCardReveal(index);
  return (
    <Link ref={r.ref} to={`/cikk/${a.slug}`} aria-label={`Olvasd el a teljes cikket: ${a.title}`} className={`quick-card quick-card--quote ${r.className}`} style={{ ...r.style, '--q-bg': c.bg, '--q-fg': c.fg }}>
      <span className="quote-mark" aria-hidden="true">„</span>
      <blockquote className="quote-text">{quote.text}</blockquote>
      <span className="quote-cite">
        <span>{quote.cite}</span>
        <span className="quote-from">{a.school.name}</span>
      </span>
      <span className="quote-link">Olvasd el a cikket: {a.title}</span>
    </Link>
  );
}

export function StoryCard({ story, index = 0 }) {
  const cat = categoryById[story.categoryId];
  const school = schoolById[story.schoolId];
  const author = authorById[story.authorId];
  const r = useCardReveal(index);
  return (
    <Link ref={r.ref} to={`/tortenet/${story.slug}`} aria-label={`Nézd meg a képes történetet: ${story.title}`} className={`quick-card quick-card--story ${r.className}`} style={r.style}>
      <div className="story-stack">
        <ArticleImage imageKey={story.slides[0].imageKey} ratio="4 / 5" categoryId={story.categoryId} decorative />
        <span className="sticker sticker--pink story-stack__sticker">Képes történet, {story.slides.length} kép</span>
      </div>
      <p className="quick-card__cat">{cat.name}</p>
      <h3 className="quick-card__title">{story.title}</h3>
      <div className="quick-card__foot">
        <SchoolTag school={school} size="sm" />
        <span className="quick-card__by">{author.name}, {formatDate(story.date)}</span>
      </div>
    </Link>
  );
}

export function QuickItem({ item, index }) {
  if (item.type === 'summary') return <SummaryCard article={item.article} points={item.points} index={index} />;
  if (item.type === 'quote') return <QuoteCard quote={item.quote} article={item.article} index={index} colorIndex={index} />;
  return <StoryCard story={item.story} index={index} />;
}

// Box shown at the top of an article page: the 30-second version.
export function SummaryBox({ points, onContinue }) {
  return (
    <aside className="summary-box" aria-labelledby="summary-box-title">
      <span className="sticker sticker--lime">Fél perc alatt</span>
      <h2 id="summary-box-title" className="summary-box__title">Röviden</h2>
      <ul className="quick-card__points">
        {points.map((p) => (<li key={p}>{p}</li>))}
      </ul>
      <button type="button" className="text-link text-link--btn" onClick={onContinue}>Érdekel, olvasom a teljes cikket</button>
    </aside>
  );
}
