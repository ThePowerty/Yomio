import { ArrowLeft, Compass, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { publicPath } from "../../lib/publicPath";
import "./NotFoundPage.css";

export function NotFoundPage() {
  return (
    <main className="not-found-shell">
      <section>
        <img src={publicPath("yomio-icono.png")} alt="Símbolo de Yomio" />
        <span className="not-found-code">404 · Página fuera de catálogo</span>
        <h1>Esta historia no está donde la dejamos.</h1>
        <p>La dirección puede haber cambiado o el enlace ya no existe. Puedes volver al inicio público o acceder a tu biblioteca.</p>
        <div><Link className="primary" to="/"><Home size={18} /> Volver al inicio</Link><Link className="ghost" to="/auth"><Compass size={18} /> Ir a mi cuenta</Link></div>
        <button type="button" onClick={() => window.history.back()}><ArrowLeft size={17} /> Volver a la página anterior</button>
      </section>
    </main>
  );
}
