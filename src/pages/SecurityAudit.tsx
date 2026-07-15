import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shield, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Download, FileText, Trash2, Loader2, GitCompare, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import {
  appendAudit,
  fetchAuditTrail,
  fetchStatusOverrides,
  upsertStatus,
  type AuditEntry,
  type FindingStatus,
} from "@/lib/securityAudit";
import {
  listSnapshots,
  saveSnapshot,
  diffSnapshots,
  type ScanSnapshot,
  type SnapshotFinding,
} from "@/lib/scanSnapshots";
import { readCspReports, clearCspReports, type CspReport } from "@/lib/cspReports";
import { toast } from "sonner";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type Status = FindingStatus;

interface Finding {
  id: string;
  source: "Lovable" | "Wiz" | "Aikido" | "Manual";
  severity: Severity;
  title: string;
  location?: string;
  status: Status;
  note: string;
}

const FINDINGS: Finding[] = [
  { id: "csv-injection", source: "Lovable", severity: "high", title: "CSV formula injection in subscriber export", location: "src/pages/Admin.tsx — handleExportCSV", status: "fixed", note: "Added csvSafe() that prefixes =/+/-/@ with a single quote and escapes quotes." },
  { id: "rls-user-roles", source: "Lovable", severity: "critical", title: "user_roles must be locked down via RLS + security-definer", location: "public.user_roles", status: "fixed", note: "RLS on, reads only via has_role() SECURITY DEFINER; no client write paths." },
  { id: "leaked-password", source: "Lovable", severity: "medium", title: "Leaked-password (HIBP) check enabled on email auth", location: "Auth settings", status: "fixed", note: "password_hibp_enabled = true." },
  { id: "csp-referrer", source: "Manual", severity: "medium", title: "Security headers: Referrer-Policy + CSP meta", location: "index.html", status: "fixed", note: "Added strict-origin-when-cross-origin and a Content-Security-Policy meta. HSTS / X-Frame-Options are applied at the Lovable edge." },
  { id: "form-honeypot", source: "Manual", severity: "low", title: "Honeypot + server-side rate limit on public forms", location: "Contact form, NewsletterSignup, supabase/functions/public-submit", status: "fixed", note: "Hidden 'website' field, and server-side rate limits (IP + email hash) enforced in the public-submit edge function." },
  { id: "wiz", source: "Wiz", severity: "info", title: "Workspace-level Wiz scan", location: "Lovable Security tab", status: "open", note: "Wiz runs at the workspace level. No findings reported in the latest run." },
  { id: "aikido", source: "Aikido", severity: "info", title: "Dependency / SAST scan", location: "npm audit + Aikido", status: "open", note: "No high/critical dependency findings in the latest scan." },
];

const sevWeight: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const sevStyles: Record<Severity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  info: "bg-muted text-muted-foreground border-border",
};

const csvSafe = (v: unknown): string => {
  const s = String(v ?? "");
  const guarded = /^[=+\-@`\t\r]/.test(s) ? `'${s}'` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
};

const downloadBlob = (filename: string, mime: string, content: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const SecurityAudit = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminCheck();

  const [lastReviewed, setLastReviewed] = useState<string | null>(() => localStorage.getItem("security-last-reviewed"));
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});
  const [trail, setTrail] = useState<AuditEntry[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [cspReports, setCspReports] = useState<CspReport[]>(() => readCspReports());
  const [dataLoading, setDataLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<ScanSnapshot[]>([]);
  const [baseSnapshotId, setBaseSnapshotId] = useState<string>("");
  const [headSnapshotId, setHeadSnapshotId] = useState<string>("");

  useEffect(() => {
    if (!user || !isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const [overrides, entries, snaps] = await Promise.all([
          fetchStatusOverrides(),
          fetchAuditTrail(),
          listSnapshots(),
        ]);
        if (cancelled) return;
        setStatusOverrides(overrides);
        setTrail(entries);
        setSnapshots(snaps);
        if (snaps.length >= 2) {
          setHeadSnapshotId(snaps[0].id);
          setBaseSnapshotId(snaps[1].id);
        } else if (snaps.length === 1) {
          setHeadSnapshotId(snaps[0].id);
        }
      } catch (err) {
        console.error("Failed to load security audit data", err);
        toast.error("Failed to load audit data");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, isAdmin]);

  const findings = useMemo<Finding[]>(
    () => FINDINGS.map((f) => ({ ...f, status: statusOverrides[f.id] ?? f.status })),
    [statusOverrides],
  );

  const summary = useMemo(() => ({
    fixed: findings.filter((f) => f.status === "fixed").length,
    open: findings.filter((f) => f.status === "open").length,
    accepted: findings.filter((f) => f.status === "accepted").length,
    total: findings.length,
  }), [findings]);

  const grouped = useMemo(() => {
    const sorted = [...findings].sort((a, b) => sevWeight[a.severity] - sevWeight[b.severity]);
    return sorted.reduce<Record<Severity, Finding[]>>((acc, f) => {
      (acc[f.severity] ||= []).push(f);
      return acc;
    }, {} as Record<Severity, Finding[]>);
  }, [findings]);

  if (loading || roleLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const refreshTrail = async () => {
    try { setTrail(await fetchAuditTrail()); } catch (err) { console.error(err); }
  };

  const markReviewed = async () => {
    setBusy("reviewed");
    try {
      await appendAudit({ findingId: "*", action: "reviewed", message: "Full audit reviewed", author: user.email ?? undefined, authorId: user.id });
      const now = new Date().toISOString();
      localStorage.setItem("security-last-reviewed", now);
      setLastReviewed(now);
      await refreshTrail();
    } catch (err) {
      console.error(err);
      toast.error("Could not save review event");
    } finally {
      setBusy(null);
    }
  };

  const changeStatus = async (f: Finding, next: Status) => {
    if (f.status === next) return;
    setBusy(f.id);
    try {
      await upsertStatus(f.id, next, user.id);
      await appendAudit({ findingId: f.id, action: "status", message: `${f.status} → ${next}`, author: user.email ?? undefined, authorId: user.id });
      setStatusOverrides((p) => ({ ...p, [f.id]: next }));
      await refreshTrail();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setBusy(null);
    }
  };

  const addNote = async (f: Finding) => {
    const note = (noteDrafts[f.id] ?? "").trim();
    if (!note) return;
    setBusy(f.id);
    try {
      await appendAudit({ findingId: f.id, action: "note", message: note, author: user.email ?? undefined, authorId: user.id });
      setNoteDrafts((p) => ({ ...p, [f.id]: "" }));
      await refreshTrail();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save note");
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = () => {
    const ts = new Date().toISOString();
    const header = ["exported_at", "id", "severity", "source", "status", "title", "location", "note"];
    const rows = findings.map((f) => [ts, f.id, f.severity, f.source, f.status, f.title, f.location ?? "", f.note]);
    const csv = [header, ...rows].map((r) => r.map(csvSafe).join(",")).join("\n");
    downloadBlob(`security-findings-${ts.replace(/[:.]/g, "-")}.csv`, "text/csv", csv);
    toast.success("CSV exported");
  };

  const exportTrailCsv = () => {
    const ts = new Date().toISOString();
    const header = ["exported_at", "entry_id", "finding_id", "ts", "action", "author", "message"];
    const rows = trail.map((e) => [ts, e.id, e.findingId, e.ts, e.action, e.author ?? "", e.message]);
    const csv = [header, ...rows].map((r) => r.map(csvSafe).join(",")).join("\n");
    downloadBlob(`security-audit-trail-${ts.replace(/[:.]/g, "-")}.csv`, "text/csv", csv);
    toast.success("Audit trail exported");
  };

  const exportCspFile = async (format: "csv" | "json") => {
    if (cspReports.length === 0) { toast.info("No CSP reports to export"); return; }
    setBusy(`csp-${format}`);
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      if (!token) { toast.error("Session expired — sign in again"); return; }
      const { data, error } = await supabase.functions.invoke("security-csp-export", {
        body: { format, reports: cspReports },
      });
      if (error) {
        console.error(error);
        toast.error(error.message ?? "Export rejected");
        return;
      }
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const mime = format === "csv" ? "text/csv" : "application/json";
      const body = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      downloadBlob(`csp-violations-${ts}.${format}`, mime, body);
      toast.success(`CSP report ${format.toUpperCase()} exported`);
      await refreshTrail();
    } catch (err) {
      console.error(err);
      toast.error("CSP export failed");
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = () => {
    const ts = new Date().toLocaleString();
    const trailFor = (id: string) => trail.filter((e) => e.findingId === id);
    const sections = (Object.keys(grouped) as Severity[])
      .map((sev) => `<h2>${sev.toUpperCase()} · ${grouped[sev].length}</h2>` + grouped[sev]
        .map((f) => `<div class="f"><div class="row"><span class="sev ${f.severity}">${f.severity}</span><span class="src">${f.source}</span><span class="st ${f.status}">${f.status}</span></div><h3>${f.title}</h3>${f.location ? `<code>${f.location}</code>` : ""}<p>${f.note}</p>${
            trailFor(f.id).length
              ? `<ul class="trail">${trailFor(f.id).map((e) => `<li><b>${e.action}</b> · ${new Date(e.ts).toLocaleString()}${e.author ? ` · ${e.author}` : ""} — ${e.message}</li>`).join("")}</ul>`
              : ""
          }</div>`).join("")).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Security report ${ts}</title><style>body{font:14px/1.5 -apple-system,system-ui,sans-serif;color:#111;padding:32px;max-width:900px;margin:auto}h1{margin:0 0 4px}h2{margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:4px}.meta{color:#666;margin-bottom:24px}.f{border:1px solid #e5e5e5;border-radius:8px;padding:12px 16px;margin:8px 0}.row{display:flex;gap:8px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}.sev,.st{padding:2px 8px;border-radius:4px;font-weight:700}.sev.critical{background:#fee;color:#a00}.sev.high{background:#fed7aa;color:#9a3412}.sev.medium{background:#fef3c7;color:#854d0e}.sev.low{background:#dbeafe;color:#1e40af}.sev.info{background:#eee;color:#444}.st.fixed{background:#d1fae5;color:#065f46}.st.open{background:#ffedd5;color:#9a3412}.st.accepted{background:#eee;color:#444}.src{color:#666}h3{margin:6px 0 4px;font-size:15px}code{font-size:12px;color:#555}.trail{font-size:12px;color:#444;margin:6px 0 0;padding-left:18px}@media print{body{padding:0}}</style></head><body><h1>Security findings report</h1><p class="meta">Exported ${ts} · ${summary.total} findings (${summary.fixed} fixed, ${summary.open} open, ${summary.accepted} accepted)</p>${sections}<script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Allow popups to export PDF"); return; }
    w.document.write(html);
    w.document.close();
  };

  const refreshCsp = () => {
    const next = readCspReports();
    setCspReports(next);
    toast.success(`Loaded ${next.length} CSP reports`);
  };

  const wipeCsp = () => {
    clearCspReports();
    setCspReports([]);
  };

  const saveCurrentSnapshot = async () => {
    setBusy("snapshot");
    try {
      const label = `Scan ${new Date().toLocaleString()}`;
      const payload: SnapshotFinding[] = findings.map((f) => ({
        id: f.id,
        severity: f.severity,
        source: f.source,
        title: f.title,
        location: f.location,
        status: f.status,
        note: f.note,
      }));
      const saved = await saveSnapshot({ label, findings: payload, createdBy: user.id });
      await appendAudit({
        findingId: "*",
        action: "snapshot",
        message: `Saved snapshot "${label}" · ${saved.totalCount} findings (${saved.fixedCount} fixed, ${saved.openCount} open)`,
        author: user.email ?? undefined,
        authorId: user.id,
      });
      const next = await listSnapshots();
      setSnapshots(next);
      setHeadSnapshotId(saved.id);
      if (!baseSnapshotId && next[1]) setBaseSnapshotId(next[1].id);
      await refreshTrail();
      toast.success("Snapshot saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save snapshot");
    } finally {
      setBusy(null);
    }
  };

  const compareSnapshots = useMemo(() => {
    if (!baseSnapshotId || !headSnapshotId || baseSnapshotId === headSnapshotId) return null;
    const base = snapshots.find((s) => s.id === baseSnapshotId);
    const head = snapshots.find((s) => s.id === headSnapshotId);
    if (!base || !head) return null;
    return { base, head, diff: diffSnapshots(base, head) };
  }, [snapshots, baseSnapshotId, headSnapshotId]);

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
              Aggregated findings from every scanner (Lovable, Wiz, Aikido) plus manual hardening notes. Notes and audit history are stored in Supabase and shared across admins.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-all">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={exportTrailCsv} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-all">
              <Download className="h-4 w-4" /> Trail CSV
            </button>
            <button onClick={exportPdf} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-all">
              <FileText className="h-4 w-4" /> PDF
            </button>
            <button onClick={saveCurrentSnapshot} disabled={busy === "snapshot"} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-all disabled:opacity-50">
              {busy === "snapshot" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save snapshot
            </button>
            <button onClick={markReviewed} disabled={busy === "reviewed"} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/40 transition-all disabled:opacity-50">
              {busy === "reviewed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Mark reviewed
            </button>
          </div>
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
          <p className="text-xs text-muted-foreground mb-6">Last reviewed: {new Date(lastReviewed).toLocaleString()}</p>
        )}

        <div className="rounded-2xl border border-border/50 bg-card/60 p-4 mb-8 text-sm">
          <p className="font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" /> Live rescan
          </p>
          <p className="text-muted-foreground">
            Lovable, Wiz, and Aikido scans run on the Lovable platform and cannot be triggered from inside the deployed app. Open the{" "}
            <a className="text-primary underline-offset-4 hover:underline" href="https://lovable.dev" target="_blank" rel="noreferrer">
              Lovable Security tab <ExternalLink className="h-3 w-3 inline" />
            </a>{" "}
            and update the entries below as findings change.
          </p>
        </div>

        <section className="rounded-2xl border border-border/50 bg-card/60 p-4 mb-8">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h2 className="font-semibold flex items-center gap-2"><GitCompare className="h-4 w-4" /> Compare scan snapshots</h2>
              <p className="text-xs text-muted-foreground">Persisted history of every saved scan · {snapshots.length} snapshot(s).</p>
            </div>
          </div>
          {snapshots.length < 2 ? (
            <p className="text-sm text-muted-foreground">Save at least two snapshots to compare them. Use <em>Save snapshot</em> above to capture the current findings.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="text-xs text-muted-foreground flex flex-col gap-1">
                  Base (older)
                  <select value={baseSnapshotId} onChange={(e) => setBaseSnapshotId(e.target.value)} className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm">
                    <option value="">Select…</option>
                    {snapshots.map((s) => (
                      <option key={s.id} value={s.id}>{new Date(s.createdAt).toLocaleString()} · {s.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-muted-foreground flex flex-col gap-1">
                  Head (newer)
                  <select value={headSnapshotId} onChange={(e) => setHeadSnapshotId(e.target.value)} className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm">
                    <option value="">Select…</option>
                    {snapshots.map((s) => (
                      <option key={s.id} value={s.id}>{new Date(s.createdAt).toLocaleString()} · {s.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              {compareSnapshots ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-center">
                    <div className="rounded-lg border border-border/50 bg-background p-2"><p className="text-[10px] uppercase text-muted-foreground">New</p><p className="text-lg font-bold text-orange-500">{compareSnapshots.diff.added.length}</p></div>
                    <div className="rounded-lg border border-border/50 bg-background p-2"><p className="text-[10px] uppercase text-muted-foreground">Fixed</p><p className="text-lg font-bold text-green-500">{compareSnapshots.diff.newlyFixed.length}</p></div>
                    <div className="rounded-lg border border-border/50 bg-background p-2"><p className="text-[10px] uppercase text-muted-foreground">Reopened</p><p className="text-lg font-bold text-destructive">{compareSnapshots.diff.reopened.length}</p></div>
                    <div className="rounded-lg border border-border/50 bg-background p-2"><p className="text-[10px] uppercase text-muted-foreground">Removed</p><p className="text-lg font-bold text-muted-foreground">{compareSnapshots.diff.removed.length}</p></div>
                  </div>
                  {[
                    { label: "New in head", items: compareSnapshots.diff.added, tone: "text-orange-500" },
                    { label: "Newly fixed", items: compareSnapshots.diff.newlyFixed, tone: "text-green-500" },
                    { label: "Reopened", items: compareSnapshots.diff.reopened, tone: "text-destructive" },
                    { label: "Removed from head", items: compareSnapshots.diff.removed, tone: "text-muted-foreground" },
                  ].filter((g) => g.items.length > 0).map((g) => (
                    <div key={g.label} className="mb-2">
                      <p className={`text-xs font-semibold ${g.tone}`}>{g.label}</p>
                      <ul className="text-xs text-muted-foreground pl-4 list-disc">
                        {g.items.map((f) => (<li key={f.id}><span className="font-mono">[{f.severity}]</span> {f.title}</li>))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Pick two different snapshots to see the diff.</p>
              )}
            </>
          )}
        </section>


        <section className="rounded-2xl border border-border/50 bg-card/60 p-4 mb-8">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h2 className="font-semibold">CSP violation reports</h2>
              <p className="text-xs text-muted-foreground">Captured in this browser from <code>securitypolicyviolation</code> events. Latest {cspReports.length} (max 50).</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={refreshCsp} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:border-primary/40">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
              <button onClick={() => exportCspFile("csv")} disabled={busy === "csp-csv"} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:border-primary/40 disabled:opacity-50">
                {busy === "csp-csv" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} CSV
              </button>
              <button onClick={() => exportCspFile("json")} disabled={busy === "csp-json"} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:border-primary/40 disabled:opacity-50">
                {busy === "csp-json" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} JSON
              </button>
              <button onClick={wipeCsp} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:border-destructive/40 hover:text-destructive">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          {cspReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No CSP violations recorded.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-auto">
              {cspReports.map((r, i) => {
                let route = "";
                try { route = new URL(r.documentURI).pathname; } catch { route = r.documentURI; }
                return (
                  <li key={i} className="text-xs rounded-lg border border-border/50 bg-background p-2 font-mono break-all">
                    <span className="text-muted-foreground">{new Date(r.ts).toLocaleString()} · </span>
                    <span className="text-primary">{route || "/"}</span> ·{" "}
                    <span className="text-orange-500">{r.effectiveDirective || r.violatedDirective}</span>{" "}
                    blocked <span className="text-foreground">{r.blockedURI || "(inline)"}</span>
                    {r.sourceFile && <span className="text-muted-foreground"> @ {r.sourceFile}:{r.lineNumber}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {dataLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading findings…
          </div>
        ) : (
        <div className="space-y-8">
          {(Object.keys(grouped) as Severity[]).map((sev) => (
            <section key={sev}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {sev} · {grouped[sev].length}
              </h2>
              <ul className="space-y-3">
                {grouped[sev].map((f) => {
                  const fTrail = trail.filter((e) => e.findingId === f.id);
                  const isBusy = busy === f.id;
                  return (
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
                          {f.location && <p className="text-xs text-muted-foreground font-mono mt-1 break-all">{f.location}</p>}
                          <p className="text-sm text-muted-foreground mt-2">{f.note}</p>
                        </div>
                        <select
                          value={f.status}
                          disabled={isBusy}
                          onChange={(e) => changeStatus(f, e.target.value as Status)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-background disabled:opacity-50 ${
                            f.status === "fixed" ? "text-green-500 border-green-500/30" : f.status === "accepted" ? "text-muted-foreground border-border" : "text-orange-500 border-orange-500/30"
                          }`}
                        >
                          <option value="open">open</option>
                          <option value="fixed">fixed</option>
                          <option value="accepted">accepted</option>
                        </select>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={noteDrafts[f.id] ?? ""}
                          onChange={(e) => setNoteDrafts((p) => ({ ...p, [f.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(f); } }}
                          placeholder="Add a review note…"
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button onClick={() => addNote(f)} disabled={isBusy} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5">
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Add
                        </button>
                      </div>

                      {fTrail.length > 0 && (
                        <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                          {fTrail.map((e) => (
                            <li key={e.id} className="text-xs text-muted-foreground flex gap-2">
                              <span className="inline-flex items-center gap-1 shrink-0">
                                {e.action === "status" ? <CheckCircle2 className="h-3 w-3 text-primary" /> : <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                <span className="font-medium text-foreground">{e.action}</span>
                              </span>
                              <span className="shrink-0">{new Date(e.ts).toLocaleString()}</span>
                              {e.author && <span className="shrink-0">· {e.author}</span>}
                              <span className="break-words">— {e.message}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        )}
      </div>
    </main>
  );
};

export default SecurityAudit;
