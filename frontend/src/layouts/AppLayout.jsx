import { Bookmark, BookOpen, CalendarDays, ChevronDown, ClipboardList, Film, Home, Languages, Library, LogOut, Mail, Menu, MonitorPlay, Moon, PanelLeftClose, PanelLeftOpen, RefreshCw, Scale, Settings, Shield, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { TrackingEditorModal } from "../components/TrackingEditorModal/TrackingEditorModal";
import { AccountSettingsModal } from "../components/AccountSettingsModal/AccountSettingsModal";
import { LegalDocumentsModal } from "../components/LegalDocumentsModal/LegalDocumentsModal";
import { TrackerProvider, useTracker } from "../context/TrackerContext";
import { useAuth } from "../context/AuthContext";

const titlesByPath = {
  "/": "layout.titles.home",
  "/tracking": "layout.titles.tracking",
  "/calendar": "layout.titles.calendar",
  "/wishlist": "layout.titles.wishlist",
  "/catalog/anime": "layout.titles.animeCatalog",
  "/catalog/manga": "layout.titles.mangaCatalog",
  "/catalog/manhwa": "layout.titles.manhwaCatalog",
  "/catalog/movie": "layout.titles.movieCatalog",
  "/recommendations": "layout.titles.recommendations",
  "/admin": "layout.titles.admin",
  "/contact": "layout.titles.contact"
};

const THEME_STORAGE_KEY = "daytracker_theme";

function getInitialTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch {
    // The system preference remains a safe fallback when storage is unavailable.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppLayout({ children }) {
  return (
    <TrackerProvider>
      <AppShell>{children}</AppShell>
    </TrackerProvider>
  );
}

function AppShell({ children }) {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const { loadItems } = useTracker();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutStep, setLogoutStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [legalDocument, setLegalDocument] = useState(null);
  const profileMenuRef = useRef(null);
  const pages = [
    { to: "/", label: t("layout.nav.home"), icon: Home, end: true },
    { to: "/tracking", label: t("layout.nav.tracking"), icon: ClipboardList },
    { to: "/calendar", label: t("layout.nav.calendar"), icon: CalendarDays },
    { to: "/wishlist", label: t("layout.nav.wishlist"), icon: Bookmark },
    { to: "/catalog/anime", label: t("layout.nav.animeCatalog"), icon: MonitorPlay },
    { to: "/catalog/manga", label: t("layout.nav.mangaCatalog"), icon: Library },
    { to: "/catalog/manhwa", label: t("layout.nav.manhwaCatalog"), icon: BookOpen },
    { to: "/catalog/movie", label: t("layout.nav.movieCatalog"), icon: Film },
    { to: "/recommendations", label: t("layout.nav.recommendations"), icon: Sparkles },
    { to: "/contact", label: t("layout.nav.contact"), icon: Mail, className: "contact-link" }
  ];
  const detailType = location.pathname.split("/")[2];
  const contextualTitle = location.pathname.startsWith("/ratings/")
    ? "layout.titles.chapterRatings"
    : location.pathname.startsWith("/stories/")
      ? "layout.titles.storyWorkspace"
      : detailType ? `layout.titles.${detailType}Catalog` : null;
  const pageTitle = t(titlesByPath[location.pathname] || contextualTitle || "layout.titles.home");

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setLogoutStep(0);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.dataset.appTheme = theme;
    return () => {
      delete document.documentElement.dataset.appTheme;
    };
  }, [theme]);

  useEffect(() => {
    function closeMenus(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setLogoutStep(0);
      }
    }
    function closeProfile(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
        setLogoutStep(0);
      }
    }
    document.addEventListener("keydown", closeMenus);
    document.addEventListener("pointerdown", closeProfile);
    return () => {
      document.removeEventListener("keydown", closeMenus);
      document.removeEventListener("pointerdown", closeProfile);
    };
  }, []);

  function changeLanguage(language) {
    try {
      localStorage.setItem("daytracker_language", language);
    } catch {
      // The active session can still change language when storage is unavailable.
    }
    i18n.changeLanguage(language);
  }

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Theme still changes for the active session when storage is unavailable.
      }
      return nextTheme;
    });
  }

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 1040px)").matches) {
      setMobileMenuOpen((open) => !open);
      return;
    }
    setSidebarCollapsed((collapsed) => !collapsed);
  }

  return (
    <main className={`app-layout${sidebarCollapsed ? " sidebar-collapsed" : ""}${mobileMenuOpen ? " sidebar-mobile-open" : ""}`} data-theme={theme}>
      <button className="sidebar-backdrop" type="button" aria-label={t("layout.closeMenu")} onClick={() => setMobileMenuOpen(false)} />
      <aside className="sidebar" aria-label={t("layout.pages")}>
        <div className="sidebar-header">
          <div className="brand">
            <img className="brand-mark" src="/yomio-icono.png" alt={t("common.appName")} />
            <div className="brand-copy">
              <img className="brand-logo" src="/yomio-logo-fondo-oscuro.png" alt={t("common.appName")} />
              <span>{user.role}</span>
            </div>
          </div>
        </div>

        <nav className="page-nav" id="main-navigation" aria-label={t("layout.pages")}>
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <NavLink key={page.to} to={page.to} end={page.end} className={page.className}>
                <Icon size={18} />
                <span className="sidebar-label">{page.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <footer className="sidebar-legal" aria-label={t("layout.legal.information")}>
          <button type="button" onClick={() => setLegalDocument("privacy")} aria-haspopup="dialog" title={t("layout.legal.privacy")}><ShieldCheck size={14} aria-hidden="true" /><span>{t("layout.legal.privacyShort")}</span></button>
          <button type="button" onClick={() => setLegalDocument("legal")} aria-haspopup="dialog" title={t("layout.legal.notice")}><Scale size={14} aria-hidden="true" /><span>{t("layout.legal.noticeShort")}</span></button>
        </footer>

      </aside>

      <section className="app-content">
        <header className="topbar">
          <div className="topbar-heading">
            <button className="icon-button sidebar-toggle" type="button" onClick={toggleSidebar}
              title={sidebarCollapsed ? t("layout.expandMenu") : t("layout.collapseMenu")}
              aria-controls="main-navigation">
              <Menu className="mobile-menu-icon" size={20} />
              {sidebarCollapsed ? <PanelLeftOpen className="desktop-menu-icon" size={20} /> : <PanelLeftClose className="desktop-menu-icon" size={20} />}
            </button>
            <div>
              <span className="eyebrow">{t("layout.personalPanel")}</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button theme-toggle"
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? t("layout.useLightTheme") : t("layout.useDarkTheme")}
              aria-label={theme === "dark" ? t("layout.useLightTheme") : t("layout.useDarkTheme")}
              aria-pressed={theme === "dark"}
            >
              {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button className="icon-button" onClick={loadItems} title={t("common.reload")}>
              <RefreshCw size={18} />
            </button>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `admin-topbar-link${isActive ? " active" : ""}`} aria-label={t("layout.nav.administration")}>
                <Shield size={17} aria-hidden="true" />
                <span>{t("layout.nav.administration")}</span>
              </NavLink>
            )}
            <div className="profile-menu" ref={profileMenuRef}>
              <button className="profile-trigger" type="button" onClick={() => {
                setProfileOpen((open) => !open);
                setLogoutStep(0);
              }} aria-expanded={profileOpen} aria-haspopup="menu">
                <span className="profile-avatar" aria-hidden="true">{user.username?.charAt(0).toUpperCase() || <UserRound size={18} />}</span>
                <span className="profile-trigger-copy">
                  <strong>{user.username}</strong>
                  <small>{user.role}</small>
                </span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown" role="menu">
                  <section className="profile-summary">
                    <span className="profile-avatar large" aria-hidden="true">{user.username?.charAt(0).toUpperCase() || <UserRound size={20} />}</span>
                    <div>
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                      <small>{user.role}</small>
                    </div>
                  </section>

                  <section className="profile-settings" aria-label={t("layout.settings")}>
                    <button className="profile-settings-button" type="button" onClick={() => {
                      setProfileOpen(false);
                      setSettingsOpen(true);
                    }}><Settings size={16} /> {t("layout.settings")}</button>
                    <div className="profile-language-row">
                      <span><Languages size={16} /> {t("layout.language")}</span>
                      <div className="profile-language-actions">
                        <button type="button" className={i18n.language === "es" ? "active" : ""} onClick={() => changeLanguage("es")}>{t("layout.spanish")}</button>
                        <button type="button" className={i18n.language === "en" ? "active" : ""} onClick={() => changeLanguage("en")}>{t("layout.english")}</button>
                      </div>
                    </div>
                  </section>

                  {logoutStep === 0 && (
                    <button className="profile-logout" type="button" role="menuitem" onClick={() => setLogoutStep(1)}>
                      <LogOut size={17} /> {t("common.logout")}
                    </button>
                  )}
                  {logoutStep > 0 && (
                    <section className="logout-confirmation" aria-live="polite">
                      <strong>{logoutStep === 1 ? t("layout.logoutFirstTitle") : t("layout.logoutFinalTitle")}</strong>
                      <p>{logoutStep === 1 ? t("layout.logoutFirstMessage") : t("layout.logoutFinalMessage")}</p>
                      <div>
                        <button className="ghost" type="button" onClick={() => setLogoutStep(0)}>{t("common.cancel")}</button>
                        <button className="danger-action" type="button" onClick={() => logoutStep === 1 ? setLogoutStep(2) : logout()}>
                          {logoutStep === 1 ? t("layout.continueLogout") : t("layout.confirmLogout")}
                        </button>
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {children ?? <Outlet />}
        <TrackingEditorModal />
        <AccountSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </section>
      <LegalDocumentsModal document={legalDocument} onClose={() => setLegalDocument(null)} onSelectDocument={setLegalDocument} />
    </main>
  );
}
