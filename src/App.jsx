import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AssetProvider } from './context/AssetProvider';
import AboutPage from './pages/AboutPage';
import AddAssetPage from './pages/AddAssetPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import AssetListPage from './pages/AssetListPage';
import DashboardPage from './pages/DashboardPage';
import EditAssetPage from './pages/EditAssetPage';
import NotFoundPage from './pages/NotFoundPage';

/** All pages of the app. Every page is shown inside <Layout> (menu + footer). */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetListPage />} />
        <Route path="assets/new" element={<AddAssetPage />} />
        <Route path="assets/:id" element={<AssetDetailsPage />} />
        <Route path="assets/:id/edit" element={<EditAssetPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AssetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AssetProvider>
  );
}
