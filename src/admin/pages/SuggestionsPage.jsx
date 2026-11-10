import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Counter, Field, TextArea, TextInput } from '../components/FormParts.jsx';
import { EmptyState, ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import { Dot } from '../components/StatusBadge.jsx';
import { btnPrimary, btnSecondary, card, input } from '../components/ui.js';
import { can } from '../config/roles.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { formatDate } from '../lib/date.js';
import { useAsync } from '../lib/useAsync.js';
import SpellcheckAssist from '../components/SpellcheckAssist.jsx';
import { SUGGESTION_CATEGORIES } from '../../data/suggestions.js';

const STATUS = {
  new: { label: 'Új', tone: 'info' }, interesting: { label: 'Érdekes', tone: 'ok' }, info_requested: { label: 'További információt kértünk', tone: 'warn' },
  set_aside: { label: 'Félretéve', tone: 'neutral' }, unsuitable: { label: 'Nem megfelelő', tone: 'danger' },
};
const ACTIONS = [['interesting', 'Érdekes'], ['info_requested', 'További információt kérek'], ['set_aside', 'Félreteszem'], ['unsuitable', 'Nem megfelelő']];

function Item({ s, reviewer, onUpdate }) {
  const [note, setNote] = useState(s.note || '');
  const [busy, setBusy] = useState(false);
  const st = STATUS[s.status] || STATUS.new;
  const go = async (status) => { setBusy(true); try { await onUpdate(s.id, { status, note }); } finally { setBusy(false); } };
  return (
    <li className={`${card} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{SUGGESTION_CATEGORIES[s.category]}<span className="mx-1.5 text-line">|</span>{s.authorName}, {formatDate(s.createdAt)}</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium"><Dot tone={st.tone} />{st.label}</span>
      </div>
      <h2 className="mt-1.5 text-sm font-semibold">{s.title}</h2>
      {s.text && <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{s.text}</p>}
      {!reviewer && s.note && <p className="mt-2 rounded-lg bg-canvas p-2.5 text-sm"><span className="font-medium">A szerkesztőség üzenete:</span> {s.note}</p>}
      {reviewer && (
        <div className="mt-3 grid gap-2 border-t border-line pt-3">
          <label htmlFor={`note-${s.id}`} className="text-xs font-medium text-muted">Belső jegyzet / üzenet a javaslattevőnek</label>
          <textarea id={`note-${s.id}`} rows={2} lang="hu" spellCheck="true" className={`${input} resize-y`} value={note} onChange={(e) => setNote(e.target.value)} />
          <SpellcheckAssist value={note} />
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map(([k, l]) => (<button key={k} type="button" disabled={busy} onClick={() => go(k)} aria-pressed={s.status === k} className={`${btnSecondary} !h-9 ${s.status === k ? '!border-brand !bg-brand-soft !text-brand-dark' : ''}`}>{l}</button>))}
            <Link to={`/admin/tartalmak/uj?cim=${encodeURIComponent(s.title)}`} className={`${btnPrimary} !h-9`}>Tartalom indítása</Link>
          </div>
        </div>
      )}
    </li>
  );
}

export default function SuggestionsPage() {
  const { user } = useAuth();
  const reviewer = can(user.role, 'suggestions.review');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ category: 'topic_idea', title: '', text: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, error, loading, reload } = useAsync(async () => (await getRepository()).listSuggestions({ schoolId: user.schoolId, role: user.role, uid: user.uid }), [user.uid, user.role]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setMsg({ tone: 'danger', text: 'Adj címet a javaslatnak.' }); return; }
    setBusy(true); setMsg(null);
    try { await (await getRepository()).createSuggestion(form, { user }); setForm({ category: 'topic_idea', title: '', text: '' }); setMsg({ tone: 'ok', text: 'Köszönjük, a javaslat megérkezett a szerkesztőséghez.' }); await reload(); } catch (err) { setMsg({ tone: 'danger', text: err.message }); } finally { setBusy(false); }
  };
  const update = async (id, patch) => { await (await getRepository()).updateSuggestion(id, patch, { user }); await reload(); };
  const list = (data || []).filter((s) => filter === 'all' || s.status === filter);

  return (
    <>
      <PageHeader title="Diákjavaslatok" description={reviewer ? 'A diákok javaslatai a szerkesztőségi postaládában. A javaslat nem lesz automatikusan cikk.' : 'Küldj témaötletet, fotót vagy ajánlót a szerkesztőségnek.'} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] items-start">
        <form onSubmit={submit} className={`${card} grid gap-3.5 p-4 sm:p-5`} aria-label="Új javaslat">
          <h2 className="text-sm font-semibold">Új javaslat küldése</h2>
          <Field label="Típus" required>{(a) => <select {...a} className={`${input} h-10`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{Object.entries(SUGGESTION_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</Field>
          <Field label="Cím" required counter={<Counter used={form.title.length} max={120} />}>{(a) => <TextInput {...a} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />}</Field>
          <Field label="Részletek" optional counter={<Counter used={form.text.length} max={500} />}>{(a) => <TextArea {...a} rows={4} maxLength={500} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />}</Field>
          <button type="submit" className={btnPrimary} disabled={busy}>Javaslat elküldése</button>
          {msg && <p role={msg.tone === 'danger' ? 'alert' : 'status'} className={`text-sm font-medium ${msg.tone === 'danger' ? 'text-danger-ink' : 'text-ok-ink'}`}>{msg.text}</p>}
        </form>

        <section aria-labelledby="inbox-title" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="inbox-title" className="text-sm font-semibold">{reviewer ? 'Szerkesztőségi postaláda' : 'Korábbi javaslataid'}</h2>
            <select aria-label="Szűrés állapot szerint" className={`${input} h-9 !w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Minden állapot</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {loading && <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>}
          {error && <ErrorNotice error={error} onRetry={reload} />}
          {!loading && !error && (list.length ? <ul className="grid gap-3">{list.map((s) => <Item key={s.id} s={s} reviewer={reviewer} onUpdate={update} />)}</ul> : <div className={card}><EmptyState title="Nincs javaslat" text="Ebben a nézetben nincs megjeleníthető javaslat." /></div>)}
        </section>
      </div>
    </>
  );
}
