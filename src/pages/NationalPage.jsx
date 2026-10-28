import { useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { FilterChips } from '../components/Filters.jsx';
import { EmptyState, SectionHeader } from '../components/Parts.jsx';
import { categories } from '../data/categories.js';
import { schools } from '../data/schools.js';
import { categoryCounts, getArticles, getBySlot, schoolCounts } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';

export default function NationalPage() {
  useDocumentTitle('Országos lap');
  const [params, setParams] = useSearchParams();
  const kat = params.get('kat') || 'mind';
  const iskola = params.get('iskola') || 'mind';
  const all = getArticles('national');
  const featured = getBySlot('national-featured', 'national').slice(0, 2);
  const filtering = kat !== 'mind' || iskola !== 'mind';
  const list = all.filter((a) => (kat === 'mind' || a.categoryId === kat) && (iskola === 'mind' || a.schoolId === iskola));
  const catCounts = categoryCounts('national');
  const sCounts = schoolCounts();
  const catOptions = [{ id: 'mind', label: 'Mind', count: all.length }, ...categories.filter((c) => catCounts[c.id] > 0).map((c) => ({ id: c.id, label: c.name, count: catCounts[c.id], color: c.color }))];
  const schoolOptions = [{ id: 'mind', label: 'Minden iskola' }, ...schools.map((s) => ({ id: s.id, label: s.name, count: sCounts[s.id] }))];
  const set = (key, v) => { const p = new URLSearchParams(params); if (v === 'mind') p.delete(key); else p.set(key, v); setParams(p); };
  const reset = () => setParams({});

  return (
    <div className="national-page theme-maxi">
      <section className="masthead masthead--national torn">
        <div className="band__paint band__paint--lime" aria-hidden="true" />
        <div className="container masthead__inner">
          <div>
            <p className="masthead__label"><span className="sticker sticker--yellow">Egy helyen, minden iskola</span></p>
            <h1 className="masthead__title">Országos lap</h1>
          </div>
          <div>
            <p className="masthead__desc">Több iskola diákszerkesztőségének válogatott írásai egy közös felületen. Minden cikk megtartja az eredeti szerző és iskola nevét, és az iskola saját lapjában is olvasható maradhat.</p>
            <p className="masthead__facts">{all.length} cikk, {schools.length} iskola.</p>
          </div>
        </div>
      </section>

      <div className="container section">
        {!filtering && featured.length > 0 && (
          <>
            <SectionHeader kicker="Válogatás" kickerTone="pink" title="Kiemelt írások" level={2} />
            <div className="grid-2">
              {featured.map((a, i) => (<ArticleCard key={a.id} article={a} variant="feature" level={3} index={i} badges />))}
            </div>
          </>
        )}
        <SectionHeader kicker="Friss" kickerTone="lime" title={filtering ? 'Szűrt találatok' : 'Legutóbbi beküldések'} description={filtering ? `${list.length} cikk a kiválasztott szűrőkkel.` : undefined} level={2} />
        <div className="filters">
          <div>
            <p className="filters__label" id="f-cat">Kategória</p>
            <FilterChips label="Szűrés kategória szerint" value={kat} onChange={(v) => set('kat', v)} options={catOptions} />
          </div>
          <div>
            <p className="filters__label" id="f-school">Iskola</p>
            <FilterChips label="Szűrés iskola szerint" value={iskola} onChange={(v) => set('iskola', v)} options={schoolOptions} />
          </div>
          {filtering && <button type="button" className="text-link text-link--btn" onClick={reset}>Szűrők törlése</button>}
        </div>
        {list.length ? (
          <div className="grid-3">
            {list.map((a, i) => (<ArticleCard key={a.id} article={a} index={i} badges />))}
          </div>
        ) : (
          <EmptyState title="Nincs találat" text="Ehhez a kategória- és iskolakombinációhoz még nem jelent meg országos cikk." actionLabel="Szűrők törlése" onAction={reset} />
        )}
      </div>
    </div>
  );
}
