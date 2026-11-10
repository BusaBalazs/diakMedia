import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ContentFormFields from '../components/ContentFormFields.jsx';
import { TotalMeter } from '../components/FormParts.jsx';
import { Icon } from '../components/Icons.jsx';
import { ErrorNotice, PageHeader, Skeleton } from '../components/Parts.jsx';
import Steps from '../components/Steps.jsx';
import { btnPrimary, btnSecondary, card } from '../components/ui.js';
import PublicArticle from '../../components/publication/PublicArticle.jsx';
import { emptyContentData, limitFor, usedChars, validateContent, initialCard, deriveTitle } from '../config/content.js';
import { FORMAT_LIST, FORMATS } from '../config/formats.js';
import { canEditContent } from '../config/transitions.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { categoryOf, publicSchool } from '../lib/publicRefs.js';
import { useAsync } from '../lib/useAsync.js';

function FormatChooser({ params }) {
  const keep = (f) => { const p = new URLSearchParams(params); p.set('formatum', f); return `?${p.toString()}`; };
  return (
    <>
      <PageHeader title="Új tartalom" description="Először válaszd ki a formátumot: a szerkesztő csak a hozzá tartozó mezőket mutatja." />
      <ul className="grid gap-3 sm:grid-cols-2 max-w-3xl">
        {FORMAT_LIST.map((f) => (
          <li key={f.id}>
            <Link to={keep(f.id)} className={`${card} block h-full p-4 transition-shadow hover:shadow-pop hover:border-brand`}>
              <h2 className="text-sm font-semibold">{f.label}</h2>
              <p className="mt-1 text-sm text-muted">{f.description}</p>
              <p className="mt-3 text-xs text-muted">Legfeljebb {f.defaultLimit.toLocaleString('hu-HU')} karakter</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function EditorForm({ initial, limits, topic, school, isNew }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState(initial.form);
  const [mode, setMode] = useState('edit');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const saved = useRef(JSON.stringify(initial.form));
  const topRef = useRef(null);
  const format = initial.format;
  const max = limitFor(format, limits);
  const used = usedChars(format, form.contentData);
  const dirty = JSON.stringify(form) !== saved.current;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const payload = () => ({ id: initial.id, format, title: deriveTitle(format, form.title, form.contentData), category: FORMATS[format].fixedCategory || form.category, contentData: form.contentData, topicId: topic?.id || initial.topicId });

  const persist = async (input) => {
    const repo = await getRepository();
    const c = await repo.saveContent(input, { user });
    saved.current = JSON.stringify(form);
    return c;
  };

  const saveDraft = async () => {
    const v = validateContent({ ...payload(), format }, limits, { soft: true });
    setErrors(v.errors);
    if (!v.ok) { setNotice({ tone: 'danger', text: 'Néhány mező hibás, javítsd őket a mentés előtt.' }); return; }
    setBusy(true); setNotice(null);
    try {
      const c = await persist(payload());
      setNotice({ tone: 'ok', text: 'Piszkozat mentve.' });
      if (isNew) nav(`/admin/tartalmak/${c.id}/szerkeszt`, { replace: true });
    } catch (e) { setNotice({ tone: 'danger', text: e.message }); } finally { setBusy(false); }
  };

  const goNext = async () => {
    const v = validateContent({ ...payload(), format }, limits);
    setErrors(v.errors);
    if (!v.ok) { setMode('edit'); setNotice({ tone: 'danger', text: 'A folytatáshoz javítsd a megjelölt mezőket.', list: Object.values(v.errors) }); topRef.current?.scrollIntoView({ block: 'start' }); return; }
    setBusy(true); setNotice(null);
    try {
      const c = await persist(payload());
      // The card is prefilled from the content ONLY the first time; afterwards it is edited separately.
      if (!c.cardData) await (await getRepository()).saveCard(c.id, initialCard(c), { user });
      nav(`/admin/tartalmak/${c.id}/kartya`);
    } catch (e) { setNotice({ tone: 'danger', text: e.message }); setBusy(false); }
  };

  const category = categoryOf(FORMATS[format].fixedCategory || form.category);
  const previewContent = { format, title: deriveTitle(format, form.title, form.contentData), contentData: form.contentData, authorName: user.displayName };
  const feedback = initial.feedback;

  const bar = (
    <div className="sticky bottom-0 z-20 -mx-3 sm:-mx-6 lg:-mx-8 mt-6 border-t border-line bg-surface/95 backdrop-blur px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
      {mode === 'edit' ? (
        <>
          <button type="button" className={btnSecondary} onClick={saveDraft} disabled={busy}>Mentés piszkozatként</button>
          <button type="button" className={btnSecondary} onClick={() => { setMode('preview'); topRef.current?.scrollIntoView({ block: 'start' }); }}><Icon name="eye" size={16} /> Előnézet</button>
        </>
      ) : (
        <button type="button" className={btnSecondary} onClick={() => setMode('edit')}>Vissza a szerkesztéshez</button>
      )}
      <span className="flex-1" />
      {dirty && <span className="hidden sm:inline text-xs text-muted">Nem mentett módosítások</span>}
      <button type="button" className={btnPrimary} onClick={goNext} disabled={busy}>{busy ? 'Mentés…' : 'Mentés és folytatás a kártyához'}</button>
    </div>
  );

  return (
    <>
      <div ref={topRef} />
      <PageHeader title={isNew ? `Új tartalom: ${FORMATS[format].label}` : `Szerkesztés: ${FORMATS[format].label}`} description="Először a tartalom készül el, utána hozzá a főoldali kártya." actions={<Steps current={0} />} />
      {topic && <div className="mb-4 flex items-start gap-2 rounded-xl border border-lime bg-lime/30 px-4 py-3 text-sm"><Icon name="notebook" size={18} className="mt-0.5 shrink-0" /><p><strong className="font-semibold">Téma:</strong> {topic.title}{topic.note ? <span className="text-gray-700"> ({topic.note})</span> : null}</p></div>}
      {feedback && initial.status === 'changes_requested' && <div role="status" className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm"><p className="font-semibold text-danger-ink">A szerkesztőség módosítást kért</p><p className="mt-0.5 text-gray-800">{feedback}</p></div>}
      {notice && (
        <div role={notice.tone === 'danger' ? 'alert' : 'status'} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${notice.tone === 'danger' ? 'border-danger/30 bg-danger/5 text-danger-ink' : 'border-ok/30 bg-ok/5 text-ok-ink'}`}>
          <p className="font-medium">{notice.text}</p>
          {notice.list && <ul className="mt-1 list-disc pl-5">{[...new Set(notice.list)].map((m) => <li key={m}>{m}</li>)}</ul>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] items-start">
        <div className="min-w-0">
          {mode === 'edit' ? (
            <div className={`${card} p-4 sm:p-6`}><ContentFormFields format={format} form={form} setForm={setForm} errors={errors} /></div>
          ) : (
            <div>
              <p className="mb-2 text-sm text-muted">Így fog megjelenni a nyilvános oldalon (előnézet):</p>
              <div className="public-preview theme-maxi rounded-xl border border-line overflow-hidden" aria-label="A cikk előnézete"><PublicArticle content={previewContent} category={category} school={publicSchool(user.schoolId, school)} date={new Date()} /></div>
            </div>
          )}
        </div>
        <aside className="grid gap-4 lg:sticky lg:top-24">
          <div className={`${card} p-4`}><TotalMeter used={used} max={max} /></div>
          {errors.total && <p role="alert" className="text-sm text-danger-ink font-medium">{errors.total}</p>}
          <div className={`${card} p-4 text-sm text-muted grid gap-2`}>
            <p className="font-semibold text-ink">Mi következik?</p>
            <p>A „Mentés és folytatás” piszkozatként elmenti a tartalmat, és megnyitja a kártyaszerkesztőt. A tartalom még nem kerül beküldésre.</p>
          </div>
        </aside>
      </div>
      {bar}
    </>
  );
}

export default function EditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const format = params.get('formatum');
  const topicId = params.get('tema');

  const { data, error, loading, reload } = useAsync(async () => {
    const repo = await getRepository();
    const [settings, school, existing] = await Promise.all([
      repo.getSettings(user.schoolId), repo.getSchool(user.schoolId),
      id ? repo.getContent(id, { schoolId: user.schoolId, role: user.role, uid: user.uid }) : null,
    ]);
    const linkedTopicId = topicId || existing?.topicId;
    const topics = linkedTopicId ? await repo.listTopics({ schoolId: user.schoolId }) : [];
    return { settings, school, existing, topic: topics.find((t) => t.id === linkedTopicId) || null };
  }, [id, topicId, user.uid]);

  if (!id && !format) return <FormatChooser params={params} />;
  if (loading) return <><PageHeader title="Tartalom" /><Skeleton className="h-96 max-w-3xl" /></>;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;

  if (id) {
    const c = data.existing;
    if (!c) return <div className={`${card} p-6 max-w-xl text-sm`}>A tartalom nem található, vagy nincs jogosultságod megnyitni.</div>;
    if (!canEditContent(user, c)) return <Navigate to={`/admin/tartalmak/${id}`} replace />;
    const initial = { id: c.id, format: c.format, status: c.status, feedback: c.feedback, topicId: c.topicId, form: { title: c.format === 'one_thought' ? '' : c.title, category: c.category, contentData: { ...emptyContentData(c.format), ...c.contentData } } };
    return <EditorForm key={id} initial={initial} limits={data.settings.limits} topic={data.topic} school={data.school} isNew={false} />;
  }

  if (!FORMATS[format]) return <FormatChooser params={new URLSearchParams()} />;
  const prefillTitle = params.get('cim') || data.topic?.title || '';
  const initial = { format, status: 'draft', form: { title: format === 'one_thought' ? '' : prefillTitle, category: FORMATS[format].fixedCategory || data.topic?.category || '', contentData: emptyContentData(format) } };
  return <EditorForm key={`new-${format}`} initial={initial} limits={data.settings.limits} topic={data.topic} school={data.school} isNew />;
}
