import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
export function ForbiddenPage(){const navigate=useNavigate();return <section className="empty panel"><ShieldX size={38}/><h2>Acceso restringido</h2><p>Tu cuenta no tiene permiso para abrir esta página.</p><button className="primary" type="button" onClick={()=>navigate('/')}>Volver al inicio</button></section>}
