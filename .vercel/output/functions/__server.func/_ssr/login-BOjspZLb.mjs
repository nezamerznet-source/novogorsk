import { o as __toESM } from "../_runtime.mjs";
import { l as normalizePhone } from "./format-C77w8tdK.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Navigate, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-D7mW9qtT.mjs";
import { i as Button, o as useCurrentUserState } from "./router-Bdlp7Eqp.mjs";
import { n as Label, t as Input } from "./label-DPWZsFix.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BOjspZLb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto h-80 max-w-md animate-pulse rounded-xl bg-border/80" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/profile" });
	async function onEmail(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			if (mode === "up") {
				if (!normalizePhone(phone)) throw new Error("Укажите телефон: +7 999 123-45-67");
				const { error: err } = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || email.trim()
				});
				if (err) throw new Error(err.message ?? "Не удалось зарегистрироваться");
				try {
					sessionStorage.setItem("novogorsk-owner-phone", phone.trim());
				} catch {}
			} else {
				const { error: err } = await authClient.signIn.email({
					email: email.trim(),
					password
				});
				if (err) throw new Error(err.message ?? "Неверный email или пароль");
			}
			await authClient.getSession();
			await navigate({ to: "/profile" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка входа");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
					children: "Собственник"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-semibold",
					children: mode === "in" ? "Войти" : "Регистрация"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "После входа укажите корпус, квартиру и телефон — и сможете голосовать. Голос и контакт попадут в открытый реестр."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => void onEmail(e),
					className: "space-y-3 rounded-xl border border-border bg-surface p-5",
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "name",
								children: "Имя"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "name",
								value: name,
								onChange: (e) => setName(e.target.value),
								autoComplete: "name",
								placeholder: "Иван Петров"
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								type: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								autoComplete: "email",
								placeholder: "you@mail.ru"
							})]
						}),
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "Телефон"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								type: "tel",
								required: true,
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								autoComplete: "tel",
								inputMode: "tel",
								placeholder: "+7 999 123-45-67"
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Пароль"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: "password",
								required: true,
								minLength: 8,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								autoComplete: mode === "up" ? "new-password" : "current-password"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-against",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: busy ? "Подождите…" : mode === "in" ? "Войти" : "Создать аккаунт"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "w-full text-sm text-muted hover:text-foreground",
							onClick: () => {
								setMode(mode === "in" ? "up" : "in");
								setError(null);
							},
							children: mode === "in" ? "Нет аккаунта — зарегистрироваться" : "Уже есть аккаунт — войти"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-xs uppercase tracking-wide text-subtle",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
						"или",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => void signIn(p.providerId, { callbackURL: "/profile" }),
						children: ["Продолжить через ", p.label]
					}, p.providerId))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "hover:text-foreground",
					children: "На главную"
				})
			})
		]
	});
}
//#endregion
export { Login as component };
