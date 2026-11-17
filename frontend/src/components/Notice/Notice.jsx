import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Notice({ message, onClose }) {
  const { t } = useTranslation();

  if (!message) return null;

  return (
    <div className="notice" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="notice-dismiss" onClick={onClose} aria-label={t("common.dismissNotice")}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
