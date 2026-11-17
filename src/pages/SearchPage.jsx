import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublishedContentCard from '../components/publication/PublishedContentCard.jsx';
import { EmptyState } from '../components/Parts.jsx';
import { normalize } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { usePublishedContent } from '../lib/usePublishedContent.js';
import { categoryForContent } from '../admin/lib/publicRefs.js';
import { contentTags } from '../lib/tags.js';

export default function SearchPage() {
  useDocumentTitle('Keresés');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [text, setText] = useState(q);
  const { published, error, loading } = usePublishedContent();
  useEffect(() => setText(q), [q]);
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const publishedResults = published.filter((item) => {
    if (!terms.length) return true;
    const data = item.contentData || {};
    const haystack = normalize([
      item.title,
      item.cardData?.title,
      item.cardData?.description,
      item.authorName,
      data.authorDisplayName,
      categoryForContent(item).name,
      data.intro,
      data.body,
      data.question,
      ...(data.options || []),
      data.quote,
      data.quoteSource,
      data.explanation,
      data.closing,
      ...(data.images || []).map((image) => image.caption),
      data.sources,
      contentTags(data.tags).join(' '),
    ].filter(Boolean).join(' '));
    return terms.every((term) => haystack.includes(term));
  });
  const results = publishedResults
    .map((item) => ({
      id: item.id,
      date: item.publishedAt || item.submittedAt || item.createdAt,
      item,
    }))
    .sort((a, b) => {
      const dateOf = (value) => {
        const date = value?.toDate ? value.toDate() : new Date(value);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
      };
      return dateOf(b.date) - dateOf(a.date);
    });

  const update = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p);
  };

  return (
    <div className="container section theme-maxi">
      <header className="page-head">
        <h1 className="page-head__title">Keresés</h1>
        <form className="search-form search-form--page" role="search" onSubmit={(e) => { e.preventDefault(); update({ q: text.trim() }); }}>
          <label htmlFor="page-search" className="visually-hidden">Keresés a Szikra bejegyzései között</label>
          <input id="page-search" type="search" lang="hu" spellCheck="true" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cím, téma, rovat vagy címke" autoComplete="off" />
          <button type="submit" className="btn btn--primary">Keresés</button>
        </form>
      </header>
      {error && (
        <p className="poll-widget__error mb-4" role="alert">
          {error}
        </p>
      )}
      <div className="search-bar">
        <p className="search-bar__count" role="status">
          {loading
            ? "Közzétett bejegyzések betöltése…"
            : q
              ? `${results.length} találat a(z) „${q}” kifejezésre`
              : `${results.length} bejegyzés`}
        </p>
      </div>
      {results.length ? (
        <div className="grid-3">
          {results.map((result) => (
            <PublishedContentCard key={result.id} item={result.item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nincs találat"
          text="Próbáljon rövidebb kifejezést, vagy keressen másik témára."
          actionLabel="Keresés törlése"
          onAction={() => { setText(''); setParams({}); }}
        />
      )}
    </div>
  );
}
