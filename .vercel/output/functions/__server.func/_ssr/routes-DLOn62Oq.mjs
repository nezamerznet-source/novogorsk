import { i as formatDate, n as countLabel, o as formatPct, r as formatArea } from "./format-C77w8tdK.mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Scale, c as Eye, i as Stamp, l as ArrowRight, t as UserRound } from "../_libs/lucide-react.mjs";
import { o as useCurrentUserState, r as HousesMark } from "./router-Bdlp7Eqp.mjs";
import { t as Badge } from "./badge-D8-CjdW4.mjs";
import { c as getMe, s as getHome, t as Skeleton } from "./voting-kXUAsmI4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLOn62Oq.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user } = useCurrentUserState();
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
	const data = home.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise-in",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
						children: [
							"ЖК «",
							data?.complexName ?? "Новогорск Курорт",
							"»"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 max-w-2xl font-display text-4xl font-semibold text-foreground sm:text-5xl",
						children: "Голосуйте сами. Считайте сами."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg",
						children: "Если УК считает бюллетени без вас — пересчитайте голоса двора здесь. Каждый голос виден: корпус, квартира, площадь, решение."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [user && !me.data?.owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/profile",
							className: "inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]",
							children: ["Зарегистрировать квартиру", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#assemblies",
							className: "inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]",
							children: ["К повестке", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/login",
							className: "inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]",
							children: ["Войти как собственник", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/roll",
							className: "inline-flex h-12 items-center rounded-sm border border-strong bg-surface px-5 text-sm font-medium text-foreground hover:bg-card",
							children: "Открытый реестр"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise-in rise-in-2 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }),
						label: "Квартир в реестре",
						value: data ? countLabel(data.registeredApartments, "квартира", "квартиры", "квартир") : "…",
						hint: data ? formatArea(data.registeredArea) : ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" }),
						label: "Открытых голосований",
						value: data ? String(data.assemblies.filter((a) => a.status === "open").length) : "…",
						hint: "Живой подсчёт на глазах"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HousesMark, { className: "h-4 w-10" }),
						label: "Корпуса",
						value: "1 · 2 · 3",
						hint: "Дом 52"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise-in rise-in-3 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }),
						n: "01",
						title: "Квартира",
						text: "Входите и указываете корпус, номер и площадь. Одна квартира — одна запись в реестре."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stamp, { className: "size-4" }),
						n: "02",
						title: "Голос",
						text: "За, против или воздержался. Пока собрание открыто, голос можно изменить."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }),
						n: "03",
						title: "Проверка",
						text: "Итог считается и по квартирам, и по метрам. Реестр виден всем — без «чёрного ящика» УК."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "assemblies",
				className: "rise-in rise-in-4 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold",
						children: "Повестка"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/create",
						className: "text-sm font-medium text-primary hover:underline",
						children: "Вынести вопрос"
					})]
				}), home.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-36 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" })]
				}) : home.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-against",
					children: "Не удалось загрузить повестку. Обновите страницу."
				}) : data?.assemblies.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: data.assemblies.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/a/$assemblyId",
						params: { assemblyId: String(a.id) },
						className: "block rounded-xl border border-border bg-surface p-5 shadow-soft transition-[border-color] duration-150 hover:border-strong",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: a.status === "open" ? "open" : "closed",
										children: a.status === "open" ? "Открыто" : "Закрыто"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-subtle",
										children: [
											a.questionCount,
											" вопр. · ",
											a.voterCount,
											" прогол.",
											data.registeredApartments ? ` · ${formatPct(a.voterCount, data.registeredApartments)} реестра` : ""
										]
									}),
									a.closesAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-subtle",
										children: ["до ", formatDate(a.closesAt)]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-xl font-semibold",
								children: a.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-2 text-sm leading-relaxed text-muted",
								children: a.description
							})
						]
					}) }, a.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-border bg-card px-5 py-8 text-sm text-muted",
					children: "Пока нет голосований. Создайте первое — и соседи смогут проверить подсчёт."
				})]
			})
		]
	});
}
function StatCard({ icon, label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-muted",
				children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium uppercase tracking-wide",
					children: label
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-2xl font-semibold tabular-nums",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: hint
			}) : null
		]
	});
}
function Step({ icon, n, title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-8 items-center justify-center rounded-sm border border-border bg-surface",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs text-subtle",
					children: n
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: text
			})
		]
	});
}
//#endregion
export { Home as component };
