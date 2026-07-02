// Public submission endpoint with real server-side rate limiting for the
// Contact form and Newsletter signup. Uses the check_and_record_rate_limit
// SECURITY DEFINER Postgres function (service-role only) so abuse cannot
// be bypassed by tampering with client throttles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const sha = async (v: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

interface RateResult { ok: boolean; retry_after_seconds?: number; hits?: number }

const rateLimit = async (action: string, identifier: string, windowSeconds: number, maxHits: number): Promise<RateResult> => {
  const { data, error } = await supabase.rpc("check_and_record_rate_limit", {
    _action: action,
    _identifier: identifier,
    _window_seconds: windowSeconds,
    _max_hits: maxHits,
  });
  if (error) {
    console.error("rate limit rpc error", error);
    return { ok: true }; // fail-open so a broken RPC doesn't take down forms
  }
  return data as RateResult;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown")
    .split(",")[0].trim();
  const ipHash = await sha(ip);

  let body: { action?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const action = body.action;
  const payload = body.payload ?? {};

  if (action === "newsletter") {
    const email = String(payload.email ?? "").trim().toLowerCase();
    const website = String(payload.website ?? ""); // honeypot
    if (website) return json(200, { ok: true }); // silently drop bots

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return json(400, { error: "Invalid email" });
    }

    // 3 per IP per minute + 5 per email per hour
    const ipRl = await rateLimit("newsletter", ipHash, 60, 3);
    if (!ipRl.ok) return json(429, { error: "Too many requests. Please slow down.", retry_after: ipRl.retry_after_seconds });
    const emailRl = await rateLimit("newsletter:email", await sha(email), 3600, 5);
    if (!emailRl.ok) return json(429, { error: "This email has submitted too many times. Try again later.", retry_after: emailRl.retry_after_seconds });

    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error) {
      if (error.code === "23505") return json(409, { error: "You're already subscribed!" });
      console.error("newsletter insert error", error);
      return json(500, { error: "Could not subscribe" });
    }
    return json(200, { ok: true });
  }

  if (action === "contact") {
    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const message = String(payload.message ?? "").trim();
    const website = String(payload.website ?? ""); // honeypot
    if (website) return json(200, { ok: true });

    if (!name || name.length > 100) return json(400, { error: "Invalid name" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return json(400, { error: "Invalid email" });
    if (message.length < 10 || message.length > 5000) return json(400, { error: "Message must be 10-5000 characters" });

    const ipRl = await rateLimit("contact", ipHash, 300, 3);
    if (!ipRl.ok) return json(429, { error: "Too many messages. Please wait a few minutes.", retry_after: ipRl.retry_after_seconds });
    const emailRl = await rateLimit("contact:email", await sha(email), 3600, 5);
    if (!emailRl.ok) return json(429, { error: "This email has sent too many messages. Try again later.", retry_after: emailRl.retry_after_seconds });

    const { error } = await supabase.from("contact_messages").insert({ name, email, message });
    if (error) {
      console.error("contact insert error", error);
      return json(500, { error: "Could not send message" });
    }
    return json(200, { ok: true });
  }

  return json(400, { error: "Unknown action" });
});
