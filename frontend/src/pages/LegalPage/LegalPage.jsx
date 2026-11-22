import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LegalDocumentContent } from "../../components/LegalDocumentContent/LegalDocumentContent";
import "./LegalPage.css";

export function LegalPage() {
  const pathname = useLocation().pathname;
  const privacy = pathname === "/privacy";
  const terms = pathname === "/terms";
  return (
    <main className="legal-shell">
      <header className="legal-header">
        <Link to="/" className="legal-back"><ArrowLeft size={18} /> Volver a Yomio</Link>
        <img src="/yomio-logo-fondo-claro.png" alt="Yomio" />
      </header>
      <article className="legal-document">
        <span className="eyebrow"><ShieldCheck size={15} /> Información pública</span>
        <h1>{privacy ? "Política de privacidad" : terms ? "Términos y condiciones" : "Aviso legal"}</h1>
        <p className="legal-updated">Última actualización: 19 de noviembre de 2026</p>
        <LegalDocumentContent document={privacy ? "privacy" : "legal"} />
      </article>
    </main>
  );
}
