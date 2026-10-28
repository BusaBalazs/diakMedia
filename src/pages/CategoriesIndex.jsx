import { Link } from 'react-router-dom';
import { categories } from '../data/categories.js';
import { categoryCounts, getArticles } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { useSchool } from '../lib/school.jsx';

export default function CategoriesIndex() {
  useDocumentTitle('Kategóriák');
  const { activeSchoolId } = useSchool();
  const counts = categoryCounts('all', activeSchoolId);
  const all = getArticles('all', activeSchoolId);
  return (
    <div className="theme-maxi categories-page">
      <section className="masthead masthead--cats torn">
        <div className="band__paint band__paint--pink" aria-hidden="true" />
        <div className="container masthead__inner masthead__inner--single">
          <div>
            <p className="masthead__label"><span className="sticker sticker--lime">Kilenc téma</span> <span className="sticker sticker--cyan" style={{ '--rot': '2deg' }}>Egy olvasóterem</span></p>
            <h1 className="masthead__title">Kategóriák</h1>
            <p className="masthead__desc">Minden rovatban az országos lap és az iskolai lap cikkei egyaránt megtalálhatók. Válassz egy témát, és szűkítsd a nézetet a kategóriaoldalon.</p>
          </div>
        </div>
      </section>
      <div className="container section">
        <ul className="cat-list">
          {categories.map((c, i) => {
            const latest = all.find((a) => a.categoryId === c.id);
            return (
              <li key={c.id} className="cat-list__item" style={{ '--tile-bg': c.tile.bg, '--tile-fg': c.tile.fg, '--rot': `${[-1.2, 1, -0.7, 1.4][i % 4]}deg` }}>
                <span className="cat-list__count sticker sticker--ink">{counts[c.id]} cikk</span>
                <h2 className="cat-list__name"><Link to={`/kategoria/${c.id}`} className="card__link">{c.name}</Link></h2>
                <p className="cat-list__desc">{c.description}</p>
                {latest && <p className="cat-list__meta">Legutóbbi: {latest.title}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
