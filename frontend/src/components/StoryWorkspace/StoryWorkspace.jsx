import { AlertTriangle, BookmarkPlus, Eye, Heart, Pencil, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import { Notice } from "../Notice/Notice";
import { ChapterRatingPanel } from "../ChapterRatingPanel/ChapterRatingPanel";
import { LoadingSkeleton } from "../LoadingSkeleton/LoadingSkeleton";
import "./StoryWorkspace.css";

export function StoryWorkspace({ track }) {
  const { token } = useAuth();
  const [tab, setTab] = useState("resume");
  const [unit, setUnit] = useState(Math.max(1, track.currentChapter || 1));
  const [notes, setNotes] = useState([]);
  const [thread, setThread] = useState(null);
  const [note, setNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [comment, setComment] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [revealFuture, setRevealFuture] = useState(false);
  const [revealSpoilers, setRevealSpoilers] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [reporting, setReporting] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { loadPrivate(); }, [track.catalogMediaId, track.currentChapter]);
  useEffect(() => { loadThread(); }, [unit, revealFuture, revealSpoilers]);

  async function loadPrivate() {
    try {
      setNotes(await apiRequest(`/api/media/${track.catalogMediaId}/notes`, {}, token));
    } catch (error) { setMessage(error.message); }
  }

  async function loadThread() {
    if (!track.catalogMediaId) return;
    setBusy(true);
    try {
      const params = new URLSearchParams({ unit: String(unit), revealFuture: String(revealFuture), revealSpoilers: String(revealSpoilers) });
      setThread(await apiRequest(`/api/community/${track.catalogMediaId}?${params}`, {}, token));
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function addNote(event) {
    event.preventDefault(); setBusy(true);
    try {
      await apiRequest(`/api/media/${track.catalogMediaId}/notes${editingNoteId ? `/${editingNoteId}` : ""}`, { method: editingNoteId ? "PUT" : "POST", body: JSON.stringify({ unitNumber: unit, volumeNumber: null, content: note }) }, token);
      setNote(""); setEditingNoteId(null); setMessage("Nota privada guardada."); await loadPrivate();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }

  async function removeNote(id) { setBusy(true); try { await apiRequest(`/api/media/${track.catalogMediaId}/notes/${id}`, { method: "DELETE" }, token); await loadPrivate(); } catch (error) { setMessage(error.message); } finally { setBusy(false); } }

  async function addComment(event) {
    event.preventDefault(); setBusy(true);
    try {
      await apiRequest(`/api/community/${track.catalogMediaId}`, { method: "POST", body: JSON.stringify({ unitNumber: unit, parentId: replyTo, body: comment, spoiler }) }, token);
      setComment(""); setReplyTo(null); setSpoiler(false); await loadThread();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }

  async function react(id) { try { await apiRequest(`/api/community/comments/${id}/reaction`, { method: "POST" }, token); await loadThread(); } catch (error) { setMessage(error.message); } }
  async function report(id) { try { await apiRequest(`/api/community/comments/${id}/reports`, { method: "POST", body: JSON.stringify({ reason: reportReason }) }, token); setReporting(null); setReportReason(""); setMessage("Denuncia enviada para revisión."); } catch (error) { setMessage(error.message); } }

  const canWrite = unit <= track.currentChapter;
  const latestNote = notes[0];

  return <section className="story-workspace panel">
    <header className="story-workspace-header">
      <div><span className="eyebrow">Al ritmo de tu historia</span><h2>Retoma, valora y conversa</h2><p>Tu límite actual es {track.currentChapter}. Nada posterior se muestra sin tu permiso.</p></div>
      <label className="unit-selector">Capítulo o episodio<input type="number" min="1" value={unit} onChange={(event) => { setUnit(Math.max(1, Number(event.target.value))); setRevealFuture(false); }} /></label>
    </header>
    <div className="story-tabs" role="tablist" aria-label="Herramientas de la obra">
      {[['resume','Retomar'],['ratings','Valoraciones'],['community','Comunidad']].map(([value,label]) => <button key={value} type="button" role="tab" aria-selected={tab===value} className={tab===value?'active':''} onClick={()=>setTab(value)}>{label}</button>)}
    </div>
    <Notice message={message} onClose={()=>setMessage("")} />

    {tab === "resume" && <div className="story-panel-grid">
      <form noValidate className="story-compose" onSubmit={addNote}>
        <div className="story-icon"><BookmarkPlus size={20}/></div><h3>¿Dónde me quedé?</h3><p>Solo tú puedes ver esta nota. Quedará vinculada al punto {unit}.</p>
        <label>Nota privada<textarea rows="5" maxLength="2000" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Acontecimientos, personajes o tramas pendientes…" /></label>
        <button className="primary" disabled={busy || !canWrite || !note.trim()}>{editingNoteId ? "Actualizar nota" : "Guardar nota"}</button>
        {!canWrite && <small className="inline-warning">Avanza hasta este punto para guardar una nota.</small>}
      </form>
      <section className="story-history"><h3>Notas anteriores</h3>{latestNote && <p className="resume-callout">Última nota compatible: punto {latestNote.unitNumber} · {new Date(latestNote.updatedAt).toLocaleDateString()}</p>}{notes.length===0?<p className="muted">Aún no has guardado notas.</p>:notes.map(item=><article className="private-note" key={item.id}><div><strong>Punto {item.unitNumber}</strong><small>{new Date(item.updatedAt).toLocaleString()}</small></div><p>{item.content}</p><div className="private-note-actions"><button className="icon-button" type="button" aria-label="Editar nota" onClick={()=>{setUnit(item.unitNumber);setNote(item.content);setEditingNoteId(item.id)}}><Pencil size={16}/></button><button className="icon-button" type="button" aria-label="Eliminar nota" onClick={()=>removeNote(item.id)}><Trash2 size={16}/></button></div></article>)}</section>
    </div>}

    {tab === "ratings" && <ChapterRatingPanel track={track} unit={unit} onUnitChange={setUnit} />}

    {tab === "community" && <section className="community-panel">
      {thread?.locked ? <div className="spoiler-lock"><AlertTriangle size={28}/><h3>Conversación protegida</h3><p>{thread.lockReason}</p><button className="primary" type="button" onClick={()=>setRevealFuture(true)}><Eye size={17}/> Revelar bajo mi responsabilidad</button></div> : <>
        <div className="community-toolbar"><p>{busy?'Cargando conversación…':`${thread?.comments.length||0} comentarios en el punto ${unit}`}</p><label><input type="checkbox" checked={revealSpoilers} onChange={(e)=>setRevealSpoilers(e.target.checked)}/> Revelar spoilers marcados</label></div>
        <div className="comment-list">{busy && !thread ? <LoadingSkeleton variant="list" count={4} label="Cargando conversación…" /> : <>{thread?.comments.length===0&&<p className="muted">Sé la primera persona en comentar este punto.</p>}{thread?.comments.map(item=><article className={`comment-card${item.parentId?' reply':''}`} key={item.id}><header><strong>{item.author}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></header>{item.contentHidden?<div className="manual-spoiler"><Eye size={18}/><span>Spoiler marcado por su autor</span></div>:<p>{item.body}</p>}<footer><button type="button" onClick={()=>react(item.id)} className={item.reactedByMe?'active':''}><Heart size={15}/> {item.reactions}</button><button type="button" disabled={!canWrite} onClick={()=>setReplyTo(item.id)}>Responder</button><button type="button" onClick={()=>setReporting(item.id)}>Denunciar</button></footer>{reporting===item.id&&<div className="report-row"><input value={reportReason} onChange={(e)=>setReportReason(e.target.value)} placeholder="Motivo de la denuncia" maxLength="500"/><button type="button" onClick={()=>report(item.id)}>Enviar</button></div>}</article>)}</>}</div>
        {canWrite&&<form noValidate className="comment-compose" onSubmit={addComment}>{replyTo&&<p>Respondiendo al comentario #{replyTo} <button type="button" onClick={()=>setReplyTo(null)}>Cancelar</button></p>}<label>Tu comentario<textarea rows="3" maxLength="2000" value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Comenta solo sobre lo ocurrido hasta este punto…"/></label><label className="spoiler-check"><input type="checkbox" checked={spoiler} onChange={(e)=>setSpoiler(e.target.checked)}/> Marcar como spoiler</label><button className="primary" disabled={busy||!comment.trim()}><Send size={17}/> Publicar comentario</button></form>}
      </>}
    </section>}
  </section>;
}
