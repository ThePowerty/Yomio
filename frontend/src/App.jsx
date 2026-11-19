import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppRoutes } from "./routes/AppRoutes";
import { SeoManager } from "./components/SeoManager/SeoManager";
import { AnalyticsConsent } from "./components/AnalyticsConsent/AnalyticsConsent";
import { initializeAnalytics } from "./services/analytics";

initializeAnalytics();

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SeoManager />
        <AppRoutes />
        <AnalyticsConsent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
