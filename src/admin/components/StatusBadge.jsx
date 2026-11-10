import { STATUSES } from '../config/workflow.js';

const TONES = {
  neutral: { badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  muted: { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  info: { badge: 'bg-info/10 text-info-ink', dot: 'bg-info' },
  warn: { badge: 'bg-warn/15 text-warn-ink', dot: 'bg-warn' },
  ok: { badge: 'bg-ok/10 text-ok-ink', dot: 'bg-ok' },
  danger: { badge: 'bg-danger/10 text-danger-ink', dot: 'bg-danger' },
};

export function Dot({ tone = 'neutral', className = '' }) {
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${TONES[tone].dot} ${className}`} aria-hidden="true" />;
}

export default function StatusBadge({ status }) {
  const s = STATUSES[status] || STATUSES.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${TONES[s.tone].badge}`}>
      <Dot tone={s.tone} />
      {s.label}
    </span>
  );
}
