import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BuildingPicker } from "@/components/building-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { countLabel, formatArea, formatPhone, normalizePhone } from "@/lib/format";
import { getBuildings, getMe, removeMyApartment, upsertOwner, type Owner } from "@/lib/voting";

export const Route = createFileRoute("/profile")({ component: Profile });

const PHONE_DRAFT_KEY = "novogorsk-owner-phone";

function Profile() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const buildings = useQuery({ queryKey: ["buildings"], queryFn: () => getBuildings() });
  const me = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe(),
    enabled: Boolean(user),
    retry: false,
  });

  const owners = me.data?.owners ?? [];
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(() => {
    try {
      return sessionStorage.getItem(PHONE_DRAFT_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [apartment, setApartment] = useState("");
  const [area, setArea] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated || me.isPending) return;
    if (owners[0]) {
      setFullName(owners[0].fullName);
      if (owners[0].phone) setPhone(formatPhone(owners[0].phone));
    } else if (user?.displayName) {
      setFullName(user.displayName);
    }
    if (!owners.length) setAdding(true);
    setHydrated(true);
  }, [me.data, me.isPending, user, hydrated, owners]);

  const resetAptForm = () => {
    setEditingId(null);
    setAdding(false);
    setBuildingId(null);
    setApartment("");
    setArea("");
  };

  const startEdit = (row: Owner) => {
    setAdding(false);
    setEditingId(row.id);
    setBuildingId(row.buildingId);
    setApartment(row.apartment);
    setArea(String(row.areaSqm));
  };

  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
    setBuildingId(null);
    setApartment("");
    setArea("");
  };

  const save = useMutation({
    mutationFn: () =>
      upsertOwner({
        data: {
          ownerId: editingId,
          fullName,
          phone,
          buildingId: buildingId ?? 0,
          apartment,
          areaSqm: Number(area.replace(",", ".")),
        },
      }),
    onSuccess: async () => {
      try {
        sessionStorage.removeItem(PHONE_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["roll"] });
      await qc.invalidateQueries({ queryKey: ["roll-phones"] });
      await qc.invalidateQueries({ queryKey: ["assembly"] });
      toast.success(editingId ? "Квартира обновлена" : "Квартира добавлена в реестр");
      resetAptForm();
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось сохранить"),
  });

  const remove = useMutation({
    mutationFn: (ownerId: number) => removeMyApartment({ data: { ownerId } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["roll"] });
      await qc.invalidateQueries({ queryKey: ["roll-phones"] });
      await qc.invalidateQueries({ queryKey: ["assembly"] });
      toast.success("Квартира убрана. Голоса по ней сняты.");
      resetAptForm();
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось убрать"),
  });

  if (isPending) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }
  if (!user) return <RedirectToSignIn />;

  const totalArea = owners.reduce((s, row) => s + row.areaSqm, 0);
  const showForm = adding || editingId != null || owners.length === 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Собственник
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Ваши квартиры</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Можно добавить несколько объектов — 94 и 95, разные корпуса. Голос
          считается по каждой квартире и по сумме метров. Полный список
          соседей видит только совет дома.
        </p>
      </div>

      {owners.length ? (
        <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted">
          {countLabel(owners.length, "квартира", "квартиры", "квартир")} ·{" "}
          {formatArea(totalArea)}
          {owners[0].role === "council" ? " · совет дома" : null}
        </p>
      ) : (
        <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted">
          Без квартиры голосовать нельзя — иначе нечего проверять в реестре.
        </p>
      )}

      <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Фамилия и имя</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Петрова Анна"
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 999 123-45-67"
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </div>

      {owners.length ? (
        <ul className="space-y-2">
          {owners.map((row) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {row.buildingName}, кв.&nbsp;{row.apartment}
                </p>
                <p className="text-xs text-muted">{formatArea(row.areaSqm)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => startEdit(row)}
                >
                  Изменить
                </button>
                {owners.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-against hover:underline"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(row.id)}
                  >
                    Убрать
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {owners.length && !showForm ? (
        <Button type="button" variant="outline" className="w-full" onClick={startAdd}>
          <Plus className="size-4" />
          Добавить квартиру
        </Button>
      ) : null}

      {showForm ? (
        <form
          className="space-y-4 rounded-xl border border-border bg-surface p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!buildingId) {
              toast.error("Выберите корпус");
              return;
            }
            if (!normalizePhone(phone)) {
              toast.error("Укажите телефон: +7 999 123-45-67");
              return;
            }
            save.mutate();
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {editingId ? "Изменить квартиру" : "Новая квартира"}
            </p>
            {owners.length ? (
              <button
                type="button"
                className="text-xs font-medium text-muted hover:text-foreground hover:underline"
                onClick={resetAptForm}
              >
                Отмена
              </button>
            ) : null}
          </div>
          <div className="space-y-1.5">
            {buildings.data ? (
              <BuildingPicker
                buildings={buildings.data}
                value={buildingId}
                onChange={setBuildingId}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="apt">Квартира</Label>
              <Input
                id="apt"
                required
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="14"
                inputMode="text"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Площадь, м²</Label>
              <Input
                id="area"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="64,3"
                inputMode="decimal"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending
              ? "Сохраняем…"
              : editingId
                ? "Сохранить квартиру"
                : "Записать в реестр"}
          </Button>
        </form>
      ) : null}

      <p className="text-center text-sm">
        <Link to="/" className="text-primary hover:underline">
          К повестке
        </Link>
      </p>
    </div>
  );
}
