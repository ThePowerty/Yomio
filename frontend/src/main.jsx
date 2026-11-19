import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/dm-sans";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import "./lib/i18n";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
