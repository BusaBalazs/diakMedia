import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { EmptyState } from '../components/Parts.jsx';
import { searchArticles } from '../lib/content.js';
import { useDocumentTitle } from '../lib/hooks.js';

export default function SearchPage() {
  useDocumentTitle('Keresés');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  const results = searchArticles(q);

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
          <label htmlFor="page-search" className="visually-hidden">Keresés a Szikra cikkei között</label>
          <input id="page-search" type="search" lang="hu" spellCheck="true" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cím, téma vagy rovat" autoComplete="off" />
          <button type="submit" className="btn btn--primary">Keresés</button>
        </form>
      </header>
      <div className="search-bar">
        <p className="search-bar__count" role="status">
          {q ? `${results.length} találat a(z) „${q}” kifejezésre` : `${results.length} cikk`}
        </p>
      </div>
      {results.length ? (
        <div className="grid-3">
          {results.map((a, i) => (<ArticleCard key={a.id} article={a} index={i} badges />))}
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
