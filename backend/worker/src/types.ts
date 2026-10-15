export interface Env {
  GROQ_API_KEY: string; // secreto: wrangler secret put GROQ_API_KEY
  FIREBASE_PROJECT_ID: string;
  ALLOWED_ORIGINS: string;
  GROQ_MODEL: string;
  LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}
