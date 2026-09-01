import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { optionalUserMiddleware } from "@/lib/optional-user";
import {
  isAssemblyOpen,
  normalizePhone,
  toIso,
  toNum,
  uniqueError,
  type AssemblyStatus,
  type Choice,
} from "@/lib/format";

export type WeightMode = "apartments" | "area";

export type Building = {
  id: number;
  name: string;
  address: string;
  houseNo: number;
  corpusNo: number;
};

export type Owner = {
  id: number;
  userId: string;
  fullName: string;
  buildingId: number;
  buildingName: string;
  apartment: string;
  areaSqm: number;
  phone: string;
  role: "owner" | "council";
};

export type Tally = { apartments: number; area: number };

export type QuestionResult = {
  for: Tally;
  against: Tally;
  abstain: Tally;
};

export type LedgerRow = {
  questionId: number;
  buildingId: number;
  buildingName: string;
  apartment: string;
  areaSqm: number;
  choice: Choice;
  votedAt: string;
};

export type AssemblyListItem = {
  id: number;
  title: string;
  description: string;
  status: AssemblyStatus;
  closesAt: string | null;
  createdAt: string;
  createdBy: string;
  questionCount: number;
  voterCount: number;
};

export type QuestionDetail = {
  id: number;
  ordinal: number;
  title: string;
  description: string;
  result: QuestionResult;
  ledger: LedgerRow[];
};

export type AssemblyDetail = AssemblyListItem & {
  questions: QuestionDetail[];
  registeredApartments: number;
  registeredArea: number;
  voterArea: number;
  totalApartments: number | null;
  totalArea: number | null;
};

export type RollRow = {
  buildingId: number;
  buildingName: string;
  apartment: string;
  areaSqm: number;
  fullName: string;
  role: "owner" | "council";
};

export type RollPhone = {
  buildingId: number;
  apartment: string;
  phone: string;
};

export type HomeData = {
  complexName: string;
  buildings: Building[];
  assemblies: AssemblyListItem[];
  registeredApartments: number;
  registeredArea: number;
  totalApartments: number | null;
  totalArea: number | null;
};

export type MeData = {
  owner: Owner | null;
  owners: Owner[];
  ballots: { questionId: number; choice: Choice }[];
};

const emptyTally = (): Tally => ({ apartments: 0, area: 0 });
const emptyResult = (): QuestionResult => ({
  for: emptyTally(),
  against: emptyTally(),
  abstain: emptyTally(),
});

function uniqueVoterArea(
  rows: { building_id: unknown; apartment: string; area_sqm: unknown }[],
): number {
  const seen = new Set<string>();
  let area = 0;
  for (const row of rows) {
    const key = `${row.building_id}-${row.apartment}`;
    if (seen.has(key)) continue;
    seen.add(key);
    area += toNum(row.area_sqm);
  }
  return area;
}

function effectiveStatus(status: string, closesAt: string | null): AssemblyStatus {
  if (status === "draft") return "draft";
  return isAssemblyOpen(status, closesAt) ? "open" : "closed";
}

function mapBuilding(row: {
  id: number;
  name: string;
  address: string;
  house_no: unknown;
  corpus_no: unknown;
}): Building {
  return {
    id: toNum(row.id),
    name: row.name,
    address: row.address,
    houseNo: toNum(row.house_no),
    corpusNo: toNum(row.corpus_no),
  };
}

function mapOwner(row: {
  id: unknown;
  user_id: string;
  full_name: string;
  building_id: number;
  building_name: string;
  apartment: string;
  area_sqm: unknown;
  phone: string | null;
  role: string;
}): Owner {
  return {
    id: toNum(row.id),
    userId: row.user_id,
    fullName: row.full_name,
    buildingId: toNum(row.building_id),
    buildingName: row.building_name,
    apartment: row.apartment,
    areaSqm: toNum(row.area_sqm),
    phone: row.phone ?? "",
    role: row.role === "council" ? "council" : "owner",
  };
}

function isChoice(v: string): v is Choice {
  return v === "for" || v === "against" || v === "abstain";
}

const apartmentRe = /^[0-9]{1,4}[А-Яа-яA-Za-z]?$/;

function normalizeApartment(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export const getHome = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await getSql();
  const settings = await sql<{
    name: string;
    total_apartments: unknown;
    total_area: unknown;
  }>`
    select name, total_apartments, total_area from complex_settings where id = 1
  `;
  const buildings = await sql<{
    id: number;
    name: string;
    address: string;
    house_no: unknown;
    corpus_no: unknown;
  }>`
    select id, name, address, house_no, corpus_no from buildings
    order by house_no, corpus_no
  `;
  const assemblies = await sql<{
    id: number;
    title: string;
    description: string;
    status: string;
    closes_at: unknown;
    created_at: unknown;
    created_by: string;
    question_count: number;
    voter_count: number;
  }>`
    select
      a.id,
      a.title,
      a.description,
      a.status,
      a.closes_at,
      a.created_at,
      a.created_by,
      (select count(*)::int from questions q where q.assembly_id = a.id) as question_count,
      (select count(*)::int from (
         select distinct b.building_id, b.apartment
         from ballots b
         join questions q on q.id = b.question_id
         where q.assembly_id = a.id
       ) voters) as voter_count
    from assemblies a
    where a.status <> 'draft'
    order by a.created_at desc
  `;
  const stats = await sql<{ n: number; area: unknown }>`
    select count(*)::int as n, coalesce(sum(area_sqm), 0) as area from owners
  `;
  const data: HomeData = {
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
      voterCount: toNum(row.voter_count),
    })),
    registeredApartments: toNum(stats[0]?.n),
    registeredArea: toNum(stats[0]?.area),
    totalApartments: settings[0]?.total_apartments == null ? null : toNum(settings[0].total_apartments),
    totalArea: settings[0]?.total_area == null ? null : toNum(settings[0].total_area),
  };
  return data;
});

export const getAssembly = createServerFn({ method: "POST" })
  .validator(z.object({ assemblyId: z.number() }))
  .middleware([optionalUserMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const assemblies = await sql<{
      id: number;
      title: string;
      description: string;
      status: string;
      closes_at: unknown;
      created_at: unknown;
      created_by: string;
    }>`
      select id, title, description, status, closes_at, created_at, created_by
      from assemblies
      where id = ${data.assemblyId}
    `;
    const assembly = assemblies[0];
    if (!assembly) return null;

    if (assembly.status === "draft") {
      const userId = context.userId;
      if (!userId) return null;
      if (assembly.created_by !== userId) {
        const me = await sql<{ role: string }>`
          select role from owners where user_id = ${userId}
        `;
        if (me[0]?.role !== "council") return null;
      }
    }

    const questions = await sql<{
      id: number;
      ordinal: number;
      title: string;
      description: string;
    }>`
      select id, ordinal, title, description
      from questions
      where assembly_id = ${data.assemblyId}
      order by ordinal
    `;

    const tallies = await sql<{
      question_id: number;
      choice: string;
      apartments: number;
      area: unknown;
    }>`
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

    const ledger = await sql<{
      question_id: number;
      building_id: number;
      building_name: string;
      apartment: string;
      area_sqm: unknown;
      choice: string;
      voted_at: unknown;
    }>`
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

    const stats = await sql<{ n: number; area: unknown }>`
      select count(*)::int as n, coalesce(sum(area_sqm), 0) as area from owners
    `;
    const settings = await sql<{
      total_apartments: unknown;
      total_area: unknown;
    }>`
      select total_apartments, total_area from complex_settings where id = 1
    `;

    const resultByQ = new Map<number, QuestionResult>();
    for (const q of questions) resultByQ.set(q.id, emptyResult());
    for (const row of tallies) {
      if (!isChoice(row.choice)) continue;
      const bucket = resultByQ.get(row.question_id);
      if (!bucket) continue;
      bucket[row.choice] = { apartments: toNum(row.apartments), area: toNum(row.area) };
    }

    const ledgerByQ = new Map<number, LedgerRow[]>();
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
        votedAt: toIso(row.voted_at) ?? "",
      });
    }

    const detail: AssemblyDetail = {
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
      totalApartments:
        settings[0]?.total_apartments == null ? null : toNum(settings[0].total_apartments),
      totalArea: settings[0]?.total_area == null ? null : toNum(settings[0].total_area),
      questions: questions.map((q) => ({
        id: q.id,
        ordinal: q.ordinal,
        title: q.title,
        description: q.description,
        result: resultByQ.get(q.id) ?? emptyResult(),
        ledger: ledgerByQ.get(q.id) ?? [],
      })),
    };
    return detail;
  });

export const getRoll = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await sql<{ user_id: string }>`
      select user_id from owners where user_id = ${context.userId}
    `;
    if (!me[0]) throw new Error("Сначала зарегистрируйте квартиру");
    try {
    const counts = await sql<{ n: number }>`select count(*)::int as n from owners`;
    const rows = await sql<{
      building_id: unknown;
      building_name: string | null;
      apartment: string;
      area_sqm: unknown;
      full_name: string;
      owner_role: string;
    }>`
      select
        o.building_id,
        b.name as building_name,
        o.apartment,
        o.area_sqm,
        o.full_name,
        o.role as owner_role
      from owners o
      left join buildings b on b.id = o.building_id::int
      order by b.house_no, b.corpus_no, o.apartment
    `;
    if (toNum(counts[0]?.n) > 0 && rows.length === 0) {
      throw new Error("Реестр: записи есть, но выборка пуста");
    }
    const roll: RollRow[] = rows.map((row) => ({
      buildingId: toNum(row.building_id),
      buildingName: row.building_name ?? "Дом",
      apartment: row.apartment,
      areaSqm: toNum(row.area_sqm),
      fullName: row.full_name,
      role: row.owner_role === "council" ? "council" : "owner",
    }));
    return roll;
  } catch (err) {
    throw new Error(`Реестр: ${err instanceof Error ? err.message : String(err)}`);
  }
});

export const getRollPhones = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await sql<{ role: string }>`
      select role from owners where user_id = ${context.userId}
    `;
    if (me[0]?.role !== "council") return [] as RollPhone[];
    const rows = await sql<{
      building_id: unknown;
      apartment: string;
      phone: string | null;
    }>`
      select building_id, apartment, phone from owners
      where phone is not null and phone <> ''
    `;
    return rows.map((row) => ({
      buildingId: toNum(row.building_id),
      apartment: row.apartment,
      phone: row.phone ?? "",
    })).filter((row) => row.phone.length > 0);
  });

export const getBuildings = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    address: string;
    house_no: unknown;
    corpus_no: unknown;
  }>`
    select id, name, address, house_no, corpus_no from buildings
    order by house_no, corpus_no
  `;
  return rows.map(mapBuilding);
});

export const getMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const owners = await sql<{
      id: unknown;
      user_id: string;
      full_name: string;
      building_id: number;
      building_name: string;
      apartment: string;
      area_sqm: unknown;
      phone: string | null;
      role: string;
    }>`
      select
        o.id,
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
      order by b.house_no, b.corpus_no, o.apartment
    `;
    const ballots = await sql<{ question_id: number; choice: string }>`
      select question_id, choice from ballots where user_id = ${context.userId}
    `;
    const mapped = owners.map(mapOwner);
    const me: MeData = {
      owner: mapped[0] ?? null,
      owners: mapped,
      ballots: ballots
        .filter((b) => isChoice(b.choice))
        .map((b) => ({ questionId: b.question_id, choice: b.choice as Choice })),
    };
    return me;
  });

const ownerInput = z.object({
  ownerId: z.number().int().positive().nullable().optional(),
  fullName: z.string().min(3).max(120),
  phone: z.string().min(10).max(20),
  buildingId: z.number().int().positive(),
  apartment: z.string().min(1).max(8),
  areaSqm: z.number().positive().max(999),
});

export const upsertOwner = createServerFn({ method: "POST" })
  .validator(ownerInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const fullName = normalizeName(data.fullName);
    const apartment = normalizeApartment(data.apartment);
    const phone = normalizePhone(data.phone);
    if (fullName.length < 3) throw new Error("Укажите фамилию и имя");
    if (!phone) throw new Error("Укажите телефон: +7 999 123-45-67");
    if (!apartmentRe.test(apartment)) {
      throw new Error("Номер квартиры: цифры, при необходимости буква (например 14 или 14А)");
    }
    if (data.areaSqm < 10 || data.areaSqm > 400) {
      throw new Error("Площадь должна быть от 10 до 400 м²");
    }

    const sql = await getSql();
    const buildings = await sql<{ id: number }>`select id from buildings where id = ${data.buildingId}`;
    if (!buildings[0]) throw new Error("Нет такого корпуса");

    const mine = await sql<{ id: number; role: string }>`
      select id, role from owners where user_id = ${context.userId}
    `;

    if (data.ownerId) {
      if (!mine.some((row) => Number(row.id) === data.ownerId)) {
        throw new Error("Это не ваша квартира");
      }
      const before = await sql<{ building_id: number; apartment: string }>`
        select building_id, apartment from owners
        where id = ${data.ownerId} and user_id = ${context.userId}
      `;
      try {
        await sql`
          update owners
          set
            full_name = ${fullName},
            phone = ${phone},
            building_id = ${data.buildingId},
            apartment = ${apartment},
            area_sqm = ${data.areaSqm}
          where id = ${data.ownerId} and user_id = ${context.userId}
        `;
      } catch (err) {
        if (uniqueError(err)) {
          throw new Error("Эта квартира уже зарегистрирована другим собственником");
        }
        throw err;
      }
      await sql`
        update owners
        set full_name = ${fullName}, phone = ${phone}
        where user_id = ${context.userId}
      `;
      if (before[0]) {
        await sql`
          update ballots
          set
            building_id = ${data.buildingId},
            apartment = ${apartment},
            area_sqm = ${data.areaSqm}
          where user_id = ${context.userId}
            and building_id = ${before[0].building_id}
            and apartment = ${before[0].apartment}
        `;
      }
    } else {
      if (mine.length >= 8) throw new Error("Можно указать не больше 8 квартир");
      const councilCount = await sql<{ n: number }>`
        select count(*)::int as n from owners where role = 'council'
      `;
      const isFirst = toNum(councilCount[0]?.n) === 0;
      const role = mine[0]?.role === "council" || isFirst ? "council" : "owner";
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
        `;
      } catch (err) {
        if (uniqueError(err)) {
          throw new Error("Эта квартира уже зарегистрирована другим собственником");
        }
        throw err;
      }
      if (mine.length) {
        await sql`
          update owners
          set full_name = ${fullName}, phone = ${phone}
          where user_id = ${context.userId}
        `;
      }
    }

    const owners = await sql<{
      id: unknown;
      user_id: string;
      full_name: string;
      building_id: number;
      building_name: string;
      apartment: string;
      area_sqm: unknown;
      phone: string | null;
      role: string;
    }>`
      select
        o.id,
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
      order by b.house_no, b.corpus_no, o.apartment
    `;
    if (!owners[0]) throw new Error("Не удалось сохранить профиль");
    return mapOwner(
      owners.find(
        (row) => toNum(row.building_id) === data.buildingId && row.apartment === apartment,
      ) ?? owners[0],
    );
  });

export const removeMyApartment = createServerFn({ method: "POST" })
  .validator(z.object({ ownerId: z.number().int().positive() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const mine = await sql<{ id: number; building_id: number; apartment: string; role: string }>`
      select id, building_id, apartment, role from owners where user_id = ${context.userId}
    `;
    const target = mine.find((row) => Number(row.id) === data.ownerId);
    if (!target) throw new Error("Это не ваша квартира");
    if (mine.length <= 1) {
      throw new Error("Нельзя убрать последнюю квартиру. Попросите совет удалить карточку.");
    }
    await sql`
      delete from ballots
      where user_id = ${context.userId}
        and building_id = ${target.building_id}
        and apartment = ${target.apartment}
    `;
    await sql`
      delete from owners where id = ${data.ownerId} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

const voteInput = z.object({
  questionId: z.number().int().positive(),
  choice: z.enum(["for", "against", "abstain"]),
});

export const castVote = createServerFn({ method: "POST" })
  .validator(voteInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const ownerRows = await sql<{
      building_id: number;
      apartment: string;
      area_sqm: unknown;
    }>`
      select building_id, apartment, area_sqm
      from owners
      where user_id = ${context.userId}
    `;
    if (!ownerRows[0]) throw new Error("Сначала зарегистрируйте квартиру");

    const questions = await sql<{
      id: number;
      status: string;
      closes_at: unknown;
    }>`
      select q.id, a.status, a.closes_at
      from questions q
      join assemblies a on a.id = q.assembly_id
      where q.id = ${data.questionId}
    `;
    const question = questions[0];
    if (!question) throw new Error("Вопрос не найден");
    if (!isAssemblyOpen(question.status, toIso(question.closes_at))) {
      throw new Error("Голосование уже закрыто");
    }

    for (const owner of ownerRows) {
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
        on conflict (question_id, building_id, apartment) do update
          set choice = excluded.choice,
              area_sqm = excluded.area_sqm,
              user_id = excluded.user_id,
              voted_at = now()
      `;
    }
    return { ok: true as const };
  });

const createInput = z.object({
  title: z.string().min(4).max(200),
  description: z.string().max(4000),
  closesAt: z.string().nullable(),
  questions: z
    .array(
      z.object({
        title: z.string().min(4).max(280),
        description: z.string().max(1000),
      }),
    )
    .min(1)
    .max(12),
});

export const createAssembly = createServerFn({ method: "POST" })
  .validator(createInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owners = await sql<{ user_id: string }>`
      select user_id from owners where user_id = ${context.userId}
    `;
    if (!owners[0]) throw new Error("Сначала зарегистрируйте квартиру");

    const title = data.title.trim();
    const description = data.description.trim();
    const questions = data.questions
      .map((q) => ({ title: q.title.trim(), description: q.description.trim() }))
      .filter((q) => q.title.length >= 4);
    if (!questions.length) throw new Error("Добавьте хотя бы один вопрос повестки");

    let closesAt: string | null = null;
    if (data.closesAt) {
      const d = new Date(`${data.closesAt}T23:59:59`);
      if (Number.isNaN(d.getTime())) throw new Error("Некорректная дата окончания");
      if (d.getTime() < Date.now()) throw new Error("Дата окончания уже прошла");
      closesAt = d.toISOString();
    }

    const inserted = await sql<{ id: number }>`
      insert into assemblies (title, description, created_by, status, closes_at)
      values (${title}, ${description}, ${context.userId}, 'draft', ${closesAt})
      returning id
    `;
    const id = inserted[0]?.id;
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

export const getDrafts = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      title: string;
      description: string;
      status: string;
      closes_at: unknown;
      created_at: unknown;
      created_by: string;
      question_count: number;
    }>`
      select
        a.id,
        a.title,
        a.description,
        a.status,
        a.closes_at,
        a.created_at,
        a.created_by,
        (select count(*)::int from questions q where q.assembly_id = a.id) as question_count
      from assemblies a
      where a.status = 'draft'
        and (
          a.created_by = ${context.userId}
          or exists (
            select 1 from owners o
            where o.user_id = ${context.userId} and o.role = 'council'
          )
        )
      order by a.created_at desc
    `;
    const drafts: AssemblyListItem[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: "draft",
      closesAt: toIso(row.closes_at),
      createdAt: toIso(row.created_at) ?? "",
      createdBy: row.created_by,
      questionCount: toNum(row.question_count),
      voterCount: 0,
    }));
    return drafts;
  });

export const publishAssembly = createServerFn({ method: "POST" })
  .validator(z.object({ assemblyId: z.number().int().positive() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireCouncil(sql, context.userId);
    const rows = await sql<{ status: string }>`
      select status from assemblies where id = ${data.assemblyId}
    `;
    if (!rows[0]) throw new Error("Собрание не найдено");
    if (rows[0].status !== "draft") throw new Error("Эта повестка уже опубликована");
    await sql`
      update assemblies set status = 'open' where id = ${data.assemblyId} and status = 'draft'
    `;
    return { ok: true as const };
  });

export const deleteDraft = createServerFn({ method: "POST" })
  .validator(z.object({ assemblyId: z.number().int().positive() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ created_by: string; status: string }>`
      select created_by, status from assemblies where id = ${data.assemblyId}
    `;
    const assembly = rows[0];
    if (!assembly) throw new Error("Собрание не найдено");
    if (assembly.status !== "draft") {
      throw new Error("Удалить можно только неопубликованную повестку");
    }
    const me = await sql<{ role: string }>`
      select role from owners where user_id = ${context.userId}
    `;
    const isCouncil = me[0]?.role === "council";
    if (!isCouncil && assembly.created_by !== context.userId) {
      throw new Error("Отклонить повестку может совет или автор");
    }
    await sql`delete from assemblies where id = ${data.assemblyId} and status = 'draft'`;
    return { ok: true as const };
  });

export const closeAssembly = createServerFn({ method: "POST" })
  .validator(z.object({ assemblyId: z.number().int().positive() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const assemblies = await sql<{ created_by: string; status: string }>`
      select created_by, status from assemblies where id = ${data.assemblyId}
    `;
    const assembly = assemblies[0];
    if (!assembly) throw new Error("Собрание не найдено");
    if (assembly.status === "draft") {
      throw new Error("Черновик ещё не опубликован");
    }

    const owners = await sql<{ role: string }>`
      select role from owners where user_id = ${context.userId}
    `;
    const isCouncil = owners[0]?.role === "council";
    const isCreator = assembly.created_by === context.userId;
    if (!isCouncil && !isCreator) {
      throw new Error("Закрыть голосование может инициатор или совет дома");
    }

    await sql`
      update assemblies
      set status = 'closed', closes_at = coalesce(closes_at, now())
      where id = ${data.assemblyId}
    `;
    return { ok: true as const };
  });

export const setComplexTotals = createServerFn({ method: "POST" })
  .validator(
    z.object({
      totalApartments: z.number().int().min(1).max(5000),
      totalArea: z.number().positive().max(500000).nullable(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owners = await sql<{ role: string }>`
      select role from owners where user_id = ${context.userId}
    `;
    if (owners[0]?.role !== "council") {
      throw new Error("Число квартир в доме указывает совет");
    }
    await sql`
      update complex_settings
      set
        total_apartments = ${data.totalApartments},
        total_area = ${data.totalArea}
      where id = 1
    `;
    return { ok: true as const };
  });

export const setOwnerRole = createServerFn({ method: "POST" })
  .validator(
    z.object({
      buildingId: z.number().int().positive(),
      apartment: z.string().min(1).max(8),
      role: z.enum(["owner", "council"]),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await sql<{ role: string }>`
      select role from owners where user_id = ${context.userId}
    `;
    if (me[0]?.role !== "council") {
      throw new Error("Назначить в совет может только совет дома");
    }

    const apartment = normalizeApartment(data.apartment);
    const target = await sql<{ user_id: string; role: string }>`
      select user_id, role from owners
      where building_id = ${data.buildingId} and apartment = ${apartment}
    `;
    if (!target[0]) throw new Error("Собственник не найден");
    if (target[0].role === data.role) return { ok: true as const };

    if (data.role === "owner") {
      const counts = await sql<{ n: number }>`
        select count(distinct user_id)::int as n from owners where role = 'council'
      `;
      if (toNum(counts[0]?.n) <= 1) {
        throw new Error("Нельзя снять последнего члена совета");
      }
    }

    await sql`
      update owners
      set role = ${data.role}
      where user_id = ${target[0].user_id}
    `;
    return { ok: true as const };
  });

async function requireCouncil(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const me = await sql<{ role: string }>`
    select role from owners where user_id = ${userId}
  `;
  if (me[0]?.role !== "council") {
    throw new Error("Это может только совет дома");
  }
}

export const updateOwnerAsCouncil = createServerFn({ method: "POST" })
  .validator(
    z.object({
      buildingId: z.number().int().positive(),
      apartment: z.string().min(1).max(8),
      fullName: z.string().min(3).max(120),
      phone: z.string().min(10).max(20),
      newBuildingId: z.number().int().positive(),
      newApartment: z.string().min(1).max(8),
      areaSqm: z.number().positive().max(999),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireCouncil(sql, context.userId);

    const apartment = normalizeApartment(data.apartment);
    const newApartment = normalizeApartment(data.newApartment);
    const fullName = normalizeName(data.fullName);
    const phone = normalizePhone(data.phone);
    if (fullName.length < 3) throw new Error("Укажите фамилию и имя");
    if (!phone) throw new Error("Укажите телефон: +7 999 123-45-67");
    if (!apartmentRe.test(newApartment)) {
      throw new Error("Номер квартиры: цифры, при необходимости буква (например 14 или 14А)");
    }
    if (data.areaSqm < 10 || data.areaSqm > 400) {
      throw new Error("Площадь должна быть от 10 до 400 м²");
    }

    const buildings = await sql<{ id: number }>`
      select id from buildings where id = ${data.newBuildingId}
    `;
    if (!buildings[0]) throw new Error("Нет такого корпуса");

    const target = await sql<{ user_id: string; building_id: number; apartment: string }>`
      select user_id, building_id, apartment from owners
      where building_id = ${data.buildingId} and apartment = ${apartment}
    `;
    if (!target[0]) throw new Error("Собственник не найден");
    const userId = target[0].user_id;

    try {
      await sql`
        update owners
        set
          building_id = ${data.newBuildingId},
          apartment = ${newApartment},
          area_sqm = ${data.areaSqm}
        where building_id = ${data.buildingId} and apartment = ${apartment}
      `;
    } catch (err) {
      if (uniqueError(err)) {
        throw new Error("Эта квартира уже занята в реестре");
      }
      throw err;
    }

    await sql`
      update owners
      set full_name = ${fullName}, phone = ${phone}
      where user_id = ${userId}
    `;

    await sql`
      update ballots
      set
        building_id = ${data.newBuildingId},
        apartment = ${newApartment},
        area_sqm = ${data.areaSqm}
      where user_id = ${userId}
        and building_id = ${target[0].building_id}
        and apartment = ${target[0].apartment}
    `;
    return { ok: true as const };
  });

export const deleteOwnerAsCouncil = createServerFn({ method: "POST" })
  .validator(
    z.object({
      buildingId: z.number().int().positive(),
      apartment: z.string().min(1).max(8),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireCouncil(sql, context.userId);

    const apartment = normalizeApartment(data.apartment);
    const target = await sql<{ user_id: string; role: string }>`
      select user_id, role from owners
      where building_id = ${data.buildingId} and apartment = ${apartment}
    `;
    if (!target[0]) throw new Error("Собственник не найден");

    const remaining = await sql<{ n: number }>`
      select count(*)::int as n from owners where user_id = ${target[0].user_id}
    `;
    if (target[0].role === "council" && toNum(remaining[0]?.n) <= 1) {
      const counts = await sql<{ n: number }>`
        select count(distinct user_id)::int as n from owners where role = 'council'
      `;
      if (toNum(counts[0]?.n) <= 1) {
        throw new Error("Нельзя удалить последнего члена совета");
      }
    }

    await sql`
      delete from ballots
      where building_id = ${data.buildingId} and apartment = ${apartment}
    `;
    await sql`
      delete from owners
      where building_id = ${data.buildingId} and apartment = ${apartment}
    `;
    return { ok: true as const };
  });