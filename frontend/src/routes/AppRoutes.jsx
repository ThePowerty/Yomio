import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AdminPage } from "../pages/AdminPage/AdminPage";
import { AnimeCatalogPage } from "../pages/AnimeCatalogPage/AnimeCatalogPage";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { HomePage } from "../pages/HomePage/HomePage";
import { MangaCatalogPage } from "../pages/MangaCatalogPage/MangaCatalogPage";
import { ManhwaCatalogPage } from "../pages/ManhwaCatalogPage/ManhwaCatalogPage";
import { MovieCatalogPage } from "../pages/MovieCatalogPage/MovieCatalogPage";
import { CatalogMediaDetailPage } from "../pages/CatalogMediaDetailPage/CatalogMediaDetailPage";
import { RecommendationsPage } from "../pages/RecommendationsPage/RecommendationsPage";
import { TrackingPage } from "../pages/TrackingPage/TrackingPage";
import { PrivateRoute } from "./PrivateRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="catalog/anime" element={<AnimeCatalogPage />} />
          <Route path="catalog/manga" element={<MangaCatalogPage />} />
          <Route path="catalog/manhwa" element={<ManhwaCatalogPage />} />
          <Route path="catalog/movie" element={<MovieCatalogPage />} />
          <Route path="catalog/:type/:id" element={<CatalogMediaDetailPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />

          <Route element={<PrivateRoute adminOnly />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
