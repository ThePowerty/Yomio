import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Notice } from "../../components/Notice/Notice";
import { publicPath } from "../../lib/publicPath";
import { apiRequest } from "../../services/api";
import "./AuthPage.css";

export function PasswordResetPage() {
  const { hash } = useLocation();
  const token = new URLSearchParams(hash.slice(1)).get("token");
  return <RecoveryForm key={token ?? ""} token={token} />;
}

function RecoveryForm({ token }) {
  const { t } = useTranslation();
  const input = useRef(null);
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState("");
  const action = t(token ? "auth.resetSave" : "auth.resetSend");

  async function submit(event) {
    event.preventDefault();
    if (busy || submitted) return;
    const error = token
      ? (value.trim().length === 0 || value.length < 8 || new TextEncoder().encode(value).length > 72)
      : !value.trim() || !input.current.validity.valid;
    if (error) {
      setFieldError(t(token ? "auth.resetPasswordLength" : "auth.resetInvalidEmail"));
      input.current.focus();
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      await apiRequest(`/api/auth/password-reset/${token ? "confirm" : "request"}`, {
        method: "POST",
        body: JSON.stringify(token ? { token, password: value } : { email: value.trim() })
      });
      setValue("");
      setShowPassword(false);
      setSubmitted(true);
      setStatus(t(token ? "auth.resetSaved" : "auth.resetRequested"));
    } catch {
      setStatus(t(token ? "auth.resetConfirmError" : "auth.resetRequestError"));
    } finally {
      setBusy(false);
    }
  }

  const field = (
    <input
      id="recovery-value"
      ref={input}
      type={token ? (showPassword ? "text" : "password") : "email"}
      autoComplete={token ? "new-password" : "email"}
      maxLength={token ? 72 : 120}
      required
      value={value}
      disabled={busy || submitted}
      aria-invalid={Boolean(fieldError)}
      aria-describedby={fieldError ? "recovery-field-error" : token ? "recovery-password-help" : undefined}
      onChange={(event) => { setValue(event.target.value); setFieldError(""); }}
    />
  );

  return (
    <main className="auth-shell auth-recovery">
      <section className="auth-panel surface stack" aria-labelledby="recovery-title">
        <div className="auth-heading">
          <img className="auth-logo" src={publicPath("yomio-logo-fondo-claro.png")} alt={t("common.appName")} />
          <h1 id="recovery-title">{t(token ? "auth.resetConfirmTitle" : "auth.resetRequestTitle")}</h1>
        </div>
        <form noValidate className="stack" onSubmit={submit} aria-busy={busy}>
          <div className="stack">
            <label htmlFor="recovery-value">{t(token ? "auth.resetNewPassword" : "auth.email")}</label>
            {token ? (
              <div className="password-field">
                {field}
                <button type="button" className="password-toggle" disabled={busy || submitted}
                  aria-pressed={showPassword} aria-label={t(showPassword ? "auth.hidePassword" : "auth.showPassword")}
                  onClick={() => setShowPassword((previous) => !previous)}>
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            ) : field}
            {token && <small id="recovery-password-help">{t("auth.resetPasswordHelp")}</small>}
            {fieldError && <small id="recovery-field-error" role="alert">{fieldError}</small>}
          </div>
          <button className="primary" type="submit" disabled={busy || submitted}>
            {busy ? t("common.loading") : action}
          </button>
        </form>
        <Notice message={status} onClose={() => setStatus("")} />
        <nav className="auth-legal" aria-label={t("auth.resetNavigation")}>
          <Link to="/auth">{t("auth.loginTitle")}</Link>
          {token && !submitted && <Link to="/reset-password">{t("auth.resetSend")}</Link>}
        </nav>
      </section>
    </main>
  );
}
