import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import { Avatar, ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import StatusBadge, { Dot } from '../components/StatusBadge.jsx';
import { btnDanger, btnPrimary, btnSecondary, card, input } from '../components/ui.js';
import PublicArticle from '../../components/publication/PublicArticle.jsx';
import { CardPreview } from './CardEditor.jsx';
import { cardOutOfSync } from '../config/content.js';
import { FORMATS } from '../config/formats.js';
import { can } from '../config/roles.js';
import { availableActions, canEditContent } from '../config/transitions.js';
import { STATUSES } from '../config/workflow.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { formatDateTime } from '../lib/date.js';
import { categoryOf, publicSchool } from '../lib/publicRefs.js';
import { useAsync } from '../lib/useAsync.js';
import SpellcheckAssist from '../components/SpellcheckAssist.jsx';

const FLOW = ['draft', 'submitted', 'editorial_review', 'awaiting_teacher', 'published'];

function Progress({ status }) {
  const idx = FLOW.indexOf(status);
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs" aria-label="Munkafolyamat">
      {FLOW.map((s, i) => {
        const active = s === status; const done = idx > i;
        return (<li key={s} className="flex items-center gap-1"><span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-medium ${active ? 'bg-brand text-white' : done ? 'bg-brand-soft text-brand-dark' : 'bg-gray-100 text-muted'}`}>{done && <Icon name="check" size={12} />}{STATUSES[s].label}</span>{i < FLOW.length - 1 && <span className="text-line">›</span>}</li>);
      })}
      {idx === -1 && <li><StatusBadge status={status} /></li>}
    </ol>
  );
}

function NotesPanel({ notes, user, onAdd }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const reviewer = can(user.role, 'content.review');
  const feedback = notes.filter((n) => n.type === 'feedback');
  const internal = notes.filter((n) => n.type === 'internal');
  const row = (n) => (<li key={n.id} className="rounded-lg bg-canvas p-3 text-sm"><p className="flex items-center gap-2 text-xs text-muted"><Avatar name={n.authorName} size="sm" /><span className="font-medium text-gray-700">{n.authorName}</span><time>{formatDateTime(n.createdAt)}</time></p><p className="mt-1.5 whitespace-pre-line">{n.text}</p></li>);
  return (
    <div className="grid gap-5">
      <section aria-labelledby="fb-title">
        <h3 id="fb-title" className="text-sm font-semibold">Visszajelzés a szerzőnek</h3>
        <ul className="mt-2 grid gap-2">{feedback.map(row)}{feedback.length === 0 && <li className="text-sm text-muted">Még nincs visszajelzés.</li>}</ul>
      </section>
      {reviewer && (
        <section aria-labelledby="int-title">
          <h3 id="int-title" className="text-sm font-semibold">Belső szerkesztői jegyzetek <span className="font-normal text-muted">(a szerző nem látja)</span></h3>
          <ul className="mt-2 grid gap-2">{internal.map(row)}{internal.length === 0 && <li className="text-sm text-muted">Még nincs belső jegyzet.</li>}</ul>
          <form className="mt-3 grid gap-2" onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; setBusy(true); try { await onAdd(text); setText(''); } finally { setBusy(false); } }}>
            <label htmlFor="new-note" className="sr-only">Új belső jegyzet</label>
            <textarea id="new-note" rows={3} lang="hu" spellCheck="true" className={`${input} resize-y`} placeholder="Belső jegyzet a szerkesztőségnek…" value={text} onChange={(e) => setText(e.target.value)} />
            <SpellcheckAssist value={text} />
            <button type="submit" className={`${btnSecondary} justify-self-start`} disabled={busy || !text.trim()}>Jegyzet mentése</button>
          </form>
        </section>
      )}
    </div>
  );
}

function ActionsPanel({ content, user, onRun }) {
  const actions = availableActions(user, content).filter((a) => a.id !== 'author_withdraw' || true);
  const [open, setOpen] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const start = (a) => { setErr(''); setNote(''); if (a.note === 'none') confirm(a); else setOpen(a); };
  const confirm = async (a) => {
    if (a.note === 'required' && !note.trim()) { setErr('Írj egy rövid indoklást.'); return; }
    setBusy(true); setErr('');
    try { await onRun(a, note); setOpen(null); setNote(''); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  if (!actions.length) return <p className="text-sm text-muted">Ebben az állapotban nincs elérhető művelet a te szerepköröddel.</p>;
  return (
    <div className="grid gap-2">
      {actions.map((a) => (
        <button key={a.id} type="button" disabled={busy} onClick={() => start(a)} aria-expanded={open?.id === a.id}
          className={`w-full ${a.variant === 'primary' ? btnPrimary : a.danger ? btnDanger : btnSecondary}`}>{a.label}</button>
      ))}
      {open && (
        <form className="mt-1 grid gap-2 rounded-lg border border-line bg-canvas p-3" onSubmit={(e) => { e.preventDefault(); confirm(open); }}>
          <label htmlFor="action-note" className="text-sm font-medium">{open.label}: {open.note === 'required' ? 'indoklás (kötelező)' : 'megjegyzés (nem kötelező)'}</label>
          {open.feedback && <p className="text-xs text-muted">Ezt a szerző is látni fogja.</p>}
          <textarea id="action-note" rows={3} lang="hu" spellCheck="true" autoFocus className={`${input} resize-y`} value={note} onChange={(e) => setNote(e.target.value)} />
          <SpellcheckAssist value={note} />
          {err && <p role="alert" className="text-xs font-medium text-danger-ink">{err}</p>}
          <div className="flex gap-2"><button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Folyamatban…' : 'Megerősítés'}</button><button type="button" className={btnSecondary} onClick={() => setOpen(null)}>Mégsem</button></div>
        </form>
      )}
      {!open && err && <p role="alert" className="text-xs font-medium text-danger-ink">{err}</p>}
    </div>
  );
}

export default function ContentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState('card');
  const [device, setDevice] = useState('desktop');
  const [flash, setFlash] = useState(location.state?.flash || '');
  const [assignee, setAssignee] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const ctx = { schoolId: user.schoolId, role: user.role, uid: user.uid };
  const { data, error, loading, reload } = useAsync(async () => {
    const repo = await getRepository();
    const [content, school, members] = await Promise.all([
      repo.getContent(id, ctx),
      repo.getSchool(user.schoolId),
      can(user.role, 'content.review') ? repo.listMembers({ schoolId: user.schoolId }) : [],
    ]);
    const notes = content ? await repo.listNotes(id, { role: user.role }) : [];
    return { content, school, notes, members };
  }, [id, user.uid, user.role]);

  if (loading) return <><PageHeader title="Tartalom" /><Skeleton className="h-96" /></>;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;
  const c = data.content;
  if (!c) return <div className={`${card} p-6 max-w-xl text-sm`}>Ez a tartalom nem található, vagy nincs jogosultságod megnyitni.</div>;

  const school = data.school;
  const category = categoryOf(c.category);
  const editable = canEditContent(user, c);
  const changed = cardOutOfSync(c);
  const reviewer = can(user.role, 'content.review');

  const run = async (a, note) => { const repo = await getRepository(); await repo.transition(id, a.id, { user, note }); setFlash(`Kész: ${a.label}.`); await reload(); };
  const addNote = async (text) => { await (await getRepository()).addNote(id, text, { user }); await reload(); };
  const reassign = async (e) => {
    e.preventDefault();
    if (!assignee) return;
    setAssigning(true);
    setAssignmentError('');
    try {
      await (await getRepository()).reassignDraft(id, assignee, { user });
      setAssignee('');
      setFlash('A piszkozat új szerzőhöz került.');
      await reload();
    } catch (err) {
      setAssignmentError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <PageHeader
        title={c.title}
        description={`${FORMATS[c.format].label}, ${category.name}`}
        actions={<><Link to="/admin/tartalmak" className={btnSecondary}>Vissza a listához</Link>{editable && <><Link to={`/admin/tartalmak/${id}/szerkeszt`} className={btnSecondary}><Icon name="edit" size={16} /> Tartalom szerkesztése</Link><Link to={`/admin/tartalmak/${id}/kartya`} className={btnPrimary}>{c.cardData ? 'Kártya szerkesztése / beküldés' : 'Kártya létrehozása'}</Link></>}</>}
      />
      {flash && <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-ok/30 bg-ok/5 px-4 py-3 text-sm font-medium text-ok-ink"><span>{flash}</span><button type="button" onClick={() => setFlash('')} className="text-xs underline">Bezár</button></div>}
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2"><StatusBadge status={c.status} /><Progress status={c.status} /></div>
      {c.status === 'changes_requested' && c.feedback && <div role="status" className="mb-5 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm"><p className="font-semibold text-danger-ink">Módosítást kértek</p><p className="mt-0.5 whitespace-pre-line">{c.feedback}</p></div>}
      {changed && reviewer && <div role="alert" className="mb-5 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm"><p className="font-semibold text-warn-ink">A kártya frissítésre szorulhat</p><p className="mt-0.5">A cikk {changed.join(' és ')} megváltozott a kártya utolsó egyeztetése óta. A kártya szövegét nem írtuk felül.</p></div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] items-start">
        <div className="min-w-0">
          <div role="tablist" aria-label="Nézet" className="mb-3 inline-flex rounded-lg border border-line bg-surface p-0.5 text-sm">
            {[['card', 'Főoldali kártya'], ['article', 'Teljes tartalom']].map(([k, l]) => (
              <button key={k} id={`tab-${k}`} role="tab" type="button" aria-selected={tab === k} aria-controls={`panel-${k}`} onClick={() => setTab(k)} className={`h-9 px-4 rounded-md font-medium ${tab === k ? 'bg-brand text-white' : 'text-gray-700 hover:bg-canvas'}`}>{l}</button>
            ))}
          </div>
          {tab === 'card' && (
            <div id="panel-card" role="tabpanel" aria-labelledby="tab-card">
              {c.cardData ? (
                <>
                  <div role="group" aria-label="Eszköz" className="mb-3 inline-flex rounded-lg border border-line bg-surface p-0.5 text-sm">
                    {[['desktop', 'Asztali'], ['mobile', 'Mobil']].map(([k, l]) => (<button key={k} type="button" aria-pressed={device === k} onClick={() => setDevice(k)} className={`h-8 px-3 rounded-md font-medium ${device === k ? 'bg-ink text-white' : 'text-gray-700 hover:bg-canvas'}`}>{l}</button>))}
                  </div>
                  <CardPreview content={c} cardData={c.cardData} school={school} device={device} />
                </>
              ) : <div className={`${card} p-6 text-sm text-muted`}>Ehhez a tartalomhoz még nem készült kártya.</div>}
            </div>
          )}
          {tab === 'article' && (
            <div id="panel-article" role="tabpanel" aria-labelledby="tab-article" className="public-preview theme-maxi rounded-xl border border-line overflow-hidden">
              <PublicArticle content={c} category={category} school={publicSchool(c.schoolId, school)} date={c.publishedAt || c.submittedAt || c.createdAt} interactivePoll={false} />
            </div>
          )}
        </div>

        <aside className="grid gap-4 xl:sticky xl:top-24">
          <section className={`${card} p-4`} aria-labelledby="meta-title">
            <h2 id="meta-title" className="text-sm font-semibold">Részletek</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">Szerző</dt><dd className="font-medium">{c.authorName}</dd>
              <dt className="text-muted">Létrehozva</dt><dd>{formatDateTime(c.createdAt)}</dd>
              <dt className="text-muted">Beküldve</dt><dd>{c.submittedAt ? formatDateTime(c.submittedAt) : 'még nem'}</dd>
              {c.publishedAt && <><dt className="text-muted">Közzétéve</dt><dd>{formatDateTime(c.publishedAt)}</dd></>}
            </dl>
          </section>
          <section className={`${card} p-4`} aria-labelledby="act-title">
            <h2 id="act-title" className="mb-3 text-sm font-semibold">Műveletek</h2>
            <ActionsPanel key={`${c.id}-${c.status}`} content={c} user={user} onRun={run} />
          </section>
          {reviewer && c.status === 'draft' && (
            <section className={`${card} p-4`} aria-labelledby="assign-title">
              <h2 id="assign-title" className="text-sm font-semibold">Piszkozat átruházása</h2>
              <form className="mt-3 grid gap-2" onSubmit={reassign}>
                <label htmlFor="draft-assignee" className="text-xs text-muted">Új szerző (tanár nem jelölhető ki)</label>
                <select id="draft-assignee" className={`${input} h-10`} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Válassz szerkesztőségi tagot</option>
                  {data.members.filter((m) => ['editor', 'author'].includes(m.role) && m.uid !== c.authorId).map((m) => <option key={m.uid} value={m.uid}>{m.displayName} ({m.role === 'editor' ? 'szerkesztő' : 'szerző'})</option>)}
                </select>
                <button type="submit" className={btnSecondary} disabled={assigning || !assignee}>{assigning ? 'Átruházás…' : 'Piszkozat átruházása'}</button>
                {assignmentError && <p role="alert" className="text-xs font-medium text-danger-ink">{assignmentError}</p>}
              </form>
            </section>
          )}
          <section className={`${card} p-4`} aria-labelledby="notes-title">
            <h2 id="notes-title" className="mb-3 text-sm font-semibold">Jegyzetek és visszajelzések</h2>
            <NotesPanel notes={data.notes} user={user} onAdd={addNote} />
          </section>
        </aside>
      </div>
    </>
  );
}
