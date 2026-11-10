import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleImage from '../components/ArticleImage.jsx';
import { ArrowLeftIcon, ArrowRightIcon } from '../components/Icons.jsx';
import { Breadcrumb } from '../components/Parts.jsx';
import { SchoolTag } from '../components/Tags.jsx';
import { authorById } from '../data/authors.js';
import { categoryById } from '../data/categories.js';
import { schoolById } from '../data/schools.js';
import { articles } from '../data/articles.js';
import { formatDate, getStoryBySlug } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function StoryPage() {
  const { slug } = useParams();
  const story = getStoryBySlug(slug);
  const [i, setI] = useState(0);
  useDocumentTitle(story ? story.title : 'Nem található');
  const total = story ? story.slides.length : 0;
  const go = useCallback((n) => setI(Math.max(0, Math.min(total, n))), [total]);
  useEffect(() => { setI(0); }, [slug]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);
  if (!story) return <NotFound />;

  const cat = categoryById[story.categoryId];
  const school = schoolById[story.schoolId];
  const author = authorById[story.authorId];
  const article = story.articleId ? articles.find((a) => a.id === story.articleId) : null;
  const finished = i >= total;
  const slide = story.slides[Math.min(i, total - 1)];

  return (
    <div className="theme-maxi story-page container section">
      <Breadcrumb items={[{ label: 'Kezdőlap', to: '/' }, { label: 'Képes történet' }]} />
      <header className="story-head">
        <span className="sticker sticker--pink">Képes történet, {total} kép</span>
        <h1 className="story-head__title">{story.title}</h1>
        <p className="story-head__meta"><SchoolTag school={school} size="sm" /> <span>{author.name}</span> <span>{cat.name}</span> <time dateTime={story.date}>{formatDate(story.date)}</time></p>
      </header>

      <section className="story-viewer" aria-roledescription="képsor" aria-label={story.title}>
        <ol className="story-progress" aria-hidden="true">
          {story.slides.map((_, n) => (<li key={n} className={n < i ? 'is-done' : n === i && !finished ? 'is-now' : ''} />))}
        </ol>
        {!finished ? (
          <figure className="story-slide" key={i}>
            <ArticleImage imageKey={slide.imageKey} ratio="4 / 3" categoryId={story.categoryId} eager />
            <figcaption className="story-slide__caption" aria-live="polite">
              <span className="story-slide__count">{i + 1} / {total}</span>
              {slide.caption}
            </figcaption>
          </figure>
        ) : (
          <div className="story-end">
            <h2>A történet vége</h2>
            <p>Köszönjük, hogy végignézted. Ha tetszett, olvass tovább, vagy válassz másik rövid tartalmat.</p>
            <div className="story-end__links">
              {article && <Link to={`/cikk/${article.slug}`} className="btn btn--primary">A teljes cikk</Link>}
              <Link to="/" className="btn btn--dark">Vissza a címlapra</Link>
              <button type="button" className="text-link text-link--btn" onClick={() => go(0)}>Újra az elejétől</button>
            </div>
          </div>
        )}
        <div className="story-nav">
          <button type="button" className="btn btn--pill-light" onClick={() => go(i - 1)} disabled={i === 0}><ArrowLeftIcon /> Előző</button>
          <button type="button" className="btn btn--pill" onClick={() => go(i + 1)} disabled={finished}>{i === total - 1 ? 'Befejezem' : 'Következő'} <ArrowRightIcon /></button>
        </div>
        <p className="story-hint">A nyílbillentyűkkel is lapozhatsz.</p>
      </section>
    </div>
  );
}
