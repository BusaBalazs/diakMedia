import { Link, useParams, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { Breadcrumb, EmptyState } from '../components/Parts.jsx';
import { categories, categoryById } from '../data/categories.js';
import { categoryCounts, getArticles } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function CategoryPage() {
  const { id } = useParams();
  const category = categoryById[id];
  const [, setParams] = useSearchParams();
  useDocumentTitle(category ? category.name : 'Nem található');
  if (!category) return <NotFound />;

  const list = getArticles().filter((a) => a.categoryId === category.id);
  const counts = categoryCounts();

  return (
    <div className="theme-maxi category-page">
      <section className="cat-hero torn" style={{ '--tile-bg': category.tile.bg, '--tile-fg': category.tile.fg }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Kezdőlap', to: '/' }, { label: 'Kategóriák', to: '/kategoriak' }, { label: category.name }]} />
          <p className="masthead__label"><span className="sticker sticker--ink">{counts[category.id]} cikk a Szikrában</span></p>
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
                    <span className="chip__mark" aria-hidden="true" /><span>{c.name}</span><span className="chip__count">{counts[c.id]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {list.length ? (
          <div className="grid-3">
            {list.map((a, i) => (<ArticleCard key={a.id} article={a} index={i} badges />))}
          </div>
        ) : (
          <EmptyState
            title="Ebben a nézetben még nincs ilyen cikk"
            text="Ehhez a rovathoz még nem jelent meg cikk a Szikrában."
            actionLabel="Összes cikk mutatása"
            onAction={() => setParams({})}
          />
        )}
      </div>
    </div>
  );
}
