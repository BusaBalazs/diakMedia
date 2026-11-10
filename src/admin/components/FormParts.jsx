import { useId, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';
import { btnSecondary, input as inputCls, inputError } from './ui.js';
import { categories } from '../../data/categories.js';
import { FIELD_LIMITS, MAX_STORY_IMAGES } from '../config/content.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { prepareImage } from '../lib/image.js';
import SpellcheckAssist from './SpellcheckAssist.jsx';

export function Counter({ used, max }) {
  const over = used > max;
  return <span className={`text-xs tabular-nums ${over ? 'text-danger-ink font-semibold' : used > max * 0.9 ? 'text-warn-ink' : 'text-muted'}`}>{used}/{max}</span>;
}

// Label + control + hint/error. `children` receives { id, describedBy, invalid } so the control stays accessible.
export function Field({ label, required, optional, hint, error, counter, children }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">{label}{required && <span className="text-danger-ink" aria-hidden="true"> *</span>}{optional && <span className="ml-1.5 text-xs font-normal text-muted">nem kötelező</span>}</label>
        {counter}
      </div>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined })}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="text-xs text-danger-ink font-medium">{error}</p>}
    </div>
  );
}

export const TextInput = ({ error, ...p }) => (
  <>
    <input type="text" className={`${inputCls} h-10 ${error ? inputError : ''}`} {...p} lang="hu" spellCheck="true" />
    {typeof p.value === 'string' && <SpellcheckAssist value={p.value} />}
  </>
);
export const TextArea = ({ error, rows = 4, ...p }) => (
  <>
    <textarea rows={rows} className={`${inputCls} leading-relaxed resize-y ${error ? inputError : ''}`} {...p} lang="hu" spellCheck="true" />
    {typeof p.value === 'string' && <SpellcheckAssist value={p.value} />}
  </>
);

export function CategorySelect({ value, onChange, locked, error }) {
  return (
    <Field label="Kategória" required error={error} hint={locked ? 'A vélemény mindig a Vélemény rovatba kerül, ez nem módosítható.' : 'A témakör, amelyben a tartalom megjelenik.'}>
      {(a) => (
        <select {...a} className={`${inputCls} h-10 ${error ? inputError : ''} disabled:bg-canvas disabled:text-muted`} value={value} disabled={locked} onChange={(e) => onChange(e.target.value)}>
          <option value="">Válassz kategóriát…</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      )}
    </Field>
  );
}

// Single image: upload, preview, remove.
export function ImageUpload({ value, onChange, label = 'Kiemelt kép', hint = 'JPG vagy PNG, legfeljebb 8 MB. A kép automatikusan kisebb méretre készül.', optional = true, error }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const prepared = await prepareImage(file);
      const url = await (await getRepository()).uploadImage(prepared, { user });
      onChange(url);
    } catch (e) { setErr(e.message || 'A feltöltés nem sikerült.'); } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  return (
    <Field label={label} optional={optional} hint={hint} error={error || err}>
      {(a) => (
        <div className="flex flex-wrap items-center gap-3">
          {value ? <img src={value} alt="Feltöltött kép előnézete" className="h-24 w-36 rounded-lg border border-line object-cover bg-canvas" /> : <span className="grid h-24 w-36 place-items-center rounded-lg border border-dashed border-line bg-canvas text-muted"><Icon name="image" size={26} /></span>}
          <div className="flex flex-wrap gap-2">
            <label className={`${btnSecondary} cursor-pointer`}>
              <Icon name="image" size={16} /> {busy ? 'Feltöltés…' : value ? 'Csere' : 'Kép kiválasztása'}
              <input ref={inputRef} id={a.id} type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} aria-describedby={a['aria-describedby']} />
            </label>
            {value && <button type="button" className={btnSecondary} onClick={() => onChange('')}><Icon name="trash" size={16} /> Eltávolítás</button>}
          </div>
        </div>
      )}
    </Field>
  );
}

// Visual story: multiple images, each with a caption, reorderable with buttons (works on touch and with the keyboard).
export function StoryImages({ images, onChange, errors = {} }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);
  const add = async (files) => {
    setBusy(true); setErr('');
    try {
      const repo = await getRepository();
      const added = [];
      for (const f of Array.from(files).slice(0, MAX_STORY_IMAGES - images.length)) {
        const prepared = await prepareImage(f, { max: 1200, quality: 0.78 });
        added.push({ id: `i${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, url: await repo.uploadImage(prepared, { user }), caption: '' });
      }
      onChange([...images, ...added]);
    } catch (e) { setErr(e.message || 'A feltöltés nem sikerült.'); } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  const move = (i, d) => { const n = [...images]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const patch = (i, p) => onChange(images.map((x, k) => (k === i ? { ...x, ...p } : x)));
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Képek <span className="text-danger-ink" aria-hidden="true">*</span> <span className="text-xs font-normal text-muted">{images.length}/{MAX_STORY_IMAGES}, a sorrend a történet sorrendje</span></p>
        <label className={`${btnSecondary} cursor-pointer ${images.length >= MAX_STORY_IMAGES ? 'opacity-50 pointer-events-none' : ''}`}>
          <Icon name="plus" size={16} /> {busy ? 'Feltöltés…' : 'Képek hozzáadása'}
          <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" disabled={busy || images.length >= MAX_STORY_IMAGES} onChange={(e) => add(e.target.files)} />
        </label>
      </div>
      {(errors.images || err) && <p role="alert" className="text-xs text-danger-ink font-medium">{errors.images || err}</p>}
      {images.length === 0 && <div className="grid place-items-center gap-1 rounded-xl border border-dashed border-line bg-canvas py-8 text-sm text-muted"><Icon name="image" size={26} />Még nincs kép. Tölts fel legalább egyet.</div>}
      <ol className="grid gap-3">
        {images.map((img, i) => (
          <li key={img.id} className="grid gap-3 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
            <img src={img.url} alt={`${i + 1}. kép`} className="h-24 w-full sm:w-32 rounded-lg object-cover bg-canvas" />
            <Field label={`${i + 1}. kép felirata`} optional error={errors[`caption-${i}`]} counter={<Counter used={(img.caption || '').length} max={FIELD_LIMITS.caption} />}>
              {(a) => <TextArea {...a} rows={2} value={img.caption || ''} onChange={(e) => patch(i, { caption: e.target.value })} error={errors[`caption-${i}`]} />}
            </Field>
            <div className="flex sm:flex-col gap-1.5">
              <button type="button" className={`${btnSecondary} !px-2.5`} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${i + 1}. kép mozgatása feljebb`}><Icon name="arrowUp" size={16} /></button>
              <button type="button" className={`${btnSecondary} !px-2.5`} onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`${i + 1}. kép mozgatása lejjebb`}><Icon name="arrowDown" size={16} /></button>
              <button type="button" className={`${btnSecondary} !px-2.5`} onClick={() => onChange(images.filter((_, k) => k !== i))} aria-label={`${i + 1}. kép törlése`}><Icon name="trash" size={16} /></button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Overall character meter for the format's total limit.
export function TotalMeter({ used, max }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  const over = used > max;
  return (
    <div className="grid gap-1.5" role="group" aria-label="Karakterkeret">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">Terjedelem</span>
        <span className={`tabular-nums ${over ? 'text-danger-ink font-semibold' : 'text-muted'}`}>{used} / {max}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full rounded-full transition-all ${over ? 'bg-danger' : pct > 90 ? 'bg-warn' : 'bg-brand'}`} style={{ width: `${pct}%` }} /></div>
      <p className={`text-xs ${over ? 'text-danger-ink font-medium' : 'text-muted'}`} aria-live="polite">{over ? `${used - max} karakterrel túl vagy a kereten.` : `Még ${max - used} karakter írható.`}</p>
    </div>
  );
}
