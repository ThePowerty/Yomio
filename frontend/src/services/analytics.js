const ALLOWED_EVENTS = new Set([
  "onboarding_started",
  "account_created",
  "onboarding_completed",
  "login_completed",
  "title_added",
  "progress_updated",
  "frontend_crash"
]);

const CONSENT_KEY = "yomio_analytics_consent";
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === "true";
let googleTagLoaded = false;

function prepareGoogleTag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
}

function loadGoogleTag() {
  if (!analyticsIsConfigured() || googleTagLoaded || document.querySelector("script[data-yomio-ga]")) return;
  prepareGoogleTag();
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.dataset.yomioGa = "true";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  googleTagLoaded = true;
}

export function analyticsIsConfigured() {
  return analyticsEnabled && Boolean(measurementId) && !/\/reset-password\/?$/i.test(window.location.pathname);
}

export function analyticsConsentStatus() {
  if (!analyticsIsConfigured()) return "unavailable";
  return localStorage.getItem(CONSENT_KEY) || "pending";
}

export function initializeAnalytics() {
  if (!analyticsIsConfigured()) return;
  prepareGoogleTag();
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  if (analyticsConsentStatus() === "granted") loadGoogleTag();
}

export function setAnalyticsConsent(granted) {
  if (!analyticsIsConfigured()) return;
  const value = granted ? "granted" : "denied";
  localStorage.setItem(CONSENT_KEY, value);
  prepareGoogleTag();
  window.gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  if (granted) {
    loadGoogleTag();
    trackPageView(window.location.pathname, document.title);
  }
}

export function trackPageView(path, title) {
  if (analyticsConsentStatus() !== "granted") return;
  loadGoogleTag();
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href
  });
}

export function trackEvent(name) {
  if (!ALLOWED_EVENTS.has(name)) return;
  const event = { event: name };
  window.dispatchEvent(new CustomEvent("yomio:analytics", { detail: event }));
  if (analyticsConsentStatus() === "granted") window.gtag?.("event", name);
}
