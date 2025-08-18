// index.ts — ping (Supabase Edge Function)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- CORS / caching ---------------------------------------------------------
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type, x-ping-token, authorization",
  // You want the freshest signal for monitors:
  "cache-control": "no-store, max-age=0",
};

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS, ...extraHeaders },
  });

const ok = () => new Response("ok", { headers: CORS });

// ---- DB client (service role, bypasses RLS) ---------------------------------
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helpers ---------------------------------------------------------------------
const toInt = (v: unknown, fallback: number) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;

const buildDigest = (p: {
  id: string; ts: number; event?: string | null; message?: string | null;
}) => `${p.id}|${p.ts}|${p.event ?? ""}|${p.message ?? ""}`;

// -----------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") return ok();

  const url = new URL(req.url);

  if (req.method === "GET") {
    // Public GET. Returns the latest payload for ?id=<id> (defaults to "latest")
    const id = url.searchParams.get("id") ?? "latest";

    const { data, error } = await supabase
      .from("pings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return json({ code: 404, message: `No payload for id "${id}"` }, 404);
    }

    // Expose digest both in body and as an ETag header
    return json(
      { ok: true, ...data },
      200,
      { ETag: data.digest }
    );
  }

  if (req.method === "POST") {
    // Token-gated POST
    const expected = Deno.env.get("PING_TOKEN") ?? "";
    if (!expected) return json({ code: 500, message: "PING_TOKEN not configured" }, 500);

    const token = req.headers.get("x-ping-token") ?? "";
    if (token !== expected) return json({ code: 401, message: "Bad or missing x-ping-token" }, 401);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ code: 400, message: "Invalid JSON" }, 400);
    }

    const now = Date.now();
    const payload = {
      id: String(body.id ?? "latest"),
      ts: toInt(body.ts, now),
      event: typeof body.event === "string" ? body.event : null,
      message: typeof body.message === "string" ? body.message : null,
      url: typeof body.url === "string" ? body.url : null,
      version: typeof body.version === "string" ? body.version : null,
      meta: body.meta ?? null as Record<string, unknown> | null,
    };

    const digest = buildDigest(payload);

    const { data, error } = await supabase
      .from("pings")
      .upsert({ ...payload, digest }, { onConflict: "id" })
      .select("*")
      .single();

    if (error) return json({ code: 500, message: "DB error", detail: error.message }, 500);

    return json({ ok: true, saved: data }, 200, { ETag: data.digest });
  }

  return json({ code: 405, message: "Method not allowed" }, 405);
});
