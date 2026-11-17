import { Link } from "react-router-dom";
import { categories } from "../data/categories.js";
import { useDocumentTitle } from "../lib/hooks.js";
import { usePublishedContent } from "../lib/usePublishedContent.js";
import { categoryForContent } from "../admin/lib/publicRefs.js";

const timeOf = (value) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export default function CategoriesIndex() {
  useDocumentTitle("Kategóriák");
  const { published, error, loading } = usePublishedContent();
  const counts = Object.fromEntries(categories.map((category) => [category.id, 0]));
  published.forEach((item) => {
    const categoryId = categoryForContent(item).id;
    counts[categoryId] = (counts[categoryId] || 0) + 1;
  });
  return (
    <div className="theme-maxi categories-page">
      <section className="masthead masthead--cats torn">
        <div className="band__paint band__paint--pink" aria-hidden="true" />
        <div className="container masthead__inner masthead__inner--single">
          <div>
            <p className="masthead__label">
              <span className="sticker sticker--lime">A Szikra rovatai</span>{" "}
              <span
                className="sticker sticker--cyan"
                style={{ "--rot": "2deg" }}
              >
                Jedlik Ányos Gimnázium
              </span>
            </p>
            <h1 className="masthead__title">Kategóriák</h1>
            <p className="masthead__desc">
              A Jedlik Ányos Gimnázium diákjainak bejegyzései témák és
              tartalomtípusok szerint rendezve. Válassz egy kategóriát, és
              fedezd fel a Szikra tartalmait.
            </p>
          </div>
        </div>
      </section>
      <div className="container section">
        {error && (
          <p className="poll-widget__error mb-4" role="alert">
            {error}
          </p>
        )}
        <ul className="cat-list">
          {categories.map((c, i) => {
            const latestPublished = published
              .filter((item) => categoryForContent(item).id === c.id)
              .sort(
                (a, b) =>
                  timeOf(b.publishedAt || b.submittedAt || b.createdAt) -
                  timeOf(a.publishedAt || a.submittedAt || a.createdAt),
              )[0];
            const latestTitle = latestPublished?.cardData?.title || latestPublished?.title;
            return (
              <li
                key={c.id}
                className="cat-list__item"
                style={{
                  "--tile-bg": c.tile.bg,
                  "--tile-fg": c.tile.fg,
                  "--rot": `${[-1.2, 1, -0.7, 1.4][i % 4]}deg`,
                }}
              >
                <span className="cat-list__count sticker sticker--ink">
                  {loading ? "…" : `${counts[c.id]} bejegyzés`}
                </span>
                <h2 className="cat-list__name">
                  <Link to={`/kategoria/${c.id}`} className="card__link">
                    {c.name}
                  </Link>
                </h2>
                <p className="cat-list__desc">{c.description}</p>
                {latestTitle && (
                  <p className="cat-list__meta">Legutóbbi: {latestTitle}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
