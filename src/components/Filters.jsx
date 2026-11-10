// Small, reusable filter controls (all state lives in the URL so back/forward and links work).
export function ScopeTabs({ value, onChange, options, label = 'Melyik lapban keressen?' }) {
  return (
    <div className="scope-tabs" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="scope-tabs__btn"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
          {typeof o.count === 'number' && <span className="scope-tabs__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function FilterChips({ value, onChange, options, label }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="chip"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          style={o.color ? { '--chip': o.color } : undefined}
        >
          {o.color && <span className="chip__mark" aria-hidden="true" />}
          <span>{o.label}</span>
          {typeof o.count === 'number' && <span className="chip__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
