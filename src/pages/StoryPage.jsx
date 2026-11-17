import { Navigate, useParams } from 'react-router-dom';
import { usePublishedContent } from '../lib/usePublishedContent.js';
import { slugify } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function StoryPage() {
  const { slug } = useParams();
  const { published, error, loading } = usePublishedContent();
  const content = published.find(
    (item) => item.format === 'visual_story' && slugify(item.title) === slug,
  );
  useDocumentTitle(content?.title || 'Képes történet');

  if (loading) return <p className="container section" role="status">Betöltés…</p>;
  if (error) return <p className="container section poll-widget__error" role="alert">{error}</p>;
  if (!content) return <NotFound />;
  return <Navigate to={`/tartalom/${content.id}`} replace />;
}
