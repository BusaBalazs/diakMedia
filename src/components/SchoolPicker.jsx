import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterSchools, publicationCounts } from '../lib/content.js';
import { SearchIcon } from './Icons.jsx';

// Live-filtering school picker. Every keystroke narrows the list.
// variant "inline": the list is always visible (chooser page). "dropdown": the list opens under the field (school page hero).
export default function SchoolPicker({ variant = 'inline', currentId, mySchoolId, label = 'Iskola keresése', onPick }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(variant === 'inline');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const id = useId();
  const wrapRef = useRef(null);
  const results = filterSchools(query);
  const counts = publicationCounts();
  const listId = `${id}-list`;

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    if (variant !== 'dropdown') return undefined;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [variant]);

  const pick = (school) => {
    setQuery('');
    if (variant === 'dropdown') setOpen(false);
    if (onPick) onPick(school);
    navigate(`/iskola/${school.id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[active] && open) { e.preventDefault(); pick(results[active]); }
    else if (e.key === 'Escape' && variant === 'dropdown') { setOpen(false); }
  };

  return (
    <div className={`picker picker--${variant}`} ref={wrapRef}>
      <label className="picker__label" htmlFor={`${id}-input`}>{label}</label>
      <div className="picker__field">
        <SearchIcon width={20} height={20} />
        <input
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${id}-opt-${results[active].id}` : undefined}
          value={query}
          placeholder="Kezdd el gépelni az iskola nevét…"
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>
      <p className="picker__count" role="status" aria-live="polite">
        {query ? `${results.length} találat` : `${results.length} iskola`}
      </p>
      {open && (
        <ul id={listId} role="listbox" aria-label="Iskolák" className="picker__list">
          {results.map((s, i) => (
            <li
              key={s.id}
              id={`${id}-opt-${s.id}`}
              role="option"
              aria-selected={i === active}
              className={`picker__option${i === active ? ' is-active' : ''}${s.id === currentId ? ' is-current' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(s)}
            >
              <span className="school-tag__mark" style={{ background: s.color }} aria-hidden="true">{s.monogram}</span>
              <span className="picker__text">
                <span className="picker__name">{s.name}</span>
                <span className="picker__meta">{s.city}, {s.publication.name}, {counts[s.id]} cikk</span>
              </span>
              {s.id === mySchoolId && <span className="sticker sticker--lime picker__mine">Saját</span>}
            </li>
          ))}
          {!results.length && <li className="picker__empty" role="presentation">Nincs ilyen iskola. Próbálj rövidebb kifejezést, vagy a város nevét.</li>}
        </ul>
      )}
    </div>
  );
}
