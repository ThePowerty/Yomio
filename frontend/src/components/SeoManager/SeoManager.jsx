import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { faqs } from "../../content/marketingContent";
import { trackPageView } from "../../services/analytics";
import { useAuth } from "../../context/AuthContext";

const publicSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
const localBusinessName = import.meta.env.VITE_LOCAL_BUSINESS_NAME?.trim();
const publicAddress = import.meta.env.VITE_PUBLIC_ADDRESS?.trim();
const publicLocality = import.meta.env.VITE_PUBLIC_LOCALITY?.trim();
const publicCountry = import.meta.env.VITE_PUBLIC_COUNTRY?.trim();
const directionsUrl = import.meta.env.VITE_MAPS_DIRECTIONS_URL?.trim();

const exactMetadata = {
  "/": {
    title: "Yomio | Seguimiento de anime, manga, manhwa y películas",
    description: "Organiza lo que ves y lees, retoma cada historia desde el punto exacto y consulta próximos capítulos confirmados.",
    index: true
  },
  "/auth": {
    title: "Iniciar sesión o crear una cuenta | Yomio",
    description: "Accede a tu biblioteca personal de anime, manga, manhwa y películas.",
    index: false
  },
  "/privacy": {
    title: "Política de privacidad | Yomio",
    description: "Consulta cómo Yomio trata, protege y elimina los datos de tu cuenta.",
    index: true
  },
  "/legal": {
    title: "Aviso legal | Yomio",
    description: "Información legal, condiciones de uso y propiedad intelectual de Yomio.",
    index: true
  },
  "/terms": {
    title: "Términos y condiciones | Yomio",
    description: "Consulta las condiciones de uso, responsabilidades y normas aplicables de Yomio.",
    index: true
  },
  "/tracking": { title: "Seguimiento personal | Yomio", description: "Actualiza el progreso de tus historias y consulta dónde continuar." },
  "/calendar": { title: "Calendario de publicaciones | Yomio", description: "Consulta próximos capítulos y episodios confirmados de tus títulos activos." },
  "/wishlist": { title: "Lista de pendientes | Yomio", description: "Guarda historias para empezar más adelante y pásalas a seguimiento cuando quieras." },
  "/catalog/anime": { title: "Catálogo de anime | Yomio", description: "Busca anime y añade nuevos títulos a tu biblioteca personal." },
  "/catalog/manga": { title: "Catálogo de manga | Yomio", description: "Explora manga y conserva tu progreso de lectura." },
  "/catalog/manhwa": { title: "Catálogo de manhwa | Yomio", description: "Descubre manhwa y organiza cada capítulo leído." },
  "/catalog/movie": { title: "Catálogo de películas | Yomio", description: "Organiza películas vistas, pendientes y recomendaciones." },
  "/recommendations": { title: "Recomendaciones personales | Yomio", description: "Encuentra nuevas historias basadas en tu biblioteca y preferencias." },
  "/contact": { title: "Contáctanos | Yomio", description: "Envía comentarios, quejas o propuestas de mejora al equipo de administración de Yomio." },
  "/admin": { title: "Administración | Yomio", description: "Herramientas restringidas de administración de Yomio." }
};

function metadataFor(pathname) {
  if (exactMetadata[pathname]) return exactMetadata[pathname];
  if (pathname.startsWith("/stories/")) return { title: "Espacio de historia | Yomio", description: "Consulta notas y conversaciones permitidas por tu progreso." };
  if (pathname.startsWith("/ratings/")) return { title: "Valoraciones por capítulo | Yomio", description: "Valora los capítulos que ya has completado." };
  if (pathname.startsWith("/catalog/")) return { title: "Detalle de título | Yomio", description: "Consulta la ficha del título y añádelo a tu biblioteca." };
  return { title: "Página no encontrada | Yomio", description: "La dirección solicitada no existe o ha cambiado.", index: false, notFound: true };
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function SeoManager() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const metadata = location.pathname === "/" && isAuthenticated
      ? { title: "Inicio personal | Yomio", description: "Resumen privado de tu biblioteca, progreso y próximas publicaciones.", index: false }
      : metadataFor(location.pathname);
    const canonicalUrl = `${publicSiteUrl}${location.pathname}`;
    const imageUrl = `${publicSiteUrl}/yomio-icono.png`;
    const indexable = metadata.index === true;

    document.title = metadata.title;
    upsertMeta('meta[name="description"]', { name: "description", content: metadata.description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: indexable ? "index,follow" : "noindex,nofollow" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: metadata.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: metadata.description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: metadata.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: metadata.description });
    upsertLink("canonical", canonicalUrl);

    document.getElementById("yomio-structured-data")?.remove();
    if (location.pathname === "/" && !isAuthenticated) {
      const graph = [
        {
          "@type": "SoftwareApplication",
          name: "Yomio",
          applicationCategory: "EntertainmentApplication",
          operatingSystem: "Web",
          url: publicSiteUrl,
          description: exactMetadata["/"].description
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer }
          }))
        }
      ];
      if (localBusinessName && publicAddress && publicLocality && publicCountry && directionsUrl) {
        graph.push({
          "@type": "LocalBusiness",
          name: localBusinessName,
          url: publicSiteUrl,
          hasMap: directionsUrl,
          address: {
            "@type": "PostalAddress",
            streetAddress: publicAddress,
            addressLocality: publicLocality,
            addressCountry: publicCountry
          }
        });
      }
      const script = document.createElement("script");
      script.id = "yomio-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph
      });
      document.head.appendChild(script);
    }

    trackPageView(location.pathname, metadata.title);
  }, [isAuthenticated, location.pathname]);

  return null;
}
