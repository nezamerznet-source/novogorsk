import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as cn } from "./router-Bdlp7Eqp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-D8-CjdW4.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide", tone === "neutral" && "bg-card text-muted border border-border", tone === "open" && "bg-primary text-primary-foreground", tone === "closed" && "bg-card text-muted border border-border", tone === "for" && "bg-for text-primary-foreground", tone === "against" && "bg-against text-primary-foreground", tone === "abstain" && "bg-abstain text-primary-foreground", className),
		...props
	});
}
//#endregion
export { Badge as t };
