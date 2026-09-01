import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BuildingPicker } from "@/components/building-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { countLabel, formatArea, formatInt, formatPhone, normalizePhone } from "@/lib/format";
import {
  deleteOwnerAsCouncil,
  getBuildings,
  getHome,
  getMe,
  getRoll,
  getRollPhones,
  setComplexTotals,
  setOwnerRole,
  updateOwnerAsCouncil,
  type Building,
  type RollRow,
} from "@/lib/voting";

export const Route = createFileRoute("/roll")({ component: RollPage });

function RollPage() {
  const { user, isPending } = useCurrentUserState();
  const me = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe(),
    enabled: Boolean(user),
    retry: false,
  });
  const isCouncil = me.data?.owner?.role === "council";
  const roll = useQuery({
    queryKey: ["roll", user?.id],
    queryFn: () => getRoll(),
    enabled: isCouncil,
    retry: false,
  });
  const buildings = useQuery({ queryKey: ["buildings"], queryFn: () => getBuildings() });
  const home = useQuery({ queryKey: ["home"], queryFn: () => getHome() });
  const phones = useQuery({
    queryKey: ["roll-phones", user?.id],
    queryFn: () => getRollPhones(),
    enabled: Boolean(user) && isCouncil,
    retry: false,
  });
  const phoneByKey = new Map(
    (phones.data ?? []).map((p) => [`${p.buildingId}-${p.apartment}`, p.phone]),
  );
  const rows = roll.data ?? [];
  const houses = buildings.data ?? [];
  const byCorpus = houses.map((b) => ({
    building: b,
    owners: rows.filter((r) => Number(r.buildingId) === Number(b.id)),
  }));
  const area = rows.reduce((s, r) => s + r.areaSqm, 0);
  const loading = roll.isPending || buildings.isPending;
  const houseNo = houses[0]?.houseNo ?? 51;
  const totalApts = home.data?.totalApartments ?? null;
  const councilCount = rows.filter((r) => r.role === "council").length;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<RollRow | null>(null);
  const [removing, setRemoving] = useState<RollRow | null>(null);
  const setRole = useMutation({
    mutationFn: (input: { buildingId: number; apartment: string; role: "owner" | "council" }) =>
      setOwnerRole({ data: input }),
    onSuccess: async (_res, input) => {
      await qc.invalidateQueries({ queryKey: ["roll"] });
      await qc.invalidateQueries({ queryKey: ["roll-phones"] });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(
        input.role === "council"
          ? "Добавлен в совет дома"
          : "Снят с совета дома",
      );
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось изменить роль"),
  });

  if (isPending) return <Skeleton className="h-80 w-full rounded-xl" />;
  if (!user) return <RedirectToSignIn />;
  if (me.isPending) return <Skeleton className="h-80 w-full rounded-xl" />;
  if (!isCouncil) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl font-semibold">Нет доступа</h1>
        <p className="text-sm text-muted">
          Реестр с ФИО, квартирами и телефонами видит только совет дома.
        </p>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          К повестке
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Проверка
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Реестр собственников
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Список собственников — только совету дома. Если кто-то записался на
          чужую квартиру, карточку можно поправить или удалить. Здесь же
          назначают других админов. Email не показывается.
        </p>
        <p className="mt-3 text-sm tabular-nums text-foreground">
          Дом {houseNo} · {countLabel(rows.length, "квартира", "квартиры", "квартир")}
          {totalApts ? ` из ${formatInt(totalApts)}` : ""} · {formatArea(area)}
        </p>
      </div>

      {isCouncil ? (
        <TotalsForm
          totalApartments={home.data?.totalApartments ?? null}
          totalArea={home.data?.totalArea ?? null}
        />
      ) : null}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : roll.isError ? (
        <p className="text-sm text-against">Не удалось загрузить реестр.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {byCorpus.map(({ building, owners: house }) => (
            <section
              key={building.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <h2 className="font-display text-lg font-semibold">
                Корпус {building.corpusNo}
              </h2>
              <p className="mt-1 text-xs text-subtle">
                {countLabel(house.length, "запись", "записи", "записей")}
              </p>
              {house.length ? (
                <ul className="mt-4 divide-y divide-border">
                  {house.map((row) => {
                    const phone = phoneByKey.get(`${row.buildingId}-${row.apartment}`);
                    return (
                    <li
                      key={`${row.buildingId}-${row.apartment}`}
                      className="flex items-start justify-between gap-2 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">кв.&nbsp;{row.apartment}</p>
                        <p className="text-xs text-muted">{row.fullName}</p>
                        {isCouncil ? (
                          phone ? (
                            <a
                              href={`tel:${phone}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {formatPhone(phone)}
                            </a>
                          ) : (
                            <p className="text-xs text-subtle">телефон не указан</p>
                          )
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm tabular-nums">{formatArea(row.areaSqm)}</p>
                        {row.role === "council" ? (
                          <Badge className="mt-1">совет</Badge>
                        ) : null}
                        {isCouncil && row.role !== "council" ? (
                          <button
                            type="button"
                            className="mt-1 block w-full text-xs font-medium text-primary hover:underline"
                            disabled={setRole.isPending}
                            onClick={() =>
                              setRole.mutate({
                                buildingId: row.buildingId,
                                apartment: row.apartment,
                                role: "council",
                              })
                            }
                          >
                            В совет
                          </button>
                        ) : null}
                        {isCouncil && row.role === "council" && councilCount > 1 ? (
                          <button
                            type="button"
                            className="mt-1 block w-full text-xs font-medium text-muted hover:text-foreground hover:underline"
                            disabled={setRole.isPending}
                            onClick={() =>
                              setRole.mutate({
                                buildingId: row.buildingId,
                                apartment: row.apartment,
                                role: "owner",
                              })
                            }
                          >
                            Снять
                          </button>
                        ) : null}
                        {isCouncil ? (
                          <>
                            <button
                              type="button"
                              className="mt-1 block w-full text-xs font-medium text-primary hover:underline"
                              onClick={() => setEditing(row)}
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              className="mt-1 block w-full text-xs font-medium text-against hover:underline"
                              onClick={() => setRemoving(row)}
                            >
                              Удалить
                            </button>
                          </>
                        ) : null}
                      </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-subtle">Пока пусто</p>
              )}
            </section>
          ))}
        </div>
      )}

      {!loading && !rows.length ? (
        <p className="text-center text-sm">
          <Link to="/profile" className="font-medium text-primary hover:underline">
            Зарегистрировать квартиру
          </Link>
        </p>
      ) : null}

      {editing ? (
        <OwnerEditor
          row={editing}
          phone={phoneByKey.get(`${editing.buildingId}-${editing.apartment}`) ?? ""}
          buildings={houses}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {removing ? (
        <OwnerDelete
          row={removing}
          onClose={() => setRemoving(null)}
        />
      ) : null}
    </div>
  );
}

function TotalsForm({
  totalApartments,
  totalArea,
}: {
  totalApartments: number | null;
  totalArea: number | null;
}) {
  const qc = useQueryClient();
  const [apts, setApts] = useState("");
  const [area, setArea] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    if (totalApartments != null) setApts(String(totalApartments));
    if (totalArea != null) setArea(String(totalArea));
    setHydrated(true);
  }, [totalApartments, totalArea, hydrated]);

  const save = useMutation({
    mutationFn: () =>
      setComplexTotals({
        data: {
          totalApartments: Number(apts),
          totalArea: area.trim() ? Number(area.replace(",", ".")) : null,
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["assembly"] });
      toast.success("Число квартир дома записано — явка считается и от всего дома");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось сохранить"),
  });

  return (
    <form
      className="rounded-xl border border-border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(apts);
        if (!Number.isInteger(n) || n < 1) {
          toast.error("Укажите, сколько квартир в трёх корпусах дома 51");
          return;
        }
        save.mutate();
      }}
    >
      <p className="text-sm font-medium">Сколько квартир в доме 51</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Чтобы на голосовании видеть процент не только от реестра, но и от всех
        квартир трёх корпусов. Площадь — по желанию.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="totalApts">Квартир всего</Label>
          <Input
            id="totalApts"
            inputMode="numeric"
            required
            value={apts}
            onChange={(e) => setApts(e.target.value)}
            placeholder="например 180"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="totalArea">Площадь, м²</Label>
          <Input
            id="totalArea"
            inputMode="decimal"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="необязательно"
          />
        </div>
        <Button type="submit" className="h-11" disabled={save.isPending}>
          {save.isPending ? "Сохраняем…" : "Записать"}
        </Button>
      </div>
    </form>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 z-0"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-soft">
        {children}
      </div>
    </div>
  );
}

function OwnerEditor({
  row,
  phone,
  buildings,
  onClose,
}: {
  row: RollRow;
  phone: string;
  buildings: Building[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(row.fullName);
  const [phoneValue, setPhoneValue] = useState(phone ? formatPhone(phone) : "");
  const [buildingId, setBuildingId] = useState(row.buildingId);
  const [apartment, setApartment] = useState(row.apartment);
  const [area, setArea] = useState(String(row.areaSqm));

  const save = useMutation({
    mutationFn: () =>
      updateOwnerAsCouncil({
        data: {
          buildingId: row.buildingId,
          apartment: row.apartment,
          fullName,
          phone: phoneValue,
          newBuildingId: buildingId,
          newApartment: apartment,
          areaSqm: Number(area.replace(",", ".")),
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roll"] });
      await qc.invalidateQueries({ queryKey: ["roll-phones"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["assembly"] });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Карточка обновлена");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось сохранить"),
  });

  return (
    <Overlay onClose={onClose}>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Совет дома
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold">
        Изменить карточку
      </h2>
      <p className="mt-2 text-sm text-muted">
        {row.buildingName}, кв.&nbsp;{row.apartment}. Если это чужая квартира —
        поправьте данные или удалите запись.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!normalizePhone(phoneValue)) {
            toast.error("Укажите телефон: +7 999 123-45-67");
            return;
          }
          save.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="editName">Фамилия и имя</Label>
          <Input
            id="editName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="editPhone">Телефон</Label>
          <Input
            id="editPhone"
            required
            type="tel"
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            placeholder="+7 999 123-45-67"
          />
        </div>
        <BuildingPicker buildings={buildings} value={buildingId} onChange={setBuildingId} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="editApt">Квартира</Label>
            <Input
              id="editApt"
              required
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editArea">Площадь, м²</Label>
            <Input
              id="editArea"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              inputMode="decimal"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1" disabled={save.isPending}>
            {save.isPending ? "Сохраняем…" : "Сохранить"}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </form>
    </Overlay>
  );
}

function OwnerDelete({ row, onClose }: { row: RollRow; onClose: () => void }) {
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: () =>
      deleteOwnerAsCouncil({
        data: { buildingId: row.buildingId, apartment: row.apartment },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roll"] });
      await qc.invalidateQueries({ queryKey: ["roll-phones"] });
      await qc.invalidateQueries({ queryKey: ["home"] });
      await qc.invalidateQueries({ queryKey: ["assembly"] });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Карточка удалена. Квартира снова свободна.");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось удалить"),
  });

  return (
    <Overlay onClose={onClose}>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Совет дома
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold">Удалить карточку?</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {row.fullName}, {row.buildingName}, кв.&nbsp;{row.apartment}. Голоса этой
        квартиры снимутся. Человек сможет зарегистрироваться заново — так
        убирают чужие и дублирующие записи.
      </p>
      <div className="mt-5 flex gap-2">
        <Button
          className="flex-1"
          variant="against"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
        >
          {remove.isPending ? "Удаляем…" : "Удалить"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Отмена
        </Button>
      </div>
    </Overlay>
  );
}

