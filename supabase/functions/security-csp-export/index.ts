// Admin-only CSP report export. Client posts the CSP reports it holds
// locally; this function verifies the caller is an authenticated admin,
// filters the payload down to authorized fields, records an audit-trail
// row describing the export, and streams back a CSV or JSON file.

import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CspReportSchema = z.object({
  ts: z.string(),
  blockedURI: z.string().default(""),
  violatedDirective: z.string().default(""),
  effectiveDirective: z.string().default(""),
  sourceFile: z.string().default(""),
  lineNumber: z.number().int().nonnegative().default(0),
  documentURI: z.string().default(""),
  disposition: z.string().default(""),
});

const BodySchema = z.object({
  format: z.enum(["csv", "json"]),
  reports: z.array(CspReportSchema).max(500),
});

const csvSafe = (v: unknown): string => {
  const s = String(v ?? "");
  const guarded = /^[=+\-@`\t\r]/.test(s) ? `'${s}'` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
};

const toRoute = (uri: string): string => {
  try {
    return new URL(uri).pathname;
  } catch {
    return uri;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", { _role: "admin" });
  if (roleErr || isAdmin !== true) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { format, reports } = parsed.data;
  const exportedAt = new Date().toISOString();
  const routes = Array.from(new Set(reports.map((r) => toRoute(r.documentURI)))).sort();

  const audit = await supabase.from("security_audit_trail").insert({
    finding_id: "csp-export",
    action: "export",
    message: `CSP ${format.toUpperCase()} export · ${reports.length} report(s) · routes: ${routes.join(", ") || "n/a"}`,
    author: claims.claims.sub,
    author_email: (claims.claims as { email?: string }).email ?? null,
  });
  if (audit.error) {
    return new Response(JSON.stringify({ error: "Failed to record audit entry" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const filenameTs = exportedAt.replace(/[:.]/g, "-");

  if (format === "json") {
    const body = JSON.stringify(
      { exported_at: exportedAt, exported_by: claims.claims.sub, count: reports.length, reports },
      null,
      2,
    );
    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="csp-violations-${filenameTs}.json"`,
      },
    });
  }

  const header = [
    "exported_at",
    "ts",
    "route",
    "effective_directive",
    "violated_directive",
    "blocked_uri",
    "source_file",
    "line_number",
    "disposition",
  ];
  const rows = reports.map((r) => [
    exportedAt,
    r.ts,
    toRoute(r.documentURI),
    r.effectiveDirective,
    r.violatedDirective,
    r.blockedURI,
    r.sourceFile,
    r.lineNumber,
    r.disposition,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvSafe).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="csp-violations-${filenameTs}.csv"`,
    },
  });
});
