import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicArticle from '../components/publication/PublicArticle.jsx';
import { Breadcrumb } from '../components/Parts.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { DEMO_SCHOOL_ID } from '../data/schools.js';
import { getRepository } from '../admin/data/repository.js';
import { categoryOf, publicSchool } from '../admin/lib/publicRefs.js';
import NotFound from './NotFound.jsx';

export default function PublicContentPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getRepository()
      .then((repo) => repo.getPublishedContent(id))
      .then((item) => { if (active) setContent(item); })
      .catch((err) => { if (active) setError(err.message || 'A tartalom nem tölthető be.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useDocumentTitle(content?.title || 'Cikk');

  if (loading) return <p className="container section" role="status">Betöltés…</p>;
  if (error) return <p className="container section poll-widget__error" role="alert">{error}</p>;
  if (!content || content.schoolId !== DEMO_SCHOOL_ID) return <NotFound />;

  return (
    <div className="theme-maxi-lite container section">
      <Breadcrumb items={[{ label: 'Kezdőlap', to: '/' }, { label: 'Szikra', to: '/' }, { label: 'Cikk' }]} />
      <PublicArticle
        content={content}
        category={categoryOf(content.category)}
        school={publicSchool(content.schoolId, null)}
        date={content.publishedAt || content.submittedAt || content.createdAt}
      />
    </div>
  );
}
