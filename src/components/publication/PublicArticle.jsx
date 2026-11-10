import ArticleImage from "../ArticleImage.jsx";
import { CategoryLabel, SchoolTag } from "../Tags.jsx";
import { formatDate } from "../../lib/content.js";
import PollWidget from "./PollWidget.jsx";
import "./publication.css";

// Accepts ISO strings, Dates and Firestore Timestamps; the public formatDate() wants 'YYYY-MM-DD'.
const day = (v) => {
  if (!v) return "";
  const d = typeof v.toDate === "function" ? v.toDate() : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const paragraphs = (t = "") =>
  t
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
const minutes = (d) => {
  const text = [
    d.intro,
    d.body,
    d.explanation,
    d.closing,
    ...(d.images || []).map((i) => i.caption),
  ]
    .filter(Boolean)
    .join(" ");
  return Math.max(
    1,
    Math.round(text.split(/\s+/).filter(Boolean).length / 200),
  );
};

// The full article page of one publication, built from the public article styles ("how it will look on the website").
export default function PublicArticle({
  content,
  category,
  school,
  date,
  interactivePoll = true,
}) {
  const d = content.contentData || {};
  const who = d.authorDisplayName || content.authorName;
  const lead = content.format === "one_thought" ? "" : d.intro;
  return (
    <article className="article public-article">
      <header className="article__head">
        <div className="article__labels">
          <CategoryLabel category={category} />
          {content.format === "opinion" && (
            <span className="opinion-flag">
              Vélemény: a szerző saját álláspontja
            </span>
          )}
        </div>
        <h1 className="article__title">{content.title || "Cím nélkül"}</h1>
        {lead && <p className="article__lead">{lead}</p>}
        <div className="article__meta">
          <div className="article__byline">
            <p className="article__author">{who}</p>
            <SchoolTag school={school} />
          </div>
          <div className="article__facts">
            {date && <time>{formatDate(day(date))}</time>}
            <span>{minutes(d)} perc olvasás</span>
          </div>
        </div>
      </header>

      {(content.format === "short_article" || content.format === "poll") &&
        d.imageUrl && (
          <figure className="public-article__hero">
            <ArticleImage
              src={d.imageUrl}
              alt={d.imageAlt}
              ratio="16 / 9"
              categoryId={category.id}
            />
          </figure>
        )}

      <div className="prose">
        {(content.format === "short_article" || content.format === "poll") &&
          paragraphs(d.body).map((p, i) => <p key={i}>{p}</p>)}

        {content.format === "opinion" &&
          paragraphs(d.body).map((p, i) => <p key={i}>{p}</p>)}

        {content.format === "one_thought" && (
          <>
            <blockquote className="prose__quote">
              <p>{d.quote}</p>
              {(d.quoteSource || d.isOwn) && (
                <footer>{d.isOwn ? who : d.quoteSource}</footer>
              )}
            </blockquote>
            {d.imageUrl && (
              <figure className="prose__figure">
                <ArticleImage
                  src={d.imageUrl}
                  ratio="16 / 9"
                  categoryId={category.id}
                />
              </figure>
            )}
            {paragraphs(d.explanation).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </>
        )}

        {content.format === "visual_story" && (
          <>
            {(d.images || []).map((img, i) => (
              <figure key={img.id || i} className="prose__figure">
                <ArticleImage
                  src={img.url}
                  ratio="4 / 3"
                  categoryId={category.id}
                  alt={img.caption}
                />
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
            {d.closing && (
              <blockquote className="prose__quote">
                <p>{d.closing}</p>
              </blockquote>
            )}
          </>
        )}

        {d.sources && (
          <aside className="public-article__sources">
            <h2 className="prose__h2">Források</h2>
            {paragraphs(d.sources.replace(/\n/g, "\n\n")).map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </aside>
        )}
      </div>
      {content.format === "poll" && (
        <PollWidget
          pollId={content.id}
          poll={d}
          active={content.status === "published"}
          interactive={interactivePoll}
        />
      )}
    </article>
  );
}
