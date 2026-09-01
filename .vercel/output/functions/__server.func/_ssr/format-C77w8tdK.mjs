//#region node_modules/.nitro/vite/services/ssr/assets/format-C77w8tdK.js
var CHOICE_LABEL = {
	for: "За",
	against: "Против",
	abstain: "Воздержался"
};
function toNum(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}
function toIso(value) {
	if (value == null || value === "") return null;
	if (value instanceof Date) return value.toISOString();
	const s = String(value);
	return s.length ? s : null;
}
function formatArea(n) {
	return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(n)}\u00a0м²`;
}
function formatInt(n) {
	return new Intl.NumberFormat("ru-RU").format(n);
}
function plural(n, one, few, many) {
	const abs = Math.abs(n) % 100;
	const d = abs % 10;
	if (abs > 10 && abs < 20) return many;
	if (d === 1) return one;
	if (d >= 2 && d <= 4) return few;
	return many;
}
function countLabel(n, one, few, many) {
	return `${formatInt(n)}\u00a0${plural(n, one, few, many)}`;
}
function formatDate(value) {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(d);
}
function percent(part, whole) {
	if (whole <= 0) return 0;
	return part / whole * 100;
}
function formatPct(part, whole) {
	if (whole <= 0) return "—";
	const p = part / whole * 100;
	const digits = p > 0 && p < 10 ? 1 : 0;
	return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(p)}\u00a0%`;
}
function isAssemblyOpen(status, closesAt) {
	if (status !== "open") return false;
	if (!closesAt) return true;
	const t = new Date(closesAt).getTime();
	if (Number.isNaN(t)) return true;
	return t > Date.now();
}
function uniqueError(err) {
	const s = err instanceof Error ? err.message : String(err);
	return /23505|unique|duplicate key/i.test(s);
}
function normalizePhone(raw) {
	let digits = raw.replace(/\D/g, "");
	if (digits.startsWith("8") && digits.length === 11) digits = `7${digits.slice(1)}`;
	if (digits.length === 10) digits = `7${digits}`;
	if (digits.length !== 11 || !digits.startsWith("7")) return null;
	return `+${digits}`;
}
function formatPhone(stored) {
	const d = stored.replace(/\D/g, "");
	if (d.length !== 11) return stored;
	return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}
//#endregion
export { formatInt as a, isAssemblyOpen as c, toIso as d, toNum as f, formatDate as i, normalizePhone as l, countLabel as n, formatPct as o, uniqueError as p, formatArea as r, formatPhone as s, CHOICE_LABEL as t, percent as u };
