import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createAssembly, getMe } from "@/lib/voting";

export const Route = createFileRoute("/create")({ component: CreatePage });

type DraftQ = { title: string; description: string };

function CreatePage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const me = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe(),
    enabled: Boolean(user),
    retry: false,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [questions, setQuestions] = useState<DraftQ[]>([
    { title: "", description: "" },
  ]);

  const save = useMutation({
    mutationFn: () =>
      createAssembly({
        data: {
          title,
          description,
          closesAt: closesAt || null,
          questions: questions.filter((q) => q.title.trim().length >= 4),
        },
      }),
    onSuccess: async (res) => {
      toast.success("Повестка ушла в совет — опубликуют, если вопрос по делу");
      await navigate({ to: "/a/$assemblyId", params: { assemblyId: String(res.id) } });
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось создать"),
  });

  if (isPending) return <Skeleton className="h-80 w-full rounded-xl" />;
  if (!user) return <RedirectToSignIn />;

  if (me.isSuccess && !me.data.owner) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl font-semibold">Сначала квартира</h1>
        <p className="text-sm text-muted">
          Вынести повестку может только собственник из реестра.
        </p>
        <Link
          to="/profile"
          className="inline-flex h-11 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Зарегистрировать квартиру
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Повестка
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Новое голосование</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Сформулируйте вопросы так, чтобы на них можно было ответить «за /
          против / воздержался». Голосование откроется, когда совет дома
          опубликует повестку — так не появляется мусор.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="title">Тема</Label>
          <Input
            id="title"
            required
            minLength={4}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Повышение тарифа на содержание"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Пояснение</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Зачем голосуем и что проверяем"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="until">До какой даты (необязательно)</Label>
          <Input
            id="until"
            type="date"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Вопросы</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setQuestions((q) =>
                  q.length >= 12 ? q : [...q, { title: "", description: "" }],
                )
              }
            >
              <Plus className="size-4" />
              Добавить
            </Button>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  Вопрос {i + 1}
                </span>
                {questions.length > 1 ? (
                  <button
                    type="button"
                    className="text-muted hover:text-against"
                    onClick={() => setQuestions((list) => list.filter((_, j) => j !== i))}
                    aria-label="Удалить вопрос"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
              <Input
                required
                minLength={4}
                value={q.title}
                onChange={(e) =>
                  setQuestions((list) =>
                    list.map((item, j) => (j === i ? { ...item, title: e.target.value } : item)),
                  )
                }
                placeholder="Согласны ли вы с повышением тарифа?"
              />
              <Textarea
                className="min-h-20"
                value={q.description}
                onChange={(e) =>
                  setQuestions((list) =>
                    list.map((item, j) =>
                      j === i ? { ...item, description: e.target.value } : item,
                    ),
                  )
                }
                placeholder="Краткий контекст"
              />
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? "Отправляем…" : "Отправить в совет"}
        </Button>
      </form>
    </div>
  );
}
