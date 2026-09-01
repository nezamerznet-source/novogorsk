import { formatArea, formatInt, formatPct, percent } from "@/lib/format";

export function TurnoutCard({
  votedApartments,
  votedArea,
  registeredApartments,
  registeredArea,
  totalApartments,
  totalArea,
  open,
}: {
  votedApartments: number;
  votedArea: number;
  registeredApartments: number;
  registeredArea: number;
  totalApartments: number | null;
  totalArea: number | null;
  open: boolean;
}) {
  const ofRegistry = percent(votedApartments, registeredApartments);
  const ofHouse =
    totalApartments && totalApartments > 0
      ? percent(votedApartments, totalApartments)
      : null;
  const bar = ofHouse ?? ofRegistry;

  let hint: string;
  if (registeredApartments === 0) {
    hint =
      "Сначала соседи регистрируют квартиры в реестре — без этого явку считать не с чего.";
  } else if (votedApartments === 0) {
    hint = "Ждём первые бюллетени. Закрывать рано.";
  } else if (ofHouse != null && ofHouse >= 50) {
    hint = open
      ? "Больше половины квартир дома уже здесь. Если новые голоса почти не идут — можно закрывать. Это всё равно не кворум по ЖК РФ."
      : "На момент закрытия проголосовало больше половины квартир дома.";
  } else if (ofRegistry >= 50) {
    hint = open
      ? "Больше половины квартир в реестре уже проголосовали. Если картина перестала меняться — совет может закрыть голосование."
      : "Закрыли, когда проголосовало больше половины реестра.";
  } else if (ofRegistry >= 25) {
    hint = open
      ? "Явка растёт. Имеет смысл ещё подождать соседей, прежде чем закрывать."
      : "Закрыли при явке меньше половины реестра — это видно в протоколе.";
  } else {
    hint = open
      ? "Пока мало голосов. Если закрыть сейчас, картина будет неполной."
      : "Явка на момент закрытия была низкой.";
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Явка
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
            {formatPct(votedApartments, registeredApartments)}
          </p>
          <p className="mt-1 text-sm text-muted">от квартир в реестре</p>
        </div>
        {ofHouse != null ? (
          <div className="text-right">
            <p className="font-display text-2xl font-semibold tabular-nums">
              {formatPct(votedApartments, totalApartments ?? 0)}
            </p>
            <p className="mt-1 text-sm text-muted">от всех квартир дома 51</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-sm bg-card">
        <div
          className="h-full bg-primary transition-[width] duration-200"
          style={{ width: `${Math.min(100, bar)}%` }}
        />
      </div>

      <ul className="mt-4 space-y-1.5 text-sm tabular-nums">
        <li className="text-foreground">
          {formatInt(votedApartments)} из {formatInt(registeredApartments)} квартир
          в реестре
        </li>
        <li className="text-muted">
          {formatArea(votedArea)} из {formatArea(registeredArea)} в реестре
          {registeredArea > 0 ? ` · ${formatPct(votedArea, registeredArea)} по площади` : null}
        </li>
        {totalApartments ? (
          <li className="text-muted">
            {formatInt(votedApartments)} из {formatInt(totalApartments)} квартир дома 51
            {totalArea ? ` · ${formatArea(votedArea)} из ${formatArea(totalArea)}` : null}
          </li>
        ) : (
          <li className="text-subtle">
            Чтобы видеть процент от всего дома, совет указывает число квартир.
          </li>
        )}
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-muted">{hint}</p>
    </section>
  );
}
