import { Link } from 'react-router-dom';
import ArticleImage from './ArticleImage.jsx';
import { CategoryLabel, PublicationBadges, ReadingTime, SchoolTag } from './Tags.jsx';
import { enrich, formatDate } from '../lib/content.js';
import { useReveal } from '../lib/hooks.js';

// variants: feature (large, image-led), standard, row (thumbnail + text), compact (text only)
export default function ArticleCard({ article, variant = 'standard', index = 0, level = 3, tone = 'light', badges = false, excerpt = true }) {
  const a = enrich(article);
  const [ref, shown] = useReveal();
  const Heading = `h${level}`;
  const ratio = variant === 'feature' ? '4 / 3' : variant === 'row' ? '1 / 1' : '16 / 10';
  return (
    <article
      ref={ref}
      className={`card card--${variant} card--${tone} reveal${shown ? ' is-in' : ''}`}
      style={{ '--i': index % 4 }}
    >
      {variant !== 'compact' && (
        <div className="card__media">
          <ArticleImage imageKey={a.imageKey} ratio={ratio} categoryId={a.categoryId} decorative={variant === 'row'} />
          <span className="card__sticker" style={{ '--sticker-bg': a.category.tile.bg, '--sticker-fg': a.category.tile.fg }}>{a.category.name}</span>
        </div>
      )}
      <div className="card__body">
        <CategoryLabel category={a.category} />
        <Heading className="card__title">
          <Link to={`/cikk/${a.slug}`} className="card__link">{a.title}</Link>
        </Heading>
        {excerpt && (variant === 'feature' || variant === 'standard') && <p className="card__excerpt">{a.excerpt}</p>}
        <div className="card__meta">
          <SchoolTag school={a.school} size="sm" />
          <div className="card__byline">
            <span>{a.author.name}</span>
            <time dateTime={a.date}>{formatDate(a.date)}</time>
            {variant !== 'compact' && variant !== 'row' && <ReadingTime minutes={a.readingMinutes} />}
          </div>
        </div>
        {badges && <PublicationBadges article={a} />}
      </div>
    </article>
  );
}
