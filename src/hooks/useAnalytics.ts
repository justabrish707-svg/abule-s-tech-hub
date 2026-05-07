import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Lightweight analytics: tracks page views and time-on-page.
 * Logs to console + dispatches a window event so any analytics
 * provider (Plausible, GA, PostHog) can be wired in later without
 * touching call sites.
 */
export const useAnalytics = () => {
  const location = useLocation();
  const enteredAt = useRef<number>(Date.now());

  useEffect(() => {
    const path = location.pathname + location.search;
    const payload = {
      type: "page_view",
      path,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
    };
    // Hook for external providers
    window.dispatchEvent(new CustomEvent("analytics:event", { detail: payload }));
    // eslint-disable-next-line no-console
    console.info("[analytics]", payload);

    enteredAt.current = Date.now();
    return () => {
      const duration = Date.now() - enteredAt.current;
      const exitPayload = {
        type: "page_exit",
        path,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      };
      window.dispatchEvent(
        new CustomEvent("analytics:event", { detail: exitPayload })
      );
      // eslint-disable-next-line no-console
      console.info("[analytics]", exitPayload);
    };
  }, [location.pathname, location.search]);
};

export const trackEvent = (name: string, data?: Record<string, unknown>) => {
  const payload = {
    type: "custom_event",
    name,
    data: data ?? {},
    timestamp: new Date().toISOString(),
  };
  window.dispatchEvent(new CustomEvent("analytics:event", { detail: payload }));
  // eslint-disable-next-line no-console
  console.info("[analytics]", payload);
};
