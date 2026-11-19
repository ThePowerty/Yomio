import { MessageSquareText, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Notice } from "../../components/Notice/Notice";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import "./ContactPage.css";

export function ContactPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [form, setForm] = useState({ category: "COMMENT", subject: "", message: "" });
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) { setNotice(t("contact.required")); return; }
    setSending(true); setNotice("");
    try {
      await apiRequest("/api/contact-messages", { method: "POST", body: JSON.stringify(form) }, token);
      setForm({ category: "COMMENT", subject: "", message: "" }); setNotice(t("contact.sent"));
    } catch (error) { setNotice(error.message); }
    finally { setSending(false); }
  }
  return <section className="contact-page page-stack">
    <div className="panel contact-intro"><MessageSquareText size={28}/><div><span className="eyebrow">{t("contact.eyebrow")}</span><p>{t("contact.description")}</p></div></div>
    <Notice message={notice} onClose={() => setNotice("")} />
    <form className="panel contact-form" noValidate onSubmit={submit}>
      <label>{t("contact.category")}<select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}><option value="COMMENT">{t("contact.categories.COMMENT")}</option><option value="COMPLAINT">{t("contact.categories.COMPLAINT")}</option><option value="IMPROVEMENT">{t("contact.categories.IMPROVEMENT")}</option></select></label>
      <label>{t("contact.subject")}<input required maxLength="120" value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})}/></label>
      <label>{t("contact.message")}<textarea required rows="8" maxLength="2000" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}/><small>{form.message.length}/2000 · {t("contact.privacyHint")}</small></label>
      <button type="submit" className="primary" disabled={sending}><Send size={17}/>{sending ? t("contact.sending") : t("contact.send")}</button>
    </form>
  </section>;
}
