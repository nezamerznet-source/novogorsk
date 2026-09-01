import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as cn, i as Button, o as useCurrentUserState } from "./router-Bdlp7Eqp.mjs";
import { c as getMe, i as createAssembly, t as Skeleton } from "./voting-kXUAsmI4.mjs";
import { n as Label, t as Input } from "./label-DPWZsFix.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-D65H2WTL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-28 w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-sm text-foreground", "placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-150", "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30", "disabled:opacity-50", className),
		...props
	});
}
function CreatePage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const me = useQuery({
		queryKey: ["me", user?.id],
		queryFn: () => getMe(),
		enabled: Boolean(user),
		retry: false
	});
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [closesAt, setClosesAt] = (0, import_react.useState)("");
	const [questions, setQuestions] = (0, import_react.useState)([{
		title: "",
		description: ""
	}]);
	const save = useMutation({
		mutationFn: () => createAssembly({ data: {
			title,
			description,
			closesAt: closesAt || null,
			questions: questions.filter((q) => q.title.trim().length >= 4)
		} }),
		onSuccess: async (res) => {
			toast.success("Голосование открыто");
			await navigate({
				to: "/a/$assemblyId",
				params: { assemblyId: String(res.id) }
			});
		},
		onError: (err) => toast.error(err.message || "Не удалось создать")
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-80 w-full rounded-xl" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (me.isSuccess && !me.data.owner) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Сначала квартира"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Вынести повестку может только собственник из реестра."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/profile",
				className: "inline-flex h-11 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground",
				children: "Зарегистрировать квартиру"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
				children: "Повестка"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl font-semibold",
				children: "Новое голосование"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: "Сформулируйте вопросы так, чтобы на них можно было ответить «за / против / воздержался». Подсчёт будет открытым."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-5",
			onSubmit: (e) => {
				e.preventDefault();
				save.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "title",
						children: "Тема"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "title",
						required: true,
						minLength: 4,
						value: title,
						onChange: (e) => setTitle(e.target.value),
						placeholder: "Повышение тарифа на содержание"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "desc",
						children: "Пояснение"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "desc",
						value: description,
						onChange: (e) => setDescription(e.target.value),
						placeholder: "Зачем голосуем и что проверяем"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "until",
						children: "До какой даты (необязательно)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "until",
						type: "date",
						value: closesAt,
						onChange: (e) => setClosesAt(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Вопросы"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => setQuestions((q) => q.length >= 12 ? q : [...q, {
								title: "",
								description: ""
							}]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Добавить"]
						})]
					}), questions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 rounded-xl border border-border bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-medium uppercase tracking-wide text-muted",
									children: ["Вопрос ", i + 1]
								}), questions.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-muted hover:text-against",
									onClick: () => setQuestions((list) => list.filter((_, j) => j !== i)),
									"aria-label": "Удалить вопрос",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								minLength: 4,
								value: q.title,
								onChange: (e) => setQuestions((list) => list.map((item, j) => j === i ? {
									...item,
									title: e.target.value
								} : item)),
								placeholder: "Согласны ли вы с повышением тарифа?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "min-h-20",
								value: q.description,
								onChange: (e) => setQuestions((list) => list.map((item, j) => j === i ? {
									...item,
									description: e.target.value
								} : item)),
								placeholder: "Краткий контекст"
							})
						]
					}, i))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: save.isPending,
					children: save.isPending ? "Открываем…" : "Открыть голосование"
				})
			]
		})]
	});
}
//#endregion
export { CreatePage as component };
