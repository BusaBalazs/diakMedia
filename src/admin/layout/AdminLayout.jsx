import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import { btnPrimary } from '../components/ui.js';
import { can } from '../config/roles.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getRepository } from '../data/repository.js';
import { useAsync } from '../lib/useAsync.js';
import Sidebar, { Brand } from './Sidebar.jsx';
import UserMenu from './UserMenu.jsx';

export default function AdminLayout() {
  const { user, mode } = useAuth();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const menuBtn = useRef(null);

  const { data: school } = useAsync(async () => (await getRepository()).getSchool(user.schoolId), [user.schoolId]);
  const { data: newSuggestions } = useAsync(async () => (can(user.role, 'suggestions.review') ? (await getRepository()).countNewSuggestions({ schoolId: user.schoolId }) : 0), [user.schoolId, user.role]);
  const counts = { newSuggestions: newSuggestions || 0 };

  useEffect(() => { setDrawer(false); }, [location.pathname]);
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setDrawer(false); menuBtn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-ink focus:text-white focus:px-3 focus:py-2 focus:rounded-lg">Ugrás a tartalomra</a>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen bg-surface border-r border-line">
        <Sidebar user={user} school={school} counts={counts} />
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-40 ${drawer ? 'visible' : 'invisible pointer-events-none'}`} id="admin-drawer" aria-hidden={!drawer}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${drawer ? 'opacity-100' : 'opacity-0'}`} onClick={() => setDrawer(false)} />
        <div className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-pop transition-transform duration-200 ${drawer ? 'translate-x-0' : '-translate-x-full'}`}>
          <button type="button" onClick={() => { setDrawer(false); menuBtn.current?.focus(); }} className="absolute right-2 top-3 z-10 grid place-items-center w-10 h-10 rounded-lg hover:bg-canvas" aria-label="Menü bezárása"><Icon name="close" /></button>
          <Sidebar user={user} school={school} counts={counts} onNavigate={() => setDrawer(false)} />
        </div>
      </div>

      <div className="min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center gap-2 h-14 sm:h-16 px-3 sm:px-6 lg:px-8 bg-surface/95 backdrop-blur border-b border-line">
          <button ref={menuBtn} type="button" className="lg:hidden grid place-items-center w-10 h-10 -ml-1 rounded-lg hover:bg-canvas" aria-label="Menü megnyitása" aria-expanded={drawer} aria-controls="admin-drawer" onClick={() => setDrawer(true)}>
            <Icon name="menu" />
          </button>
          <span className="lg:hidden text-[15px] font-bold tracking-tight">DiákMédia</span>
          <div className="flex-1" />
          {can(user.role, 'content.create') && (
            <Link to="/admin/tartalmak/uj" className={`${btnPrimary} !px-3 sm:!px-4`}>
              <Icon name="plus" size={18} /><span className="hidden sm:inline">Új tartalom</span><span className="sm:hidden">Új</span>
            </Link>
          )}
          <UserMenu />
        </header>

        {mode === 'dev' && (
          <div className="px-3 sm:px-6 lg:px-8 py-2 bg-lime/50 border-b border-lime text-xs sm:text-sm text-ink">
            <strong className="font-semibold">Fejlesztői adatréteg:</strong> a megjelenített adatok ideiglenesek és kitalált, a Firebase még nincs beállítva (lásd: <code className="font-mono">.env.example</code>).
          </div>
        )}

        <main id="admin-main" tabIndex={-1} className="flex-1 w-full max-w-[84rem] px-3 sm:px-6 lg:px-8 py-5 sm:py-8 focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
