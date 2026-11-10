import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/Parts.jsx';
import { Icon } from '../components/Icons.jsx';
import { ROLES } from '../config/roles.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';

export default function UserMenu() {
  const { user, mode, devUsers, switchDevUser, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-lg hover:bg-canvas transition-colors">
        <Avatar name={user.displayName} />
        <span className="hidden sm:block text-left leading-tight">
          <span className="block text-sm font-medium text-ink">{user.displayName}</span>
          <span className="block text-xs text-muted">{ROLES[user.role]?.label}</span>
        </span>
        <Icon name="chevronDown" size={16} className="text-muted" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface shadow-pop p-1.5">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{user.displayName}</p>
            <p className="text-xs text-muted">{ROLES[user.role]?.label}{user.email ? `, ${user.email}` : ''}</p>
          </div>
          {mode === 'dev' && (
            <div className="border-t border-line mt-1 pt-2 px-1.5 pb-1.5">
              <p className="px-1.5 pb-1.5 text-xs font-medium text-muted">Fejlesztői mód: szerepkör váltása</p>
              {devUsers.map((u) => (
                <button key={u.uid} type="button" role="menuitemradio" aria-checked={u.uid === user.uid} onClick={() => { switchDevUser(u.uid); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 h-9 rounded-lg text-sm transition-colors ${u.uid === user.uid ? 'bg-brand-soft text-brand-dark font-medium' : 'hover:bg-canvas'}`}>
                  <span>{u.displayName} <span className="text-muted">({ROLES[u.role].label})</span></span>
                  {u.uid === user.uid && <Icon name="check" size={16} />}
                </button>
              ))}
            </div>
          )}
          {mode === 'dev' && <button type="button" role="menuitem" onClick={async () => { (await getRepository()).resetDev(); window.location.reload(); }} className="mt-1 w-full flex items-center gap-2 px-2.5 h-9 rounded-lg text-sm hover:bg-canvas transition-colors"><Icon name="refresh" size={16} /> Fejlesztői adatok visszaállítása</button>}
          <div className="border-t border-line mt-1 pt-1">
            <Link to="/" role="menuitem" className="flex items-center gap-2 px-2.5 h-9 rounded-lg text-sm hover:bg-canvas transition-colors"><Icon name="external" size={16} /> Nyilvános oldal megnyitása</Link>
            {signOut && <button type="button" role="menuitem" onClick={signOut} className="w-full flex items-center gap-2 px-2.5 h-9 rounded-lg text-sm hover:bg-canvas transition-colors"><Icon name="logout" size={16} /> Kijelentkezés</button>}
          </div>
        </div>
      )}
    </div>
  );
}
