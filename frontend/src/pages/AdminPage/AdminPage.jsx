import { BookOpen, Check, Inbox, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../../components/StatCard/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import "./AdminPage.css";
import { apiRequest } from "../../services/api";

export function AdminPage() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { stats } = useTracker();
  const [messages, setMessages] = useState([]);
  useEffect(() => { apiRequest("/api/contact-messages", {}, token).then(setMessages).catch(()=>setMessages([])); }, [token]);
  async function resolve(id) { const updated = await apiRequest(`/api/contact-messages/${id}/resolve`, { method: "PATCH" }, token); setMessages((current)=>current.map((item)=>item.id===id?updated:item)); }

  return (
    <div className="page-stack admin-page">
      <section className="stats-grid">
        <StatCard icon={Shield} label={t("admin.currentRole")} value={user.role} detail={t("admin.sessionPermissions")} />
        <StatCard icon={Users} label={t("admin.users")} value="1" detail={t("admin.readyPanel")} />
        <StatCard icon={BookOpen} label={t("admin.entries")} value={stats.anime + stats.manga} detail={t("admin.totalPersonal")} />
      </section>
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">{t("admin.eyebrow")}</span>
          </div>
        </div>
        <p className="muted">{t("admin.restricted")}</p>
      </div>
      <section className="panel admin-inbox">
        <div className="panel-header"><div><span className="eyebrow">{t("admin.inbox")}</span><h2>{t("admin.contactMessages")}</h2></div><span className="pill"><Inbox size={14}/>{messages.filter((item)=>!item.resolvedAt).length}</span></div>
        {messages.length === 0 ? <p className="muted">{t("admin.noMessages")}</p> : <div className="admin-message-list">{messages.map((item)=><article key={item.id} className={item.resolvedAt ? "resolved" : ""}><div><span className="pill">{t(`contact.categories.${item.category}`)}</span><time>{new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.createdAt))}</time></div><h3>{item.subject}</h3><p>{item.message}</p><small>{item.username}</small>{!item.resolvedAt&&<button className="ghost" onClick={()=>resolve(item.id)}><Check size={15}/>{t("admin.markResolved")}</button>}</article>)}</div>}
      </section>
    </div>
  );
}
