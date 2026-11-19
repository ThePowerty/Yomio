import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ForbiddenPage } from "../pages/ForbiddenPage/ForbiddenPage";

export function PrivateRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
