import { useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Notice } from "../../components/Notice/Notice";
import "./AuthPage.css";

export function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "", role: "USER" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authTitle = mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle");
  const redirectTo = location.state?.from?.pathname || "/";

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
          : authForm;
      if (mode === "login") {
        await login(payload);
      } else {
        await register(payload);
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
      <section className="auth-panel surface">
        <div>
          <span className="eyebrow">{t("common.appName")}</span>
          <h1>{authTitle}</h1>
        </div>

        <div className="segmented" role="tablist">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            <KeyRound size={17} /> {t("auth.loginTab")}
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            <UserPlus size={17} /> {t("auth.registerTab")}
          </button>
        </div>

        <form className="stack" onSubmit={submitAuth}>
          <label>
            {t("auth.username")}
            <input
              value={authForm.username}
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
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  required
                />
              </label>

              <label>
                {t("auth.role")}
                <select
                  value={authForm.role}
                  onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}
                >
                  <option value="USER">{t("auth.userRole")}</option>
                  <option value="ADMIN">{t("auth.adminRole")}</option>
                </select>
              </label>
            </>
          )}

          <label>
            {t("auth.password")}
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              minLength={8}
              required
            />
          </label>

          <button className="primary" disabled={loading}>
            {mode === "login" ? <KeyRound size={18} /> : <UserPlus size={18} />}
            {loading ? t("common.loading") : authTitle}
          </button>
        </form>

        <Notice message={status} onClose={() => setStatus("")} />
      </section>
    </main>
  );
}
