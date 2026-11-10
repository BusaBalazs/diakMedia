import { useState } from 'react';
import { Avatar, EmptyState, ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import { btnPrimary, btnSecondary, card, input } from '../components/ui.js';
import { categories } from '../../data/categories.js';
import { FORMAT_LIST } from '../config/formats.js';
import { ROLES, can } from '../config/roles.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { useAsync } from '../lib/useAsync.js';

export function TeamPage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(async () => (await getRepository()).listMembers({ schoolId: user.schoolId }), [user.schoolId]);
  const groups = ['teacher', 'editor', 'author'];
  return (
    <>
      <PageHeader title="Szerkesztőség" description="A szerkesztőség tagjai és szerepkörei." />
      {loading && <Skeleton className="h-48 max-w-2xl" />}
      {error && <ErrorNotice error={error} onRetry={reload} />}
      {data && (data.length ? (
        <div className="grid gap-4 max-w-3xl">
          {groups.map((g) => { const m = data.filter((u) => u.role === g); return m.length ? (
            <section key={g} className={`${card} p-4`} aria-labelledby={`g-${g}`}>
              <h2 id={`g-${g}`} className="text-sm font-semibold">{ROLES[g].label} <span className="font-normal text-muted">({m.length})</span></h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">{m.map((u) => <li key={u.uid} className="flex items-center gap-2.5 text-sm"><Avatar name={u.displayName} /><span><span className="font-medium">{u.displayName}</span>{u.grade && <span className="text-muted">, {u.grade}</span>}</span></li>)}</ul>
            </section>) : null; })}
        </div>
      ) : <div className={card}><EmptyState icon="users" title="Még nincs tag" /></div>)}
    </>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [vals, setVals] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, error, loading, reload } = useAsync(async () => { const s = await (await getRepository()).getSettings(user.schoolId); setVals(Object.fromEntries(FORMAT_LIST.map((f) => [f.id, s.limits?.[f.id] ?? f.defaultLimit]))); return s; }, [user.schoolId]);
  if (!can(user.role, 'settings.manage')) return <><PageHeader title="Beállítások" /><div className={`${card} p-6 text-sm max-w-xl`}>A beállításokat csak a tanár módosíthatja.</div></>;

  const save = async (e) => {
    e.preventDefault();
    const limits = {};
    for (const f of FORMAT_LIST) {
      const n = Number(vals[f.id]);
      if (!Number.isInteger(n) || n < 200 || n > 20000) { setMsg({ tone: 'danger', text: `${f.label}: a korlát 200 és 20 000 közötti egész szám legyen.` }); return; }
      if (n !== f.defaultLimit) limits[f.id] = n;
    }
    setBusy(true); setMsg(null);
    try { await (await getRepository()).saveSettings({ ...data, limits }, { user }); setMsg({ tone: 'ok', text: 'Beállítások mentve.' }); } catch (err) { setMsg({ tone: 'danger', text: err.message }); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Beállítások" description="A szerkesztőség működésének beállításai." />
      {loading && <Skeleton className="h-64 max-w-2xl" />}
      {error && <ErrorNotice error={error} onRetry={reload} />}
      {vals && (
        <div className="grid gap-6 max-w-2xl">
          <form onSubmit={save} className={`${card} grid gap-4 p-5`}>
            <div><h2 className="text-sm font-semibold">Karakterkorlátok formátumonként</h2><p className="mt-1 text-sm text-muted">A szerkesztő az itt megadott korlátot mutatja és érvényesíti. A cím, a bevezető és a kártya mezőinek korlátja külön, állandó.</p></div>
            {FORMAT_LIST.map((f) => (
              <div key={f.id} className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center">
                <label htmlFor={`lim-${f.id}`} className="text-sm font-medium">{f.label} <span className="font-normal text-muted">(alapértelmezés: {f.defaultLimit})</span></label>
                <input id={`lim-${f.id}`} type="number" inputMode="numeric" min={200} max={20000} step={100} className={`${input} h-10`} value={vals[f.id]} onChange={(e) => setVals({ ...vals, [f.id]: e.target.value })} />
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2"><button type="submit" className={btnPrimary} disabled={busy}>Mentés</button><button type="button" className={btnSecondary} onClick={() => setVals(Object.fromEntries(FORMAT_LIST.map((f) => [f.id, f.defaultLimit])))}>Alapértelmezések</button>{msg && <p role={msg.tone === 'danger' ? 'alert' : 'status'} className={`text-sm font-medium ${msg.tone === 'danger' ? 'text-danger-ink' : 'text-ok-ink'}`}>{msg.text}</p>}</div>
          </form>
          <section className={`${card} p-5`}><h2 className="text-sm font-semibold">Kategóriák</h2><p className="mt-1 text-sm text-muted">Jelenleg {categories.length} kategória érhető el. A testreszabásuk a következő fejlesztési lépésben készül.</p><ul className="mt-3 flex flex-wrap gap-1.5">{categories.map((c) => <li key={c.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">{c.name}</li>)}</ul></section>
        </div>
      )}
    </>
  );
}
