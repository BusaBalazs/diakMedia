import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { ScopeTabs } from '../components/Filters.jsx';
import { EmptyState } from '../components/Parts.jsx';
import { SCOPES, scopeFromParam, scopeLabel, searchArticles } from '../lib/content.js';
import { useSchool } from '../lib/school.jsx';
import { useDocumentTitle } from '../lib/hooks.js';

export default function SearchPage() {
  useDocumentTitle('Keresés');
  const [params, setParams] = useSearchParams();
  const { activeSchoolId } = useSchool();
  const q = params.get('q') || '';
  const scope = scopeFromParam(params.get('lap'));
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  const results = searchArticles(q, scope.id, activeSchoolId);
  const scopeOptions = Object.values(SCOPES).map((s) => ({ id: s.id, label: scopeLabel(s.id, activeSchoolId), count: searchArticles(q, s.id, activeSchoolId).length }));

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
          <label htmlFor="page-search" className="visually-hidden">Keresés a cikkek, kategóriák és iskolák között</label>
          <input id="page-search" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cím, téma, kategória vagy iskola" autoComplete="off" />
          <button type="submit" className="btn btn--primary">Keresés</button>
        </form>
      </header>
      <div className="search-bar">
        <ScopeTabs value={scope.id} onChange={(sid) => update({ lap: sid === 'all' ? '' : SCOPES[sid].param })} options={scopeOptions} />
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
          text="Próbáljon rövidebb kifejezést, vagy keressen kategóriára, iskolára vagy városra. A szűrés törlésével az összes cikket láthatja."
          actionLabel="Keresés törlése"
          onAction={() => { setText(''); setParams({}); }}
        />
      )}
    </div>
  );
}
