import { AlertTriangle, KeyRound, Mail, Save, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import "./AccountSettingsModal.css";

export function AccountSettingsModal({ open, onClose }) {
  const modalRef = useRef(null);
  const returnFocusRef = useRef(null);
  const { t } = useTranslation();
  const { user, token, updateProfile, deleteAccount } = useAuth();
  const [form, setForm] = useState({ username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetState, setResetState] = useState("idle");
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({ username: user.username, email: user.email });
    setMessage("");
    setError("");
    setResetState((state) => state === "pending" ? state : "idle");
    setMfaSetupOpen(false);
    setDeleteStep(0);
    setDeleteConfirmation("");
    setDeleting(false);
    setDeleteError("");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;
    const focusFrame = window.requestAnimationFrame(() => modalRef.current?.querySelector("button")?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        if (deleteStep > 0) {
          setDeleteStep(0);
          setDeleteConfirmation("");
        } else onClose();
      } else if (event.key === "Tab" && modalRef.current) {
        const focusable = [...modalRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled), a[href]")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose, deleteStep]);

  async function confirmAccountDeletion() {
    if (deleteConfirmation !== user.username || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      onClose();
    } catch (requestError) {
      setDeleteError(requestError.message);
      setDeleting(false);
    }
  }

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

  async function requestPasswordChange() {
    if (resetState === "pending" || resetState === "accepted") return;
    setResetState("pending");
    try {
      await apiRequest("/api/auth/password-reset/account", { method: "POST" }, token);
      setResetState("accepted");
    } catch {
      setResetState("error");
    }
  }

  if (!open) return null;

  return (
    <div className="account-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && deleteStep === 0 && !deleting) onClose();
    }}>
      <section ref={modalRef} className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-settings-title">
        <header className="account-modal-header">
          <div>
            <span className="eyebrow">{t("account.eyebrow")}</span>
            <h2 id="account-settings-title">{t("account.title")}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t("common.close")}>
            <X size={19} />
          </button>
        </header>

        <form noValidate className="account-settings-form" onSubmit={submitProfile}>
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

          <section className="account-section">
            <div className="account-section-heading">
              <KeyRound size={19} />
              <div><h3>{t("account.passwordTitle")}</h3><p>{t("account.passwordDescription")}</p></div>
            </div>
            <button className="ghost" type="button" onClick={requestPasswordChange}
              disabled={saving || resetState === "pending" || resetState === "accepted"}>
              <Mail size={17} aria-hidden="true" />
              {t(resetState === "pending" ? "common.loading" : "account.requestPasswordChange")}
            </button>
            <div role="status">
              {resetState === "accepted" && <p className="account-feedback success">{t("account.passwordChangeRequested")}</p>}
              {resetState === "error" && <p className="account-feedback error">{t("auth.resetRequestError")}</p>}
            </div>
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

          <section className="account-section account-danger-zone">
            <div className="account-section-heading danger-heading">
              <Trash2 size={19} />
              <div><h3>{t("account.deleteTitle")}</h3><p>{t("account.deleteDescription")}</p></div>
            </div>

            {deleteStep === 0 && (
              <button className="account-delete-trigger" type="button" onClick={() => setDeleteStep(1)}>
                <Trash2 size={17} /> {t("account.deleteAction")}
              </button>
            )}

            {deleteStep === 1 && (
              <div className="account-delete-confirm" role="alert" aria-live="polite">
                <AlertTriangle size={22} />
                <div><strong>{t("account.deleteFirstTitle")}</strong><p>{t("account.deleteFirstMessage")}</p></div>
                <div className="account-delete-actions">
                  <button className="ghost" type="button" autoFocus onClick={() => setDeleteStep(0)}>{t("common.cancel")}</button>
                  <button className="danger-outline" type="button" onClick={() => setDeleteStep(2)}>{t("account.continueDelete")}</button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="account-delete-confirm final" role="alert" aria-labelledby="delete-account-final-title" aria-describedby="delete-account-final-description">
                <Trash2 size={22} />
                <div>
                  <strong id="delete-account-final-title">{t("account.deleteFinalTitle")}</strong>
                  <p id="delete-account-final-description">{t("account.deleteFinalMessage", { username: user.username })}</p>
                </div>
                <label>
                  {t("account.typeUsername")}
                  <input autoFocus value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} onKeyDown={(event) => event.key === "Enter" && event.preventDefault()} autoComplete="off" />
                </label>
                {deleteError && <p className="account-feedback error">{deleteError}</p>}
                <div className="account-delete-actions">
                  <button className="ghost" type="button" disabled={deleting} onClick={() => { setDeleteStep(0); setDeleteConfirmation(""); }}>{t("common.cancel")}</button>
                  <button className="danger-action" type="button" disabled={deleteConfirmation !== user.username || deleting} onClick={confirmAccountDeletion}>
                    {deleting ? t("account.deleting") : t("account.deleteForever")}
                  </button>
                </div>
              </div>
            )}
          </section>
        </form>
      </section>
    </div>
  );
}
