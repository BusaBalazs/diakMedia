import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import './admin.css';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { LoginPage, NoAccess } from './auth/LoginPage.jsx';
import AdminLayout from './layout/AdminLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminNotFound from './pages/AdminNotFound.jsx';
import CardEditorPage from './pages/CardEditor.jsx';
import ContentBoard from './pages/ContentBoard.jsx';
import ContentDetailPage from './pages/ContentDetail.jsx';
import EditorPage from './pages/Editor.jsx';
import SuggestionsPage from './pages/SuggestionsPage.jsx';
import { SettingsPage, TeamPage } from './pages/TeamAndSettings.jsx';
import TopicsPage from './pages/TopicsPage.jsx';

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <div className="min-h-screen grid place-items-center text-sm text-muted" role="status">Betöltés…</div>;
  if (status === 'signedOut') return <Navigate to="/admin/belepes" replace state={{ from: location.pathname }} />;
  if (status === 'noProfile') return <NoAccess />;
  return <Outlet />;
}

// The admin lives in the same app but is fully separate from the public site:
// own layout, own routes, own (scoped) styles. Nothing here imports the public components or CSS.
export default function AdminApp() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);
    document.title = 'Szerkesztőségi admin | DiákMédia';
    return () => meta.remove();
  }, []);
  return (
    <div className="admin-scope">
      <AuthProvider>
        <Routes>
          <Route path="belepes" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tartalmak" element={<ContentBoard />} />
              <Route path="tartalmak/uj" element={<EditorPage />} />
              <Route path="tartalmak/:id/szerkeszt" element={<EditorPage />} />
              <Route path="tartalmak/:id/kartya" element={<CardEditorPage />} />
              <Route path="tartalmak/:id" element={<ContentDetailPage />} />
              <Route path="temajavaslat" element={<TopicsPage />} />
              <Route path="javaslatok" element={<SuggestionsPage />} />
              <Route path="szerkesztoseg" element={<TeamPage />} />
              <Route path="beallitasok" element={<SettingsPage />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}
