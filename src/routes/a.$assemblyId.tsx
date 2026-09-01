import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LedgerTable } from "@/components/ledger-table";
import { TurnoutCard } from "@/components/turnout";
import { WeightToggle } from "@/components/results-meter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VoteQuestion } from "@/components/vote-question";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  CHOICE_LABEL,
  countLabel,
  formatArea,
  formatDate,
  type Choice,
} from "@/lib/format";
import {
  castVote,
  closeAssembly,
  deleteDraft,
  getAssembly,
  getMe,
  publishAssembly,
  type WeightMode,
} from "@/lib/voting";

export const Route = createFileRoute("/a/$assemblyId")({ component: AssemblyPage });

function AssemblyPage() {
  const { assemblyId } = Route.useParams();
  const id = Number(assemblyId);
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [mode, setMode] = useState<WeightMode>("area");
  const [pendingQ, setPendingQ] = useState<number | null>(null);

  const assembly = useQuery({
    queryKey: ["assembly", id],
    queryFn: () => getAssembly({ data: { assemblyId: id } }),
    enabled: Number.isFinite(id),
  });
  const me = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe(),
    enabled: Boolean(user),
    retry: false,
  });

  const vote = useMutation({
    mutationFn: (input: { questionId: number; choice: Choice }) =>
      castVote({ data: input }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["assembly", id] });
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      toast.success("Голос учтён. Пока собрание открыто, его можно изменить.");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось проголосовать"),
    onSettled: () => setPendingQ(null),
  });

  const close = useMutation({
    mutationFn: () => closeAssembly({ data: { assemblyId: id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["assembly", id] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      toast.success("Голосование закрыто");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось закрыть"),
  });

  const publish = useMutation({
    mutationFn: () => publishAssembly({ data: { assemblyId: id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["assembly", id] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Голосование открыто");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось опубликовать"),
  });

  const reject = useMutation({
    mutationFn: () => deleteDraft({ data: { assemblyId: id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Черновик удалён");
      await navigate({ to: "/" });
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось удалить"),
  });

  if (!Number.isFinite(id)) {
    return <p className="text-sm text-muted">Нет такого собрания.</p>;
  }
  if (assembly.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }
  if (assembly.isError || !assembly.data) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-semibold">Собрание не найдено</h1>
        <Link to="/" className="text-sm text-primary hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  const a = assembly.data;
  const draft = a.status === "draft";
  const open = a.status === "open";
  const owner = me.data?.owner ?? null;
  const myApts = me.data?.owners ?? [];
  const canVote = Boolean(user && owner && open);
  const myByQ = new Map((me.data?.ballots ?? []).map((b) => [b.questionId, b.choice]));
  const canClose = Boolean(
    open && owner && (owner.role === "council" || a.createdBy === user?.id),
  );
  const canPublish = Boolean(draft && owner?.role === "council");
  const canReject = Boolean(
    draft && owner && (owner.role === "council" || a.createdBy === user?.id),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={open ? "open" : draft ? "draft" : "closed"}>
            {open ? "Открыто" : draft ? "На модерации" : "Закрыто"}
          </Badge>
          {a.closesAt ? (
            <span className="text-xs text-subtle">до {formatDate(a.closesAt)}</span>
          ) : null}
        </div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{a.title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {a.description}
        </p>
        <div className="no-print flex flex-wrap items-center gap-2">
          {!draft ? <WeightToggle value={mode} onChange={setMode} /> : null}
          {!draft ? (
            <Button variant="outline" size="sm" className="h-11" onClick={() => window.print()}>
              <Printer className="size-4" />
              Печать протокола
            </Button>
          ) : null}
          {canPublish ? (
            <Button
              size="sm"
              className="h-11"
              disabled={publish.isPending}
              onClick={() => publish.mutate()}
            >
              Опубликовать
            </Button>
          ) : null}
          {canReject ? (
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              disabled={reject.isPending}
              onClick={() => reject.mutate()}
            >
              Отклонить
            </Button>
          ) : null}
          {canClose ? (
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              disabled={close.isPending}
              onClick={() => close.mutate()}
            >
              Закрыть голосование
            </Button>
          ) : null}
        </div>
        {canClose ? (
          <p className="text-xs text-subtle">
            Закрывать стоит, когда явка перестала расти. После закрытия голоса не меняются.
          </p>
        ) : null}
        {draft ? (
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted">
            {canPublish
              ? "Черновик. Опубликуйте — и собственники смогут голосовать. Отклоните, если это мусор."
              : "Повестка у совета. Голосовать можно после публикации."}
          </p>
        ) : !user ? (
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted">
            Смотреть реестр можно без входа. Чтобы голосовать —{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              войдите
            </Link>{" "}
            и укажите квартиру.
          </p>
        ) : !owner ? (
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted">
            <Link to="/profile" className="font-medium text-primary hover:underline">
              Зарегистрируйте квартиру
            </Link>
            , чтобы ваш голос попал в реестр.
          </p>
        ) : !open ? (
          <p className="text-sm text-muted">Голосование закрыто, реестр сохранён.</p>
        ) : myApts.length > 1 ? (
          <p className="text-sm text-muted">
            Ваш голос учитывается по{" "}
            {countLabel(myApts.length, "квартире", "квартирам", "квартирам")} ·{" "}
            {formatArea(myApts.reduce((s, row) => s + row.areaSqm, 0))}.
          </p>
        ) : null}
      </header>

      {!draft ? (
        <TurnoutCard
          votedApartments={a.voterCount}
          votedArea={a.voterArea}
          registeredApartments={a.registeredApartments}
          registeredArea={a.registeredArea}
          totalApartments={a.totalApartments}
          totalArea={a.totalArea}
          open={open}
        />
      ) : null}

      <div className="print-only space-y-2 text-sm">
        <p>ЖК «Новогорск Курорт» — открытое собрание</p>
        <p>
          {a.title}. Статус: {open ? "открыто" : "закрыто"}.{" "}
          {a.closesAt ? `До ${formatDate(a.closesAt)}.` : null} Явка: {a.voterCount} из{" "}
          {a.registeredApartments} квартир в реестре
          {a.totalApartments ? `, ${a.voterCount} из ${a.totalApartments} в доме 52` : ""}.
        </p>
      </div>

      <div className="space-y-5">
        {a.questions.map((q) => (
          <VoteQuestion
            key={q.id}
            question={q}
            mode={mode}
            myChoice={myByQ.get(q.id) ?? null}
            canVote={canVote}
            pending={pendingQ === q.id}
            preview={draft}
            onVote={(choice) => {
              setPendingQ(q.id);
              vote.mutate({ questionId: q.id, choice });
            }}
          />
        ))}
      </div>

      {!draft ? (
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Сводный реестр</h2>
        <p className="text-sm text-muted">
          Все бюллетени по этой повестке. Пересчитайте сами: квартира + площадь +
          решение.
        </p>
        {a.questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <h3 className="text-sm font-medium">
              {q.ordinal}. {q.title}
            </h3>
            <LedgerTable rows={q.ledger} />
            <ul className="print-only text-sm">
              {q.ledger.map((row) => (
                <li key={`${row.buildingId}-${row.apartment}`}>
                  {row.buildingName}, кв. {row.apartment} — {CHOICE_LABEL[row.choice]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      ) : null}
    </div>
  );
}
