import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Env } from "./types";
import { callGroq } from "./groq";
import { DIAGNOSIS_SYSTEM, buildDiagnosisInput, normalizeDiagnosis } from "./diagnosis";
import { PLAN_SYSTEM, buildPlanInput, normalizePlan } from "./plan";
import type { Json } from "./util";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

const MAX_BODY_CHARS = 40_000;

function allowedOrigin(req: Request, env: Env): string | null {
  const origin = req.headers.get("Origin");
  if (!origin) return null;
  const list = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  return list.includes(origin) ? origin : null;
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin), ...extra },
  });
}

async function verifyUser(req: Request, env: Env): Promise<string | null> {
  const header = req.headers.get("Authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), GOOGLE_JWKS, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
      algorithms: ["RS256"],
    });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

async function run(
  env: Env,
  origin: string | null,
  system: string,
  user: string,
  maxTokens: number,
  normalize: (raw: unknown) => unknown | null
): Promise<Response> {
  const result = await callGroq(env, system, user, maxTokens);
  if (!result.ok) {
    return json({ error: result.error }, result.status, origin, result.retry ? { "Retry-After": "60" } : {});
  }
  try {
    const data = normalize(JSON.parse(result.content));
    if (!data) throw new Error("estructura incompleta");
    return json({ data }, 200, origin);
  } catch {
    return json({ error: "El asistente devolvió una respuesta incompleta. Intenta de nuevo." }, 502, origin);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = allowedOrigin(req, env);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method === "GET" && url.pathname === "/health") return json({ ok: true }, 200, origin);

    if (req.method !== "POST" || url.pathname !== "/ai") return json({ error: "No encontrado" }, 404, origin);
    if (!origin) return json({ error: "Origen no permitido" }, 403, null);

    const uid = await verifyUser(req, env);
    if (!uid) return json({ error: "Sesión no válida. Vuelve a iniciar sesión." }, 401, origin);

    const { success } = await env.LIMITER.limit({ key: uid });
    if (!success) return json({ error: "Demasiadas solicitudes. Espera un minuto e intenta de nuevo." }, 429, origin, { "Retry-After": "60" });

    const text = await req.text();
    if (text.length > MAX_BODY_CHARS) return json({ error: "La solicitud es demasiado grande." }, 413, origin);

    let body: Json;
    try {
      body = JSON.parse(text) as Json;
    } catch {
      return json({ error: "Solicitud inválida." }, 400, origin);
    }

    if (body.task === "diagnosis") {
      return run(env, origin, DIAGNOSIS_SYSTEM, `Datos de la persona (JSON):\n${buildDiagnosisInput(body.payload)}`, 3000, normalizeDiagnosis);
    }

    if (body.task === "plan_training") {
      const input = buildPlanInput(body.payload);
      if (!input) return json({ error: "Responde al menos una pregunta antes de generar el plan." }, 400, origin);
      return run(env, origin, PLAN_SYSTEM, `Datos de la persona (JSON):\n${input.text}`, 7000, (raw) => normalizePlan(raw, input.conservative));
    }

    return json({ error: "Tarea no soportada." }, 400, origin);
  },
};
