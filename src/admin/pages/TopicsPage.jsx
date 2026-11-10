import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Counter, Field, TextArea, TextInput } from '../components/FormParts.jsx';
import { Icon } from '../components/Icons.jsx';
import { EmptyState, ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import { btnPrimary, btnSecondary, input } from '../components/ui.js';
import { categories, categoryById } from '../../data/categories.js';
import { can } from '../config/roles.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { formatDate } from '../lib/date.js';
import { useAsync } from '../lib/useAsync.js';

const NOTE_COLORS = ['#FFF3B0', '#E9F9A6', '#CFF3E6', '#FFE2D6', '#FFFFFF'];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const hand = { fontFamily: "'Permanent Marker', 'Inter Variable', cursive" };

function Note({ t, user, members, reviewer, onAction, busy }) {
  const [confirming, setConfirming] = useState(false);
  const [assignee, setAssignee] = useState('');
  const h = hash(t.id);
  const rot = ((h % 5) - 2) * 0.7;
  const claimed = t.status === 'claimed';
  const mine = claimed && t.claimedBy === user.uid;
  const other = claimed && !mine;
  const canDiscard = reviewer && !t.contentId && (!claimed || mine || user.role === 'teacher');
  return (
    <li className="relative" style={{ transform: `rotate(${rot}deg)` }}>
      <article className={`relative flex h-full flex-col gap-2 rounded-sm p-4 pt-6 shadow-[2px_4px_10px_rgba(23,25,35,0.12)] transition-transform hover:-translate-y-0.5 ${other ? 'opacity-90' : ''}`} style={{ background: NOTE_COLORS[h % NOTE_COLORS.length] }}>
        <span className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[-2deg] bg-white/60 border border-black/5" aria-hidden="true" />
        {claimed && (
          <p className="absolute right-2 top-2 rotate-[3deg] rounded bg-ink px-2 py-0.5 text-[13px] leading-tight text-lime" style={hand}>
            Lefoglalva: {t.claimedByName}
          </p>
        )}
        {t.category && <p className="text-xs font-medium text-gray-700">{categoryById[t.category]?.name}</p>}
        <h2 className="text-[15px] font-semibold leading-snug text-ink">{t.title}</h2>
        {t.note && <p className="text-sm text-gray-800">{t.note}</p>}
        <p className="mt-auto pt-2 text-xs text-gray-600">Javasolta: <span className="font-medium">{t.createdByName}</span>, {formatDate(t.createdAt)}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!claimed && reviewer && <button type="button" disabled={busy} onClick={() => onAction('claim', t)} className={`${btnPrimary} !h-9`}>Feldolgozom</button>}
          {mine && <><button type="button" disabled={busy} onClick={() => onAction('continue', t)} className={`${btnPrimary} !h-9`}>{t.contentId ? 'Piszkozat folytatása' : 'Folytatom'}</button>{!t.contentId && <button type="button" disabled={busy} onClick={() => onAction('release', t)} className={`${btnSecondary} !h-9`}>Felszabadítom</button>}</>}
          {other && <span className="text-xs font-medium text-gray-700">{t.claimedByName} dolgozik rajta</span>}
          {t.contentId && reviewer && <Link to={`/admin/tartalmak/${t.contentId}`} className={`${btnSecondary} !h-9`}>Piszkozat megnyitása</Link>}
          {!claimed && reviewer && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`assignee-${t.id}`}>Feldolgozó kijelölése</label>
              <select id={`assignee-${t.id}`} className={`${input} h-9 !w-auto`} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Szerkesztőségi tag kijelölése</option>
                {members.map((m) => <option key={m.uid} value={m.uid}>{m.displayName} ({m.role === 'editor' ? 'szerkesztő' : 'szerző'})</option>)}
              </select>
              <button type="button" disabled={busy || !assignee} onClick={() => onAction('assign', t, assignee)} className={`${btnSecondary} !h-9`}>Kijelölés piszkozatként</button>
            </div>
          )}
          {canDiscard && (confirming ? (
            <span className="inline-flex items-center gap-1.5 text-sm"><span className="font-medium">Biztosan?</span><button type="button" disabled={busy} onClick={() => onAction('discard', t)} className="h-9 rounded-lg bg-danger px-3 text-sm font-medium text-white hover:opacity-90">Igen, elvetem</button><button type="button" onClick={() => setConfirming(false)} className="h-9 px-2 text-sm underline">Mégsem</button></span>
          ) : <button type="button" disabled={busy} onClick={() => setConfirming(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-danger-ink hover:bg-white/60"><Icon name="trash" size={15} /> Elvetés</button>)}
        </div>
      </article>
    </li>
  );
}

export default function TopicsPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const reviewer = can(user.role, 'content.review');
  const [filter, setFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const ctx = { user };
  const { data, error, loading, reload } = useAsync(async () => {
    const repo = await getRepository();
    const [topics, members] = await Promise.all([
      repo.listTopics({ schoolId: user.schoolId }),
      reviewer ? repo.listMembers({ schoolId: user.schoolId }) : [],
    ]);
    return { topics, members: members.filter((m) => ['editor', 'author'].includes(m.role)) };
  }, [user.schoolId, reviewer]);

  if (!can(user.role, 'topics.use')) return <><PageHeader title="Téma javaslat" /><div className="rounded-xl border border-line bg-surface p-6 text-sm max-w-xl">Ezt a jegyzetfüzetet szerkesztőségi tagok használhatják.</div></>;

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setMsg({ tone: 'danger', text: 'Írd le röviden a témát.' }); return; }
    setBusy(true); setMsg(null);
    try { await (await getRepository()).createTopic({ title, note, category }, ctx); setTitle(''); setNote(''); setCategory(''); setMsg({ tone: 'ok', text: 'Felírva a jegyzetfüzetbe.' }); await reload(); } catch (err) { setMsg({ tone: 'danger', text: err.message }); } finally { setBusy(false); }
  };

  const act = async (what, t, assigneeUid) => {
    setBusy(true); setMsg(null);
    try {
      const repo = await getRepository();
      if (what === 'claim') { await repo.claimTopic(t.id, ctx); nav(`/admin/tartalmak/uj?tema=${t.id}`); return; }
      if (what === 'assign') {
        const content = await repo.assignTopic(t.id, assigneeUid, ctx);
        setMsg({ tone: 'ok', text: 'A téma bekerült a kijelölt tag piszkozatába.' });
        if (content.authorId === user.uid) { nav(`/admin/tartalmak/${content.id}/szerkeszt`); return; }
      }
      if (what === 'continue') { nav(t.contentId ? `/admin/tartalmak/${t.contentId}/szerkeszt` : `/admin/tartalmak/uj?tema=${t.id}`); return; }
      if (what === 'release') { await repo.releaseTopic(t.id, ctx); setMsg({ tone: 'ok', text: 'A téma újra szabad.' }); }
      if (what === 'discard') { await repo.discardTopic(t.id, ctx); setMsg({ tone: 'ok', text: 'A téma kikerült a listából.' }); }
      await reload();
    } catch (err) { setMsg({ tone: 'danger', text: err.message }); await reload(); } finally { setBusy(false); }
  };

  const all = data?.topics || [];
  const members = data?.members || [];
  const shown = all.filter((t) => (filter === 'free' ? t.status === 'open' : filter === 'claimed' ? t.status === 'claimed' : true));
  const free = all.filter((t) => t.status === 'open').length;

  return (
    <>
      <PageHeader title="Téma javaslat" description="Közös jegyzetfüzet a szerkesztőségnek. A szerkesztők és a tanárok feldolgozhatják, elvethetik vagy piszkozatként kijelölhetik a témákat." />
      <div className="adm-notebook rounded-2xl border border-line p-4 sm:p-6 lg:p-8">
        <form onSubmit={add} className="mx-auto mb-8 grid max-w-2xl gap-3 rounded-lg border-2 border-dashed border-ink/20 bg-white/80 p-4 sm:p-5" aria-label="Új téma felírása">
          <p className="text-lg text-ink" style={hand}>Mi legyen a téma?</p>
          <Field label="Ötlet" required counter={<Counter used={title.length} max={140} />}>{(a) => <TextInput {...a} maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pl. Hogyan tanuljunk a vizsgaidőszakban?" />}</Field>
          <Field label="Rövid megjegyzés" optional counter={<Counter used={note.length} max={300} />}>{(a) => <TextArea {...a} rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
          <Field label="Kategória" optional>{(a) => <select {...a} className={`${input} h-10`} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Még nem tudom</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</Field>
          <div className="flex flex-wrap items-center gap-3"><button type="submit" className={btnPrimary} disabled={busy}><Icon name="plus" size={16} /> Felírom</button>{msg && <p role={msg.tone === 'danger' ? 'alert' : 'status'} className={`text-sm font-medium ${msg.tone === 'danger' ? 'text-danger-ink' : 'text-ok-ink'}`}>{msg.text}</p>}</div>
        </form>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700"><strong className="font-semibold">{all.length}</strong> téma a füzetben, ebből <strong className="font-semibold">{free}</strong> szabad.</p>
          <div role="group" aria-label="Szűrés" className="inline-flex rounded-lg border border-line bg-white p-0.5 text-sm">
            {[['all', 'Mind'], ['free', 'Szabad'], ['claimed', 'Lefoglalt']].map(([k, l]) => (<button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={`h-8 px-3 rounded-md font-medium ${filter === k ? 'bg-brand text-white' : 'text-gray-700 hover:bg-canvas'}`}>{l}</button>))}
          </div>
        </div>

        {loading && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}</div>}
        {error && <ErrorNotice error={error} onRetry={reload} />}
        {!loading && !error && shown.length === 0 && <EmptyState icon="notebook" title={all.length ? 'Nincs ilyen téma' : 'Üres a füzet'} text={all.length ? 'Ezzel a szűréssel nincs megjeleníthető téma.' : 'Írj fel egy ötletet a fenti lapra.'} />}
        {!loading && !error && shown.length > 0 && <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 pt-2">{shown.map((t) => <Note key={t.id} t={t} user={user} members={members} reviewer={reviewer} onAction={act} busy={busy} />)}</ul>}
      </div>
      <p className="mt-3 text-xs text-muted">A kijelölt téma a megjelölt szerkesztőségi tag piszkozatába kerül. Tanár nem jelölhető ki; a piszkozat később tanári vagy szerkesztői jogosultsággal átruházható.</p>
    </>
  );
}
