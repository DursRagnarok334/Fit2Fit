export type Json = Record<string, unknown>;

export const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
export const str = (v: unknown, max = 1500) => (typeof v === "string" ? v.slice(0, max) : undefined);
export const strList = (v: unknown, max = 12): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, max).map((s) => s.slice(0, 500)) : [];
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));
