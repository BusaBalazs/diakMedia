import { Link } from 'react-router-dom';
import { ClockIcon, NationalIcon, SchoolIcon } from './Icons.jsx';
import { publicationLabels } from '../lib/content.js';

export function CategoryLabel({ category, asLink = false }) {
  const inner = (
    <>
      <span className="category-label__mark" style={{ background: category.color }} aria-hidden="true" />
      <span>{category.name}</span>
    </>
  );
  return asLink ? (
    <Link to={`/kategoria/${category.id}`} className="category-label category-label--link" style={{ '--cat': category.color }}>{inner}</Link>
  ) : (
    <span className="category-label" style={{ '--cat': category.color }}>{inner}</span>
  );
}

export function SchoolTag({ school, size = 'md', to }) {
  const mark = (
    <span className="school-tag__mark" style={{ background: school.color }} aria-hidden="true">{school.monogram}</span>
  );
  const name = <span className="school-tag__name">{school.name}</span>;
  const content = (<>{mark}{name}</>);
  return to ? (
    <Link to={to} className={`school-tag school-tag--${size}`}>{content}</Link>
  ) : (
    <span className={`school-tag school-tag--${size}`}>{content}</span>
  );
}

export function PublicationBadges({ article }) {
  return (
    <ul className="pub-badges" aria-label="Hol jelent meg">
      {publicationLabels(article).map((l) => (
        <li key={l.id} className={`pub-badge pub-badge--${l.id}`}>
          {l.id === 'school' ? <SchoolIcon width={14} height={14} /> : <NationalIcon width={14} height={14} />}
          <span>{l.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReadingTime({ minutes }) {
  return (
    <span className="meta-item">
      <ClockIcon width={14} height={14} />
      <span>{minutes} perc olvasás</span>
    </span>
  );
}
