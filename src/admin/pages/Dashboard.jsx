import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import { Avatar, EmptyState, ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import StatusBadge, { Dot } from '../components/StatusBadge.jsx';
import { btnPrimary, card, linkAction } from '../components/ui.js';
import { categoryById } from '../../data/categories.js';
import { FORMATS } from '../config/formats.js';
import { ROLES, can } from '../config/roles.js';
import { STATUSES, WORKFLOW_ORDER } from '../config/workflow.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { formatDate, toDate } from '../lib/date.js';
import { useAsync } from '../lib/useAsync.js';

const countByStatus = (items) => {
  const by = Object.fromEntries(WORKFLOW_ORDER.map((s) => [s, 0]));
  items.forEach((i) => { by[i.status] = (by[i.status] || 0) + 1; });
  return by;
};

function StatCard({ label, value, hint, tone, to, attention }) {
  return (
    <Link to={to} className={`${card} group flex flex-col gap-1 p-4 transition-shadow hover:shadow-pop focus-visible:outline-brand`}>
      <span className="flex items-center justify-between gap-2 text-sm font-medium text-muted">
        <span className="inline-flex items-center gap-2"><Dot tone={tone} />{label}</span>
        {attention && <span className="inline-flex items-center h-5 px-2 rounded-full bg-lime text-ink text-[11px] font-semibold">Teendő</span>}
      </span>
      <span className="text-3xl font-bold tabular-nums tracking-tight text-ink">{value}</span>
      <span className="text-xs text-muted">{hint}</span>
    </Link>
  );
}

function StatCards({ by, role }) {
  const own = role === 'author';
  const hint = own ? 'Csak a saját tartalmaid' : 'Az iskola tartalmai';
  const cards = [
    { key: 'submitted', label: 'Új beküldések', tone: 'info', attention: role === 'editor' && by.submitted > 0 },
    { key: 'editorial_review', label: 'Szerkesztői lektorálásra vár', tone: 'warn', attention: false },
    { key: 'awaiting_teacher', label: 'Tanári jóváhagyásra vár', tone: 'warn', attention: role === 'teacher' && by.awaiting_teacher > 0 },
    { key: 'published', label: 'Közzétett tartalmak', tone: 'ok', attention: false },
  ];
  return (
    <section aria-label="Összesítő" className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => (<StatCard key={c.key} label={c.label} value={by[c.key]} hint={hint} tone={c.tone} attention={c.attention} to={`/admin/tartalmak?statusz=${c.key}`} />))}
    </section>
  );
}

function attentionItems(role, by, newSuggestions, openTopics) {
  const list = [];
  if (role === 'teacher') {
    if (by.awaiting_teacher) list.push({ n: by.awaiting_teacher, text: 'tartalom vár a jóváhagyásodra', to: '/admin/tartalmak?statusz=awaiting_teacher', tone: 'warn' });
    if (by.submitted) list.push({ n: by.submitted, text: 'új beküldés vár a szerkesztőségre', to: '/admin/tartalmak?statusz=submitted', tone: 'info' });
  }
  if (role === 'editor') {
    if (by.submitted) list.push({ n: by.submitted, text: 'új beküldés vár lektorálásra', to: '/admin/tartalmak?statusz=submitted', tone: 'info' });
    if (by.editorial_review) list.push({ n: by.editorial_review, text: 'tartalom lektorálás alatt', to: '/admin/tartalmak?statusz=editorial_review', tone: 'warn' });
  }
  if (role === 'author') {
    if (by.changes_requested) list.push({ n: by.changes_requested, text: 'tartalmadhoz módosítást kértek', to: '/admin/tartalmak?statusz=changes_requested', tone: 'danger' });
    if (by.draft) list.push({ n: by.draft, text: 'piszkozatod vár befejezésre', to: '/admin/tartalmak?statusz=draft', tone: 'neutral' });
  }
  if ((role === 'teacher' || role === 'editor') && newSuggestions) list.push({ n: newSuggestions, text: 'új diákjavaslat érkezett', to: '/admin/javaslatok', tone: 'info' });
  if ((role === 'teacher' || role === 'editor') && openTopics) list.push({ n: openTopics, text: 'témajavaslat vár feldolgozásra', to: '/admin/temajavaslat', tone: 'warn' });
  if (role === 'teacher' && by.changes_requested) list.push({ n: by.changes_requested, text: 'tartalom javításra vár a szerzőnél', to: '/admin/tartalmak?statusz=changes_requested', tone: 'danger' });
  return list;
}

function AttentionPanel({ items }) {
  return (
    <section aria-labelledby="attention-title" className={`${card} p-4 sm:p-5`}>
      <h2 id="attention-title" className="text-sm font-semibold text-ink">Mire van szükség most?</h2>
      {items.length ? (
        <ul className="mt-3 grid gap-1">
          {items.map((a) => (
            <li key={a.text}>
              <Link to={a.to} className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-canvas transition-colors">
                <Dot tone={a.tone} />
                <span className="text-sm"><strong className="font-semibold tabular-nums">{a.n}</strong> {a.text}</span>
                <Icon name="chevronRight" size={16} className="ml-auto text-muted shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted"><span className="text-ok"><Icon name="check" size={18} /></span> Minden rendben, jelenleg nincs teendő.</p>
      )}
    </section>
  );
}

function RecentList({ items }) {
  return (
    <section aria-labelledby="recent-title" className={`${card} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-line">
        <h2 id="recent-title" className="text-sm font-semibold text-ink">Legutóbbi beküldések</h2>
        <Link to="/admin/tartalmak" className={linkAction}>Minden tartalom <Icon name="chevronRight" size={14} /></Link>
      </div>
      {items.length ? (
        <ul className="divide-y divide-line">
          {items.map((c) => (
            <li key={c.id}>
              <Link to={`/admin/tartalmak/${c.id}`} className="grid gap-x-4 gap-y-1.5 px-4 sm:px-5 py-3.5 hover:bg-canvas transition-colors md:grid-cols-[minmax(0,1fr)_8rem_12.5rem] md:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink leading-snug">{c.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{FORMATS[c.format]?.label}<span className="mx-1.5 text-line">|</span>{categoryById[c.category]?.name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted min-w-0 md:flex-col md:items-start md:gap-0.5">
                  <span className="inline-flex items-center gap-1.5 text-gray-700 font-medium min-w-0"><Avatar name={c.authorName} size="sm" /><span className="truncate">{c.authorName}</span></span>
                  <time dateTime={toDate(c.submittedAt)?.toISOString()}>{formatDate(c.submittedAt)}</time>
                </div>
                <div className="md:justify-self-end"><StatusBadge status={c.status} /></div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Még nincs beküldött tartalom" text="Amint valaki beküld egy cikket, itt jelenik meg." action={<Link to="/admin/tartalmak/uj" className={`${btnPrimary} mt-2`}>Új tartalom</Link>} />
      )}
    </section>
  );
}

function WorkflowPanel({ by }) {
  return (
    <section aria-labelledby="flow-title" className={`${card} p-4 sm:p-5`}>
      <h2 id="flow-title" className="text-sm font-semibold text-ink">Munkafolyamat</h2>
      <ol className="mt-3 grid gap-0.5">
        {WORKFLOW_ORDER.map((s) => (
          <li key={s}>
            <Link to={`/admin/tartalmak?statusz=${s}`} className="flex items-center gap-2.5 -mx-2 px-2 h-9 rounded-lg hover:bg-canvas transition-colors text-sm">
              <Dot tone={STATUSES[s].tone} />
              <span className="flex-1">{STATUSES[s].label}</span>
              <span className="tabular-nums font-semibold text-ink">{by[s]}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SideCard({ role, newSuggestions }) {
  if (can(role, 'suggestions.review')) {
    return (
      <section className={`${card} p-4 sm:p-5`} aria-labelledby="sugg-title">
        <h2 id="sugg-title" className="text-sm font-semibold text-ink">Diákjavaslatok</h2>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{newSuggestions}</p>
        <p className="text-xs text-muted">új javaslat a szerkesztőségi postaládában</p>
        <Link to="/admin/javaslatok" className={`${linkAction} mt-3`}>Megnyitás <Icon name="chevronRight" size={14} /></Link>
      </section>
    );
  }
  return (
    <section className={`${card} p-4 sm:p-5`} aria-labelledby="sugg-title">
      <h2 id="sugg-title" className="text-sm font-semibold text-ink">Van ötleted?</h2>
      <p className="mt-1.5 text-sm text-muted">Küldj témajavaslatot, fotót vagy ajánlót a szerkesztőségnek.</p>
      <Link to="/admin/javaslatok" className={`${linkAction} mt-3`}>Javaslat küldése <Icon name="chevronRight" size={14} /></Link>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Betöltés">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(async () => {
    const repo = await getRepository();
    const [content, newSuggestions, openTopics] = await Promise.all([
      repo.listContent({ schoolId: user.schoolId, role: user.role, uid: user.uid }),
      can(user.role, 'suggestions.review') ? repo.countNewSuggestions({ schoolId: user.schoolId }) : 0,
      can(user.role, 'content.review') ? repo.countOpenTopics({ schoolId: user.schoolId }) : 0,
    ]);
    return { content, newSuggestions, openTopics };
  }, [user.uid, user.role, user.schoolId]);

  const firstName = user.displayName.split(' ')[0];
  const head = <PageHeader title={`Szia, ${firstName}!`} description={`${ROLES[user.role].label} a szerkesztőségben. Itt látod, mi vár rád az editorial munkafolyamatban.`} />;

  if (loading) return <>{head}<DashboardSkeleton /></>;
  if (error) return <>{head}<ErrorNotice error={error} onRetry={reload} /></>;

  const by = countByStatus(data.content);
  const recent = data.content
    .filter((c) => c.submittedAt)
    .sort((a, b) => toDate(b.submittedAt) - toDate(a.submittedAt))
    .slice(0, 8);

  return (
    <>
      {head}
      <div className="grid gap-4 sm:gap-6">
        <StatCards by={by} role={user.role} />
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] items-start">
          <div className="grid gap-4 sm:gap-6 min-w-0">
            <AttentionPanel items={attentionItems(user.role, by, data.newSuggestions, data.openTopics)} />
            <RecentList items={recent} />
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <WorkflowPanel by={by} />
            <SideCard role={user.role} newSuggestions={data.newSuggestions} />
          </div>
        </div>
      </div>
    </>
  );
}
