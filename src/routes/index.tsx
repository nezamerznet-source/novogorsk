import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, Scale, Stamp, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { HousesMark } from "@/components/houses-mark";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  countLabel,
  formatArea,
  formatDate,
  formatPct,
} from "@/lib/format";
import { getDrafts, getHome, getMe } from "@/lib/voting";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user } = useCurrentUserState();
  const home = useQuery({ queryKey: ["home"], queryFn: () => getHome() });
  const me = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe(),
    enabled: Boolean(user),
    retry: false,
  });

  const drafts = useQuery({
    queryKey: ["drafts", user?.id],
    queryFn: () => getDrafts(),
    enabled: Boolean(user),
    retry: false,
  });
  const isCouncil = me.data?.owner?.role === "council";
  const data = home.data;

  return (
    <div className="space-y-12">
      <section className="rise-in">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          ЖК «{data?.complexName ?? "Новогорск Курорт"}»
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold text-foreground sm:text-5xl">
          Голосуйте сами. Считайте сами.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Если УК считает бюллетени без вас — пересчитайте голоса двора здесь.
          Каждый голос виден: корпус, квартира, площадь, решение.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {user && !me.data?.owner ? (
            <Link
              to="/profile"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]"
            >
              Зарегистрировать квартиру
              <ArrowRight className="size-4" />
            </Link>
          ) : user ? (
            <a
              href="#assemblies"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]"
            >
              К повестке
              <ArrowRight className="size-4" />
            </a>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]"
            >
              Войти как собственник
              <ArrowRight className="size-4" />
            </Link>
          )}
          <Link
            to="/roll"
            className="inline-flex h-12 items-center rounded-sm border border-strong bg-surface px-5 text-sm font-medium text-foreground hover:bg-card"
          >
            Реестр соседей
          </Link>
        </div>
      </section>

      <section className="rise-in rise-in-2 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<UserRound className="size-4" />}
          label="Квартир в реестре"
          value={
            data
              ? countLabel(data.registeredApartments, "квартира", "квартиры", "квартир")
              : "…"
          }
          hint={data ? formatArea(data.registeredArea) : ""}
        />
        <StatCard
          icon={<Scale className="size-4" />}
          label="Открытых голосований"
          value={
            data
              ? String(data.assemblies.filter((a) => a.status === "open").length)
              : "…"
          }
          hint="Живой подсчёт на глазах"
        />
        <StatCard
          icon={<HousesMark className="h-4 w-10" />}
          label="Корпуса"
          value="1 · 2 · 3"
          hint="Дом 52"
        />
      </section>

      <section className="rise-in rise-in-3 grid gap-4 sm:grid-cols-3">
        <Step
          icon={<UserRound className="size-4" />}
          n="01"
          title="Квартира"
          text="Входите и указываете корпус, номер и площадь. Несколько квартир — плюсом в кабинете. Каждая даёт свой вес."
        />
        <Step
          icon={<Stamp className="size-4" />}
          n="02"
          title="Голос"
          text="За, против или воздержался. Пока собрание открыто, голос можно изменить."
        />
        <Step
          icon={<Eye className="size-4" />}
          n="03"
          title="Проверка"
          text="Итог считается и по квартирам, и по метрам. Реестр виден всем — без «чёрного ящика» УК."
        />
      </section>

      <section id="assemblies" className="rise-in rise-in-4 space-y-4">
        {drafts.data?.length ? (
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold">
              {isCouncil ? "На модерации" : "Ваши черновики"}
            </h2>
            <p className="text-sm text-muted">
              {isCouncil
                ? "Собственники прислали повестки. Опубликуйте — или отклоните мусор."
                : "Совет ещё не опубликовал. Голосовать пока нельзя."}
            </p>
            <ul className="space-y-3">
              {drafts.data.map((a) => (
                <li key={a.id}>
                  <Link
                    to="/a/$assemblyId"
                    params={{ assemblyId: String(a.id) }}
                    className="block rounded-xl border border-dashed border-border bg-card p-5 transition-[border-color] duration-150 hover:border-strong"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="draft">Черновик</Badge>
                      <span className="text-xs text-subtle">{a.questionCount} вопр.</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold">{a.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                      {a.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Повестка</h2>
          <Link to="/create" className="text-sm font-medium text-primary hover:underline">
            Предложить вопрос
          </Link>
        </div>
        {home.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : home.isError ? (
          <p className="text-sm text-against">Не удалось загрузить повестку. Обновите страницу.</p>
        ) : data?.assemblies.length ? (
          <ul className="space-y-3">
            {data.assemblies.map((a) => (
              <li key={a.id}>
                <Link
                  to="/a/$assemblyId"
                  params={{ assemblyId: String(a.id) }}
                  className="block rounded-xl border border-border bg-surface p-5 shadow-soft transition-[border-color] duration-150 hover:border-strong"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={a.status === "open" ? "open" : "closed"}>
                      {a.status === "open" ? "Открыто" : "Закрыто"}
                    </Badge>
                    <span className="text-xs text-subtle">
                      {a.questionCount} вопр. · {a.voterCount} прогол.
                      {data.registeredApartments
                        ? ` · ${formatPct(a.voterCount, data.registeredApartments)} реестра`
                        : ""}
                    </span>
                    {a.closesAt ? (
                      <span className="text-xs text-subtle">до {formatDate(a.closesAt)}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {a.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-sm text-muted">
            Пока нет опубликованных голосований. Предложите вопрос — совет
            дома откроет его, если это не мусор.
          </p>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

function Step({
  icon,
  n,
  title,
  text,
}: {
  icon: ReactNode;
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted">
        <span className="flex size-8 items-center justify-center rounded-sm border border-border bg-surface">
          {icon}
        </span>
        <span className="font-mono text-xs text-subtle">{n}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
