import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../services/api";
import { trackEvent } from "../services/analytics";
import { useAuth } from "./AuthContext";

export const emptyTrackForm = {
  catalogMediaId: null,
  latestReleasedUnit: null,
  catalogStatus: null,
  title: "",
  type: "ANIME",
  currentChapter: 0,
  totalChapters: "",
  readingStatus: "READING",
  score: "",
  finished: false,
  notes: "",
  favorite: false
};

const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const { t } = useTranslation();
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [form, setForm] = useState(emptyTrackForm);
  const [recommendationItems, setRecommendationItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadItems();
      loadWishlist();
      loadRecommendations();
    } else {
      setItems([]);
      setWishlistItems([]);
      setRecommendationItems([]);
    }
  }, [isAuthenticated, token]);

  const stats = useMemo(() => {
    const anime = items.filter((item) => item.type === "ANIME");
    const manga = items.filter((item) => item.type === "MANGA");
    const manhwa = items.filter((item) => item.type === "MANHWA");
    const movies = items.filter((item) => item.type === "MOVIE");
    const finished = items.filter((item) => item.finished);
    const inProgress = items.filter((item) => !item.finished);
    const scored = items.filter((item) => item.score !== null && item.score !== undefined);
    const averageScore = scored.length
      ? (scored.reduce((total, item) => total + item.score, 0) / scored.length).toFixed(1)
      : "-";

    return {
      anime: anime.length,
      manga: manga.length,
      manhwa: manhwa.length,
      movies: movies.length,
      finished: finished.length,
      inProgress: inProgress.length,
      averageScore
    };
  }, [items]);

  const recommendations = recommendationItems;

  async function loadRecommendations(filters = {}) {
    if (!token) return [];
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== "" && value !== null && value !== undefined && value !== false) params.set(key, String(value)); });
    try {
      const data = await apiRequest(`/api/recommendations?${params}`, {}, token);
      const mapped = data.map((item) => ({ ...item.media, recommendationExplanation: item.explanation, matchScore: item.matchScore }));
      setRecommendationItems(mapped); return mapped;
    } catch (error) { setStatus(error.message); return []; }
  }

  async function dismissRecommendation(mediaId) {
    try { await apiRequest(`/api/recommendations/${mediaId}/dismiss`, { method: "POST" }, token); setRecommendationItems((current) => current.filter((item) => item.id !== mediaId)); }
    catch (error) { setStatus(error.message); }
  }

  async function loadRecommendationPreferences() {
    try { return await apiRequest("/api/recommendations/preferences", {}, token); }
    catch (error) { setStatus(error.message); return { genres: [], formats: [] }; }
  }

  async function saveRecommendationPreferences(preferences) {
    try { const saved = await apiRequest("/api/recommendations/preferences", { method: "PUT", body: JSON.stringify(preferences) }, token); await loadRecommendations(); return saved; }
    catch (error) { setStatus(error.message); return null; }
  }

  async function loadItems() {
    if (!token) {
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const data = await apiRequest("/api/tracks", {}, token);
      setItems(data);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadWishlist() {
    if (!token) return [];
    try {
      const data = await apiRequest("/api/wishlist", {}, token);
      setWishlistItems(data);
      return data;
    } catch (error) {
      setStatus(error.message);
      return [];
    }
  }

  async function addToWishlist(mediaOrId, favorite = false) {
    const catalogMediaId = typeof mediaOrId === "object" ? mediaOrId.id : mediaOrId;
    setLoading(true);
    setStatus("");
    try {
      await apiRequest("/api/wishlist", { method: "POST", body: JSON.stringify({ catalogMediaId, favorite }) }, token);
      setStatus(t("status.wishlistCreated"));
      await loadWishlist();
      return true;
    } catch (error) {
      setStatus(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function startWishlistItem(id) {
    setLoading(true);
    setStatus("");
    try {
      await apiRequest(`/api/wishlist/${id}/start`, { method: "PATCH" }, token);
      setStatus(t("status.wishlistStarted"));
      await Promise.all([loadWishlist(), loadItems()]);
      return true;
    } catch (error) {
      setStatus(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteWishlistItem(id) {
    setLoading(true);
    setStatus("");
    try {
      await apiRequest(`/api/wishlist/${id}`, { method: "DELETE" }, token);
      setStatus(t("status.wishlistDeleted"));
      await loadWishlist();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalog(query = "", type = "") {
    if (!token) {
      return [];
    }

    if (!query && !type) {
      try {
        return await apiRequest("/api/catalog?limit=50&importMissing=false", {}, token);
      } catch (error) {
        setStatus(error.message);
        return [];
      }
    }

    const params = new URLSearchParams({
      limit: "50",
      importMissing: query ? "true" : "false"
    });
    if (query) {
      params.set("query", query);
    }
    if (type) {
      params.set("type", type);
    }

    try {
      const data = await apiRequest(`/api/catalog?${params.toString()}`, {}, token);
      return data;
    } catch (error) {
      setStatus(error.message);
      return [];
    }
  }

  async function loadCatalogPage(query = "", type = "", page = 0, size = 12) {
    if (!token) {
      return { items: [], page: 0, size, totalItems: 0, totalPages: 0 };
    }
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      importMissing: query && page === 0 ? "true" : "false"
    });
    if (query) params.set("query", query);
    if (type) params.set("type", type);
    try {
      return await apiRequest(`/api/catalog/page?${params.toString()}`, {}, token);
    } catch (error) {
      setStatus(error.message);
      return { items: [], page: 0, size, totalItems: 0, totalPages: 0 };
    }
  }

  async function refreshCatalog(type = "") {
    if (!token) {
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const params = type ? `?type=${encodeURIComponent(type)}` : "";
      await apiRequest(`/api/catalog/refresh${params}`, { method: "POST" }, token);
      await loadCatalog();
      setStatus(t("status.catalogUpdated"));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const payload = {
      ...form,
      currentChapter: Number(form.currentChapter),
      totalChapters: form.totalChapters === "" ? null : Number(form.totalChapters),
      finished: form.readingStatus === "COMPLETED",
      score: form.score !== "" ? Number(form.score) : null
    };

    try {
      await apiRequest(editingId ? `/api/tracks/${editingId}` : "/api/tracks", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      }, token);
      trackEvent(editingId ? "progress_updated" : "title_added");
      setForm(emptyTrackForm);
      setEditingId(null);
      setEditorOpen(false);
      setStatus(editingId ? t("status.updated") : t("status.created"));
      await loadItems();
      return true;
    } catch (error) {
      setStatus(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    setLoading(true);
    setStatus("");
    try {
      await apiRequest(`/api/tracks/${id}`, { method: "DELETE" }, token);
      setStatus(t("status.deleted"));
      await loadItems();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  function editItem(item) {
    setEditingId(item.id);
    setForm({
      catalogMediaId: item.catalogMediaId ?? null,
      latestReleasedUnit: item.latestReleasedUnit ?? null,
      catalogStatus: item.catalogStatus ?? null,
      title: item.title,
      type: item.type,
      currentChapter: item.currentChapter,
      totalChapters: item.totalChapters ?? "",
      readingStatus: item.readingStatus ?? (item.finished ? "COMPLETED" : "READING"),
      score: item.score ?? "",
      finished: item.finished,
      notes: item.notes ?? "",
      favorite: item.favorite ?? false
    });
    setEditorOpen(true);
  }

  function fillFormFromCatalog(media) {
    setEditingId(null);
    setForm({
      catalogMediaId: media.id,
      latestReleasedUnit: media.latestReleasedUnit ?? null,
      catalogStatus: media.status ?? null,
      title: media.titleLocalized || media.title,
      type: media.type,
      currentChapter: 0,
      totalChapters: media.type === "ANIME" || media.type === "MOVIE" ? media.episodes ?? "" : media.chapters ?? "",
      readingStatus: "READING",
      score: "",
      finished: false,
      notes: "",
      favorite: false
    });
    setEditorOpen(true);
  }

  function truncate(value, maxLength) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyTrackForm);
  }

  function openNewTracking() {
    resetForm();
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    resetForm();
  }

  function clearStatus() {
    setStatus("");
  }

  const value = useMemo(() => ({
    items,
    wishlistItems,
    stats,
    recommendations,
    form,
    setForm,
    editingId,
    editorOpen,
    setEditorOpen,
    status,
    clearStatus,
    loading,
    loadItems,
    loadWishlist,
    addToWishlist,
    startWishlistItem,
    deleteWishlistItem,
    loadCatalog,
    loadCatalogPage,
    refreshCatalog,
    loadRecommendations,
    dismissRecommendation,
    loadRecommendationPreferences,
    saveRecommendationPreferences,
    saveItem,
    deleteItem,
    editItem,
    fillFormFromCatalog,
    openNewTracking,
    closeEditor,
    resetForm
  }), [items, wishlistItems, stats, recommendations, form, editingId, editorOpen, status, loading, t]);

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used inside TrackerProvider");
  }
  return context;
}
