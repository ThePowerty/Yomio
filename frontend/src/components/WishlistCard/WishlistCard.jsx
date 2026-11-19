import { BookOpen, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./WishlistCard.css";

export function WishlistCard({ item, onStart, onDelete, disabled }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <article className="wishlist-card"><div><span className="pill">{t(`common.${item.type.toLowerCase()}`)}</span><h3>{item.title}</h3><p>{item.totalChapters ? t("wishlist.knownLength", { count: item.totalChapters }) : t("wishlist.unknownLength")}</p></div>
    {!confirmDelete ? <div className="wishlist-card-actions">
      {item.catalogMediaId && <button className="ghost" type="button" onClick={() => navigate(`/stories/${item.catalogMediaId}`)}><BookOpen size={17}/> {t("wishlist.viewTitle")}</button>}
      <button className="primary" type="button" disabled={disabled} onClick={() => onStart(item.id)}><Play size={17}/> {t("wishlist.startTracking")}</button>
      <button className="icon-button danger" type="button" onClick={() => setConfirmDelete(true)} title={t("common.delete")}><Trash2 size={18}/></button>
    </div> : <div className="wishlist-delete-confirm" role="alertdialog" aria-label={t("wishlist.deleteTitle", { title: item.title })}><p>{t("wishlist.deleteQuestion", { title: item.title })}</p><div><button className="ghost" type="button" onClick={() => setConfirmDelete(false)}>{t("common.cancel")}</button><button className="danger-action" type="button" onClick={() => onDelete(item.id)}>{t("common.delete")}</button></div></div>}
  </article>;
}
