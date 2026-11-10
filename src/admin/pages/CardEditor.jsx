import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Counter, Field, TextArea, TextInput } from '../components/FormParts.jsx';
import { Icon } from '../components/Icons.jsx';
import { ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import Steps from '../components/Steps.jsx';
import { btnPrimary, btnSecondary, card } from '../components/ui.js';
import PublicationCard from '../../components/publication/PublicationCard.jsx';
import { FIELD_LIMITS, cardOutOfSync, featuredImage, initialCard, validateCard, validateContent, validatePublication } from '../config/content.js';
import { FORMATS } from '../config/formats.js';
import { canEditContent } from '../config/transitions.js';
import { can } from '../config/roles.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { categoryOf, publicSchool } from '../lib/publicRefs.js';
import { useAsync } from '../lib/useAsync.js';

export function cardModel(content, card) {
  const d = content.contentData || {};
  return {
    format: content.format, title: card.title, description: card.description, imageUrl: card.imageUrl,
    quoteSource: content.format === 'one_thought' ? (d.isOwn ? '' : d.quoteSource) : '', authorName: content.authorName,
    authorDisplayName: content.format === 'opinion' ? d.authorDisplayName : '', imageCount: content.format === 'visual_story' ? (d.images || []).length : 0,
    date: content.publishedAt || content.submittedAt || new Date().toISOString(), contentId: content.id, status: content.status,
    poll: content.format === 'poll' ? d : null,
  };
}

// Frame for the live preview: desktop (card in a homepage row) or a 360 px phone.
export function CardPreview({ content, cardData, school, device }) {
  const category = categoryOf(content.category);
  const pub = <PublicationCard card={cardModel(content, cardData)} category={category} school={publicSchool(content.schoolId, school)} />;
  const ghost = <div className="hidden sm:block rounded-xl border border-dashed border-line bg-canvas/60 min-h-[14rem]" aria-hidden="true" />;
  return (
    <div className={`public-preview theme-maxi ${device === 'mobile' ? 'mx-auto w-[22.5rem] max-w-full rounded-[1.75rem] border-[6px] border-ink px-3 py-6' : 'rounded-xl border border-line p-5'}`} aria-label="A főoldali kártya előnézete">
      {device === 'mobile' ? pub : <div className="grid gap-5 sm:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">{pub}{ghost}</div>}
    </div>
  );
}

function CardForm({ content, school }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [card0, setCard] = useState({ ...content.cardData });
  const [device, setDevice] = useState('desktop');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  const model = { ...content, cardData: card0 };
  const cardCheck = validateCard(model);
  const contentCheck = validateContent(content, null);
  const changed = cardOutOfSync(model);
  const featured = featuredImage(content.format, content.contentData);
  const set = (patch) => { setNotice((n) => (n?.tone === 'danger' ? null : n)); setCard((c) => ({ ...c, ...patch })); };

  const save = async (next = card0) => (await getRepository()).saveCard(content.id, next, { user });
  const run = async (fn, okText) => {
    setBusy(true); setNotice(null);
    try { await fn(); if (okText) setNotice({ tone: 'ok', text: okText }); } catch (e) { setNotice({ tone: 'danger', text: e.message }); } finally { setBusy(false); }
  };

  const refresh = () => { const next = { ...card0, ...initialCard(content) }; setCard(next); return run(() => save(next), 'A kártya frissítve a cikk adataival.'); };
  const keep = () => { const next = { ...card0, snapshot: initialCard(content).snapshot }; setCard(next); return run(() => save(next), 'Rendben, a kártya változatlan marad.'); };
  const submit = () => {
    setShowErrors(true);
    if (!cardCheck.ok || !contentCheck.ok) { setNotice({ tone: 'danger', text: 'A beküldéshez a tartalomnak és a kártyának is hiánytalannak kell lennie.' }); return; }
    run(async () => { await save(); await (await getRepository()).submitContent(content.id, { user }); nav(`/admin/tartalmak/${content.id}`, { state: { flash: 'A tartalom és a kártyája beérkezett a szerkesztőséghez.' } }); });
  };
  const publish = () => {
    setShowErrors(true);
    if (!validatePublication({ ...content, cardData: card0 }, null).ok) { setNotice({ tone: 'danger', text: 'A publikáláshoz a tartalomnak és a kártyának is hiánytalannak kell lennie.' }); return; }
    run(async () => { await save(); await (await getRepository()).publishContent(content.id, { user }); nav(`/admin/tartalmak/${content.id}`, { state: { flash: 'A tartalom közvetlenül közzétéve.' } }); });
  };

  const e = showErrors ? cardCheck.errors : {};
  const checklist = [
    { ok: contentCheck.ok, text: 'A tartalom minden kötelező mezője ki van töltve' },
    { ok: !cardCheck.errors.title, text: 'A kártya címe megvan' },
    { ok: !cardCheck.errors.description, text: 'A kártya leírása megvan' },
  ];

  return (
    <>
      <PageHeader title="Főoldali kártya" description="A cím és a bevezető automatikusan átkerült a tartalomból; a kártya szövegeit itt még módosíthatod." actions={<Steps current={1} />} />
      {changed && (
        <div role="alert" className="mb-4 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm">
          <p className="font-semibold text-warn-ink">A cikk {changed.join(' és ')} megváltozott a kártya létrehozása óta.</p>
          <p className="mt-0.5 text-gray-800">A kártyát nem írjuk felül magától. Döntsd el, mi legyen.</p>
          <div className="mt-2 flex flex-wrap gap-2"><button type="button" className={btnSecondary} onClick={refresh} disabled={busy}>Kártya frissítése a cikkből</button><button type="button" className={btnSecondary} onClick={keep} disabled={busy}>A kártya marad így</button></div>
        </div>
      )}
      {content.feedback && content.status === 'changes_requested' && <div role="status" className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm"><p className="font-semibold text-danger-ink">A szerkesztőség módosítást kért</p><p className="mt-0.5">{content.feedback}</p></div>}
      {notice && <div role={notice.tone === 'danger' ? 'alert' : 'status'} className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${notice.tone === 'danger' ? 'border-danger/30 bg-danger/5 text-danger-ink' : 'border-ok/30 bg-ok/5 text-ok-ink'}`}>{notice.text}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start">
        <div className="grid gap-4">
          <div className={`${card} p-4 sm:p-5 grid gap-4`}>
            <Field label="Kártya címe" required error={e.title} hint="Szerkesztheted anélkül, hogy a cikk címe megváltozna." counter={<Counter used={(card0.title || '').length} max={FIELD_LIMITS.cardTitle} />}>
              {(a) => <TextInput {...a} value={card0.title || ''} onChange={(ev) => set({ title: ev.target.value })} error={e.title} />}
            </Field>
            <Field label="Kártya leírása" required error={e.description} hint="A cikk bevezetője automatikusan bekerül, és szabadon átírhatod." counter={<Counter used={(card0.description || '').length} max={FIELD_LIMITS.cardDescription} />}>
              {(a) => <TextArea {...a} rows={4} value={card0.description || ''} onChange={(ev) => set({ description: ev.target.value })} error={e.description} />}
            </Field>
            <div className="text-sm"><p className="font-medium">Kategória és formátum</p><p className="text-muted">{categoryOf(content.category).name}, {FORMATS[content.format].label} (a cikkből átvéve)</p></div>
            <div className="text-sm"><p className="font-medium">Kiemelt kép</p><p className="text-muted">{featured ? 'A cikk képe, a kártyán megjelenik.' : 'Nincs kép, a kártya a kategória színével jelenik meg.'}</p></div>
          </div>
          <div className={`${card} p-4 sm:p-5`}>
            <p className="text-sm font-semibold">Beküldés előtt</p>
            <ul className="mt-2 grid gap-1.5 text-sm">{checklist.map((c) => (<li key={c.text} className="flex gap-2"><span className={c.ok ? 'text-ok' : 'text-muted'}><Icon name={c.ok ? 'check' : 'clock'} size={16} /></span><span className={c.ok ? 'text-gray-700' : 'text-ink'}>{c.text}</span></li>))}</ul>
          </div>
        </div>
        <div className="grid gap-3 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Élő előnézet</h2>
            <div role="group" aria-label="Eszköz" className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-sm">
              {[['desktop', 'Asztali'], ['mobile', 'Mobil']].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)} className={`h-8 px-3 rounded-md font-medium ${device === id ? 'bg-brand text-white' : 'text-gray-700 hover:bg-canvas'}`}>{label}</button>
              ))}
            </div>
          </div>
          <CardPreview content={content} cardData={card0} school={school} device={device} />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-3 sm:-mx-6 lg:-mx-8 mt-6 border-t border-line bg-surface/95 backdrop-blur px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
        <Link to={`/admin/tartalmak/${content.id}/szerkeszt`} className={btnSecondary}>Vissza a tartalomhoz</Link>
        <button type="button" className={btnSecondary} onClick={() => { setShowErrors(true); run(() => save(), 'Kártya mentve.'); }} disabled={busy}>Kártya mentése</button>
        <span className="flex-1" />
        {can(user.role, 'content.publish') && (
          <button type="button" className={btnPrimary} onClick={publish} disabled={busy}>
            {busy ? 'Publikálás…' : 'Publikálás most'}
          </button>
        )}
        <button type="button" className={can(user.role, 'content.publish') ? btnSecondary : btnPrimary} onClick={submit} disabled={busy}>
          {busy ? 'Beküldés…' : 'Beküldés szerkesztői lektorálásra'}
        </button>
      </div>
    </>
  );
}

export default function CardEditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(async () => {
    const repo = await getRepository();
    const [content, school] = await Promise.all([repo.getContent(id, { schoolId: user.schoolId, role: user.role, uid: user.uid }), repo.getSchool(user.schoolId)]);
    return { content, school };
  }, [id, user.uid]);
  if (loading) return <><PageHeader title="Főoldali kártya" /><Skeleton className="h-96" /></>;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;
  const c = data.content;
  if (!c) return <div className={`${card} p-6 max-w-xl text-sm`}>A tartalom nem található.</div>;
  if (!canEditContent(user, c)) return <Navigate to={`/admin/tartalmak/${id}`} replace />;
  if (!c.cardData) return <Navigate to={`/admin/tartalmak/${id}/szerkeszt`} replace />;
  return <CardForm key={id} content={c} school={data.school} />;
}
