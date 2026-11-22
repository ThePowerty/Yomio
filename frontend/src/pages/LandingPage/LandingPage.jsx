import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clipboard,
  Film,
  MapPin,
  MonitorPlay,
  Pause,
  Play,
  Search,
  Share2,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { caseStudies, faqs, verifiedReviews } from "../../content/marketingContent";
import "./LandingPage.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const publicAddress = import.meta.env.VITE_PUBLIC_ADDRESS?.trim();
const directionsUrl = import.meta.env.VITE_MAPS_DIRECTIONS_URL?.trim();
const cinematicVideoUrl = import.meta.env.VITE_LANDING_CINEMATIC_VIDEO?.trim();
const cinematicPosterUrl = import.meta.env.VITE_LANDING_CINEMATIC_POSTER?.trim();

const workflowScenes = [
  {
    icon: Search,
    title: "Encuentra el título",
    description: "Busca en los catálogos conectados y consulta su ficha antes de guardarlo."
  },
  {
    icon: BookOpen,
    title: "Marca tu progreso",
    description: "Guarda capítulo, episodio, estado, notas y valoraciones personales."
  },
  {
    icon: CalendarDays,
    title: "Continúa a tiempo",
    description: "Reúne fechas confirmadas sin confundir una obra al día con una terminada."
  }
];

function ProgressHorizon({ compact = false }) {
  return (
    <div className={`landing-horizon${compact ? " landing-horizon-compact" : ""}`}>
      <div className="landing-horizon-label"><span>One Piece</span><strong>Cap. 1198</strong></div>
      <div className="landing-horizon-line"><i /></div>
      <div className="landing-horizon-states">
        <span><Check size={16} /> Leído</span>
        <span>Tu punto actual</span>
        <span className="locked"><ShieldCheck size={16} /> Spoilers protegidos</span>
      </div>
      {!compact && (
        <div className="landing-mini-grid">
          <article><BookOpen size={24} /><small>Nota privada</small><strong>La promesa sigue pendiente</strong></article>
          <article><CalendarDays size={24} /><small>Próxima publicación</small><strong>Viernes, 19:00</strong></article>
        </div>
      )}
    </div>
  );
}

function WorkflowVisuals() {
  return (
    <div className="landing-scene-player" aria-hidden="true">
      <div className="landing-scene-visual is-initial" data-scene-visual="0">
        <div className="landing-catalog-search"><Search size={20} /><span>Buscar una historia</span></div>
        <div className="landing-catalog-result">
          <div className="landing-cover-mark"><Film size={28} /></div>
          <div><strong>Una biblioteca para todo</strong><span>Anime, manga, manhwa y películas</span></div>
          <Check size={20} />
        </div>
        <div className="landing-catalog-result muted">
          <div className="landing-cover-mark"><BookOpen size={28} /></div>
          <div><strong>Ficha y contexto</strong><span>Consulta antes de añadir</span></div>
          <ArrowRight size={20} />
        </div>
      </div>

      <div className="landing-scene-visual" data-scene-visual="1">
        <ProgressHorizon compact />
        <div className="landing-scene-note"><BookOpen size={20} /><span>Tu nota privada sigue ligada al punto exacto.</span></div>
      </div>

      <div className="landing-scene-visual" data-scene-visual="2">
        <div className="landing-calendar-head"><span>Próximas publicaciones</span><strong>Esta semana</strong></div>
        <div className="landing-calendar-row"><span>Vie</span><div><strong>Continuar la historia</strong><small>Fecha confirmada</small></div><CalendarDays size={20} /></div>
        <div className="landing-calendar-row"><span>Dom</span><div><strong>Revisar pendientes</strong><small>Tu biblioteca, en orden</small></div><Check size={20} /></div>
        <div className="landing-calendar-foot"><ShieldCheck size={18} /> Sin adelantar contenido futuro</div>
      </div>

      <div className="landing-scene-progress"><i /></div>
      <div className="landing-scene-counter"><span>01</span><span>03</span></div>
    </div>
  );
}

export function LandingPage() {
  const [shareStatus, setShareStatus] = useState("");
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(Boolean(cinematicVideoUrl && cinematicPosterUrl));
  const landingRef = useRef(null);
  const primaryCtaRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShowMobileCta(!entry.isIntersecting), { threshold: 0.1 });
    if (primaryCtaRef.current) observer.observe(primaryCtaRef.current);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const scroller = landingRef.current;
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 901px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      (context) => {
        const { desktop, reduceMotion } = context.conditions;
        if (reduceMotion) return;

        const intro = gsap.timeline({ defaults: { duration: 0.72, ease: "power3.out" } });
        intro
          .from(".landing-header-inner", { autoAlpha: 0, y: -12, duration: 0.5 })
          .from(".landing-hero-copy > *", { autoAlpha: 0, y: 30, stagger: 0.09 }, "-=0.16")
          .from(".landing-hero-reel", { autoAlpha: 0, y: 38, scale: 0.975, duration: 0.95 }, "-=0.58")
          .from(".landing-horizon-line i", { scaleX: 0, transformOrigin: "left center", duration: 1 }, "-=0.58")
          .from(".landing-media-index li", { autoAlpha: 0, y: 12, stagger: 0.06, duration: 0.42 }, "-=0.46");

        if (desktop) {
          gsap.to(".landing-hero-reel", {
            yPercent: -7,
            ease: "none",
            scrollTrigger: {
              trigger: ".landing-hero",
              scroller,
              start: "top top",
              end: "bottom top",
              scrub: 0.8
            }
          });
        }

        const visuals = gsap.utils.toArray("[data-scene-visual]");
        const counter = document.querySelector(".landing-scene-counter span:first-child");
        const progress = document.querySelector(".landing-scene-progress i");

        const showScene = (index) => {
          gsap.to(visuals, {
            autoAlpha: (visualIndex) => visualIndex === index ? 1 : 0,
            y: (visualIndex) => visualIndex === index ? 0 : 18,
            scale: (visualIndex) => visualIndex === index ? 1 : 0.985,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true
          });
          gsap.to(progress, { scaleX: (index + 1) / visuals.length, duration: 0.45, ease: "power2.out", overwrite: true });
          if (counter) counter.textContent = `0${index + 1}`;
        };

        gsap.utils.toArray("[data-scene-copy]").forEach((scene, index) => {
          ScrollTrigger.create({
            trigger: scene,
            scroller,
            start: "top 58%",
            end: "bottom 42%",
            onEnter: () => showScene(index),
            onEnterBack: () => showScene(index)
          });
        });

        ScrollTrigger.batch(".landing-cinematic-reveal", {
          scroller,
          start: "top 84%",
          once: true,
          onEnter: (elements) => gsap.from(elements, {
            autoAlpha: 0,
            y: 34,
            duration: 0.72,
            stagger: 0.08,
            ease: "power3.out",
            overwrite: true
          })
        });
      }
    );

    return () => media.revert();
  }, { scope: landingRef });

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

  async function toggleVideo() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      await videoRef.current.play();
      setVideoPaused(false);
    } else {
      videoRef.current.pause();
      setVideoPaused(true);
    }
  }

  return (
    <main className="landing-shell" id="top" ref={landingRef}>
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link className="landing-brand" to="/" aria-label="Yomio, inicio"><img src="/yomio-logo-fondo-oscuro.png" alt="Yomio" /></Link>
          <nav aria-label="Navegación pública">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#casos">Casos</a>
            <a href="#faq">Preguntas</a>
            <a href="#agradecimientos">Agradecimientos</a>
          </nav>
          <Link className="landing-login" to="/auth">Entrar</Link>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        {videoAvailable && (
          <div className="landing-film" aria-hidden="true">
            <video ref={videoRef} autoPlay muted loop playsInline poster={cinematicPosterUrl} onError={() => setVideoAvailable(false)}>
              <source src={cinematicVideoUrl} type="video/mp4" />
            </video>
          </div>
        )}

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <h1 id="landing-title">Retoma cada historia en el punto exacto.</h1>
            <p>Tu biblioteca recuerda el progreso y mantiene el futuro protegido.</p>
            <div className="landing-hero-actions" ref={primaryCtaRef}>
              <Link className="landing-primary" to="/auth">Crear mi biblioteca <ArrowRight size={20} /></Link>
              <a className="landing-secondary" href="#como-funciona">Ver cómo funciona</a>
            </div>
            <small><span>Cuenta gratuita</span><span>Sin permisos de cámara, ubicación o contactos</span></small>
          </div>

          <div className="landing-hero-reel" aria-label="Ejemplo visual del seguimiento de una historia">
            <div className="landing-reel-back landing-reel-back-one" aria-hidden="true"><span>Manga</span><strong>Tu lectura</strong></div>
            <div className="landing-reel-back landing-reel-back-two" aria-hidden="true"><span>Anime</span><strong>Tu ritmo</strong></div>
            <div className="landing-reel-frame">
              <div className="landing-reel-heading"><span>Ahora mismo</span><strong>Una historia en curso</strong></div>
              <ProgressHorizon />
              <p>El límite entre lo que recuerdas y lo que aún no debes ver.</p>
            </div>
          </div>
        </div>

        <ol className="landing-media-index" aria-label="Contenido que organiza Yomio">
          <li>Anime</li><li>Manga</li><li>Manhwa</li><li>Películas</li>
        </ol>

        {videoAvailable && (
          <button className="landing-film-toggle" type="button" onClick={toggleVideo} aria-label={videoPaused ? "Reproducir fondo" : "Pausar fondo"}>
            {videoPaused ? <Play size={18} /> : <Pause size={18} />} {videoPaused ? "Reproducir" : "Pausar"}
          </button>
        )}
      </section>

      <section className="landing-quick landing-cinematic-reveal" aria-labelledby="quick-title">
        <h2 id="quick-title">Lo esencial, antes de empezar</h2>
        <dl>
          <div><dt>¿Cuánto cuesta?</dt><dd>La cuenta actual es gratuita.</dd></div>
          <div><dt>¿Qué organiza?</dt><dd>Anime, películas, manga y manhwa.</dd></div>
          <div><dt>¿Inventa fechas?</dt><dd>No. Solo muestra publicaciones confirmadas.</dd></div>
          <div><dt>¿Puedo borrar mis datos?</dt><dd>Sí, desde los ajustes de la cuenta.</dd></div>
        </dl>
      </section>

      <section className="landing-story" id="como-funciona" aria-labelledby="workflow-title">
        <header className="landing-story-heading landing-cinematic-reveal">
          <span>Un recorrido continuo</span>
          <h2 id="workflow-title">De encontrarla a seguir justo donde estabas</h2>
          <p>Yomio conserva la frontera entre lo que ya conoces y lo que todavía pertenece al futuro.</p>
        </header>

        <div className="landing-story-grid">
          <div className="landing-story-screen"><WorkflowVisuals /></div>
          <div className="landing-story-scenes">
            {workflowScenes.map((scene, index) => {
              const Icon = scene.icon;
              return (
                <article key={scene.title} data-scene-copy={index}>
                  <div className="landing-scene-number">0{index + 1}</div>
                  <Icon size={28} />
                  <h3>{scene.title}</h3>
                  <p>{scene.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section landing-cases" id="casos" aria-labelledby="cases-title">
        <header className="landing-cinematic-reveal"><h2 id="cases-title">Tres problemas cotidianos, un mismo registro</h2><p className="landing-disclaimer">Escenarios ilustrativos basados en las funciones de Yomio; no son testimonios de clientes.</p></header>
        <div className="landing-case-grid">
          {caseStudies.map((item, index) => (
            <article className="landing-cinematic-reveal" key={item.label}>
              <span>Escena 0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <small>{item.label}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-reviews landing-cinematic-reveal" id="resenas" aria-labelledby="reviews-title">
        <header><h2 id="reviews-title">Solo publicaremos opiniones verificables</h2></header>
        {verifiedReviews.length > 0 ? (
          <div className="landing-review-grid">{verifiedReviews.map((review) => <blockquote key={review.source}><p>“{review.quote}”</p><cite>{review.author}, {review.source}</cite></blockquote>)}</div>
        ) : (
          <div className="landing-honesty"><ShieldCheck size={24} /><p>Yomio todavía no dispone de reseñas públicas con fuente y permiso verificables. Esta sección no se rellenará con testimonios inventados.</p></div>
        )}
      </section>

      <section className="landing-section landing-faq" id="faq" aria-labelledby="faq-title">
        <header className="landing-cinematic-reveal"><h2 id="faq-title">Cinco preguntas antes de crear tu biblioteca</h2></header>
        <div className="landing-cinematic-reveal">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
      </section>

      {publicAddress && directionsUrl ? (
        <section className="landing-section landing-location landing-cinematic-reveal" id="ubicacion" aria-labelledby="location-title">
          <MapPin size={32} /><div><h2 id="location-title">Cómo llegar</h2><p>{publicAddress}</p></div>
          <a className="landing-secondary" href={directionsUrl} target="_blank" rel="noreferrer">Abrir indicaciones</a>
        </section>
      ) : (
        <section className="landing-section landing-location online landing-cinematic-reveal" aria-label="Servicio online"><MapPin size={32} /><div><h2>Yomio funciona completamente online</h2><p>No mostramos un mapa ni indicaciones porque el servicio no declara una ubicación pública de atención.</p></div></section>
      )}

      <section className="landing-section landing-thanks" id="agradecimientos" aria-labelledby="thanks-title">
        <div className="landing-cinematic-reveal"><h2 id="thanks-title">Construido sobre un ecosistema abierto</h2><p>Gracias a las comunidades y servicios que mantienen accesibles los metadatos con los que Yomio organiza cada biblioteca.</p></div>
        <ul className="landing-cinematic-reveal"><li><a href="https://anilist.co" target="_blank" rel="noreferrer">AniList</a></li><li><a href="https://kitsu.io" target="_blank" rel="noreferrer">Kitsu</a></li><li><a href="https://mangadex.org" target="_blank" rel="noreferrer">MangaDex</a></li><li>Lucide</li><li>GSAP</li></ul>
      </section>

      <section className="landing-final-cta landing-cinematic-reveal" aria-labelledby="final-cta-title">
        <div><span>Tu siguiente historia empieza aquí</span><h2 id="final-cta-title">No vuelvas a buscar dónde lo dejaste.</h2></div>
        <Link className="landing-primary" to="/auth">Empezar ahora <ArrowRight size={20} /></Link>
      </section>

      <footer className="landing-footer">
        <img src="/yomio-logo-fondo-claro.png" alt="Yomio" />
        <nav aria-label="Enlaces del pie"><a href="#top">Volver arriba</a><Link to="/privacy">Privacidad</Link><Link to="/terms">Términos y condiciones</Link><Link to="/auth">Acceder</Link></nav>
        <div className="landing-share"><button type="button" onClick={shareYomio}>{shareStatus === "Enlace copiado" ? <Clipboard size={18} /> : <Share2 size={18} />} Compartir Yomio</button><span role="status">{shareStatus}</span></div>
      </footer>

      {showMobileCta && <Link className="landing-mobile-cta" to="/auth">Crear mi biblioteca <ArrowRight size={20} /></Link>}
    </main>
  );
}
