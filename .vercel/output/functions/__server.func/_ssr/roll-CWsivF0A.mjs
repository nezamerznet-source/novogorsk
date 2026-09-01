import { o as __toESM } from "../_runtime.mjs";
import { a as formatInt, n as countLabel, r as formatArea, s as formatPhone } from "./format-C77w8tdK.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Button, o as useCurrentUserState } from "./router-Bdlp7Eqp.mjs";
import { t as Badge } from "./badge-D8-CjdW4.mjs";
import { c as getMe, l as getRoll, o as getBuildings, s as getHome, t as Skeleton, u as setComplexTotals } from "./voting-kXUAsmI4.mjs";
import { n as Label, t as Input } from "./label-DPWZsFix.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roll-CWsivF0A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RollPage() {
	const { user } = useCurrentUserState();
	const roll = useQuery({
		queryKey: ["roll"],
		queryFn: () => getRoll()
	});
	const buildings = useQuery({
		queryKey: ["buildings"],
		queryFn: () => getBuildings()
	});
	const home = useQuery({
		queryKey: ["home"],
		queryFn: () => getHome()
	});
	const me = useQuery({
		queryKey: ["me", user?.id],
		queryFn: () => getMe(),
		enabled: Boolean(user),
		retry: false
	});
	const rows = roll.data ?? [];
	const houses = buildings.data ?? [];
	const byCorpus = houses.map((b) => ({
		building: b,
		owners: rows.filter((r) => Number(r.buildingId) === Number(b.id))
	}));
	const area = rows.reduce((s, r) => s + r.areaSqm, 0);
	const loading = roll.isPending || buildings.isPending;
	const houseNo = houses[0]?.houseNo ?? 52;
	const totalApts = home.data?.totalApartments ?? null;
	const isCouncil = me.data?.owner?.role === "council";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
					children: "Проверка"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-semibold sm:text-4xl",
					children: "Реестр собственников"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base",
					children: "Сверьте список с соседями. Если видите чужую квартиру — это повод разобраться до того, как считать кворум. Телефон виден, чтобы можно было связаться. Email не публикуется."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm tabular-nums text-foreground",
					children: [
						"Дом ",
						houseNo,
						" · ",
						countLabel(rows.length, "квартира", "квартиры", "квартир"),
						totalApts ? ` из ${formatInt(totalApts)}` : "",
						" · ",
						formatArea(area)
					]
				})
			] }),
			isCouncil ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotalsForm, {
				totalApartments: home.data?.totalApartments ?? null,
				totalArea: home.data?.totalArea ?? null
			}) : null,
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" }) : roll.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-against",
				children: "Не удалось загрузить реестр."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: byCorpus.map(({ building, owners: house }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-lg font-semibold",
							children: ["Корпус ", building.corpusNo]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-subtle",
							children: countLabel(house.length, "запись", "записи", "записей")
						}),
						house.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 divide-y divide-border",
							children: house.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start justify-between gap-2 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-medium",
										children: ["кв.\xA0", row.apartment]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: row.fullName
									}),
									row.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `tel:${row.phone}`,
										className: "text-xs text-primary hover:underline",
										children: formatPhone(row.phone)
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-subtle",
										children: "телефон не указан"
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm tabular-nums",
										children: formatArea(row.areaSqm)
									}), row.role === "council" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "mt-1",
										children: "совет"
									}) : null]
								})]
							}, `${row.buildingId}-${row.apartment}`))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-subtle",
							children: "Пока пусто"
						})
					]
				}, building.id))
			}),
			!loading && !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/profile",
					className: "font-medium text-primary hover:underline",
					children: "Зарегистрировать квартиру"
				})
			}) : null
		]
	});
}
function TotalsForm({ totalApartments, totalArea }) {
	const qc = useQueryClient();
	const [apts, setApts] = (0, import_react.useState)("");
	const [area, setArea] = (0, import_react.useState)("");
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (hydrated) return;
		if (totalApartments != null) setApts(String(totalApartments));
		if (totalArea != null) setArea(String(totalArea));
		setHydrated(true);
	}, [
		totalApartments,
		totalArea,
		hydrated
	]);
	const save = useMutation({
		mutationFn: () => setComplexTotals({ data: {
			totalApartments: Number(apts),
			totalArea: area.trim() ? Number(area.replace(",", ".")) : null
		} }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["home"] });
			await qc.invalidateQueries({ queryKey: ["assembly"] });
			toast.success("Число квартир дома записано — явка считается и от всего дома");
		},
		onError: (err) => toast.error(err.message || "Не удалось сохранить")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-xl border border-border bg-card p-4",
		onSubmit: (e) => {
			e.preventDefault();
			const n = Number(apts);
			if (!Number.isInteger(n) || n < 1) {
				toast.error("Укажите, сколько квартир в трёх корпусах дома 52");
				return;
			}
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Сколько квартир в доме 52"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted",
				children: "Чтобы на голосовании видеть процент не только от реестра, но и от всех квартир трёх корпусов. Площадь — по желанию."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "totalApts",
							children: "Квартир всего"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "totalApts",
							inputMode: "numeric",
							required: true,
							value: apts,
							onChange: (e) => setApts(e.target.value),
							placeholder: "например 180"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "totalArea",
							children: "Площадь, м²"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "totalArea",
							inputMode: "decimal",
							value: area,
							onChange: (e) => setArea(e.target.value),
							placeholder: "необязательно"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "h-11",
						disabled: save.isPending,
						children: save.isPending ? "Сохраняем…" : "Записать"
					})
				]
			})
		]
	});
}
//#endregion
export { RollPage as component };
