import { Scale, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { LegalDocumentContent } from "../LegalDocumentContent/LegalDocumentContent";
import "./LegalDocumentsModal.css";

export function LegalDocumentsModal({ document, onClose, onSelectDocument }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const returnFocusRef = useRef(null);
  const open = Boolean(document);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = window.document.activeElement;
    const appRoot = window.document.querySelector(".app-layout");
    const previousInert = appRoot?.inert ?? false;
    if (appRoot) appRoot.inert = true;
    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.querySelector("button")?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (appRoot) appRoot.inert = previousInert;
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (open) bodyRef.current?.scrollTo({ top: 0 });
  }, [document, open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyboard(event) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll("button:not(:disabled), a[href]")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && window.document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && window.document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    window.document.addEventListener("keydown", handleKeyboard);
    return () => window.document.removeEventListener("keydown", handleKeyboard);
  }, [onClose, open]);

  if (!open) return null;
  const privacy = document === "privacy";

  return createPortal(
    <div className="legal-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={dialogRef} className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" aria-describedby="legal-modal-updated">
        <header className="legal-modal-header">
          <div>
            <span className="eyebrow">{privacy ? <ShieldCheck size={15} aria-hidden="true" /> : <Scale size={15} aria-hidden="true" />}{t("layout.legal.publicInformation")}</span>
            <h2 id="legal-modal-title">{t(privacy ? "layout.legal.privacy" : "layout.legal.notice")}</h2>
            <p id="legal-modal-updated">{t("layout.legal.updated")}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t("common.close")}><X size={19} aria-hidden="true" /></button>
        </header>
        <div ref={bodyRef} className="legal-modal-body">
          <LegalDocumentContent document={document} onSelectDocument={onSelectDocument} />
        </div>
      </section>
    </div>,
    window.document.body
  );
}
