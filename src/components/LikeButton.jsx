import { HeartIcon } from './Icons.jsx';
import { useLikes } from '../lib/likes.jsx';

export default function LikeButton({ article, compact = false }) {
  const { isLiked, toggle } = useLikes();
  const on = isLiked(article.id);
  return (
    <button
      type="button"
      className={`like-btn${on ? ' is-on' : ''}${compact ? ' like-btn--compact' : ''}`}
      aria-pressed={on}
      aria-label={compact ? (on ? 'Kedvelés visszavonása' : 'Kedvelem a cikket') : undefined}
      onClick={() => toggle(article.id)}
    >
      <HeartIcon filled={on} width={compact ? 18 : 22} height={compact ? 18 : 22} />
      {!compact && <span>{on ? 'Kedvelem' : 'Tetszik'}</span>}
    </button>
  );
}
