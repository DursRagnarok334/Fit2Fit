import type { Env } from "./types";

export type GroqResult =
  | { ok: true; content: string }
  | { ok: false; status: number; error: string; retry?: boolean };

export async function callGroq(env: Env, system: string, user: string, maxTokens: number): Promise<GroqResult> {
  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        temperature: 0.3,
        max_completion_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(50_000),
    });
  } catch {
    return { ok: false, status: 504, error: "El asistente tardó demasiado en responder. Intenta de nuevo." };
  }

  if (res.status === 429) {
    return { ok: false, status: 429, retry: true, error: "El asistente está al límite de uso. Intenta de nuevo en unos minutos." };
  }
  if (!res.ok) {
    console.error("Groq respondió", res.status, (await res.text()).slice(0, 300));
    return { ok: false, status: 502, error: "El asistente no está disponible por ahora." };
  }

  try {
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("vacío");
    return { ok: true, content };
  } catch {
    return { ok: false, status: 502, error: "El asistente devolvió una respuesta vacía. Intenta de nuevo." };
  }
}
