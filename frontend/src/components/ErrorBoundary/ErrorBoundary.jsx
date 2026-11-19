import { Component } from "react";
import { trackEvent } from "../../services/analytics";
import "./ErrorBoundary.css";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    trackEvent("frontend_crash");
    if (import.meta.env.DEV) {
      console.error("Uncaught UI error", error);
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="fatal-error" role="alert">
          <section className="surface fatal-error__panel">
            <p className="eyebrow">Yomio</p>
            <h1>La aplicación no pudo continuar</h1>
            <p>Recarga la página. Si el problema continúa, comparte el identificador de la respuesta fallida con soporte.</p>
            <button className="primary" type="button" onClick={() => window.location.reload()}>
              Recargar Yomio
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
