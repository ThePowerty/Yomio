import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "daytracker_token";
const USER_KEY = "daytracker_user";
const EXPIRY_WARNING_MS = 5 * 60 * 1000;

function tokenExpiresAt(token) {
  try {
    const rawPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = rawPayload.padEnd(Math.ceil(rawPayload.length / 4) * 4, "=");
    return JSON.parse(window.atob(payload)).exp * 1000;
  } catch {
    return 0;
  }
}

function storedSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  if (!token || !user || tokenExpiresAt(token) <= Date.now()) {
    if (token && user) sessionStorage.setItem("yomio_auth_notice", "expired");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(storedSession);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timers = useRef([]);

  function clearSession(reason) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession(null);
    setShowExpiryWarning(false);
    if (reason) sessionStorage.setItem("yomio_auth_notice", reason);
  }

  useEffect(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    if (!session?.token) return undefined;

    const remaining = tokenExpiresAt(session.token) - Date.now();
    if (remaining <= 0) {
      clearSession("expired");
      return undefined;
    }
    timers.current.push(window.setTimeout(() => setShowExpiryWarning(true), Math.max(0, remaining - EXPIRY_WARNING_MS)));
    timers.current.push(window.setTimeout(() => clearSession("expired"), remaining));
    return () => timers.current.forEach(window.clearTimeout);
  }, [session?.token]);

  useEffect(() => {
    const invalidate = () => clearSession("invalid");
    const syncLogout = (event) => {
      if (event.key === TOKEN_KEY && !event.newValue) clearSession("other-tab");
    };
    window.addEventListener("yomio:session-invalid", invalidate);
    window.addEventListener("storage", syncLogout);
    return () => {
      window.removeEventListener("yomio:session-invalid", invalidate);
      window.removeEventListener("storage", syncLogout);
    };
  }, []);

  async function login(payload) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    persistSession(data);
    return data;
  }

  async function register(payload) {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    persistSession(data);
    return data;
  }

  async function updateProfile(payload) {
    const data = await apiRequest("/api/account/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    }, session.token);
    persistSession(data);
    return data.user;
  }

  async function deleteAccount() {
    await apiRequest("/api/account", { method: "DELETE" }, session.token);
    clearSession("account-deleted");
  }

  function persistSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setSession(data);
    setShowExpiryWarning(false);
  }

  function logout() {
    clearSession();
  }

  async function refreshSession() {
    if (!session?.token || refreshing) return;
    setRefreshing(true);
    try {
      const data = await apiRequest("/api/auth/refresh", { method: "POST" }, session.token);
      persistSession(data);
    } finally {
      setRefreshing(false);
    }
  }

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session),
    isAdmin: session?.user?.role === "ADMIN",
    login,
    register,
    updateProfile,
    deleteAccount,
    logout,
    refreshSession
  }), [session, refreshing]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showExpiryWarning && session && (
        <div className="session-warning-backdrop" role="presentation">
          <section className="session-warning" role="alertdialog" aria-modal="true" aria-labelledby="session-warning-title">
            <span className="eyebrow">Sesión</span>
            <h2 id="session-warning-title">Tu sesión está a punto de caducar</h2>
            <p>Por seguridad, se cerrará en menos de cinco minutos. Puedes renovarla ahora o salir.</p>
            <div>
              <button type="button" className="ghost" onClick={logout}>Cerrar sesión</button>
              <button type="button" className="primary" onClick={refreshSession} disabled={refreshing}>
                {refreshing ? "Renovando…" : "Mantener sesión"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
