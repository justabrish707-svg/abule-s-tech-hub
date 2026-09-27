import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { startCspReporting } from "./lib/cspReports";

startCspReporting();

// Clickjacking fallback for hosts that ignore frame-ancestors in a <meta> CSP.
// The Lovable editor preview is exempt so the site can still be edited.
const isEditorPreview = /(^|\.)lovable(project)?\.(app|dev|com)$/.test(window.location.hostname) &&
  window.location.hostname.includes("preview");
if (window.top !== window.self && !isEditorPreview) {
  document.documentElement.hidden = true;
  window.top?.location.replace(window.location.href);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
