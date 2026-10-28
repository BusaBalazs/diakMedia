import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { ArrowRightIcon } from '../components/Icons.jsx';
import Marquee from '../components/Marquee.jsx';
import { SectionHeader } from '../components/Parts.jsx';
import { SchoolTag } from '../components/Tags.jsx';
import { categories } from '../data/categories.js';
import { schools } from '../data/schools.js';
import { topicById } from '../data/topics.js';
import { BRAND } from '../data/brand.js';
import { categoryCounts, enrich, getArticles, getBySlot, getTopicArticles, publicationCounts, schoolCounts } from '../lib/content.js';
import { useDocumentTitle, useReveal } from '../lib/hooks.js';
import { useSchool } from '../lib/school.jsx';

function LandingHero() {
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-hero__bg" role="img" aria-label="Kollázs egy mosolygó diáklányról, zenei fesztivál, gördeszkás, régi épület, fotós és a Parlament képeivel, valamint a témák listájával." />
      <div className="container landing-hero__inner">
        <div className="landing-hero__text">
          <p className="hero-stickers">
            <span className="sticker sticker--lime" style={{ '--rot': '-4deg' }}>Diákok írtak.</span>
            <span className="sticker sticker--lime" style={{ '--rot': '-2deg' }}>Diákoknak.</span>
            <span className="sticker sticker--lime" style={{ '--rot': '-3deg' }}>— Az egész országnak.</span>
          </p>
          <h1 id="hero-title" className="landing-hero__title">
            <span>Egy iskolai újság.</span>
            <span className="grad">Egy országnyi</span>
            <span className="grad">történet.</span>
          </h1>
          <p className="landing-hero__lead">Iskolai közösségek, tehetséges diákok, valódi történetek. Helyi lapok, közös témák, országos elérés.</p>
          <div className="landing-hero__actions">
            <Link to="/orszagos" className="btn btn--pill btn--lg">Felfedezem a platformot <ArrowRightIcon /></Link>
            <Link to="/iskola" className="text-link">Keresd meg az iskolád lapját</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryBand() {
  const { activeSchoolId } = useSchool();
  const counts = categoryCounts('all', activeSchoolId);
  return (
    <section className="section container" aria-labelledby="cats-title">
      <SectionHeader kicker="Válassz témát" kickerTone="pink" title="Rovatok" description="Kilenc témakör, mindegyik külön oldallal. A kategóriaoldalon külön lehet nézni az országos lapot és az iskolai lapot." action={{ to: '/kategoriak', label: 'Minden kategória' }} />
      <ul className="cat-grid">
        {categories.map((c, i) => (
          <li key={c.id} style={{ '--rot': `${[-1.6, 1.2, -0.8, 1.8, -1.2, 0.9][i % 6]}deg` }}>
            <Link to={`/kategoria/${c.id}`} className="cat-tile" style={{ '--tile-bg': c.tile.bg, '--tile-fg': c.tile.fg }}>
              <span className="cat-tile__name">{c.name}</span>
              <span className="cat-tile__count">{counts[c.id]} cikk</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NationalBand() {
  const nat = getArticles('national');
  const seen = new Set();
  const picks = [];
  for (const a of nat) {
    if (!seen.has(a.schoolId)) { seen.add(a.schoolId); picks.push(a); }
    if (picks.length === 4) break;
  }
  const counts = schoolCounts();
  return (
    <section className="band band--national torn" aria-labelledby="nat-title">
      <div className="band__paint band__paint--lime" aria-hidden="true" />
      <div className="container band__content">
        <SectionHeader tone="dark" kicker="Egy helyen, minden iskola" kickerTone="yellow" title="Országos lap" description="Több iskola válogatott írásai egy közös felületen. Minden cikk megőrzi a szerző és az eredeti iskola nevét." action={{ to: '/orszagos', label: 'Az összes országos cikk' }} />
        <div className="grid-4">
          {picks.map((a, i) => (<ArticleCard key={a.id} article={a} index={i} tone="dark" excerpt={false} variant="standard" />))}
        </div>
        <ul className="school-roll" aria-label="Az országos lapban szereplő iskolák">
          {schools.map((s) => (
            <li key={s.id}>
              <Link to={`/orszagos?iskola=${s.id}`} className="school-roll__item">
                <span className="school-tag__mark" style={{ background: s.color }} aria-hidden="true">{s.monogram}</span>
                <span>
                  <span className="school-roll__name">{s.name}</span>
                  <span className="school-roll__meta">{s.city}, {counts[s.id]} cikk az országos lapban</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SchoolBand() {
  const { activeSchool, activeSchoolId, mySchool } = useSchool();
  const list = getArticles('school', activeSchoolId).slice(0, 4);
  const [lead, ...rest] = list;
  const total = publicationCounts()[activeSchoolId];
  return (
    <section className="band band--school torn" aria-labelledby="school-title">
      <div className="container school-band">
        <div className="school-band__intro">
          <p className="section-header__kicker"><span className="sticker sticker--ink">{mySchool ? 'Az én iskolám' : 'Példa: egy iskolai lap'}</span></p>
          <h2 id="school-title" className="school-band__title">{activeSchool.publication.name}</h2>
          <p className="school-band__school">{activeSchool.name}, {activeSchool.city}</p>
          <p className="school-band__desc">{activeSchool.publication.description}</p>
          <div className="school-band__actions">
            <Link to={`/iskola/${activeSchool.id}`} className="btn btn--dark">Megnyitom: {activeSchool.publication.name} ({total} cikk)</Link>
            {!mySchool && <Link to="/iskola" className="text-link">Válaszd ki a saját iskolád</Link>}
          </div>
        </div>
        <div className="school-band__lead">{lead && <ArticleCard article={lead} variant="feature" level={3} badges />}</div>
        <div className="school-band__list">
          {rest.map((a, i) => (<ArticleCard key={a.id} article={a} variant="compact" index={i} badges />))}
        </div>
      </div>
    </section>
  );
}

function TopicBand() {
  const topic = topicById.hullamhossz;
  const list = getTopicArticles(topic.id);
  const [ref, shown] = useReveal();
  return (
    <section className="band band--topic torn" aria-labelledby="topic-title">
      <div className="container topic">
        <div ref={ref} className={`topic__head reveal${shown ? ' is-in' : ''}`}>
          <p className="section-header__kicker"><span className="sticker sticker--cyan">Közös téma</span></p>
          <h2 id="topic-title" className="topic__title">{topic.title}</h2>
          <p className="topic__desc">{topic.description}</p>
        </div>
        <ol className="topic__list">
          {list.map((raw) => {
            const a = enrich(raw);
            return (
              <li key={a.id} className="topic__item">
                <p className="topic__angle">{a.topicAngle}</p>
                <h3 className="topic__item-title"><Link to={`/cikk/${a.slug}`} className="card__link">{a.title}</Link></h3>
                <div className="topic__who"><SchoolTag school={a.school} size="sm" /><span>{a.author.name}</span></div>
              </li>
            );
          })}
        </ol>
        <Link to={`/tema/${topic.slug}`} className="btn btn--pill-light">A téma oldala</Link>
      </div>
    </section>
  );
}

export default function Home() {
  useDocumentTitle('Kezdőlap');
  const { activeSchoolId } = useSchool();
  const all = getArticles('all', activeSchoolId);
  const feature = getBySlot('home-feature', 'all', activeSchoolId)[0] || all[0];
  const rest = all.filter((a) => a.id !== feature.id);
  const rows = rest.slice(0, 3);
  const strip = rest.slice(3, 7);
  return (
    <div className="theme-maxi">
      <LandingHero />
      <Marquee items={categories.map((c) => c.name.toUpperCase())} />
      <section className="section container" aria-labelledby="latest-title">
        <SectionHeader kicker="Friss" kickerTone="lime" title="Legfrissebb" description="Az országos lap és a saját iskolai lap friss írásai egy listában." />
        <div className="latest">
          <div className="latest__feature"><ArticleCard article={feature} variant="feature" badges /></div>
          <div className="latest__rows">
            {rows.map((a, i) => (<ArticleCard key={a.id} article={a} variant="row" index={i} excerpt={false} badges />))}
          </div>
        </div>
        <div className="strip">
          {strip.map((a, i) => (<ArticleCard key={a.id} article={a} variant="compact" index={i} />))}
        </div>
      </section>
      <CategoryBand />
      <NationalBand />
      <SchoolBand />
      <TopicBand />
      <p className="container home-note">{BRAND.futureNote}</p>
    </div>
  );
}
