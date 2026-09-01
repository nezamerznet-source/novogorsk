import { c as isAssemblyOpen, d as toIso, f as toNum, l as normalizePhone, p as uniqueError } from "./format-C77w8tdK.mjs";
import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-KiUcI7VU.mjs";
import { t as authMiddleware } from "./middleware-CXgU8qMD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voting-lDU69j2q.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var emptyTally = () => ({
	apartments: 0,
	area: 0
});
var emptyResult = () => ({
	for: emptyTally(),
	against: emptyTally(),
	abstain: emptyTally()
});
function uniqueVoterArea(rows) {
	const seen = /* @__PURE__ */ new Set();
	let area = 0;
	for (const row of rows) {
		const key = `${row.building_id}-${row.apartment}`;
		if (seen.has(key)) continue;
		seen.add(key);
		area += toNum(row.area_sqm);
	}
	return area;
}
function effectiveStatus(status, closesAt) {
	return isAssemblyOpen(status, closesAt) ? "open" : "closed";
}
function mapBuilding(row) {
	return {
		id: toNum(row.id),
		name: row.name,
		address: row.address,
		houseNo: toNum(row.house_no),
		corpusNo: toNum(row.corpus_no)
	};
}
function mapOwner(row) {
	return {
		userId: row.user_id,
		fullName: row.full_name,
		buildingId: toNum(row.building_id),
		buildingName: row.building_name,
		apartment: row.apartment,
		areaSqm: toNum(row.area_sqm),
		phone: row.phone ?? "",
		role: row.role === "council" ? "council" : "owner"
	};
}
function isChoice(v) {
	return v === "for" || v === "against" || v === "abstain";
}
var apartmentRe = /^[0-9]{1,4}[А-Яа-яA-Za-z]?$/;
function normalizeApartment(raw) {
	return raw.trim().replace(/\s+/g, "").toUpperCase();
}
function normalizeName(raw) {
	return raw.trim().replace(/\s+/g, " ");
}
var getHome_createServerFn_handler = createServerRpc({
	id: "710306f18bcd1644fb23821abb826794b65876c15f81bd31dbfddb4c1b32b4e8",
	name: "getHome",
	filename: "src/lib/voting.ts"
}, (opts) => getHome.__executeServer(opts));
var getHome = createServerFn({ method: "POST" }).handler(getHome_createServerFn_handler, async () => {
	const sql = await getSql();
	const settings = await sql`
    select name, total_apartments, total_area from complex_settings where id = 1
  `;
	const buildings = await sql`
    select id, name, address, house_no, corpus_no from buildings
    order by house_no, corpus_no
  `;
	const assemblies = await sql`
    select
      a.id,
      a.title,
      a.description,
      a.status,
      a.closes_at,
      a.created_at,
      a.created_by,
      (select count(*)::int from questions q where q.assembly_id = a.id) as question_count,
      (select count(distinct b.user_id)::int
         from ballots b
         join questions q on q.id = b.question_id
        where q.assembly_id = a.id) as voter_count
    from assemblies a
    order by a.created_at desc
  `;
	const stats = await sql`
    select count(*)::int as n, coalesce(sum(area_sqm), 0) as area from owners
  `;
	return {
		complexName: settings[0]?.name ?? "Новогорск Курорт",
		buildings: buildings.map(mapBuilding),
		assemblies: assemblies.map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			status: effectiveStatus(row.status, toIso(row.closes_at)),
			closesAt: toIso(row.closes_at),
			createdAt: toIso(row.created_at) ?? "",
			createdBy: row.created_by,
			questionCount: toNum(row.question_count),
			voterCount: toNum(row.voter_count)
		})),
		registeredApartments: toNum(stats[0]?.n),
		registeredArea: toNum(stats[0]?.area),
		totalApartments: settings[0]?.total_apartments == null ? null : toNum(settings[0].total_apartments),
		totalArea: settings[0]?.total_area == null ? null : toNum(settings[0].total_area)
	};
});
var getAssembly_createServerFn_handler = createServerRpc({
	id: "ceb521416226d14a42d4536f368c6009c240c96ac1e3237767e177df88e69456",
	name: "getAssembly",
	filename: "src/lib/voting.ts"
}, (opts) => getAssembly.__executeServer(opts));
var getAssembly = createServerFn({ method: "POST" }).validator(object({ assemblyId: number() })).handler(getAssembly_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const assembly = (await sql`
      select id, title, description, status, closes_at, created_at, created_by
      from assemblies
      where id = ${data.assemblyId}
    `)[0];
	if (!assembly) return null;
	const questions = await sql`
      select id, ordinal, title, description
      from questions
      where assembly_id = ${data.assemblyId}
      order by ordinal
    `;
	const tallies = await sql`
      select
        b.question_id,
        b.choice,
        count(*)::int as apartments,
        coalesce(sum(b.area_sqm), 0) as area
      from ballots b
      join questions q on q.id = b.question_id
      where q.assembly_id = ${data.assemblyId}
      group by b.question_id, b.choice
    `;
	const ledger = await sql`
      select
        b.question_id,
        b.building_id,
        bd.name as building_name,
        b.apartment,
        b.area_sqm,
        b.choice,
        b.voted_at
      from ballots b
      join questions q on q.id = b.question_id
      join buildings bd on bd.id = b.building_id
      where q.assembly_id = ${data.assemblyId}
      order by bd.id, b.apartment
    `;
	const stats = await sql`
      select count(*)::int as n, coalesce(sum(area_sqm), 0) as area from owners
    `;
	const settings = await sql`
      select total_apartments, total_area from complex_settings where id = 1
    `;
	const resultByQ = /* @__PURE__ */ new Map();
	for (const q of questions) resultByQ.set(q.id, emptyResult());
	for (const row of tallies) {
		if (!isChoice(row.choice)) continue;
		const bucket = resultByQ.get(row.question_id);
		if (!bucket) continue;
		bucket[row.choice] = {
			apartments: toNum(row.apartments),
			area: toNum(row.area)
		};
	}
	const ledgerByQ = /* @__PURE__ */ new Map();
	for (const q of questions) ledgerByQ.set(q.id, []);
	for (const row of ledger) {
		if (!isChoice(row.choice)) continue;
		const list = ledgerByQ.get(row.question_id);
		if (!list) continue;
		list.push({
			questionId: row.question_id,
			buildingId: toNum(row.building_id),
			buildingName: row.building_name,
			apartment: row.apartment,
			areaSqm: toNum(row.area_sqm),
			choice: row.choice,
			votedAt: toIso(row.voted_at) ?? ""
		});
	}
	return {
		id: assembly.id,
		title: assembly.title,
		description: assembly.description,
		status: effectiveStatus(assembly.status, toIso(assembly.closes_at)),
		closesAt: toIso(assembly.closes_at),
		createdAt: toIso(assembly.created_at) ?? "",
		createdBy: assembly.created_by,
		questionCount: questions.length,
		voterCount: new Set(ledger.map((r) => `${r.building_id}-${r.apartment}`)).size,
		voterArea: uniqueVoterArea(ledger),
		registeredApartments: toNum(stats[0]?.n),
		registeredArea: toNum(stats[0]?.area),
		totalApartments: settings[0]?.total_apartments == null ? null : toNum(settings[0].total_apartments),
		totalArea: settings[0]?.total_area == null ? null : toNum(settings[0].total_area),
		questions: questions.map((q) => ({
			id: q.id,
			ordinal: q.ordinal,
			title: q.title,
			description: q.description,
			result: resultByQ.get(q.id) ?? emptyResult(),
			ledger: ledgerByQ.get(q.id) ?? []
		}))
	};
});
var getRoll_createServerFn_handler = createServerRpc({
	id: "e11edda3d3387dc274b160495855303fba40d9ad8e6628b012eafdc1a511e4fd",
	name: "getRoll",
	filename: "src/lib/voting.ts"
}, (opts) => getRoll.__executeServer(opts));
var getRoll = createServerFn({ method: "POST" }).handler(getRoll_createServerFn_handler, async () => {
	const sql = await getSql();
	try {
		const counts = await sql`select count(*)::int as n from owners`;
		const rows = await sql`
      select
        o.building_id,
        b.name as building_name,
        o.apartment,
        o.area_sqm,
        o.full_name,
        o.phone,
        o.role as owner_role
      from owners o
      left join buildings b on b.id = o.building_id::int
      order by b.house_no, b.corpus_no, o.apartment
    `;
		if (toNum(counts[0]?.n) > 0 && rows.length === 0) throw new Error("Реестр: записи есть, но выборка пуста");
		return rows.map((row) => ({
			buildingId: toNum(row.building_id),
			buildingName: row.building_name ?? "Дом",
			apartment: row.apartment,
			areaSqm: toNum(row.area_sqm),
			fullName: row.full_name,
			phone: row.phone,
			role: row.owner_role === "council" ? "council" : "owner"
		}));
	} catch (err) {
		throw new Error(`Реестр: ${err instanceof Error ? err.message : String(err)}`);
	}
});
var getBuildings_createServerFn_handler = createServerRpc({
	id: "ac836e4c56496eae1ff371574c3a7598086e6721fb4944097af957c894828680",
	name: "getBuildings",
	filename: "src/lib/voting.ts"
}, (opts) => getBuildings.__executeServer(opts));
var getBuildings = createServerFn({ method: "POST" }).handler(getBuildings_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, name, address, house_no, corpus_no from buildings
    order by house_no, corpus_no
  `).map(mapBuilding);
});
var getMe_createServerFn_handler = createServerRpc({
	id: "9dc48cf7a4d06bb0bd1d58da04a4eeb5b381b123cdb649a749ac5d89f4d093d2",
	name: "getMe",
	filename: "src/lib/voting.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(getMe_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const owners = await sql`
      select
        o.user_id,
        o.full_name,
        o.building_id,
        b.name as building_name,
        o.apartment,
        o.area_sqm,
        o.phone,
        o.role as role
      from owners o
      join buildings b on b.id = o.building_id::int
      where o.user_id = ${context.userId}
    `;
	const ballots = await sql`
      select question_id, choice from ballots where user_id = ${context.userId}
    `;
	return {
		owner: owners[0] ? mapOwner(owners[0]) : null,
		ballots: ballots.filter((b) => isChoice(b.choice)).map((b) => ({
			questionId: b.question_id,
			choice: b.choice
		}))
	};
});
var ownerInput = object({
	fullName: string().min(3).max(120),
	phone: string().min(10).max(20),
	buildingId: number().int().positive(),
	apartment: string().min(1).max(8),
	areaSqm: number().positive().max(999)
});
var upsertOwner_createServerFn_handler = createServerRpc({
	id: "6f9963a892f24ac0511fed34b3cc075f9e4a976ce2689c1ba2df6aab0ef99556",
	name: "upsertOwner",
	filename: "src/lib/voting.ts"
}, (opts) => upsertOwner.__executeServer(opts));
var upsertOwner = createServerFn({ method: "POST" }).validator(ownerInput).middleware([authMiddleware]).handler(upsertOwner_createServerFn_handler, async ({ context, data }) => {
	const fullName = normalizeName(data.fullName);
	const apartment = normalizeApartment(data.apartment);
	const phone = normalizePhone(data.phone);
	if (fullName.length < 3) throw new Error("Укажите фамилию и имя");
	if (!phone) throw new Error("Укажите телефон: +7 999 123-45-67");
	if (!apartmentRe.test(apartment)) throw new Error("Номер квартиры: цифры, при необходимости буква (например 14 или 14А)");
	if (data.areaSqm < 10 || data.areaSqm > 400) throw new Error("Площадь должна быть от 10 до 400 м²");
	const sql = await getSql();
	if (!(await sql`select id from buildings where id = ${data.buildingId}`)[0]) throw new Error("Нет такого корпуса");
	const councilCount = await sql`
      select count(*)::int as n from owners where role = 'council'
    `;
	const role = toNum(councilCount[0]?.n) === 0 ? "council" : "owner";
	try {
		await sql`
        insert into owners (user_id, full_name, phone, building_id, apartment, area_sqm, role)
        values (
          ${context.userId},
          ${fullName},
          ${phone},
          ${data.buildingId},
          ${apartment},
          ${data.areaSqm},
          ${role}
        )
        on conflict (user_id) do update
          set full_name = excluded.full_name,
              phone = excluded.phone,
              building_id = excluded.building_id,
              apartment = excluded.apartment,
              area_sqm = excluded.area_sqm
      `;
	} catch (err) {
		if (uniqueError(err)) throw new Error("Эта квартира уже зарегистрирована другим собственником");
		throw err;
	}
	const owners = await sql`
      select
        o.user_id,
        o.full_name,
        o.building_id,
        b.name as building_name,
        o.apartment,
        o.area_sqm,
        o.phone,
        o.role as role
      from owners o
      join buildings b on b.id = o.building_id::int
      where o.user_id = ${context.userId}
    `;
	if (!owners[0]) throw new Error("Не удалось сохранить профиль");
	return mapOwner(owners[0]);
});
var voteInput = object({
	questionId: number().int().positive(),
	choice: _enum([
		"for",
		"against",
		"abstain"
	])
});
var castVote_createServerFn_handler = createServerRpc({
	id: "449bfa3ce8a484d8cdf623799cc8d4f718b18a6b8ab7e5f8f3278fdddee080a7",
	name: "castVote",
	filename: "src/lib/voting.ts"
}, (opts) => castVote.__executeServer(opts));
var castVote = createServerFn({ method: "POST" }).validator(voteInput).middleware([authMiddleware]).handler(castVote_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const owner = (await sql`
      select building_id, apartment, area_sqm
      from owners
      where user_id = ${context.userId}
    `)[0];
	if (!owner) throw new Error("Сначала зарегистрируйте квартиру");
	const question = (await sql`
      select q.id, a.status, a.closes_at
      from questions q
      join assemblies a on a.id = q.assembly_id
      where q.id = ${data.questionId}
    `)[0];
	if (!question) throw new Error("Вопрос не найден");
	if (!isAssemblyOpen(question.status, toIso(question.closes_at))) throw new Error("Голосование уже закрыто");
	await sql`
      insert into ballots (
        question_id, user_id, choice, area_sqm, building_id, apartment
      )
      values (
        ${data.questionId},
        ${context.userId},
        ${data.choice},
        ${toNum(owner.area_sqm)},
        ${owner.building_id},
        ${owner.apartment}
      )
      on conflict (question_id, user_id) do update
        set choice = excluded.choice,
            area_sqm = excluded.area_sqm,
            building_id = excluded.building_id,
            apartment = excluded.apartment,
            voted_at = now()
    `;
	return { ok: true };
});
var createInput = object({
	title: string().min(4).max(200),
	description: string().max(4e3),
	closesAt: string().nullable(),
	questions: array(object({
		title: string().min(4).max(280),
		description: string().max(1e3)
	})).min(1).max(12)
});
var createAssembly_createServerFn_handler = createServerRpc({
	id: "174450c0d5d5006827b6da470c8fb7359cf616295e71b699c3ea12dfd9ad7c70",
	name: "createAssembly",
	filename: "src/lib/voting.ts"
}, (opts) => createAssembly.__executeServer(opts));
var createAssembly = createServerFn({ method: "POST" }).validator(createInput).middleware([authMiddleware]).handler(createAssembly_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`
      select user_id from owners where user_id = ${context.userId}
    `)[0]) throw new Error("Сначала зарегистрируйте квартиру");
	const title = data.title.trim();
	const description = data.description.trim();
	const questions = data.questions.map((q) => ({
		title: q.title.trim(),
		description: q.description.trim()
	})).filter((q) => q.title.length >= 4);
	if (!questions.length) throw new Error("Добавьте хотя бы один вопрос повестки");
	let closesAt = null;
	if (data.closesAt) {
		const d = /* @__PURE__ */ new Date(`${data.closesAt}T23:59:59`);
		if (Number.isNaN(d.getTime())) throw new Error("Некорректная дата окончания");
		if (d.getTime() < Date.now()) throw new Error("Дата окончания уже прошла");
		closesAt = d.toISOString();
	}
	const id = (await sql`
      insert into assemblies (title, description, created_by, status, closes_at)
      values (${title}, ${description}, ${context.userId}, 'open', ${closesAt})
      returning id
    `)[0]?.id;
	if (!id) throw new Error("Не удалось создать голосование");
	for (let i = 0; i < questions.length; i += 1) {
		const q = questions[i];
		await sql`
        insert into questions (assembly_id, ordinal, title, description)
        values (${id}, ${i + 1}, ${q.title}, ${q.description})
      `;
	}
	return { id };
});
var closeAssembly_createServerFn_handler = createServerRpc({
	id: "035382875a4437c85042694199a7f4f2ebbe438c6b76e41aba4a5c42411b7809",
	name: "closeAssembly",
	filename: "src/lib/voting.ts"
}, (opts) => closeAssembly.__executeServer(opts));
var closeAssembly = createServerFn({ method: "POST" }).validator(object({ assemblyId: number().int().positive() })).middleware([authMiddleware]).handler(closeAssembly_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const assembly = (await sql`
      select created_by, status from assemblies where id = ${data.assemblyId}
    `)[0];
	if (!assembly) throw new Error("Собрание не найдено");
	const isCouncil = (await sql`
      select role from owners where user_id = ${context.userId}
    `)[0]?.role === "council";
	const isCreator = assembly.created_by === context.userId;
	if (!isCouncil && !isCreator) throw new Error("Закрыть голосование может инициатор или совет дома");
	await sql`
      update assemblies
      set status = 'closed', closes_at = coalesce(closes_at, now())
      where id = ${data.assemblyId}
    `;
	return { ok: true };
});
var setComplexTotals_createServerFn_handler = createServerRpc({
	id: "0a1b9ad5a3ed0d16b67d9e0fe9e68b560139c5d5b9869deca081f454dcc0e9ab",
	name: "setComplexTotals",
	filename: "src/lib/voting.ts"
}, (opts) => setComplexTotals.__executeServer(opts));
var setComplexTotals = createServerFn({ method: "POST" }).validator(object({
	totalApartments: number().int().min(1).max(5e3),
	totalArea: number().positive().max(5e5).nullable()
})).middleware([authMiddleware]).handler(setComplexTotals_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if ((await sql`
      select role from owners where user_id = ${context.userId}
    `)[0]?.role !== "council") throw new Error("Число квартир в доме указывает совет");
	await sql`
      update complex_settings
      set
        total_apartments = ${data.totalApartments},
        total_area = ${data.totalArea}
      where id = 1
    `;
	return { ok: true };
});
//#endregion
export { castVote_createServerFn_handler, closeAssembly_createServerFn_handler, createAssembly_createServerFn_handler, getAssembly_createServerFn_handler, getBuildings_createServerFn_handler, getHome_createServerFn_handler, getMe_createServerFn_handler, getRoll_createServerFn_handler, setComplexTotals_createServerFn_handler, upsertOwner_createServerFn_handler };
