import { StarMark } from './Icons.jsx';

// Decorative ticker. The same information is available in the category navigation, so it is hidden from assistive tech.
export default function Marquee({ items }) {
  const row = (key) => (
    <ul className="marquee__row" key={key}>
      {items.map((t) => (
        <li key={t}><span>{t}</span><StarMark size={26} /></li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">{row('a')}{row('b')}</div>
    </div>
  );
}
