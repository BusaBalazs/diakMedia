import { Link } from "react-router-dom";
import PublicationCard from "./PublicationCard.jsx";
import { categoryForContent, publicSchool } from "../../admin/lib/publicRefs.js";

//--------------------------------------------------------------
export default function PublishedContentCard({ item }) {
  const category = categoryForContent(item);
  const card = {
    format: item.format,
    title: item.cardData.title,
    description: item.cardData.description,
    imageUrl: item.cardData.imageUrl,
    quoteSource:
      item.format === "one_thought" && !item.contentData.isOwn
        ? item.contentData.quoteSource
        : "",
    authorName: item.authorName,
    authorDisplayName:
      item.format === "opinion" ? item.contentData.authorDisplayName : "",
    imageCount:
      item.format === "visual_story"
        ? (item.contentData.images || []).length
        : 0,
    date: item.publishedAt || item.submittedAt || item.createdAt,
    contentId: item.id,
    status: item.status,
    poll: item.format === "poll" ? item.contentData : null,
  };
  const publicationCard = (
    <PublicationCard
      card={card}
      category={category}
      school={publicSchool(item.schoolId, null)}
      interactivePoll={item.format === "poll"}
    />
  );
  if (item.format === "poll") return publicationCard;
  return (
    <Link
      to={`/tartalom/${item.id}`}
      className="home-publication-link"
      aria-label={`Olvasd el: ${card.title}`}
    >
      {publicationCard}
    </Link>
  );
}
