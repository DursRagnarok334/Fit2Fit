import { auth } from "./firebase";

const BASE = (import.meta.env.VITE_AI_WORKER_URL as string | undefined)?.replace(/\/$/, "");

export const aiConfigured = Boolean(BASE);

export class AiError extends Error {}

/** Llama al Worker con el token de Firebase del usuario. La clave de Groq nunca llega al navegador. */
export async function callAi<T>(task: string, payload: unknown): Promise<T> {
  const user = auth?.currentUser;
  if (!BASE || !user) throw new AiError("El asistente no está configurado.");
  const token = await user.getIdToken();

  let res: Response;
  try {
    res = await fetch(`${BASE}/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ task, payload }),
    });
  } catch {
    throw new AiError("No se pudo contactar al asistente. Revisa tu conexión.");
  }

  const body = (await res.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!res.ok || !body?.data) throw new AiError(body?.error ?? "El asistente no respondió correctamente.");
  return body.data;
}
