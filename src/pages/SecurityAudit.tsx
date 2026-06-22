import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shield, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import SEO from "@/components/SEO";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface Finding {
  id: string;
  source: "Lovable" | "Wiz" | "Aikido" | "Manual";
  severity: Severity;
  title: string;
  location?: string;
  status: "fixed" | "open" | "accepted";
  note: string;
}

// Aggregated, hand-curated record of every scan finding handled to date.
// Update entries as new scans run; the Lovable / Wiz / Aikido scanners run on
// the platform and cannot be triggered from the deployed app.
const FINDINGS: Finding[] = [
  {
    id: "csv-injection",
    source: "Lovable",
    severity: "high",
    title: "CSV formula injection in subscriber export",
    location: "src/pages/Admin.tsx — handleExportCSV",
    status: "fixed",
    note: "Added csvSafe() that prefixes =/+/-/@ with a single quote and escapes quotes.",
  },
  {
    id: "rls-user-roles",
    source: "Lovable",
    severity: "critical",
    title: "user_roles must be locked down via RLS + security-definer",
    location: "public.user_roles",
    status: "fixed",
    note: "RLS on, reads only via has_role() SECURITY DEFINER; no client write paths.",
  },
  {
    id: "leaked-password",
    source: "Lovable",
    severity: "medium",
    title: "Leaked-password (HIBP) check enabled on email auth",
    location: "Auth settings",
    status: "fixed",
    note: "password_hibp_enabled = true.",
  },
  {
    id: "csp-referrer",
    source: "Manual",
    severity: "medium",
    title: "Security headers: Referrer-Policy + CSP meta",
    location: "index.html",
    status: "fixed",
    note: "Added strict-origin-when-cross-origin and a Content-Security-Policy meta. HSTS / X-Frame-Options are applied at the Lovable edge.",
  },
  {
    id: "form-honeypot",
    source: "Manual",
    severity: "low",
    title: "Honeypot anti-bot on public forms",
    location: "Contact form, NewsletterSignup",
    status: "fixed",
    note: "Hidden 'website' field; submissions where it is non-empty are silently dropped.",
  },
  {
    id: "wiz",
    source: "Wiz",
    severity: "info",
    title: "Workspace-level Wiz scan",
    location: "Lovable Security tab",
    status: "open",
    note: "Wiz runs at the workspace level. No findings reported in the latest run.",
  },
  {
    id: "aikido",
    source: "Aikido",
    severity: "info",
    title: "Dependency / SAST scan",
    location: "npm audit + Aikido",
    status: "open",
    note: "No high/critical dependency findings in the latest scan.",
  },
];

const sevWeight: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const sevStyles: Record<Severity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  info: "bg-muted text-muted-foreground border-border",
};

const SecurityAudit = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminCheck();
  const [lastReviewed, setLastReviewed] = useState<string | null>(
    () => localStorage.getItem("security-last-reviewed"),
  );

  const summary = useMemo(() => {
    const fixed = FINDINGS.filter((f) => f.status === "fixed").length;
    const open = FINDINGS.filter((f) => f.status === "open").length;
    const accepted = FINDINGS.filter((f) => f.status === "accepted").length;
    return { fixed, open, accepted, total: FINDINGS.length };
  }, []);

  const grouped = useMemo(() => {
    const sorted = [...FINDINGS].sort((a, b) => sevWeight[a.severity] - sevWeight[b.severity]);
    return sorted.reduce<Record<Severity, Finding[]>>((acc, f) => {
      (acc[f.severity] ||= []).push(f);
      return acc;
    }, {} as Record<Severity, Finding[]>);
  }, []);

  if (loading || roleLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const markReviewed = () => {
    const now = new Date().toISOString();
    localStorage.setItem("security-last-reviewed", now);
    setLastReviewed(now);
  };

  return (
    <main className="pt-20 min-h-screen">
      <SEO title="Security audit — Admin" description="Aggregated security findings across all scanners." path="/admin/security" />
      <div className="container max-w-5xl py-10">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-sm font-medium text-primary mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4" /> Admin · Security
            </p>
            <h1 className="text-3xl font-bold">Security audit</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aggregated findings from every scanner (Lovable, Wiz, Aikido) plus manual hardening notes.
            </p>
          </div>
          <button
            onClick={markReviewed}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Mark reviewed
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: summary.total, tone: "" },
            { label: "Fixed", value: summary.fixed, tone: "text-green-500" },
            { label: "Open", value: summary.open, tone: "text-orange-500" },
            { label: "Accepted", value: summary.accepted, tone: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {lastReviewed && (
          <p className="text-xs text-muted-foreground mb-6">
            Last reviewed: {new Date(lastReviewed).toLocaleString()}
          </p>
        )}

        <div className="rounded-2xl border border-border/50 bg-card/60 p-4 mb-8 text-sm">
          <p className="font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" /> Live rescan
          </p>
          <p className="text-muted-foreground">
            Lovable, Wiz, and Aikido scans run on the Lovable platform and cannot be triggered from
            inside the deployed app. To rescan, open the{" "}
            <a className="text-primary underline-offset-4 hover:underline" href="https://lovable.dev" target="_blank" rel="noreferrer">
              Lovable Security tab <ExternalLink className="h-3 w-3 inline" />
            </a>{" "}
            and update the entries below as findings change.
          </p>
        </div>

        <div className="space-y-8">
          {(Object.keys(grouped) as Severity[]).map((sev) => (
            <section key={sev}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {sev} · {grouped[sev].length}
              </h2>
              <ul className="space-y-3">
                {grouped[sev].map((f) => (
                  <li key={f.id} className="rounded-xl border border-border/50 bg-card p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sevStyles[f.severity]}`}>
                            {f.severity}
                          </span>
                          <span className="text-xs text-muted-foreground">{f.source}</span>
                        </div>
                        <p className="font-medium">{f.title}</p>
                        {f.location && (
                          <p className="text-xs text-muted-foreground font-mono mt-1 break-all">{f.location}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{f.note}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          f.status === "fixed"
                            ? "bg-green-500/10 text-green-500 border-green-500/30"
                            : f.status === "accepted"
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-orange-500/10 text-orange-500 border-orange-500/30"
                        }`}
                      >
                        {f.status === "fixed" && <CheckCircle2 className="h-3 w-3" />}
                        {f.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SecurityAudit;
