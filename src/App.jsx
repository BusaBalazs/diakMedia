import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import CategoriesIndex from './pages/CategoriesIndex.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import Home from './pages/Home.jsx';
import NationalPage from './pages/NationalPage.jsx';
import NotFound from './pages/NotFound.jsx';
import SchoolChooser from './pages/SchoolChooser.jsx';
import SchoolPage from './pages/SchoolPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import TopicPage from './pages/TopicPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="iskola" element={<SchoolChooser />} />
        <Route path="iskola/:id" element={<SchoolPage />} />
        <Route path="orszagos" element={<NationalPage />} />
        <Route path="kategoriak" element={<CategoriesIndex />} />
        <Route path="kategoria/:id" element={<CategoryPage />} />
        <Route path="cikk/:slug" element={<ArticlePage />} />
        <Route path="tema/:slug" element={<TopicPage />} />
        <Route path="kereses" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
