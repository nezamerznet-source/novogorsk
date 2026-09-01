import { o as __toESM } from "../_runtime.mjs";
import { a as formatInt, i as formatDate, o as formatPct, r as formatArea, t as CHOICE_LABEL, u as percent } from "./format-C77w8tdK.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Printer } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as cn, i as Button, n as Route$1, o as useCurrentUserState } from "./router-Bdlp7Eqp.mjs";
import { t as Badge } from "./badge-D8-CjdW4.mjs";
import { a as getAssembly, c as getMe, n as castVote, r as closeAssembly, t as Skeleton } from "./voting-kXUAsmI4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/a._assemblyId-BP_Ten1F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LedgerTable({ rows }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Реестр пуст. Как только кто-то проголосует, здесь появится строка: корпус, квартира, голос и площадь."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-md border border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border bg-card px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted sm:grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Квартира" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Площадь" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Голос" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "grid grid-cols-2 items-center gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-foreground",
						children: [
							row.buildingName,
							", кв.\xA0",
							row.apartment
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle sm:hidden",
						children: formatArea(row.areaSqm)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "hidden text-sm tabular-nums text-muted sm:block",
						children: formatArea(row.areaSqm)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: row.choice,
						children: CHOICE_LABEL[row.choice]
					})
				]
			}, `${row.questionId}-${row.buildingId}-${row.apartment}`))
		})]
	});
}
function TurnoutCard({ votedApartments, votedArea, registeredApartments, registeredArea, totalApartments, totalArea, open }) {
	const ofRegistry = percent(votedApartments, registeredApartments);
	const ofHouse = totalApartments && totalApartments > 0 ? percent(votedApartments, totalApartments) : null;
	const bar = ofHouse ?? ofRegistry;
	let hint;
	if (registeredApartments === 0) hint = "Сначала соседи регистрируют квартиры в реестре — без этого явку считать не с чего.";
	else if (votedApartments === 0) hint = "Ждём первые бюллетени. Закрывать рано.";
	else if (ofHouse != null && ofHouse >= 50) hint = open ? "Больше половины квартир дома уже здесь. Если новые голоса почти не идут — можно закрывать. Это всё равно не кворум по ЖК РФ." : "На момент закрытия проголосовало больше половины квартир дома.";
	else if (ofRegistry >= 50) hint = open ? "Больше половины квартир в реестре уже проголосовали. Если картина перестала меняться — совет может закрыть голосование." : "Закрыли, когда проголосовало больше половины реестра.";
	else if (ofRegistry >= 25) hint = open ? "Явка растёт. Имеет смысл ещё подождать соседей, прежде чем закрывать." : "Закрыли при явке меньше половины реестра — это видно в протоколе.";
	else hint = open ? "Пока мало голосов. Если закрыть сейчас, картина будет неполной." : "Явка на момент закрытия была низкой.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
						children: "Явка"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-3xl font-semibold tabular-nums",
						children: formatPct(votedApartments, registeredApartments)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "от квартир в реестре"
					})
				] }), ofHouse != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl font-semibold tabular-nums",
						children: formatPct(votedApartments, totalApartments ?? 0)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "от всех квартир дома 52"
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-3 overflow-hidden rounded-sm bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-primary transition-[width] duration-200",
					style: { width: `${Math.min(100, bar)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 space-y-1.5 text-sm tabular-nums",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-foreground",
						children: [
							formatInt(votedApartments),
							" из ",
							formatInt(registeredApartments),
							" квартир в реестре"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-muted",
						children: [
							formatArea(votedArea),
							" из ",
							formatArea(registeredArea),
							" в реестре",
							registeredArea > 0 ? ` · ${formatPct(votedArea, registeredArea)} по площади` : null
						]
					}),
					totalApartments ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-muted",
						children: [
							formatInt(votedApartments),
							" из ",
							formatInt(totalApartments),
							" квартир дома 52",
							totalArea ? ` · ${formatArea(votedArea)} из ${formatArea(totalArea)}` : null
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-subtle",
						children: [
							"Чтобы видеть процент от всего дома, совет указывает число квартир в",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/roll",
								className: "text-primary hover:underline",
								children: "реестре"
							}),
							"."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-muted",
				children: hint
			})
		]
	});
}
var ORDER = [
	"for",
	"against",
	"abstain"
];
function valueOf(tally, mode) {
	return mode === "area" ? tally.area : tally.apartments;
}
function ResultsMeter({ result, mode }) {
	const total = ORDER.reduce((sum, key) => sum + valueOf(result[key], mode), 0);
	const totalApts = ORDER.reduce((sum, key) => sum + result[key].apartments, 0);
	const totalArea = ORDER.reduce((sum, key) => sum + result[key].area, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-3 overflow-hidden rounded-sm bg-card",
				children: ORDER.map((key) => {
					const p = percent(valueOf(result[key], mode), total);
					if (p <= 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("h-full transition-[width] duration-200", key === "for" && "bg-for", key === "against" && "bg-against", key === "abstain" && "bg-abstain"),
						style: { width: `${p}%` }
					}, key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-3",
				children: ORDER.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", key === "for" && "bg-for", key === "against" && "bg-against", key === "abstain" && "bg-abstain") }), CHOICE_LABEL[key]]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-foreground",
						children: [formatInt(result[key].apartments), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: [" / ", formatArea(result[key].area)]
						})]
					})]
				}, key))
			}),
			totalApts === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Пока никто не проголосовал — будьте первым."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle tabular-nums",
				children: [
					"Итого: ",
					formatInt(totalApts),
					" кв. · ",
					formatArea(totalArea)
				]
			})
		]
	});
}
function WeightToggle({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex rounded-sm border border-border bg-card p-0.5",
		children: [["apartments", "По квартирам"], ["area", "По площади"]].map(([mode, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(mode),
			className: cn("h-9 rounded-xs px-3 text-sm transition-colors duration-150", value === mode ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"),
			children: label
		}, mode))
	});
}
var CHOICES = [
	"for",
	"against",
	"abstain"
];
function VoteQuestion({ question, mode, myChoice, canVote, pending, onVote }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: ["Вопрос ", question.ordinal]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-xl font-semibold text-foreground sm:text-2xl",
				children: question.title
			}),
			question.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: question.description
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-2 sm:grid-cols-3",
				children: CHOICES.map((choice) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: myChoice === choice ? choice : "outline",
						className: cn("h-12 w-full", !canVote && "opacity-70"),
						disabled: !canVote || pending,
						onClick: () => onVote(choice),
						children: CHOICE_LABEL[choice]
					}, choice);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsMeter, {
					result: question.result,
					mode
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer text-sm font-medium text-muted hover:text-foreground",
					children: [
						"Реестр голосов (",
						question.ledger.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerTable, { rows: question.ledger })
				})]
			})
		]
	});
}
function AssemblyPage() {
	const { assemblyId } = Route$1.useParams();
	const id = Number(assemblyId);
	const { user } = useCurrentUserState();
	const qc = useQueryClient();
	const [mode, setMode] = (0, import_react.useState)("area");
	const [pendingQ, setPendingQ] = (0, import_react.useState)(null);
	const assembly = useQuery({
		queryKey: ["assembly", id],
		queryFn: () => getAssembly({ data: { assemblyId: id } }),
		enabled: Number.isFinite(id)
	});
	const me = useQuery({
		queryKey: ["me", user?.id],
		queryFn: () => getMe(),
		enabled: Boolean(user),
		retry: false
	});
	const vote = useMutation({
		mutationFn: (input) => castVote({ data: input }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["assembly", id] });
			await qc.invalidateQueries({ queryKey: ["me"] });
			await qc.invalidateQueries({ queryKey: ["home"] });
			toast.success("Голос учтён. Пока собрание открыто, его можно изменить.");
		},
		onError: (err) => toast.error(err.message || "Не удалось проголосовать"),
		onSettled: () => setPendingQ(null)
	});
	const close = useMutation({
		mutationFn: () => closeAssembly({ data: { assemblyId: id } }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["assembly", id] });
			await qc.invalidateQueries({ queryKey: ["home"] });
			toast.success("Голосование закрыто");
		},
		onError: (err) => toast.error(err.message || "Не удалось закрыть")
	});
	if (!Number.isFinite(id)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Нет такого собрания."
	});
	if (assembly.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 w-full rounded-xl" })]
	});
	if (assembly.isError || !assembly.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Собрание не найдено"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "text-sm text-primary hover:underline",
			children: "На главную"
		})]
	});
	const a = assembly.data;
	const open = a.status === "open";
	const owner = me.data?.owner ?? null;
	const canVote = Boolean(user && owner && open);
	const myByQ = new Map((me.data?.ballots ?? []).map((b) => [b.questionId, b.choice]));
	const canClose = Boolean(open && owner && (owner.role === "council" || a.createdBy === user?.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: open ? "open" : "closed",
							children: open ? "Открыто" : "Закрыто"
						}), a.closesAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-subtle",
							children: ["до ", formatDate(a.closesAt)]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold sm:text-4xl",
						children: a.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted sm:text-base",
						children: a.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "no-print flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightToggle, {
								value: mode,
								onChange: setMode
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-11",
								onClick: () => window.print(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), "Печать протокола"]
							}),
							canClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-11",
								disabled: close.isPending,
								onClick: () => close.mutate(),
								children: "Закрыть голосование"
							}) : null
						]
					}),
					canClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "Закрывать стоит, когда явка перестала расти. После закрытия голоса не меняются."
					}) : null,
					!user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-md border border-border bg-card px-4 py-3 text-sm text-muted",
						children: [
							"Смотреть реестр можно без входа. Чтобы голосовать —",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "font-medium text-primary hover:underline",
								children: "войдите"
							}),
							" ",
							"и укажите квартиру."
						]
					}) : !owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-md border border-border bg-card px-4 py-3 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							className: "font-medium text-primary hover:underline",
							children: "Зарегистрируйте квартиру"
						}), ", чтобы ваш голос попал в реестр."]
					}) : !open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Голосование закрыто, реестр сохранён."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TurnoutCard, {
				votedApartments: a.voterCount,
				votedArea: a.voterArea,
				registeredApartments: a.registeredApartments,
				registeredArea: a.registeredArea,
				totalApartments: a.totalApartments,
				totalArea: a.totalArea,
				open
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "print-only space-y-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ЖК «Новогорск Курорт» — открытое собрание" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					a.title,
					". Статус: ",
					open ? "открыто" : "закрыто",
					".",
					" ",
					a.closesAt ? `До ${formatDate(a.closesAt)}.` : null,
					" Явка: ",
					a.voterCount,
					" из",
					" ",
					a.registeredApartments,
					" квартир в реестре",
					a.totalApartments ? `, ${a.voterCount} из ${a.totalApartments} в доме 52` : "",
					"."
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children: a.questions.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteQuestion, {
					question: q,
					mode,
					myChoice: myByQ.get(q.id) ?? null,
					canVote,
					pending: pendingQ === q.id,
					onVote: (choice) => {
						setPendingQ(q.id);
						vote.mutate({
							questionId: q.id,
							choice
						});
					}
				}, q.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: "Сводный реестр"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Все бюллетени по этой повестке. Пересчитайте сами: квартира + площадь + решение."
					}),
					a.questions.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-sm font-medium",
								children: [
									q.ordinal,
									". ",
									q.title
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerTable, { rows: q.ledger }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "print-only text-sm",
								children: q.ledger.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									row.buildingName,
									", кв. ",
									row.apartment,
									" — ",
									CHOICE_LABEL[row.choice]
								] }, `${row.buildingId}-${row.apartment}`))
							})
						]
					}, q.id))
				]
			})
		]
	});
}
//#endregion
export { AssemblyPage as component };
