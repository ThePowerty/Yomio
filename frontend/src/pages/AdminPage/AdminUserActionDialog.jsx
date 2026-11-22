import { AlertTriangle, BookOpen, MonitorPlay, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../../services/api";
import { LoadingSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";

function progressPercent(group) {
  if (!group?.knownTotalUnits) return 0;
  return Math.min(100, Math.round((group.knownCurrentUnits / group.knownTotalUnits) * 100));
}

function ProgressGroup({ icon: Icon, label, unitLabel, group }) {
  const { t } = useTranslation();
  const percent = progressPercent(group);
  return (
    <article className="admin-progress-group">
      <header><Icon size={19} aria-hidden="true" /><div><h3>{label}</h3><p>{t("admin.progressTitles", { count: group.trackedTitles })}</p></div></header>
      <div className="admin-progress-numbers">
        <span><strong>{group.currentUnits}</strong>{unitLabel}</span>
        <span><strong>{group.completedTitles}</strong>{t("admin.completed")}</span>
      </div>
      <div className="admin-progress-meter" aria-label={t("admin.knownProgress", { percent })}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <small>{group.knownTotalUnits > 0
        ? t("admin.knownUnits", { current: group.knownCurrentUnits, total: group.knownTotalUnits, percent })
        : t("admin.noKnownTotals")}</small>
    </article>
  );
}

export function AdminUserActionDialog({ action, token, onClose, onRoleUpdated }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("USER");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!action) return undefined;
    let stale = false;
    returnFocusRef.current = document.activeElement;
    setSummary(null);
    setError("");
    setRole(action.user.role);
    setConfirming(false);
    setSaving(false);
    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.querySelector("button")?.focus());
    if (action.mode === "progress") {
      setLoading(true);
      apiRequest(`/api/admin/users/${action.user.id}/progress`, {}, token)
        .then((data) => { if (!stale) setSummary(data); })
        .catch((requestError) => { if (!stale) setError(requestError.message); })
        .finally(() => { if (!stale) setLoading(false); });
    }
    return () => {
      stale = true;
      window.cancelAnimationFrame(focusFrame);
      returnFocusRef.current?.focus?.();
    };
  }, [action, token]);

  useEffect(() => {
    if (!action) return undefined;
    function handleKeyboard(event) {
      if (event.key === "Escape" && !saving) {
        if (confirming) setConfirming(false);
        else onClose();
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll("button:not(:disabled), select:not(:disabled)")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [action, confirming, onClose, saving]);

  if (!action) return null;
  const isProgress = action.mode === "progress";
  const roleChanged = role !== action.user.role;

  async function submitRole(event) {
    event.preventDefault();
    if (!roleChanged || saving) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest(`/api/admin/users/${action.user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      }, token);
      onRoleUpdated(updated, action.user.role);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving && !confirming) onClose();
    }}>
      <section ref={dialogRef} className="admin-user-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-user-dialog-title">
        <header className="admin-dialog-header">
          <div><span className="eyebrow">{t(isProgress ? "admin.progressEyebrow" : "admin.permissionsEyebrow")}</span><h2 id="admin-user-dialog-title">{t(isProgress ? "admin.progressTitle" : "admin.editRoleTitle", { username: action.user.username })}</h2><p>{action.user.username}</p></div>
          <button type="button" className="icon-button" onClick={onClose} disabled={saving} aria-label={t("common.close")}><X size={19} aria-hidden="true" /></button>
        </header>

        {isProgress ? (
          <div className="admin-dialog-body">
            {loading && <LoadingSkeleton variant="list" count={3} label={t("admin.loadingProgress")} />}
            {error && <div className="admin-dialog-feedback error" role="alert">{error}</div>}
            {!loading && summary && summary.totalTracked === 0 && <div className="admin-dialog-state"><BookOpen size={26} /><strong>{t("admin.noProgress")}</strong></div>}
            {!loading && summary && summary.totalTracked > 0 && <>
              <div className="admin-progress-overview">
                <span><strong>{summary.totalTracked}</strong>{t("admin.tracked")}</span>
                <span><strong>{summary.activeTitles}</strong>{t("admin.active")}</span>
                <span><strong>{summary.completedTitles}</strong>{t("admin.completed")}</span>
              </div>
              <div className="admin-progress-groups">
                <ProgressGroup icon={MonitorPlay} label={t("admin.viewing")} unitLabel={t("admin.episodesViewed")} group={summary.viewing} />
                <ProgressGroup icon={BookOpen} label={t("admin.reading")} unitLabel={t("admin.chaptersRead")} group={summary.reading} />
              </div>
              <p className="admin-privacy-note"><ShieldCheck size={16} aria-hidden="true" />{t("admin.aggregateOnly")}</p>
            </>}
          </div>
        ) : (
          <form className="admin-dialog-body admin-role-form" onSubmit={submitRole}>
            <label htmlFor="admin-role-select">{t("admin.newRole")}<select id="admin-role-select" value={role} onChange={(event) => { setRole(event.target.value); setConfirming(false); setError(""); }} disabled={saving}><option value="USER">{t("admin.roles.USER")}</option><option value="ADMIN">{t("admin.roles.ADMIN")}</option></select></label>
            <p className="admin-role-help">{t(role === "ADMIN" ? "admin.adminRoleHelp" : "admin.userRoleHelp")}</p>
            {confirming && <div className="admin-role-confirm" role="alert"><AlertTriangle size={19} aria-hidden="true" /><div><strong>{t("admin.confirmRoleTitle")}</strong><p>{t("admin.confirmRoleDescription", { username: action.user.username, role: t(`admin.roles.${role}`) })}</p></div></div>}
            {error && <div className="admin-dialog-feedback error" role="alert">{error}</div>}
            <div className="admin-dialog-actions"><button type="button" className="ghost" onClick={() => confirming ? setConfirming(false) : onClose()} disabled={saving}>{t("common.cancel")}</button><button type="submit" className="primary" disabled={!roleChanged || saving}>{saving ? t("admin.savingRole") : t(confirming ? "admin.confirmRole" : "admin.reviewRole")}</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
