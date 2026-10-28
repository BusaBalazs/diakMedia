import { Link, useParams, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { CheckIcon } from '../components/Icons.jsx';
import { FilterChips } from '../components/Filters.jsx';
import SchoolPicker from '../components/SchoolPicker.jsx';
import { EmptyState, SectionHeader } from '../components/Parts.jsx';
import { categories } from '../data/categories.js';
import { schoolById } from '../data/schools.js';
import { categoryCounts, getArticles, getBySlot } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { useSchool } from '../lib/school.jsx';
import NotFound from './NotFound.jsx';

// One school's own publication. Each school gets its own palette, pattern and shape language (school.theme).
export default function SchoolPage() {
  const { id } = useParams();
  const school = schoolById[id];
  const { mySchoolId, setMySchool } = useSchool();
  const [params, setParams] = useSearchParams();
  useDocumentTitle(school ? `${school.publication.name}, ${school.name}` : 'Nem található');
  if (!school) return <NotFound />;

  const t = school.theme;
  const kat = params.get('kat') || 'mind';
  const all = getArticles('school', school.id);
  const featured = getBySlot('school-featured', 'school', school.id)[0] || all[0];
  const counts = categoryCounts('school', school.id);
  const options = [{ id: 'mind', label: 'Mind', count: all.length }, ...categories.filter((c) => counts[c.id] > 0).map((c) => ({ id: c.id, label: c.name, count: counts[c.id], color: c.color }))];
  const filtered = all.filter((a) => a.id !== featured?.id && (kat === 'mind' || a.categoryId === kat));
  const showFeatured = featured && (kat === 'mind' || featured.categoryId === kat);
  const alsoNational = all.filter((a) => a.visibility.national).length;
  const isMine = mySchoolId === school.id;
  const setKat = (v) => { const p = new URLSearchParams(params); if (v === 'mind') p.delete('kat'); else p.set('kat', v); setParams(p); };

  const style = { '--sc-bg': t.bg, '--sc-fg': t.fg, '--sc-accent': t.accent, '--sc-accent2': t.accent2, '--sc-radius': t.radius };

  return (
    <div className="school-page" style={style} data-pattern={t.pattern} data-upper={t.upper ? 'yes' : 'no'}>
      <section className="school-hero">
        <div className="container school-hero__inner">
          <div className="school-hero__main">
            <p className="school-hero__kicker"><span className="school-sticker">Iskolai lap</span></p>
            <h1 className="school-hero__title">{school.publication.name}</h1>
            <p className="school-hero__school">{school.name}, {school.city}</p>
            <p className="school-hero__desc">{school.publication.description}</p>
            <p className="school-hero__facts">{all.length} cikk a lapban, ebből {alsoNational} az országos lapban is megjelent.</p>
            <div className="school-hero__actions">
              {isMine ? (
                <button type="button" className="btn school-btn school-btn--on" onClick={() => setMySchool(null)} aria-pressed="true">
                  <CheckIcon width={18} height={18} /> Ez a saját iskolám
                </button>
              ) : (
                <button type="button" className="btn school-btn" onClick={() => setMySchool(school.id)} aria-pressed="false">Ez a saját iskolám</button>
              )}
              <Link to="/orszagos" className="school-link">Országos lap</Link>
            </div>
            {isMine && <p className="school-hero__hint">Az Iskolai lap menü legközelebb ide visz. A jelölést a gombbal bármikor visszavonhatod.</p>}
          </div>
          <div className="school-hero__picker">
            <SchoolPicker variant="dropdown" currentId={school.id} mySchoolId={mySchoolId} label="Másik iskola keresése" />
          </div>
        </div>
      </section>

      <div className="container section">
        {showFeatured && (
          <div className="school-feature">
            <ArticleCard article={featured} variant="feature" level={2} badges />
          </div>
        )}
        <SectionHeader title={`Legfrissebb a(z) ${school.publication.name} lapban`} description={`Csak a(z) ${school.name} saját lapjában megjelent írások. Más iskolák lapjainak cikkei itt nem jelennek meg.`} level={2} />
        <FilterChips label="Szűrés kategória szerint" value={kat} onChange={setKat} options={options} />
        {filtered.length ? (
          <div className="grid-3">
            {filtered.map((a, i) => (<ArticleCard key={a.id} article={a} index={i} badges />))}
          </div>
        ) : (
          !showFeatured && <EmptyState title="Nincs találat ebben a kategóriában" text="Ennek az iskolának ehhez a kategóriához még nem jelent meg írása." actionLabel="Szűrő törlése" onAction={() => setKat('mind')} />
        )}
      </div>
    </div>
  );
}
