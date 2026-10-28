import { Link, useParams } from 'react-router-dom';
import ArticleImage from '../components/ArticleImage.jsx';
import { Breadcrumb } from '../components/Parts.jsx';
import { CategoryLabel, ReadingTime, SchoolTag } from '../components/Tags.jsx';
import { topicBySlug } from '../data/topics.js';
import { enrich, formatDate, getTopicArticles } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function TopicPage() {
  const { slug } = useParams();
  const topic = topicBySlug[slug];
  useDocumentTitle(topic ? topic.title : 'Nem található');
  if (!topic) return <NotFound />;
  const list = getTopicArticles(topic.id).map(enrich);
  const schoolNames = [...new Set(list.map((a) => a.school.name))];
  return (
    <div className="container section theme-maxi">
      <Breadcrumb items={[{ label: 'Kezdőlap', to: '/' }, { label: 'Közös témák' }, { label: topic.title }]} />
      <header className="topic-head">
        <h1 className="page-head__title">{topic.title}</h1>
        <p className="page-head__desc">{topic.description}</p>
        <p className="topic-head__schools">{list.length} cikk, {schoolNames.length} iskola: {schoolNames.join(', ')}.</p>
      </header>
      <ol className="topic-articles">
        {list.map((a) => (
          <li key={a.id} className="topic-articles__item">
            <div className="topic-articles__media"><ArticleImage imageKey={a.imageKey} ratio="16 / 10" categoryId={a.categoryId} /></div>
            <div>
              <p className="topic__angle">{a.topicAngle}</p>
              <CategoryLabel category={a.category} />
              <h2 className="topic-articles__title"><Link to={`/cikk/${a.slug}`} className="card__link">{a.title}</Link></h2>
              <p className="card__excerpt">{a.excerpt}</p>
              <div className="card__meta">
                <SchoolTag school={a.school} size="sm" />
                <div className="card__byline"><span>{a.author.name}</span><time dateTime={a.date}>{formatDate(a.date)}</time><ReadingTime minutes={a.readingMinutes} /></div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
