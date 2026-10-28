import { Link } from 'react-router-dom';

export function SectionHeader({ title, description, action, level = 2, tone = 'light', kicker, kickerTone = 'lime' }) {
  const H = `h${level}`;
  return (
    <header className={`section-header section-header--${tone}`}>
      <div>
        {kicker && <p className="section-header__kicker"><span className={`sticker sticker--${kickerTone}`}>{kicker}</span></p>}
        <H className="section-header__title">{title}</H>
        {description && <p className="section-header__desc">{description}</p>}
      </div>
      {action && <Link to={action.to} className="text-link">{action.label}</Link>}
    </header>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Hol vagy most?" className="breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="empty" role="status">
      <h2 className="empty__title">{title}</h2>
      <p>{text}</p>
      {actionLabel && <button type="button" className="btn btn--primary" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
