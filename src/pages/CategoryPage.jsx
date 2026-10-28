import { Link, useParams, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { ScopeTabs } from '../components/Filters.jsx';
import { Breadcrumb, EmptyState } from '../components/Parts.jsx';
import { categories, categoryById } from '../data/categories.js';
import { SCOPES, categoryCounts, getArticles, scopeFromParam, scopeLabel } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { useSchool } from '../lib/school.jsx';
import NotFound from './NotFound.jsx';

export default function CategoryPage() {
  const { id } = useParams();
  const category = categoryById[id];
  const [params, setParams] = useSearchParams();
  const { activeSchoolId } = useSchool();
  const scope = scopeFromParam(params.get('lap'));
  useDocumentTitle(category ? category.name : 'Nem található');
  if (!category) return <NotFound />;

  const list = getArticles(scope.id, activeSchoolId).filter((a) => a.categoryId === category.id);
  const scopeOptions = Object.values(SCOPES).map((s) => ({ id: s.id, label: scopeLabel(s.id, activeSchoolId), count: getArticles(s.id, activeSchoolId).filter((a) => a.categoryId === category.id).length }));
  const setScope = (sid) => {
    const p = new URLSearchParams(params);
    if (sid === 'all') p.delete('lap'); else p.set('lap', SCOPES[sid].param);
    setParams(p);
  };
  const counts = categoryCounts(scope.id, activeSchoolId);
  const q = scope.id === 'all' ? '' : `?lap=${scope.param}`;

  return (
    <div className="theme-maxi category-page">
      <section className="cat-hero torn" style={{ '--tile-bg': category.tile.bg, '--tile-fg': category.tile.fg }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Kezdőlap', to: '/' }, { label: 'Kategóriák', to: '/kategoriak' }, { label: category.name }]} />
          <p className="masthead__label"><span className="sticker sticker--ink">{counts[category.id]} cikk ebben a nézetben</span></p>
          <h1 className="cat-hero__title">{category.name}</h1>
          <p className="cat-hero__desc">{category.description}</p>
        </div>
      </section>
      <div className="container section">
        <div className="cat-controls">
          <ScopeTabs value={scope.id} onChange={setScope} options={scopeOptions} label="Melyik lap cikkeit mutassa?" />
          <nav aria-label="Másik kategória" className="cat-switch">
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/kategoria/${c.id}${q}`} className={`chip${c.id === category.id ? ' chip--current' : ''}`} style={{ '--chip': c.color }} aria-current={c.id === category.id ? 'page' : undefined}>
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
            text={`A(z) „${scopeLabel(scope.id, activeSchoolId)}” nézetben ehhez a kategóriához nem jelent meg írás. Válts másik lapra, vagy nézd meg az összes cikket.`}
            actionLabel="Összes cikk mutatása"
            onAction={() => setScope('all')}
          />
        )}
      </div>
    </div>
  );
}
