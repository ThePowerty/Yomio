import { ArrowLeft, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StoryWorkspace } from "../../components/StoryWorkspace/StoryWorkspace";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import { apiRequest } from "../../services/api";

export function StoryPage(){
 const {mediaId}=useParams(); const navigate=useNavigate(); const {token}=useAuth(); const {items}=useTracker(); const [media,setMedia]=useState(null);
 const track=items.find(item=>String(item.catalogMediaId)===String(mediaId));
 useEffect(()=>{apiRequest(`/api/catalog/${mediaId}`,{},token).then(setMedia).catch(()=>setMedia(null));},[mediaId,token]);
 if(!track)return <div className="empty"><BookOpen size={34}/><p>Añade esta obra a tu seguimiento para usar sus notas, valoraciones y comunidad.</p></div>;
 return <div className="page-stack"><button className="ghost detail-back" type="button" onClick={()=>navigate('/tracking')}><ArrowLeft size={18}/> Volver al seguimiento</button><section className="panel"><span className="pill">{track.type}</span><h2>{media?.titleLocalized||track.title}</h2><p className="muted">Última actividad: {new Date(track.updatedAt).toLocaleString()}</p></section><StoryWorkspace track={track}/></div>;
}
