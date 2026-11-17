import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../services/api";
import { useAuth } from "./AuthContext";

export const emptyTrackForm = {
  title: "",
  type: "ANIME",
  currentChapter: 0,
  totalChapters: "",
  readingStatus: "PLAN_TO_READ",
  score: "",
  finished: false,
  notes: ""
};

const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const { t } = useTranslation();
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyTrackForm);
  const [catalogItems, setCatalogItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadItems();
      loadCatalog();
    } else {
      setItems([]);
      setCatalogItems([]);
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

  const recommendations = useMemo(() => {
    const trackedTitles = new Set(items.map((item) => item.title.toLowerCase()));
    return catalogItems.filter((item) => !trackedTitles.has((item.titleLocalized || item.title).toLowerCase()));
  }, [catalogItems, items]);

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

  async function loadCatalog(query = "", type = "") {
    if (!token) {
      return [];
    }

    if (!query && !type) {
      try {
        const mediaTypes = ["ANIME", "MOVIE", "MANGA", "MANHWA"];
        const pages = await Promise.all(mediaTypes.map((mediaType) => apiRequest(
          `/api/catalog?limit=50&type=${mediaType}&importMissing=false`, {}, token
        )));
        const combined = pages.flat();
        setCatalogItems(combined);
        return combined;
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
      score: form.readingStatus === "COMPLETED" && form.score !== "" ? Number(form.score) : null
    };

    try {
      await apiRequest(editingId ? `/api/tracks/${editingId}` : "/api/tracks", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      }, token);
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
      title: item.title,
      type: item.type,
      currentChapter: item.currentChapter,
      totalChapters: item.totalChapters ?? "",
      readingStatus: item.readingStatus ?? (item.finished ? "COMPLETED" : "READING"),
      score: item.score ?? "",
      finished: item.finished,
      notes: item.notes ?? ""
    });
    setEditorOpen(true);
  }

  function fillFormFromCatalog(media) {
    setEditingId(null);
    setForm({
      title: media.titleLocalized || media.title,
      type: media.type,
      currentChapter: 0,
      totalChapters: media.type === "ANIME" || media.type === "MOVIE" ? media.episodes ?? "" : media.chapters ?? "",
      readingStatus: "PLAN_TO_READ",
      score: "",
      finished: false,
      notes: truncate(media.description ?? "", 1000)
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
    stats,
    recommendations,
    catalogItems,
    form,
    setForm,
    editingId,
    editorOpen,
    setEditorOpen,
    status,
    clearStatus,
    loading,
    loadItems,
    loadCatalog,
    loadCatalogPage,
    refreshCatalog,
    saveItem,
    deleteItem,
    editItem,
    fillFormFromCatalog,
    openNewTracking,
    closeEditor,
    resetForm
  }), [items, stats, recommendations, catalogItems, form, editingId, editorOpen, status, loading, t]);

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used inside TrackerProvider");
  }
  return context;
}
