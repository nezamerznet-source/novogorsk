export type Choice = "for" | "against" | "abstain";

export const CHOICE_LABEL: Record<Choice, string> = {
  for: "За",
  against: "Против",
  abstain: "Воздержался",
};

export function toNum(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function toIso(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  const s = String(value);
  return s.length ? s : null;
}

export function formatArea(n: number): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(n)}\u00a0м²`;
}

export function formatInt(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d === 1) return one;
  if (d >= 2 && d <= 4) return few;
  return many;
}

export function countLabel(n: number, one: string, few: string, many: string): string {
  return `${formatInt(n)}\u00a0${plural(n, one, few, many)}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return (part / whole) * 100;
}

export function formatPct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  const p = (part / whole) * 100;
  const digits = p > 0 && p < 10 ? 1 : 0;
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(p)}\u00a0%`;
}

export type AssemblyStatus = "draft" | "open" | "closed";

export function isAssemblyOpen(status: string, closesAt: string | null): boolean {
  if (status !== "open") return false;
  if (!closesAt) return true;
  const t = new Date(closesAt).getTime();
  if (Number.isNaN(t)) return true;
  return t > Date.now();
}

export function uniqueError(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  return /23505|unique|duplicate key/i.test(s);
}

export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  if (digits.length !== 11 || !digits.startsWith("7")) return null;
  return `+${digits}`;
}

export function formatPhone(stored: string): string {
  const d = stored.replace(/\D/g, "");
  if (d.length !== 11) return stored;
  return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}
