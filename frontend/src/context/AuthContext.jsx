import { createContext, useContext, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("daytracker_token");
    const user = localStorage.getItem("daytracker_user");
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

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

  function persistSession(data) {
    localStorage.setItem("daytracker_token", data.token);
    localStorage.setItem("daytracker_user", JSON.stringify(data.user));
    setSession(data);
  }

  function logout() {
    localStorage.removeItem("daytracker_token");
    localStorage.removeItem("daytracker_user");
    setSession(null);
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
    logout
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
