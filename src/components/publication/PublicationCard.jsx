import ArticleImage from '../ArticleImage.jsx';
import { CategoryLabel, SchoolTag } from '../Tags.jsx';
import { formatDate } from '../../lib/content.js';
import PollWidget from './PollWidget.jsx';
import './publication.css';

// Accepts ISO strings, Dates and Firestore Timestamps; the public formatDate() wants 'YYYY-MM-DD'.
const day = (v) => {
  if (!v) return '';
  const d = typeof v.toDate === 'function' ? v.toDate() : new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};


// The homepage card of one publication, rendered with the public site's own styles.
// One template per content format. `card` = { format, title, description, imageUrl, quoteSource, authorName, authorDisplayName, imageCount, date }.
// Used by the admin card editor / review preview and ready to be used by the public homepage.
export default function PublicationCard({ card, category, school, interactivePoll = false }) {
  const c = card;
  const who = c.authorDisplayName || c.authorName;
  const date = c.date ? formatDate(day(c.date)) : '';
  const tone = { '--q-bg': category.tile.bg, '--q-fg': category.tile.fg };

  if (c.format === 'poll') {
    return (
      <article className="card card--standard card--light pub-card pub-card--article">
        {c.imageUrl && <div className="card__media"><ArticleImage src={c.imageUrl} ratio="16 / 10" categoryId={category.id} decorative /><span className="card__sticker" style={{ '--sticker-bg': category.tile.bg, '--sticker-fg': category.tile.fg }}>{category.name}</span></div>}
        <div className="card__body">
          <CategoryLabel category={category} />
          <h3 className="card__title">{c.title}</h3>
          {c.description && <p className="card__excerpt">{c.description}</p>}
          <div className="card__meta"><SchoolTag school={school} size="sm" /><span className="card__byline">{who}{date ? ` · ${date}` : ''}</span></div>
          {c.poll && <PollWidget pollId={c.contentId} poll={c.poll} active={c.status === 'published'} interactive={interactivePoll} />}
        </div>
      </article>
    );
  }

  if (c.format === 'one_thought') {
    return (
      <figure className="quick-card quick-card--quote pub-card" style={tone}>
        {c.imageUrl && <ArticleImage src={c.imageUrl} ratio="16 / 9" categoryId={category.id} decorative />}
        <span className="quote-mark" aria-hidden="true">„</span>
        <blockquote className="quote-text">{c.title}</blockquote>
        {c.description && <p className="pub-card__note">{c.description}</p>}
        <figcaption className="quote-cite">
          <span>{c.quoteSource || who}</span>
          <span className="quote-from">{school.name}</span>
        </figcaption>
        <span className="pub-card__tag">{category.name}</span>
      </figure>
    );
  }

  if (c.format === 'visual_story') {
    return (
      <article className="quick-card quick-card--story pub-card">
        <div className="story-stack">
          <ArticleImage src={c.imageUrl} ratio="4 / 5" categoryId={category.id} decorative />
          <span className="sticker sticker--pink story-stack__sticker">Képes történet{c.imageCount ? `, ${c.imageCount} kép` : ''}</span>
        </div>
        <p className="quick-card__cat">{category.name}</p>
        <h3 className="quick-card__title">{c.title}</h3>
        {c.description && <p className="pub-card__note pub-card__note--dark">{c.description}</p>}
        <div className="quick-card__foot"><SchoolTag school={school} size="sm" /><span className="quick-card__by">{who}{date ? `, ${date}` : ''}</span></div>
      </article>
    );
  }

  if (c.format === 'opinion') {
    return (
      <article className="quick-card pub-card pub-card--opinion">
        <span className="sticker sticker--pink pub-card__sticker">Vélemény</span>
        <h3 className="pub-card__opinion-title">{c.title}</h3>
        {c.description && <p className="pub-card__opinion-text">{c.description}</p>}
        <p className="pub-card__author"><span aria-hidden="true">—</span> {who}</p>
        <div className="quick-card__foot"><SchoolTag school={school} size="sm" />{date && <span className="quick-card__by">{date}</span>}</div>
      </article>
    );
  }

  // short_article
  return (
    <article className="card card--standard card--light pub-card pub-card--article">
      <div className="card__media">
        <ArticleImage src={c.imageUrl} ratio="16 / 10" categoryId={category.id} decorative />
        <span className="card__sticker" style={{ '--sticker-bg': category.tile.bg, '--sticker-fg': category.tile.fg }}>{category.name}</span>
      </div>
      <div className="card__body">
        <CategoryLabel category={category} />
        <h3 className="card__title">{c.title}</h3>
        {c.description && <p className="card__excerpt">{c.description}</p>}
        <div className="card__meta">
          <SchoolTag school={school} size="sm" />
          <div className="card__byline"><span>{who}</span>{date && <time>{date}</time>}</div>
        </div>
      </div>
    </article>
  );
}
