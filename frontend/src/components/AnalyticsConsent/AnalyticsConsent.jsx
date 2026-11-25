import { useState } from "react";
import { Link } from "react-router-dom";
import { setAnalyticsConsent, analyticsConsentStatus, analyticsIsConfigured } from "../../services/analytics";
import "./AnalyticsConsent.css";

export function AnalyticsConsent() {
  const [status, setStatus] = useState(analyticsConsentStatus);

  if (!analyticsIsConfigured() || status !== "pending") return null;

  function choose(granted) {
    setAnalyticsConsent(granted);
    setStatus(granted ? "granted" : "denied");
  }

  return (
    <aside className="analytics-consent" aria-labelledby="analytics-consent-title">
      <div>
        <strong id="analytics-consent-title">Analítica opcional</strong>
        <p>Google Analytics puede ayudarnos a entender qué recorridos funcionan. No enviamos usuario, email, búsquedas ni contenido privado.</p>
        <Link to="/privacy">Leer la política de privacidad</Link>
      </div>
      <div className="analytics-consent-actions">
        <button type="button" className="ghost" onClick={() => choose(false)}>Rechazar</button>
        <button type="button" className="primary" onClick={() => choose(true)}>Permitir analítica</button>
      </div>
    </aside>
  );
}
