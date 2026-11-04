import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const getInitial = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
};

/**
 * Reads the theme actually applied to <html>, so branding assets stay in sync
 * with ThemeToggle without sharing component state.
 */
export const useResolvedTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("light") ? "light" : "dark",
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.classList.contains("light") ? "light" : "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
};
