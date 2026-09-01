import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { a as cn } from "./router-Bdlp7Eqp.mjs";
import { t as authMiddleware } from "./middleware-CXgU8qMD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voting-kXUAsmI4.js
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-border/80", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getHome = createServerFn({ method: "POST" }).handler(createSsrRpc("710306f18bcd1644fb23821abb826794b65876c15f81bd31dbfddb4c1b32b4e8"));
var getAssembly = createServerFn({ method: "POST" }).validator(object({ assemblyId: number() })).handler(createSsrRpc("ceb521416226d14a42d4536f368c6009c240c96ac1e3237767e177df88e69456"));
var getRoll = createServerFn({ method: "POST" }).handler(createSsrRpc("e11edda3d3387dc274b160495855303fba40d9ad8e6628b012eafdc1a511e4fd"));
var getBuildings = createServerFn({ method: "POST" }).handler(createSsrRpc("ac836e4c56496eae1ff371574c3a7598086e6721fb4944097af957c894828680"));
var getMe = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9dc48cf7a4d06bb0bd1d58da04a4eeb5b381b123cdb649a749ac5d89f4d093d2"));
var ownerInput = object({
	fullName: string().min(3).max(120),
	phone: string().min(10).max(20),
	buildingId: number().int().positive(),
	apartment: string().min(1).max(8),
	areaSqm: number().positive().max(999)
});
var upsertOwner = createServerFn({ method: "POST" }).validator(ownerInput).middleware([authMiddleware]).handler(createSsrRpc("6f9963a892f24ac0511fed34b3cc075f9e4a976ce2689c1ba2df6aab0ef99556"));
var voteInput = object({
	questionId: number().int().positive(),
	choice: _enum([
		"for",
		"against",
		"abstain"
	])
});
var castVote = createServerFn({ method: "POST" }).validator(voteInput).middleware([authMiddleware]).handler(createSsrRpc("449bfa3ce8a484d8cdf623799cc8d4f718b18a6b8ab7e5f8f3278fdddee080a7"));
var createInput = object({
	title: string().min(4).max(200),
	description: string().max(4e3),
	closesAt: string().nullable(),
	questions: array(object({
		title: string().min(4).max(280),
		description: string().max(1e3)
	})).min(1).max(12)
});
var createAssembly = createServerFn({ method: "POST" }).validator(createInput).middleware([authMiddleware]).handler(createSsrRpc("174450c0d5d5006827b6da470c8fb7359cf616295e71b699c3ea12dfd9ad7c70"));
var closeAssembly = createServerFn({ method: "POST" }).validator(object({ assemblyId: number().int().positive() })).middleware([authMiddleware]).handler(createSsrRpc("035382875a4437c85042694199a7f4f2ebbe438c6b76e41aba4a5c42411b7809"));
var setComplexTotals = createServerFn({ method: "POST" }).validator(object({
	totalApartments: number().int().min(1).max(5e3),
	totalArea: number().positive().max(5e5).nullable()
})).middleware([authMiddleware]).handler(createSsrRpc("0a1b9ad5a3ed0d16b67d9e0fe9e68b560139c5d5b9869deca081f454dcc0e9ab"));
//#endregion
export { getAssembly as a, getMe as c, upsertOwner as d, createAssembly as i, getRoll as l, castVote as n, getBuildings as o, closeAssembly as r, getHome as s, Skeleton as t, setComplexTotals as u };
