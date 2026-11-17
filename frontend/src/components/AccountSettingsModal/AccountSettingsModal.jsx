import { AlertTriangle, KeyRound, Mail, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import "./AccountSettingsModal.css";

export function AccountSettingsModal({ open, onClose }) {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ username: user.username, email: user.email });
    setMessage("");
    setError("");
    setMfaSetupOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  async function submitProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile({ username: form.username.trim(), email: form.email.trim() });
      setMessage(t("account.profileUpdated"));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="account-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-settings-title">
        <header className="account-modal-header">
          <div>
            <span className="eyebrow">{t("account.eyebrow")}</span>
            <h2 id="account-settings-title">{t("account.title")}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t("common.close")}>
            <X size={19} />
          </button>
        </header>

        <form className="account-settings-form" onSubmit={submitProfile}>
          <section className="account-section">
            <div className="account-section-heading">
              <UserRound size={19} />
              <div><h3>{t("account.profileTitle")}</h3><p>{t("account.profileDescription")}</p></div>
            </div>
            <div className="account-fields">
              <label>
                {t("auth.username")}
                <input minLength="3" maxLength="50" required value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })} />
              </label>
              <label>
                {t("auth.email")}
                <input type="email" maxLength="120" required value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
            </div>
            {error && <p className="account-feedback error">{error}</p>}
            {message && <p className="account-feedback success">{message}</p>}
            <button className="primary account-save" type="submit" disabled={saving}>
              <Save size={17} /> {saving ? t("account.saving") : t("account.saveProfile")}
            </button>
          </section>

          <section className="account-section account-future-section">
            <div className="account-section-heading">
              <KeyRound size={19} />
              <div><h3>{t("account.passwordTitle")}</h3><p>{t("account.passwordDescription")}</p></div>
            </div>
            <div className="future-feature-note"><Mail size={18} /><span>{t("account.passwordFuture")}</span></div>
            <button className="ghost" type="button" disabled>{t("account.requestPasswordChange")}</button>
          </section>

          <section className="account-section">
            <div className="account-section-heading">
              <ShieldCheck size={19} />
              <div><h3>{t("account.mfaTitle")}</h3><p>{t("account.mfaDescription")}</p></div>
            </div>
            <div className="mfa-status"><span>{t("account.mfaStatus")}</span><strong>{t("account.mfaInactive")}</strong></div>
            <button className="ghost" type="button" onClick={() => setMfaSetupOpen((visible) => !visible)}>
              <ShieldCheck size={17} /> {t("account.addMfa")}
            </button>
            {mfaSetupOpen && (
              <div className="mfa-pending-panel">
                <AlertTriangle size={19} />
                <div><strong>{t("account.mfaSetupTitle")}</strong><p>{t("account.mfaSetupFuture")}</p></div>
              </div>
            )}
          </section>
        </form>
      </section>
    </div>
  );
}
