import { Route, Routes } from "react-router-dom";
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
import { WishlistPage } from "../pages/WishlistPage/WishlistPage";
import { StoryPage } from "../pages/StoryPage/StoryPage";
import { ChapterRatingsPage } from "../pages/ChapterRatingsPage/ChapterRatingsPage";
import { ReleaseCalendarPage } from "../pages/ReleaseCalendarPage/ReleaseCalendarPage";
import { LegalPage } from "../pages/LegalPage/LegalPage";
import { PrivateRoute } from "./PrivateRoute";
import { LandingPage } from "../pages/LandingPage/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import { useAuth } from "../context/AuthContext";

function RootPage() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppLayout><HomePage /></AppLayout> : <LandingPage />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/legal" element={<LegalPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="calendar" element={<ReleaseCalendarPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="stories/:mediaId" element={<StoryPage />} />
          <Route path="ratings/:mediaId" element={<ChapterRatingsPage />} />
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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
