import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../components/Icons.jsx";
import Marquee from "../components/Marquee.jsx";
import { SectionHeader } from "../components/Parts.jsx";
import PublishedContentCard from "../components/publication/PublishedContentCard.jsx";
import { categories } from "../data/categories.js";
import { DEMO_SCHOOL_ID, schoolById } from "../data/schools.js";
import { BRAND } from "../data/brand.js";
import { useDocumentTitle } from "../lib/hooks.js";
import { usePublishedContent } from "../lib/usePublishedContent.js";
import { usePublicAuth } from "../lib/publicAuth.jsx";
import { categoryForContent } from "../admin/lib/publicRefs.js";

//--------------------------------------------------------------
function LandingHero() {
  const { user } = usePublicAuth();

  //--------------------------------------------------------------
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div
        className="landing-hero__bg"
        role="img"
        aria-label="Kollázs egy mosolygó diáklányról, zenei fesztivál, gördeszkás, régi épület, fotós és a Parlament képeivel, valamint a témák listájával."
      />
      <div className="container landing-hero__inner">
        <div className="landing-hero__text">
          <p className="hero-stickers">
            <span
              className="sticker sticker--lime"
              style={{ "--rot": "-4deg" }}
            >
              Diákok írtak.
            </span>
            <span
              className="sticker sticker--lime"
              style={{ "--rot": "-2deg" }}
            >
              Diákoknak.
            </span>
            <span
              className="sticker sticker--lime"
              style={{ "--rot": "-3deg" }}
            >
              — A Jedlik közösségének.
            </span>
          </p>
          <h1 id="hero-title" className="landing-hero__title">
            {/* <span>A Jedlik diáklapja.</span> */}
            {/* <span className="grad">Kíváncsiság.</span>
            <span className="grad">Szikra.</span> */}
          </h1>
          <p className="landing-hero__lead ">
            Történetek, kísérletek, vélemények és ötletek a Jedlik Ányos
            Gimnázium diákjaitól.
          </p>
          <div className="landing-hero__actions">
            <Link
              to={user ? "/diakjavaslat" : "/belepes?cel=%2Fdiakjavaslat"}
              className="btn btn--pill btn--lg"
            >
              Dobj egy témát <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

//--------------------------------------------------------------
function CategoryBand({ published, loading }) {
  const counts = Object.fromEntries(
    categories.map((category) => [category.id, 0]),
  );
  published.forEach((item) => {
    const categoryId = categoryForContent(item).id;
    counts[categoryId] = (counts[categoryId] || 0) + 1;
  });

  //--------------------------------------------------------------
  return (
    <section className="section container" aria-labelledby="cats-title">
      <SectionHeader
        kicker="Válassz témát"
        kickerTone="pink"
        title="Rovatok"
        description="A Szikra bejegyzéseit témák és tartalomtípusok szerint is böngészheted."
        action={{ to: "/kategoriak", label: "Minden kategória" }}
        />
      <ul className="cat-grid">
        {categories.map((c, i) => (
          <li
          key={c.id}
          style={{
            "--rot": `${[-1.6, 1.2, -0.8, 1.8, -1.2, 0.9][i % 6]}deg`,
          }}
          >
            <Link
              to={`/kategoria/${c.id}`}
              className="cat-tile"
              style={{ "--tile-bg": c.tile.bg, "--tile-fg": c.tile.fg }}
              >
              <span className="cat-tile__name">{c.name}</span>
              <span className="cat-tile__count">
                {loading ? "…" : `${counts[c.id]} bejegyzés`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

//--------------------------------------------------------------
//--------------------------------------------------------------
export default function Home() {
  const { published, error: publishedError, loading } = usePublishedContent();
  const school = schoolById[DEMO_SCHOOL_ID];
  useDocumentTitle(`${school.publication.name} · ${school.name}`);
  
  const cardDate = (value) => {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };
  
  const homepageCards = [
    ...published.map((item) => ({
      id: item.id,
      date: cardDate(item.publishedAt || item.submittedAt || item.createdAt),
      isPoll: item.format === "poll",
      content: <PublishedContentCard key={item.id} item={item} />,
    })),
  ].sort(
    (a, b) =>
      Number(b.isPoll) - Number(a.isPoll) ||
    b.date - a.date ||
    a.id.localeCompare(b.id),
  );
  
  //--------------------------------------------------------------
  return (
    <div className="theme-maxi">
      <LandingHero />
      <Marquee items={categories.map((c) => c.name.toUpperCase())} />
      <section className="section container" aria-labelledby="latest-title">
        <SectionHeader
          kicker="Friss"
          kickerTone="lime"
          title="Szavazás és friss bejegyzések"
          description="Először az aktuális szavazások, majd időrendben a legfrissebb tartalmak."
        />
        {publishedError && (
          <p className="poll-widget__error mb-4" role="alert">
            {publishedError}
          </p>
        )}
        <div className="home-publication-grid">
          {homepageCards.map((item) => item.content)}
        </div>
      </section>
      <CategoryBand published={published} loading={loading} />
      <p className="container home-note">{BRAND.futureNote}</p>
    </div>
  );
}
