import { Bookmark, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Notice } from "../../components/Notice/Notice";
import { WishlistCard } from "../../components/WishlistCard/WishlistCard";
import { useTracker } from "../../context/TrackerContext";
import "./WishlistPage.css";

const TYPES = ["", "ANIME", "MOVIE", "MANGA", "MANHWA"];

export function WishlistPage() {
  const { t } = useTranslation();
  const { wishlistItems, loadCatalog, addToWishlist, startWishlistItem, deleteWishlistItem, status, clearStatus, loading } = useTracker();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function search(event) {
    event.preventDefault();
    setSearching(true);
    setResults(await loadCatalog(query.trim(), type));
    setSearching(false);
  }

  async function choose(media) {
    if (await addToWishlist(media)) setResults((current) => current.filter((item) => item.id !== media.id));
  }

  return <section className="wishlist-page page-stack"><div className="panel">
    <div className="panel-header"><div><span className="eyebrow">{t("wishlist.eyebrow")}</span><p>{t("wishlist.description")}</p></div>
      <button className={adding ? "ghost" : "primary"} type="button" onClick={() => setAdding((value) => !value)}>{adding ? <X size={18}/> : <Plus size={18}/>} {adding ? t("common.close") : t("wishlist.addTitle")}</button>
    </div>
    {adding && <section className="wishlist-add" aria-label={t("wishlist.addTitle")}>
      <div><h3>{t("wishlist.addTitle")}</h3><p>{t("wishlist.addHint")}</p></div>
      <div className="wishlist-types" aria-label={t("modal.catalogType")}>{TYPES.map((value) => <button key={value || "ALL"} type="button" className={type === value ? "active" : ""} onClick={() => setType(value)}>{value ? t(`common.${value.toLowerCase()}`) : t("common.all")}</button>)}</div>
      <form className="wishlist-search" onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("wishlist.searchPlaceholder")}/><button className="primary" disabled={searching}><Search size={18}/> {t("common.search")}</button></form>
      {results.length > 0 && <div className="wishlist-results">{results.map((media) => <button type="button" key={media.id} onClick={() => choose(media)} disabled={loading}>
        {media.coverImage ? <img src={media.coverImage} alt={`Portada de ${media.titleLocalized || media.title}`}/> : <span className="wishlist-result-placeholder"/>}<span><strong>{media.titleLocalized || media.title}</strong><small>{t(`common.${media.type.toLowerCase()}`)}</small></span><Plus size={18}/>
      </button>)}</div>}
      {!searching && results.length === 0 && query && <p className="wishlist-no-results">{t("wishlist.noResults")}</p>}
    </section>}
    <Notice message={status} onClose={clearStatus}/>
    <section className="wishlist-list">{wishlistItems.length === 0 ? <div className="empty"><Bookmark size={34}/><p>{t("wishlist.empty")}</p></div> : wishlistItems.map((item) => <WishlistCard key={item.id} item={item} onStart={startWishlistItem} onDelete={deleteWishlistItem} disabled={loading}/>)}</section>
  </div></section>;
}
