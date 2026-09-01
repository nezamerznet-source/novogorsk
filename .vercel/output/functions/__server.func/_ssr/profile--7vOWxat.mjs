import { o as __toESM } from "../_runtime.mjs";
import { l as normalizePhone, s as formatPhone } from "./format-C77w8tdK.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as cn, i as Button, o as useCurrentUserState } from "./router-Bdlp7Eqp.mjs";
import { c as getMe, d as upsertOwner, o as getBuildings, t as Skeleton } from "./voting-kXUAsmI4.mjs";
import { n as Label, t as Input } from "./label-DPWZsFix.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile--7vOWxat.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BuildingPicker({ buildings, value, onChange }) {
	const selected = buildings.find((b) => b.id === value) ?? null;
	const houseNo = selected?.houseNo ?? buildings[0]?.houseNo ?? 52;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Дом ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-foreground tabular-nums",
					children: houseNo
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: "Корпус"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					children: buildings.map((b) => {
						const isSelected = value === b.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onChange(b.id),
							className: cn("flex min-h-12 items-center justify-center rounded-md border text-base font-medium tabular-nums transition-[background-color,border-color,transform] duration-150", isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:border-strong"),
							children: b.corpusNo
						}, b.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: selected ? selected.name : "Выберите корпус"
			})
		]
	});
}
var PHONE_DRAFT_KEY = "novogorsk-owner-phone";
function Profile() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const buildings = useQuery({
		queryKey: ["buildings"],
		queryFn: () => getBuildings()
	});
	const me = useQuery({
		queryKey: ["me", user?.id],
		queryFn: () => getMe(),
		enabled: Boolean(user),
		retry: false
	});
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [buildingId, setBuildingId] = (0, import_react.useState)(null);
	const [apartment, setApartment] = (0, import_react.useState)("");
	const [area, setArea] = (0, import_react.useState)("");
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!me.data || hydrated) return;
		if (me.data.owner) {
			setFullName(me.data.owner.fullName);
			setBuildingId(me.data.owner.buildingId);
			setApartment(me.data.owner.apartment);
			setArea(String(me.data.owner.areaSqm));
			setPhone(me.data.owner.phone ? formatPhone(me.data.owner.phone) : "");
		} else {
			if (user?.displayName) setFullName(user.displayName);
			try {
				const draft = sessionStorage.getItem(PHONE_DRAFT_KEY);
				if (draft) setPhone(draft);
			} catch {}
		}
		setHydrated(true);
	}, [
		me.data,
		user,
		hydrated
	]);
	const save = useMutation({
		mutationFn: () => upsertOwner({ data: {
			fullName,
			phone,
			buildingId: buildingId ?? 0,
			apartment,
			areaSqm: Number(area.replace(",", "."))
		} }),
		onSuccess: async () => {
			try {
				sessionStorage.removeItem(PHONE_DRAFT_KEY);
			} catch {}
			await qc.invalidateQueries({ queryKey: ["me"] });
			await qc.invalidateQueries({ queryKey: ["home"] });
			await qc.invalidateQueries({ queryKey: ["roll"] });
			toast.success("Квартира записана в реестр");
		},
		onError: (err) => toast.error(err.message || "Не удалось сохранить")
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-80 w-full rounded-xl" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
					children: "Собственник"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-semibold",
					children: "Ваша квартира"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "В открытый реестр попадут дом 52, корпус, квартира, площадь, ФИО и телефон — чтобы соседи могли связаться. Email скрыт. Одна квартира — одна запись."
				})
			] }),
			me.data?.owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-md border border-border bg-card px-4 py-3 text-sm text-muted",
				children: [
					me.data.owner.buildingName,
					", кв.\xA0",
					me.data.owner.apartment,
					me.data.owner.phone ? ` · ${formatPhone(me.data.owner.phone)}` : null,
					me.data.owner.role === "council" ? " · совет дома" : null
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md border border-border bg-card px-4 py-3 text-sm text-muted",
				children: "Без квартиры голосовать нельзя — иначе нечего проверять в реестре."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4 rounded-xl border border-border bg-surface p-5",
				onSubmit: (e) => {
					e.preventDefault();
					if (!buildingId) {
						toast.error("Выберите корпус");
						return;
					}
					if (!normalizePhone(phone)) {
						toast.error("Укажите телефон: +7 999 123-45-67");
						return;
					}
					save.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "fullName",
							children: "Фамилия и имя"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "fullName",
							required: true,
							value: fullName,
							onChange: (e) => setFullName(e.target.value),
							placeholder: "Петрова Анна",
							autoComplete: "name"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "Телефон"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							required: true,
							type: "tel",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							placeholder: "+7 999 123-45-67",
							autoComplete: "tel",
							inputMode: "tel"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5",
						children: buildings.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingPicker, {
							buildings: buildings.data,
							value: buildingId,
							onChange: setBuildingId
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "apt",
								children: "Квартира"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "apt",
								required: true,
								value: apartment,
								onChange: (e) => setApartment(e.target.value),
								placeholder: "14",
								inputMode: "text"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "area",
								children: "Площадь, м²"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "area",
								required: true,
								value: area,
								onChange: (e) => setArea(e.target.value),
								placeholder: "64,3",
								inputMode: "decimal"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: save.isPending,
						children: save.isPending ? "Сохраняем…" : "Записать в реестр"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-primary hover:underline",
					children: "К повестке"
				})
			})
		]
	});
}
//#endregion
export { Profile as component };
