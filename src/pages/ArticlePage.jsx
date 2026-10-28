import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import ArticleImage from '../components/ArticleImage.jsx';
import { ArrowLeftIcon } from '../components/Icons.jsx';
import { Breadcrumb } from '../components/Parts.jsx';
import { CategoryLabel, PublicationBadges, ReadingTime, SchoolTag } from '../components/Tags.jsx';
import { getImage } from '../data/images.js';
import { enrich, formatDate, getArticleBySlug, getRelated, isPublished } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

function Block({ block }) {
  if (block.type === 'h2') return <h2 className="prose__h2">{block.text}</h2>;
  if (block.type === 'quote') return (
    <blockquote className="prose__quote">
      <p>{block.text}</p>
      {block.cite && <footer>{block.cite}</footer>}
    </blockquote>
  );
  if (block.type === 'figure') {
    const img = getImage(block.imageKey);
    return (
      <figure className="prose__figure">
        <ArticleImage imageKey={block.imageKey} ratio="16 / 9" alt={img?.alt} />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  }
  return <p>{block.text}</p>;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const raw = getArticleBySlug(slug);
  const navigate = useNavigate();
  const location = useLocation();
  const visible = raw && isPublished(raw);
  useDocumentTitle(visible ? raw.title : 'Nem található');
  if (!visible) return <NotFound />;

  const a = enrich(raw);
  const related = getRelated(raw, 3);
  const inSchool = a.visibility.school;
  const pubName = a.school.publication.name;
  const origin = inSchool
    ? { to: `/iskola/${a.school.id}`, label: `Vissza a(z) ${pubName} lapra` }
    : { to: '/orszagos', label: 'Vissza az országos laphoz' };
  const crumbs = [
    { label: 'Kezdőlap', to: '/' },
    inSchool ? { label: pubName, to: `/iskola/${a.school.id}` } : { label: 'Országos lap', to: '/orszagos' },
    { label: a.category.name, to: `/kategoria/${a.category.id}` },
    { label: 'Cikk' },
  ];
  const canGoBack = location.key !== 'default';

  return (
    <article className="article theme-maxi-lite">
      <div className="container article__top">
        <Breadcrumb items={crumbs} />
        <header className="article__head">
          <div className="article__labels">
            <CategoryLabel category={a.category} asLink />
            {a.isOpinion && <span className="opinion-flag">Vélemény: a szerző saját álláspontja</span>}
          </div>
          <h1 className="article__title">{a.title}</h1>
          <p className="article__lead">{a.lead}</p>
          <div className="article__meta">
            <div className="article__byline">
              <p className="article__author">{a.author.name}, {a.author.grade} osztály</p>
              <SchoolTag school={a.school} to={`/orszagos?iskola=${a.school.id}`} />
            </div>
            <div className="article__facts">
              <time dateTime={a.date}>{formatDate(a.date)}</time>
              <ReadingTime minutes={a.readingMinutes} />
            </div>
            <PublicationBadges article={a} />
          </div>
        </header>
      </div>

      <figure className="container article__hero">
        <ArticleImage imageKey={a.imageKey} ratio="21 / 9" categoryId={a.categoryId} eager />
        {a.imageCaption && <figcaption>{a.imageCaption}</figcaption>}
      </figure>

      <div className="container article__layout">
        <div className="prose">
          {a.body.map((b, i) => (<Block key={i} block={b} />))}
          <ul className="tag-list" aria-label="Témacímkék">
            {a.tags.map((t) => (<li key={t}><Link to={`/kereses?q=${encodeURIComponent(t)}`} className="tag">{t}</Link></li>))}
          </ul>
          <aside className="author-box" aria-label="A szerzőről">
            <SchoolTag school={a.school} />
            <p><strong>{a.author.name}</strong>, {a.author.grade} osztály. A szerző és az iskola kitalált, a bemutató kedvéért szerepel itt.</p>
            {a.topic && <p>Ez a cikk a(z) <Link to={`/tema/${a.topic.slug}`} className="text-link">{a.topic.title}</Link> közös téma része.</p>}
          </aside>
          <div className="article__back">
            {canGoBack && <button type="button" className="text-link text-link--btn" onClick={() => navigate(-1)}><ArrowLeftIcon width={16} height={16} /> Vissza az előző oldalra</button>}
            <Link to={origin.to} className="text-link">{origin.label}</Link>
            {a.visibility.national && inSchool && <Link to="/orszagos" className="text-link">Országos lap</Link>}
            <Link to={`/kategoria/${a.category.id}`} className="text-link">Több a(z) {a.category.name} rovatból</Link>
          </div>
        </div>
      </div>

      <section className="container related" aria-labelledby="related-title">
        <h2 id="related-title" className="related__title">További olvasnivaló</h2>
        <div className="grid-3">
          {related.map((r, i) => (<ArticleCard key={r.id} article={r} index={i} excerpt={false} badges />))}
        </div>
      </section>
    </article>
  );
}
