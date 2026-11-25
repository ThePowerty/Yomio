import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import "./LegalDocumentContent.css";

const owner = import.meta.env.VITE_LEGAL_ENTITY_NAME || "[Responsable pendiente de completar]";
const email = import.meta.env.VITE_PRIVACY_EMAIL || "[Email de privacidad pendiente]";
const address = import.meta.env.VITE_LEGAL_ADDRESS || "[Domicilio legal pendiente]";

export function LegalDocumentContent({ document, onSelectDocument }) {
  return (
    <div className="legal-content">
      {document === "privacy" ? <PrivacyContent /> : <LegalContent onSelectDocument={onSelectDocument} />}
    </div>
  );
}

function PrivacyContent() {
  return <>
    <section><h2>1. Responsable</h2><p>El responsable del tratamiento es <strong>{owner}</strong>, con domicilio en {address}. Contacto de privacidad: <strong>{email}</strong>.</p><p className="legal-warning">Estos datos deben completarse antes de publicar Yomio o enviar la aplicación a una tienda.</p></section>
    <section><h2>2. Datos que trata Yomio</h2><p>Al crear una cuenta tratamos nombre de usuario, correo electrónico y una contraseña almacenada únicamente como hash seguro. También guardamos tu biblioteca, progreso, valoraciones, notas, lista de pendientes, preferencias, acciones comunitarias y los mensajes que envíes al equipo desde Contacto.</p><p>Los registros técnicos pueden incluir identificadores de petición, fecha, resultado y datos de red imprescindibles para seguridad, límites de uso y diagnóstico. No registramos contraseñas ni tokens.</p></section>
    <section><h2>3. Finalidad y base jurídica</h2><p>Usamos estos datos para prestar el servicio solicitado, autenticarte, sincronizar tu seguimiento, recomendar contenido, prevenir abusos y resolver errores.</p><p>Google Analytics permanece desactivado hasta que aceptas la analítica opcional. Si se configura, registra páginas visitadas y eventos técnicos permitidos de onboarding, sin enviar nombre de usuario, correo, búsquedas, notas, tokens ni texto privado. Puedes rechazarla y seguir utilizando Yomio.</p></section>
    <section><h2>4. Proveedores y fuentes externas</h2><p>Yomio consulta fuentes públicas como AniList, Kitsu y MangaDex para metadatos, fechas y portadas. Esos servicios pueden recibir la dirección IP de la infraestructura de Yomio; las imágenes remotas pueden ser solicitadas por tu dispositivo según la configuración de despliegue.</p></section>
    <section><h2>5. Conservación, seguridad y derechos</h2><p>Conservamos la cuenta mientras permanezca activa y los registros técnicos durante el tiempo estrictamente necesario para seguridad. Puedes solicitar acceso, rectificación, supresión, limitación, oposición o portabilidad escribiendo al contacto indicado. Desde los ajustes puedes eliminar definitivamente la cuenta y sus datos asociados; esta acción no se puede deshacer.</p></section>
    <section id="account-deletion"><h2>6. Eliminación de la cuenta</h2><p>Inicia sesión, abre Ajustes desde tu perfil y selecciona “Eliminar mi cuenta”. Tras dos confirmaciones, Yomio elimina el perfil y sus datos asociados de la base de datos. Las respuestas escritas por otras personas a comentarios eliminados se conservan sin depender del comentario borrado.</p></section>
    <section><h2>7. Permisos del dispositivo y analítica</h2><p>La versión web actual no solicita cámara, micrófono, ubicación, contactos ni fotos. La analítica no se usa para publicidad personalizada y mantiene denegados los permisos de almacenamiento publicitario, datos publicitarios y personalización. Una futura app móvil deberá actualizar esta política y pedir cada permiso solo cuando sea necesario.</p></section>
  </>;
}

function LegalContent({ onSelectDocument }) {
  return <>
    <section><h2>1. Titular del servicio</h2><p>Titular: <strong>{owner}</strong><br />Domicilio: {address}<br />Contacto: {email}</p><p className="legal-warning">Faltan los datos identificativos obligatorios del titular. Completa las variables legales antes de producción.</p></section>
    <section><h2>2. Objeto y condiciones de uso</h2><p>Yomio permite organizar el seguimiento de anime, películas, manga y manhwa. La persona usuaria debe aportar información veraz, proteger sus credenciales y utilizar el servicio de forma lícita, sin abusar de la API ni vulnerar derechos de terceros.</p></section>
    <section><h2>3. Propiedad intelectual</h2><p>La marca, interfaz y código propio de Yomio pertenecen a su titular o se usan bajo la licencia correspondiente. Los títulos, imágenes y metadatos de terceros pertenecen a sus respectivos titulares y se muestran con finalidad informativa.</p></section>
    <section><h2>4. Disponibilidad y enlaces</h2><p>El servicio puede cambiar o interrumpirse por mantenimiento o causas técnicas. Los enlaces y datos procedentes de servicios externos no implican aprobación ni control sobre sus contenidos.</p></section>
    <section><h2>5. Normas aplicables</h2><p>Estas condiciones se interpretarán conforme a la legislación aplicable al titular y a la persona consumidora. Antes de publicar, una revisión jurídica debe completar jurisdicción, identificación fiscal y mecanismos de reclamación que correspondan.</p></section>
    {onSelectDocument ? (
      <button className="legal-source" type="button" onClick={() => onSelectDocument("privacy")}><ExternalLink size={16} aria-hidden="true" /> Consultar política de privacidad</button>
    ) : (
      <Link className="legal-source" to="/privacy"><ExternalLink size={16} aria-hidden="true" /> Consultar política de privacidad</Link>
    )}
  </>;
}
