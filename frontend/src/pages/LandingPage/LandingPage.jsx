import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Check, Clipboard, Film, MapPin, MonitorPlay, Share2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { caseStudies, faqs, verifiedReviews } from "../../content/marketingContent";
import "./LandingPage.css";

const publicAddress = import.meta.env.VITE_PUBLIC_ADDRESS?.trim();
const directionsUrl = import.meta.env.VITE_MAPS_DIRECTIONS_URL?.trim();

export function LandingPage() {
  const [shareStatus, setShareStatus] = useState("");
  const [showMobileCta, setShowMobileCta] = useState(false);
  const primaryCtaRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShowMobileCta(!entry.isIntersecting), { threshold: 0.1 });
    if (primaryCtaRef.current) observer.observe(primaryCtaRef.current);
    return () => observer.disconnect();
  }, []);

  async function shareYomio() {
    const payload = {
      title: "Yomio",
      text: "Organiza anime, manga, manhwa y películas sin perder tu punto de progreso.",
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        setShareStatus("Compartido");
      } else {
        await navigator.clipboard.writeText(payload.url);
        setShareStatus("Enlace copiado");
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareStatus("No se pudo compartir");
    }
  }

  return (
    <main className="landing-shell" id="top">
      <header className="landing-header">
        <Link to="/" aria-label="Yomio, inicio"><img src="/yomio-logo-fondo-claro.png" alt="Yomio" /></Link>
        <nav aria-label="Navegación pública">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#casos">Casos</a>
          <a href="#faq">Preguntas</a>
          <a href="#agradecimientos">Agradecimientos</a>
        </nav>
        <Link className="landing-login" to="/auth">Entrar</Link>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><Sparkles size={16} /> Tu historia, siempre al día</span>
          <h1 id="landing-title">Retoma cada historia en el punto exacto.</h1>
          <p>Anime, manga, manhwa y películas en una biblioteca que recuerda por ti, separa lo pendiente y protege lo que todavía no deberías ver.</p>
          <div className="landing-hero-actions" ref={primaryCtaRef}>
            <Link className="landing-primary" to="/auth">Crear mi biblioteca <ArrowRight size={18} /></Link>
            <a className="landing-secondary" href="#como-funciona">Ver cómo funciona</a>
          </div>
          <small>Cuenta gratuita · Sin permisos de cámara, ubicación o contactos</small>
        </div>

        <div className="landing-horizon" aria-label="Ejemplo visual del seguimiento de una historia">
          <div className="landing-horizon-label"><span>ONE PIECE</span><strong>Cap. 1198</strong></div>
          <div className="landing-horizon-line"><i /></div>
          <div className="landing-horizon-states">
            <span><Check size={16} /> Leído</span><span>Tu punto actual</span><span className="locked"><ShieldCheck size={16} /> Spoilers protegidos</span>
          </div>
          <div className="landing-mini-grid">
            <article><BookOpen size={20} /><small>Nota privada</small><strong>La promesa sigue pendiente</strong></article>
            <article><CalendarDays size={20} /><small>Próxima publicación</small><strong>Viernes · 19:00</strong></article>
          </div>
        </div>
      </section>

      <section className="landing-quick" aria-labelledby="quick-title">
        <div><span className="landing-section-label">Respuestas rápidas</span><h2 id="quick-title">Lo esencial, antes de empezar</h2></div>
        <dl>
          <div><dt>¿Cuánto cuesta?</dt><dd>La cuenta actual es gratuita.</dd></div>
          <div><dt>¿Qué organiza?</dt><dd>Anime, películas, manga y manhwa.</dd></div>
          <div><dt>¿Inventa fechas?</dt><dd>No. Solo muestra publicaciones confirmadas.</dd></div>
          <div><dt>¿Puedo borrar mis datos?</dt><dd>Sí, desde los ajustes de la cuenta.</dd></div>
        </dl>
      </section>

      <section className="landing-section landing-workflow" id="como-funciona" aria-labelledby="workflow-title">
        <header><span className="landing-section-label">Un solo recorrido</span><h2 id="workflow-title">Del “quiero verla” al “sigo por aquí”</h2><p>Yomio conserva la frontera entre lo que ya conoces y lo que aún pertenece al futuro.</p></header>
        <div className="landing-workflow-grid">
          <article><span>01</span><MonitorPlay /><h3>Encuentra el título</h3><p>Busca en los catálogos conectados y consulta su ficha antes de guardarlo.</p></article>
          <article><span>02</span><BookOpen /><h3>Marca tu progreso</h3><p>Guarda capítulo, episodio, estado, notas y valoraciones personales.</p></article>
          <article><span>03</span><CalendarDays /><h3>Continúa a tiempo</h3><p>Reúne fechas confirmadas y recomendaciones sin confundir una obra al día con una terminada.</p></article>
        </div>
      </section>

      <section className="landing-section" id="casos" aria-labelledby="cases-title">
        <header><span className="landing-section-label">Casos de estudio del producto</span><h2 id="cases-title">Tres problemas cotidianos, un mismo registro</h2><p className="landing-disclaimer">Escenarios ilustrativos basados en las funciones de Yomio; no son testimonios de clientes.</p></header>
        <div className="landing-case-grid">
          {caseStudies.map((item) => <article key={item.label}><span>{item.label}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </section>

      <section className="landing-section landing-reviews" id="resenas" aria-labelledby="reviews-title">
        <header><span className="landing-section-label">Reseñas reales</span><h2 id="reviews-title">Solo publicaremos opiniones verificables</h2></header>
        {verifiedReviews.length > 0 ? (
          <div className="landing-review-grid">{verifiedReviews.map((review) => <blockquote key={review.source}><p>“{review.quote}”</p><cite>{review.author} · {review.source}</cite></blockquote>)}</div>
        ) : (
          <div className="landing-honesty"><ShieldCheck size={22} /><p>Yomio todavía no dispone de reseñas públicas con fuente y permiso verificables. Esta sección no se rellenará con testimonios inventados.</p></div>
        )}
      </section>

      <section className="landing-section landing-faq" id="faq" aria-labelledby="faq-title">
        <header><span className="landing-section-label">5 preguntas frecuentes</span><h2 id="faq-title">Antes de crear tu biblioteca</h2></header>
        <div>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
      </section>

      {publicAddress && directionsUrl ? (
        <section className="landing-section landing-location" id="ubicacion" aria-labelledby="location-title">
          <MapPin size={28} /><div><span className="landing-section-label">Ubicación</span><h2 id="location-title">Cómo llegar</h2><p>{publicAddress}</p></div>
          <a className="landing-secondary" href={directionsUrl} target="_blank" rel="noreferrer">Abrir indicaciones</a>
        </section>
      ) : (
        <section className="landing-section landing-location online" aria-label="Servicio online"><MapPin size={26} /><div><h2>Yomio funciona completamente online</h2><p>No mostramos un mapa ni indicaciones porque el servicio no declara una ubicación pública de atención.</p></div></section>
      )}

      <section className="landing-section landing-thanks" id="agradecimientos" aria-labelledby="thanks-title">
        <div><span className="landing-section-label">Agradecimientos</span><h2 id="thanks-title">Construido sobre un ecosistema abierto</h2><p>Gracias a las comunidades y servicios que mantienen accesibles los metadatos con los que Yomio organiza cada biblioteca.</p></div>
        <ul><li><a href="https://anilist.co" target="_blank" rel="noreferrer">AniList</a></li><li><a href="https://kitsu.io" target="_blank" rel="noreferrer">Kitsu</a></li><li><a href="https://mangadex.org" target="_blank" rel="noreferrer">MangaDex</a></li><li>Lucide</li><li>GSAP</li></ul>
      </section>

      <section className="landing-final-cta" aria-labelledby="final-cta-title">
        <div><span className="landing-section-label">Tu siguiente historia</span><h2 id="final-cta-title">No vuelvas a buscar dónde lo dejaste.</h2></div>
        <Link className="landing-primary" to="/auth">Empezar ahora <ArrowRight size={18} /></Link>
      </section>

      <footer className="landing-footer">
        <img src="/yomio-logo-fondo-claro.png" alt="Yomio" />
        <nav aria-label="Enlaces del pie"><a href="#top">Volver arriba</a><Link to="/privacy">Privacidad</Link><Link to="/legal">Aviso legal</Link><Link to="/auth">Acceder</Link></nav>
        <div className="landing-share"><button type="button" onClick={shareYomio}>{shareStatus === "Enlace copiado" ? <Clipboard size={17} /> : <Share2 size={17} />} Compartir Yomio</button><span role="status">{shareStatus}</span></div>
      </footer>

      <Link className={`landing-mobile-cta${showMobileCta ? " visible" : ""}`} to="/auth">Crear mi biblioteca <ArrowRight size={18} /></Link>
    </main>
  );
}
