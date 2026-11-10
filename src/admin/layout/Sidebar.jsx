import { NavLink } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import { NAV_ITEMS } from '../config/nav.js';
import { can } from '../config/roles.js';

export function Brand({ school }) {
  return (
    <div className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b border-line">
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        {[0, 45, 90, 135].map((a, i) => (<line key={a} x1="20" y1="4" x2="20" y2="36" stroke={i % 2 ? '#16866F' : '#171923'} strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 20 20)`} />))}
      </svg>
      <div className="leading-tight min-w-0">
        <p className="text-[15px] font-bold tracking-tight">DiákMédia</p>
        <p className="text-xs text-muted truncate">{school ? school.publicationName : 'Szerkesztőség'}</p>
      </div>
    </div>
  );
}

export default function Sidebar({ user, school, counts, onNavigate }) {
  const items = NAV_ITEMS.filter((i) => !i.permission || can(user.role, i.permission));
  return (
    <div className="flex flex-col h-full">
      <Brand school={school} />
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-medium text-muted">Iskola</p>
        <p className="text-sm font-semibold text-ink leading-snug">{school ? school.name : '…'}</p>
      </div>
      <nav aria-label="Admin főmenü" className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="grid gap-0.5">
          {items.map((item) => {
            const count = item.badge ? counts?.[item.badge] : 0;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) => `group flex items-center gap-3 h-10 pl-3 pr-3 rounded-lg border-l-[3px] text-sm transition-colors ${isActive ? 'bg-brand-soft border-brand text-brand-dark font-semibold' : 'border-transparent text-gray-700 font-medium hover:bg-canvas hover:text-ink'}`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && <span className="min-w-[1.4rem] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-lime text-ink text-xs font-semibold" aria-label={`${count} új`}>{count}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 border-t border-line">
        <NavLink to="/" className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted hover:bg-canvas hover:text-ink transition-colors">
          <Icon name="external" size={16} /> Nyilvános oldal
        </NavLink>
      </div>
    </div>
  );
}
