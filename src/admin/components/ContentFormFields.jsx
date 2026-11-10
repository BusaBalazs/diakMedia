import { CategorySelect, Counter, Field, ImageUpload, StoryImages, TextArea, TextInput } from './FormParts.jsx';
import { FIELD_LIMITS } from '../config/content.js';
import { FORMATS } from '../config/formats.js';

const n = (s) => (s || '').length;
const dateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value.toDate ? value.toDate() : value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

// Renders ONLY the fields of the chosen format (no generic editor with every possible field).
export default function ContentFormFields({ format, form, setForm, errors }) {
  const d = form.contentData;
  const set = (patch) => setForm((f) => ({ ...f, contentData: { ...f.contentData, ...patch } }));
  const locked = FORMATS[format].fixedCategory;
  const title = (
    <Field label="Cím" required error={errors.title} counter={<Counter used={n(form.title)} max={FIELD_LIMITS.title} />}>
      {(a) => <TextInput {...a} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />}
    </Field>
  );
  const intro = (required, hint) => (
    <Field label="Bevezető / rövid összefoglaló" required={required} optional={!required} hint={hint} error={errors.intro} counter={<Counter used={n(d.intro)} max={FIELD_LIMITS.intro} />}>
      {(a) => <TextArea {...a} rows={3} value={d.intro} onChange={(e) => set({ intro: e.target.value })} error={errors.intro} />}
    </Field>
  );
  const sources = (
    <Field label="Források" optional hint="Ha tényállítást írsz, add meg, honnan származik. Soronként egy forrás." error={errors.sources} counter={<Counter used={n(d.sources)} max={FIELD_LIMITS.sources} />}>
      {(a) => <TextArea {...a} rows={3} value={d.sources} onChange={(e) => set({ sources: e.target.value })} error={errors.sources} />}
    </Field>
  );

  return (
    <div className="grid gap-5">
      <CategorySelect value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} locked={Boolean(locked)} error={errors.category} />

      {(format === 'short_article' || format === 'poll') && (
        <>
          {title}
          {intro(true, 'Egy-két mondat arról, miről szól a cikk.')}
          <Field label="Teljes szöveg" required hint="Az új bekezdéshez hagyj ki egy üres sort." error={errors.body}>
            {(a) => <TextArea {...a} rows={12} value={d.body} onChange={(e) => set({ body: e.target.value })} error={errors.body} />}
          </Field>
          {format === 'poll' && (
            <>
              <Field label="Szavazási kérdés" required error={errors.question} counter={<Counter used={n(d.question)} max={FIELD_LIMITS.pollQuestion} />}>
                {(a) => <TextArea {...a} rows={2} maxLength={FIELD_LIMITS.pollQuestion} value={d.question} onChange={(e) => set({ question: e.target.value })} error={errors.question} />}
              </Field>
              <Field label="Válaszlehetőségek" required hint="Legalább két különböző válasz szükséges." error={errors.options}>
                {(a) => (
                  <div className="grid gap-2">
                    {(d.options || []).map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <TextInput {...(index === 0 ? a : {})} value={option} maxLength={FIELD_LIMITS.pollOption} aria-label={`${index + 1}. válaszlehetőség`} onChange={(e) => set({ options: (d.options || []).map((value, i) => i === index ? e.target.value : value) })} />
                        {(d.options || []).length > 2 && <button type="button" className="text-sm text-danger-ink hover:underline" onClick={() => set({ options: d.options.filter((_, i) => i !== index) })}>Törlés</button>}
                      </div>
                    ))}
                    {(d.options || []).length < 6 && <button type="button" className="justify-self-start text-sm font-medium text-brand hover:underline" onClick={() => set({ options: [...(d.options || []), ''] })}>+ Válasz hozzáadása</button>}
                  </div>
                )}
              </Field>
              <Field label="A szavazás lezárása" required error={errors.endsAt} hint="A határidő után a szavazás lezárul, az eredmények továbbra is láthatók.">
                {(a) => <input {...a} type="datetime-local" lang="hu" className="h-10 rounded-lg border border-line bg-white px-3 text-sm" value={dateTimeLocal(d.endsAt)} onChange={(e) => set({ endsAt: e.target.value ? new Date(e.target.value) : '' })} />}
              </Field>
            </>
          )}
          <ImageUpload label="Kiemelt kép" value={d.imageUrl} onChange={(url) => set({ imageUrl: url })} />
          {sources}
        </>
      )}

      {format === 'one_thought' && (
        <>
          <Field label="Kiemelt gondolat vagy idézet" required error={errors.quote} counter={<Counter used={n(d.quote)} max={FIELD_LIMITS.quote} />}>
            {(a) => <TextArea {...a} rows={3} value={d.quote} onChange={(e) => set({ quote: e.target.value })} error={errors.quote} />}
          </Field>
          <label className="flex items-start gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#16866F]" checked={d.isOwn} onChange={(e) => set({ isOwn: e.target.checked })} />
            <span><span className="font-medium">Ez a saját gondolatom.</span> <span className="text-muted">Ha mástól származik, vedd ki a pipát, és add meg a forrást.</span></span>
          </label>
          {!d.isOwn && (
            <Field label="Az idézet szerzője / forrása" required error={errors.quoteSource} counter={<Counter used={n(d.quoteSource)} max={FIELD_LIMITS.quoteSource} />}>
              {(a) => <TextInput {...a} value={d.quoteSource} onChange={(e) => set({ quoteSource: e.target.value })} error={errors.quoteSource} />}
            </Field>
          )}
          <Field label="Rövid magyarázat vagy kifejtés" optional error={errors.explanation} counter={<Counter used={n(d.explanation)} max={FIELD_LIMITS.explanation} />}>
            {(a) => <TextArea {...a} rows={5} value={d.explanation} onChange={(e) => set({ explanation: e.target.value })} error={errors.explanation} />}
          </Field>
          <ImageUpload label="Kapcsolódó kép" value={d.imageUrl} onChange={(url) => set({ imageUrl: url })} />
        </>
      )}

      {format === 'visual_story' && (
        <>
          {title}
          {intro(false, 'Egy-két mondat a történet elé.')}
          <StoryImages images={d.images} onChange={(images) => set({ images })} errors={errors} />
          <Field label="Záró gondolat" optional error={errors.closing} counter={<Counter used={n(d.closing)} max={FIELD_LIMITS.closing} />}>
            {(a) => <TextArea {...a} rows={2} value={d.closing} onChange={(e) => set({ closing: e.target.value })} error={errors.closing} />}
          </Field>
        </>
      )}

      {format === 'opinion' && (
        <>
          {title}
          {intro(false, 'Egy-két mondat arról, mi a véleményed lényege.')}
          <Field label="A véleményed és az érveid" required hint="Az új bekezdéshez hagyj ki egy üres sort." error={errors.body}>
            {(a) => <TextArea {...a} rows={12} value={d.body} onChange={(e) => set({ body: e.target.value })} error={errors.body} />}
          </Field>
          {sources}
          <Field label="Szerző neve vagy választott megjelenési neve" required hint="A cikk így jelenik meg. Lehet a neved vagy egy választott név." error={errors.authorDisplayName} counter={<Counter used={n(d.authorDisplayName)} max={FIELD_LIMITS.authorDisplayName} />}>
            {(a) => <TextInput {...a} value={d.authorDisplayName} onChange={(e) => set({ authorDisplayName: e.target.value })} error={errors.authorDisplayName} />}
          </Field>
        </>
      )}
    </div>
  );
}
