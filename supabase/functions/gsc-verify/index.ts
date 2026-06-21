import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SITE = "https://abule-tech.lovable.app/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

interface StepResult {
  step: string;
  ok: boolean;
  status?: number;
  detail?: unknown;
}

const gatewayHeaders = () => ({
  Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY") ?? ""}`,
  "X-Connection-Api-Key": Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY") ?? "",
  "Content-Type": "application/json",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Admin guard
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userRes.user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const steps: StepResult[] = [];

    // 1) token
    const tokenRes = await fetch(`${GATEWAY}/siteVerification/v1/token`, {
      method: "POST",
      headers: gatewayHeaders(),
      body: JSON.stringify({ site: { identifier: SITE, type: "SITE" }, verificationMethod: "META" }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    steps.push({ step: "token", ok: tokenRes.ok, status: tokenRes.status, detail: tokenJson });

    // 2) verify
    const verifyRes = await fetch(`${GATEWAY}/siteVerification/v1/webResource?verificationMethod=META`, {
      method: "POST",
      headers: gatewayHeaders(),
      body: JSON.stringify({ site: { identifier: SITE, type: "SITE" } }),
    });
    const verifyJson = await verifyRes.json().catch(() => ({}));
    steps.push({ step: "verify", ok: verifyRes.ok, status: verifyRes.status, detail: verifyJson });

    // 3) add to Search Console (only if verified)
    let added: StepResult | null = null;
    if (verifyRes.ok) {
      const addRes = await fetch(`${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(SITE)}`, {
        method: "PUT",
        headers: gatewayHeaders(),
      });
      added = { step: "add-site", ok: addRes.ok, status: addRes.status, detail: addRes.ok ? "ok" : await addRes.text() };
      steps.push(added);
    }

    // 4) list sites for current status
    const listRes = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers: gatewayHeaders() });
    const listJson = await listRes.json().catch(() => ({}));
    steps.push({ step: "list-sites", ok: listRes.ok, status: listRes.status, detail: listJson });

    const verified = verifyRes.ok || (Array.isArray(listJson?.siteEntry) && listJson.siteEntry.some((s: { siteUrl: string }) => s.siteUrl === SITE));

    return new Response(JSON.stringify({ verified, site: SITE, steps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
