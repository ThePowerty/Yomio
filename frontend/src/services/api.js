const API_URL = import.meta.env.VITE_API_URL || "";
const REQUEST_TIMEOUT_MS = 15_000;

export async function apiRequest(path, options = {}, token = null) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La petición ha tardado demasiado. Inténtalo de nuevo.");
    }
    throw new Error("No se pudo conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.");
  } finally {
    window.clearTimeout(timeout);
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent("yomio:session-invalid"));
    }
    const requestId = response.headers.get("X-Request-Id") || data.requestId;
    const suffix = requestId ? ` (referencia ${requestId})` : "";
    throw new Error(`${data.message || "La petición ha fallado"}${suffix}`);
  }
  return data;
}
