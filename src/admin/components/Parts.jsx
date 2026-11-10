import { Icon } from './Icons.jsx';
import { btnSecondary, card } from './ui.js';

export function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Avatar({ name, size = 'md' }) {
  const text = name.replace(/\./g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  return <span className={`inline-flex items-center justify-center rounded-full bg-brand-soft text-brand-dark font-semibold shrink-0 ${dim}`} aria-hidden="true">{text}</span>;
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/70 ${className}`} aria-hidden="true" />;
}

export function ErrorNotice({ title = 'Nem sikerült betölteni az adatokat', error, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm">
      <span className="text-danger-ink"><Icon name="alert" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-danger-ink">{title}</p>
        {error?.message && <p className="text-muted break-words">{error.message}</p>}
      </div>
      {onRetry && <button type="button" onClick={onRetry} className={btnSecondary}><Icon name="refresh" size={16} /> Újra</button>}
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 px-6 py-10">
      <span className="grid place-items-center w-11 h-11 rounded-full bg-canvas text-muted"><Icon name={icon} size={22} /></span>
      <p className="font-semibold text-ink">{title}</p>
      {text && <p className="text-sm text-muted max-w-sm">{text}</p>}
      {action}
    </div>
  );
}

// Placeholder used for sections that arrive in a later phase. It says exactly what is planned.
export function ComingSoon({ phase, title, description, items = [] }) {
  return (
    <div className={`${card} p-6 max-w-2xl`}>
      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-lime text-ink text-xs font-semibold">{phase}</span>
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {items.length > 0 && (
        <ul className="mt-4 grid gap-2 text-sm">
          {items.map((i) => (
            <li key={i} className="flex gap-2"><span className="mt-0.5 text-brand"><Icon name="check" size={16} /></span><span>{i}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
