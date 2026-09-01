import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as cn } from "./router-Bdlp7Eqp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/label-DPWZsFix.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-foreground", "placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-150", "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30", "disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-foreground", className),
		...props
	});
}
//#endregion
export { Label as n, Input as t };
