import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { Avatar } from './Parts.jsx';
import { categoryById } from '../../data/categories.js';
import { FORMATS } from '../config/formats.js';
import { formatDate } from '../lib/date.js';

// Compact board card: title, format, category, author, submission date, status.
export default function ContentCard({ item, showStatus = true }) {
  return (
    <Link to={`/admin/tartalmak/${item.id}`} className="block rounded-lg border border-line bg-surface p-3 shadow-card transition-shadow hover:shadow-pop hover:border-brand/40">
      <p className="text-sm font-semibold leading-snug text-ink">{item.title}</p>
      <p className="mt-1 text-xs text-muted">{FORMATS[item.format]?.label}<span className="mx-1.5 text-line">|</span>{categoryById[item.category]?.name}</p>
      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-gray-700 font-medium"><Avatar name={item.authorName} size="sm" /><span className="truncate">{item.authorName}</span></span>
        <time>{formatDate(item.submittedAt || item.createdAt)}</time>
      </div>
      {showStatus && <div className="mt-2.5"><StatusBadge status={item.status} /></div>}
    </Link>
  );
}
