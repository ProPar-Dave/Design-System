// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const PING_TOKEN = Deno.env.get("PING_TOKEN")!; // writer auth for POST
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL"); // optional

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
});

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Access-Control-Allow-Origin": "*",
};

function sha1(s: string) {
  const data = new TextEncoder().encode(s);
  const hash = new Uint8Array(crypto.subtle.digestSync("SHA-1", data));
  return Array.from(hash).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function summarize(payload: any) {
  const status = payload?.status ?? "unknown";
  const actor = payload?.actor ?? payload?.by ?? "make";
  const target = payload?.url ?? payload?.page ?? payload?.id ?? "(n/a)";
  const ver = payload?.version ?? payload?.v ?? "";
  const dur = payload?.durationMs ? `${Math.round(payload.durationMs / 1000)}s` : "";
  return `${status.toUpperCase()} ${ver} ${dur} — ${actor} → ${target}`.trim();
}

async function notifySlack(text: string, payload: any) {
  if (!SLACK_WEBHOOK_URL) return;
  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks: [
      { type: "section", text: { type: "mrkdwn", text } },
      { type: "context", elements: [{ type: "mrkdwn", text: `payload: \`${JSON.stringify(payload)}\`` }] },
    ] }),
  });
}

async function handleGET(url: URL) {
  const id = url.searchParams.get("id") ?? "latest";

  // health probe
  if (id === "health") {
    return new Response(JSON.stringify({ status: "ok", ts: new Date().toISOString() }), { headers: JSON_HEADERS });
  }

  // latest or list
  if (id === "latest") {
    const { data, error } = await supabase
      .from("ping_latest")
      .select("payload, digest, received_at")
      .eq("id", "latest")
      .maybeSingle();

    if (error || !data) {
      return new Response(
        JSON.stringify({ payload: null, digest: null, received_at: null, missing: true }),
        { headers: JSON_HEADERS },
      );
    }
    return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
  }

  // history (last 50)
  const { data } = await supabase
    .from("ping_events")
    .select("id, received_at, payload, digest")
    .order("id", { ascending: false })
    .limit(50);
  return new Response(JSON.stringify(data ?? []), { headers: JSON_HEADERS });
}

async function handlePOST(req: Request) {
  // accept x-ping-token, x-token, or Authorization: Bearer for compatibility
  const headerToken = req.headers.get("x-ping-token") || 
                     req.headers.get("x-token") || 
                     req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  
  if (!headerToken || headerToken !== PING_TOKEN) {
    return new Response(
      JSON.stringify({ code: 401, message: "Bad or missing x-ping-token" }), 
      { status: 401, headers: JSON_HEADERS }
    );
  }

  try {
    const payload = await req.json();
    const digest = sha1(JSON.stringify(payload));

    // upsert latest
    await supabase.from("ping_latest").upsert({ id: "latest", payload, digest });
    // append history
    await supabase.from("ping_events").insert({ payload, digest });

    await notifySlack(summarize(payload), payload);
    return new Response(JSON.stringify({ ok: true, digest }), { headers: JSON_HEADERS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 400, headers: JSON_HEADERS });
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...JSON_HEADERS,
        "Access-Control-Allow-Headers": "authorization, x-token, x-ping-token, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  if (req.method === "GET") return handleGET(url);
  if (req.method === "POST") return handlePOST(req);

  return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), { status: 405, headers: JSON_HEADERS });
});