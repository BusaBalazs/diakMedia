import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import CategoriesIndex from './pages/CategoriesIndex.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import SearchPage from './pages/SearchPage.jsx';
import StoryPage from './pages/StoryPage.jsx';
import PublicContentPage from './pages/PublicContentPage.jsx';
import StudentSuggestionPage from './pages/StudentSuggestionPage.jsx';
import PublicSignInPage from './pages/PublicSignInPage.jsx';

// The admin is a separate, lazily loaded part of the app: its code, Tailwind styles and Firebase SDK are only
// downloaded when someone opens /admin, and none of it touches the public site.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="admin/*" element={<Suspense fallback={<p style={{ padding: '2rem', fontFamily: 'sans-serif' }} role="status">Betöltés…</p>}><AdminApp /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="iskola/*" element={<Navigate to="/" replace />} />
        <Route path="orszagos" element={<Navigate to="/" replace />} />
        <Route path="kategoriak" element={<CategoriesIndex />} />
        <Route path="kategoria/:id" element={<CategoryPage />} />
        <Route path="cikk/:slug" element={<ArticlePage />} />
        <Route path="tartalom/:id" element={<PublicContentPage />} />
        <Route path="diakjavaslat" element={<StudentSuggestionPage />} />
        <Route path="belepes" element={<PublicSignInPage />} />
        <Route path="felperc" element={<Navigate to="/" replace />} />
        <Route path="tortenet/:slug" element={<StoryPage />} />
        <Route path="kereses" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
