import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, RefreshCw, FileText, Image as ImageIcon, Code2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { validateJsonLd, type JsonLdReport } from "@/lib/jsonLdValidation";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type CheckStatus = "pass" | "fail" | "warn" | "loading";

interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  file?: string;
}

const SITE = "https://abule-tech.lovable.app";

const fetchText = async (path: string): Promise<string | null> => {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
};

const SeoAudit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { data: posts = [] } = useBlogPosts();
  const [checks, setChecks] = useState<Check[]>([]);
  const [ldReports, setLdReports] = useState<JsonLdReport[]>([]);
  const [running, setRunning] = useState(false);
  const [gscRunning, setGscRunning] = useState(false);
  const [gscResult, setGscResult] = useState<{
    verified: boolean;
    site?: string;
    steps?: Array<{ step: string; ok: boolean; status?: number; detail?: unknown }>;
    error?: string;
    ranAt: string;
  } | null>(null);

  const retryGsc = async () => {
    setGscRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-verify", { body: {} });
      if (error) throw error;
      setGscResult({ ...data, ranAt: new Date().toLocaleTimeString() });
      toast({
        title: data?.verified ? "Search Console verified" : "Verification incomplete",
        description: data?.verified ? "Domain confirmed in Google Search Console." : "See details below for the failing step.",
        variant: data?.verified ? "default" : "destructive",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGscResult({ verified: false, error: msg, ranAt: new Date().toLocaleTimeString() });
      toast({ title: "Retry failed", description: msg, variant: "destructive" });
    } finally {
      setGscRunning(false);
    }
  };

  useEffect(() => {
    if (!adminLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, adminLoading, navigate]);

  const runAudit = async () => {
    setRunning(true);
    const next: Check[] = [];

    // 1. sitemap.xml
    const sitemap = await fetchText("/sitemap.xml");
    if (sitemap && sitemap.includes("<urlset")) {
      const urlCount = (sitemap.match(/<url>/g) || []).length;
      next.push({ id: "sitemap", label: "sitemap.xml", status: "pass", detail: `${urlCount} URLs registered.`, file: "/sitemap.xml" });
    } else {
      next.push({ id: "sitemap", label: "sitemap.xml", status: "fail", detail: "Missing or malformed sitemap.", file: "/sitemap.xml" });
    }

    // 2. robots.txt
    const robots = await fetchText("/robots.txt");
    if (robots && /Sitemap:/i.test(robots)) {
      next.push({ id: "robots", label: "robots.txt", status: "pass", detail: "References sitemap.", file: "/robots.txt" });
    } else if (robots) {
      next.push({ id: "robots", label: "robots.txt", status: "warn", detail: "Present but missing Sitemap directive.", file: "/robots.txt" });
    } else {
      next.push({ id: "robots", label: "robots.txt", status: "fail", detail: "Not found.", file: "/robots.txt" });
    }

    // 3. llms.txt
    const llms = await fetchText("/llms.txt");
    if (llms && llms.length > 100) {
      next.push({ id: "llms", label: "llms.txt", status: "pass", detail: `${llms.length} bytes — AI crawlers supported.`, file: "/llms.txt" });
    } else {
      next.push({ id: "llms", label: "llms.txt", status: "fail", detail: "Not found or too short.", file: "/llms.txt" });
    }

    // 4. Single H1 on current document
    const h1s = document.querySelectorAll("h1");
    if (h1s.length === 1) {
      next.push({ id: "h1", label: "Single H1 heading", status: "pass", detail: `Exactly one <h1> on this page.` });
    } else if (h1s.length === 0) {
      next.push({ id: "h1", label: "Single H1 heading", status: "fail", detail: "No <h1> on this page." });
    } else {
      next.push({ id: "h1", label: "Single H1 heading", status: "warn", detail: `${h1s.length} <h1> tags on this page.` });
    }

    // 5. Meta description present
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    if (desc.length >= 50 && desc.length <= 160) {
      next.push({ id: "meta-desc", label: "Meta description length", status: "pass", detail: `${desc.length} chars.` });
    } else if (desc) {
      next.push({ id: "meta-desc", label: "Meta description length", status: "warn", detail: `${desc.length} chars (recommended 50–160).` });
    } else {
      next.push({ id: "meta-desc", label: "Meta description length", status: "fail", detail: "No meta description on current page." });
    }

    // 6. Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
    if (canonical.startsWith("http")) {
      next.push({ id: "canonical", label: "Canonical URL", status: "pass", detail: canonical });
    } else {
      next.push({ id: "canonical", label: "Canonical URL", status: "fail", detail: "Missing canonical link." });
    }

    // 7. Blog post cover images (responsive social previews)
    const missing = posts.filter((p) => !p.cover_image).length;
    if (posts.length === 0) {
      next.push({ id: "covers", label: "Blog cover images", status: "warn", detail: "No blog posts to evaluate." });
    } else if (missing === 0) {
      next.push({ id: "covers", label: "Blog cover images", status: "pass", detail: `All ${posts.length} posts have cover images.` });
    } else {
      next.push({
        id: "covers",
        label: "Blog cover images",
        status: "warn",
        detail: `${missing} of ${posts.length} posts will fall back to dynamic OG.`,
      });
    }

    // 8. Structured data validation — scan all JSON-LD blocks in <head>
    const ldNodes = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const reports: JsonLdReport[] = [];
    for (const node of ldNodes) {
      try {
        const parsed = JSON.parse(node.textContent || "null");
        reports.push(validateJsonLd(parsed));
      } catch {
        reports.push({ type: "unknown", valid: false, issues: [{ severity: "error", path: "$", message: "Invalid JSON." }] });
      }
    }
    setLdReports(reports);
    const errors = reports.flatMap((r) => r.issues.filter((i) => i.severity === "error")).length;
    if (reports.length === 0) {
      next.push({ id: "jsonld", label: "Structured data (JSON-LD)", status: "fail", detail: "No JSON-LD found on this page." });
    } else if (errors === 0) {
      next.push({ id: "jsonld", label: "Structured data (JSON-LD)", status: "pass", detail: `${reports.length} schema(s) validated cleanly.` });
    } else {
      next.push({ id: "jsonld", label: "Structured data (JSON-LD)", status: "fail", detail: `${errors} schema error(s) — see report below.` });
    }

    setChecks(next);
    setRunning(false);
  };

  useEffect(() => {
    if (isAdmin && !adminLoading) runAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, adminLoading, posts.length]);

  if (adminLoading || !user || !isAdmin) {
    return <main className="pt-16"><div className="container py-20 text-center text-muted-foreground">Loading…</div></main>;
  }

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warned = checks.filter((c) => c.status === "warn").length;

  return (
    <main className="pt-16">
      <SEO title="SEO Audit | Admin · Abule Tech" description="In-app SEO audit and status." path="/admin/seo" />
      <div className="container max-w-4xl py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">SEO Audit</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {passed} passed · {warned} warnings · {failed} failed
            </p>
          </div>
          <button
            onClick={runAudit}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} /> Re-run audit
          </button>
        </div>

        <div className="grid gap-3 mb-10">
          {checks.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card">
              <div className="mt-0.5">
                {c.status === "pass" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {c.status === "fail" && <XCircle className="h-5 w-5 text-destructive" />}
                {c.status === "warn" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {c.status === "loading" && <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{c.label}</p>
                  {c.file && (
                    <a href={c.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <FileText className="h-3 w-3" />{c.file}<ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Code2 className="h-5 w-5" /> JSON-LD report</h2>
          {ldReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No JSON-LD blocks detected on this page.</p>
          ) : (
            <div className="space-y-3">
              {ldReports.map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium font-mono text-sm">{r.type}</p>
                    {r.valid ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-500">Valid</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Has errors</span>
                    )}
                  </div>
                  {r.issues.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No issues.</p>
                  ) : (
                    <ul className="space-y-1">
                      {r.issues.map((iss, j) => (
                        <li key={j} className="text-xs flex gap-2">
                          <span className={iss.severity === "error" ? "text-destructive" : "text-yellow-500"}>
                            {iss.severity === "error" ? "✗" : "!"}
                          </span>
                          <code className="text-muted-foreground">{iss.path}</code>
                          <span className="text-foreground/80">— {iss.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Generated assets</h2>
          <ul className="text-sm space-y-1.5">
            <li><a className="text-primary hover:underline" href="/sitemap.xml" target="_blank" rel="noreferrer">/sitemap.xml</a></li>
            <li><a className="text-primary hover:underline" href="/robots.txt" target="_blank" rel="noreferrer">/robots.txt</a></li>
            <li><a className="text-primary hover:underline" href="/llms.txt" target="_blank" rel="noreferrer">/llms.txt</a></li>
            <li>
              Dynamic OG endpoint:{" "}
              <a
                className="text-primary hover:underline font-mono text-xs"
                target="_blank"
                rel="noreferrer"
                href={`${SITE}/functions/v1/og-image?title=Sample+Post&category=Programming`}
              >
                /functions/v1/og-image?title=…
              </a>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Tip: open this audit from any route to evaluate that page's head & structured data.{" "}
            <Link to="/admin" className="text-primary hover:underline">← Back to admin</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default SeoAudit;
