// Captures browser-emitted CSP violations and stores the most recent ones in
// localStorage so they can be reviewed from /admin/security. We can't run a
// public report endpoint, so this is the next-best client-side capture.

export interface CspReport {
  ts: string;
  blockedURI: string;
  violatedDirective: string;
  effectiveDirective: string;
  sourceFile: string;
  lineNumber: number;
  documentURI: string;
  disposition: string;
}

const KEY = "csp-reports";
const MAX = 50;

export const readCspReports = (): CspReport[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CspReport[]) : [];
  } catch {
    return [];
  }
};

export const clearCspReports = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

const append = (r: CspReport): void => {
  try {
    const all = readCspReports();
    all.unshift(r);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX)));
  } catch {
    // ignore quota errors
  }
};

let started = false;

export const startCspReporting = (): void => {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("securitypolicyviolation", (e) => {
    append({
      ts: new Date().toISOString(),
      blockedURI: e.blockedURI || "",
      violatedDirective: e.violatedDirective || "",
      effectiveDirective: e.effectiveDirective || "",
      sourceFile: e.sourceFile || "",
      lineNumber: e.lineNumber || 0,
      documentURI: e.documentURI || "",
      disposition: e.disposition || "",
    });
  });
};
