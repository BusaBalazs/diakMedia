import { Link, useNavigate, useParams } from 'react-router-dom';
import PublishedContentCard from '../components/publication/PublishedContentCard.jsx';
import { Breadcrumb, EmptyState } from '../components/Parts.jsx';
import { categories, categoryById } from '../data/categories.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { usePublishedContent } from '../lib/usePublishedContent.js';
import { categoryForContent } from '../admin/lib/publicRefs.js';
import NotFound from './NotFound.jsx';

const timeOf = (value) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export default function CategoryPage() {
  const { id } = useParams();
  const category = categoryById[id];
  const navigate = useNavigate();
  const { published, error, loading } = usePublishedContent();
  useDocumentTitle(category ? category.name : 'Nem található');
  if (!category) return <NotFound />;

  const counts = Object.fromEntries(categories.map((item) => [item.id, 0]));
  published.forEach((item) => {
    const categoryId = categoryForContent(item).id;
    counts[categoryId] = (counts[categoryId] || 0) + 1;
  });
  const publications = published.filter(
    (item) => categoryForContent(item).id === category.id,
  );
  const cards = publications
    .map((item) => ({
      id: item.id,
      time: timeOf(item.publishedAt || item.submittedAt || item.createdAt),
      element: <PublishedContentCard key={item.id} item={item} />,
    }))
    .sort((a, b) => b.time - a.time || a.id.localeCompare(b.id));

  return (
    <div className="theme-maxi category-page">
      <section className="cat-hero torn" style={{ '--tile-bg': category.tile.bg, '--tile-fg': category.tile.fg }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Kezdőlap', to: '/' }, { label: 'Kategóriák', to: '/kategoriak' }, { label: category.name }]} />
          <p className="masthead__label"><span className="sticker sticker--ink">{loading ? '…' : counts[category.id]} bejegyzés a Szikrában</span></p>
          <h1 className="cat-hero__title">{category.name}</h1>
          <p className="cat-hero__desc">{category.description}</p>
        </div>
      </section>
      <div className="container section">
        <div className="cat-controls">
          <nav aria-label="Másik kategória" className="cat-switch">
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/kategoria/${c.id}`} className={`chip${c.id === category.id ? ' chip--current' : ''}`} style={{ '--chip': c.color }} aria-current={c.id === category.id ? 'page' : undefined}>
                    <span className="chip__mark" aria-hidden="true" /><span>{c.name}</span><span className="chip__count">{loading ? '…' : counts[c.id]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {error && (
          <p className="poll-widget__error mb-4" role="alert">
            {error}
          </p>
        )}
        {cards.length ? (
          <div className="grid-3">
            {cards.map(({ element }) => element)}
          </div>
        ) : loading ? (
          <p role="status">A bejegyzések betöltése…</p>
        ) : (
          <EmptyState
            title="Ebben a nézetben még nincs bejegyzés"
            text="Ehhez a rovathoz még nem jelent meg bejegyzés a Szikrában."
            actionLabel="Vissza a kategóriákhoz"
            onAction={() => navigate('/kategoriak')}
          />
        )}
      </div>
    </div>
  );
}
