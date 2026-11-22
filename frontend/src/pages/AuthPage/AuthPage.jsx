import { useEffect, useState } from "react";
import { BookOpen, Eye, EyeOff, KeyRound, Sparkles, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Notice } from "../../components/Notice/Notice";
import { YomioLogoSequence } from "../../components/YomioLogoSequence/YomioLogoSequence";
import { YomioStoryAmbient } from "../../components/YomioStoryAmbient/YomioStoryAmbient";
import { trackEvent } from "../../services/analytics";
import "./AuthPage.css";

export function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authTitle = mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle");
  const redirectTo = location.state?.from?.pathname || "/";

  useEffect(() => {
    trackEvent("onboarding_started");
    const reason = sessionStorage.getItem("yomio_auth_notice");
    if (reason) {
      setStatus(reason === "account-deleted" ? "Tu cuenta y sus datos asociados se han eliminado definitivamente." : reason === "expired" ? "Tu sesión ha caducado. Inicia sesión de nuevo para continuar." : "La sesión se ha cerrado por seguridad. Vuelve a identificarte para continuar.");
      sessionStorage.removeItem("yomio_auth_notice");
    }
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const payload =
        mode === "login"
          ? { username: authForm.username, password: authForm.password }
          : { username: authForm.username, email: authForm.email, password: authForm.password, policiesAccepted };
      if (mode === "login") {
        await login(payload);
        trackEvent("login_completed");
      } else {
        await register(payload);
        trackEvent("account_created");
        trackEvent("onboarding_completed");
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story" aria-hidden="true">
        <YomioStoryAmbient />
        <YomioLogoSequence />
        <div className="story-copy">
          <span className="story-kicker"><Sparkles size={16} /> Tu historia, siempre al día</span>
          <h2>Todo lo que lees y ves,<br />en un solo lugar.</h2>
          <div className="story-shelf">
            <article><BookOpen size={20} /><span>Próximo capítulo</span><strong>Cap. 38</strong></article>
            <article><span className="story-dot" /><span>En emisión</span><strong>Viernes · 19:00</strong></article>
            <article><Sparkles size={20} /><span>Para ti</span><strong>3 nuevas historias</strong></article>
          </div>
        </div>
      </section>
      <section className="auth-panel surface">
        <div className="auth-heading">
          <img className="auth-logo" src="/yomio-logo-fondo-claro.png" alt={t("common.appName")} />
          <h1>{authTitle}</h1>
        </div>

        <div className="segmented" role="tablist">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            <KeyRound size={17} /> {t("auth.loginTab")}
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            <UserPlus size={17} /> {t("auth.registerTab")}
          </button>
        </div>

        <form noValidate className="stack" onSubmit={submitAuth}>
          <label>
            {t("auth.username")}
            <input
              value={authForm.username}
              autoComplete="username"
              onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
              minLength={3}
              required
            />
          </label>

          {mode === "register" && (
            <>
              <label>
                {t("auth.email")}
                <input
                  type="email"
                  autoComplete="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  required
                />
              </label>
            </>
          )}

          <label>
            {t("auth.password")}
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {mode === "register" && (
            <label className="policy-consent">
              <input type="checkbox" checked={policiesAccepted} onChange={(event) => setPoliciesAccepted(event.target.checked)} />
              <span>{t("auth.acceptPoliciesPrefix")} <a href="/privacy" target="_blank" rel="noreferrer">{t("auth.privacyPolicy")}</a> {t("auth.and")} <a href="/terms" target="_blank" rel="noreferrer">{t("auth.termsConditions")}</a>.</span>
            </label>
          )}

          <button className="primary" type="submit" disabled={loading || (mode === "register" && !policiesAccepted)}>
            {mode === "login" ? <KeyRound size={18} /> : <UserPlus size={18} />}
            {loading ? t("common.loading") : authTitle}
          </button>
        </form>

        <Notice message={status} onClose={() => setStatus("")} />
        <nav className="auth-legal" aria-label="Información legal">
          <a href="/privacy">Privacidad</a><span aria-hidden="true">·</span><a href="/terms">Términos y condiciones</a>
        </nav>
      </section>
    </main>
  );
}
