import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../components/Icons.jsx';
import Marquee from '../components/Marquee.jsx';
import { SectionHeader } from '../components/Parts.jsx';
import PublicationCard from '../components/publication/PublicationCard.jsx';
import { categories, categoryById } from '../data/categories.js';
import { DEMO_SCHOOL_ID, schoolById } from '../data/schools.js';
import { getImage } from '../data/images.js';
import { BRAND } from '../data/brand.js';
import { categoryCounts, enrich, getArticles } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { usePublicAuth } from '../lib/publicAuth.jsx';
import { getRepository } from '../admin/data/repository.js';
import { categoryOf, publicSchool } from '../admin/lib/publicRefs.js';

function PublishedContentCard({ item }) {
  const category = categoryOf(item.category);
  const card = {
    format: item.format,
    title: item.cardData.title,
    description: item.cardData.description,
    imageUrl: item.cardData.imageUrl,
    quoteSource: item.format === 'one_thought' && !item.contentData.isOwn ? item.contentData.quoteSource : '',
    authorName: item.authorName,
    authorDisplayName: item.format === 'opinion' ? item.contentData.authorDisplayName : '',
    imageCount: item.format === 'visual_story' ? (item.contentData.images || []).length : 0,
    date: item.publishedAt || item.submittedAt || item.createdAt,
    contentId: item.id,
    status: item.status,
    poll: item.format === 'poll' ? item.contentData : null,
  };
  const publicationCard = <PublicationCard card={card} category={category} school={publicSchool(item.schoolId, null)} interactivePoll={item.format === 'poll'} />;
  if (item.format === 'poll') return publicationCard;
  return (
    <Link to={`/tartalom/${item.id}`} className="home-publication-link" aria-label={`Olvasd el: ${card.title}`}>
      {publicationCard}
    </Link>
  );
}

function SampleArticleCard({ article }) {
  const a = enrich(article);
  const image = getImage(a.imageKey);
  const card = {
    format: 'short_article',
    title: a.title,
    description: a.excerpt,
    imageUrl: image?.src || '',
    authorName: a.author.name,
    date: a.date,
  };
  return (
    <Link to={`/cikk/${article.slug}`} className="home-publication-link" aria-label={`Olvasd el: ${card.title}`}>
      <PublicationCard card={card} category={categoryById[a.categoryId]} school={a.school} />
    </Link>
  );
}

function usePublishedContent() {
  const [published, setPublished] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    getRepository()
      .then((repo) => repo.listPublishedContent({ schoolId: DEMO_SCHOOL_ID }))
      .then((items) => { if (alive) setPublished(items); })
      .catch((err) => { if (alive) setError(err.message || 'A közzétett tartalmak nem tölthetők be.'); });
    return () => { alive = false; };
  }, []);

  return { published, error };
}

function LandingHero() {
  const { user } = usePublicAuth();
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-hero__bg" role="img" aria-label="Kollázs egy mosolygó diáklányról, zenei fesztivál, gördeszkás, régi épület, fotós és a Parlament képeivel, valamint a témák listájával." />
      <div className="container landing-hero__inner">
        <div className="landing-hero__text">
          <p className="hero-stickers">
            <span className="sticker sticker--lime" style={{ '--rot': '-4deg' }}>Diákok írtak.</span>
            <span className="sticker sticker--lime" style={{ '--rot': '-2deg' }}>Diákoknak.</span>
            <span className="sticker sticker--lime" style={{ '--rot': '-3deg' }}>— A Jedlik közösségének.</span>
          </p>
          <h1 id="hero-title" className="landing-hero__title">
            <span>A Jedlik diáklapja.</span>
            <span className="grad">Kíváncsiság.</span>
            <span className="grad">Szikra.</span>
          </h1>
          <p className="landing-hero__lead">Történetek, kísérletek, vélemények és ötletek a Jedlik Ányos Gimnázium diákjaitól.</p>
          <div className="landing-hero__actions">
            <Link to={user ? '/diakjavaslat' : '/belepes?cel=%2Fdiakjavaslat'} className="btn btn--pill btn--lg">Dobj egy témát <ArrowRightIcon /></Link>
            <Link to="/kereses" className="text-link">Keresés a Szikra cikkeit között</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryBand() {
  const counts = categoryCounts();
  return (
    <section className="section container" aria-labelledby="cats-title">
      <SectionHeader kicker="Válassz témát" kickerTone="pink" title="Rovatok" description="A Szikra cikkeit témakörök szerint is böngészheted." action={{ to: '/kategoriak', label: 'Minden kategória' }} />
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

export default function Home() {
  const { published, error: publishedError } = usePublishedContent();
  const school = schoolById[DEMO_SCHOOL_ID];
  useDocumentTitle(`${school.publication.name} · ${school.name}`);
  const all = getArticles();
  const cardDate = (value) => {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };
  const homepageCards = [
    ...published.map((item) => ({
      id: item.id,
      date: cardDate(item.publishedAt || item.submittedAt || item.createdAt),
      isPoll: item.format === 'poll',
      content: <PublishedContentCard key={item.id} item={item} />,
    })),
    ...all.map((article) => ({
      id: article.id,
      date: cardDate(article.date),
      content: <SampleArticleCard key={article.id} article={article} />,
    })),
  ].sort((a, b) => Number(b.isPoll) - Number(a.isPoll) || b.date - a.date || a.id.localeCompare(b.id));
  return (
    <div className="theme-maxi">
      <LandingHero />
      <Marquee items={categories.map((c) => c.name.toUpperCase())} />
      <section className="section container" aria-labelledby="latest-title">
        <SectionHeader kicker="Friss" kickerTone="lime" title="Szavazás és friss bejegyzések" description="Először az aktuális szavazások, majd időrendben a legfrissebb tartalmak." />
        {publishedError && <p className="poll-widget__error mb-4" role="alert">{publishedError}</p>}
        <div className="home-publication-grid">
          {homepageCards.map((item) => item.content)}
        </div>
      </section>
      <CategoryBand />
      <p className="container home-note">{BRAND.futureNote}</p>
    </div>
  );
}
