import { CHOICE_LABEL, formatArea, formatInt, percent, type Choice } from "@/lib/format";
import type { QuestionResult, WeightMode } from "@/lib/voting";
import { cn } from "@/lib/utils";

const ORDER: Choice[] = ["for", "against", "abstain"];

function valueOf(tally: QuestionResult[Choice], mode: WeightMode): number {
  return mode === "area" ? tally.area : tally.apartments;
}

export function ResultsMeter({
  result,
  mode,
}: {
  result: QuestionResult;
  mode: WeightMode;
}) {
  const total = ORDER.reduce((sum, key) => sum + valueOf(result[key], mode), 0);
  const totalApts = ORDER.reduce((sum, key) => sum + result[key].apartments, 0);
  const totalArea = ORDER.reduce((sum, key) => sum + result[key].area, 0);

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-sm bg-card">
        {ORDER.map((key) => {
          const p = percent(valueOf(result[key], mode), total);
          if (p <= 0) return null;
          return (
            <div
              key={key}
              className={cn(
                "h-full transition-[width] duration-200",
                key === "for" && "bg-for",
                key === "against" && "bg-against",
                key === "abstain" && "bg-abstain",
              )}
              style={{ width: `${p}%` }}
            />
          );
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {ORDER.map((key) => (
          <div key={key} className="flex items-baseline justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-muted">
              <span
                className={cn(
                  "size-2 rounded-full",
                  key === "for" && "bg-for",
                  key === "against" && "bg-against",
                  key === "abstain" && "bg-abstain",
                )}
              />
              {CHOICE_LABEL[key]}
            </span>
            <span className="tabular-nums text-foreground">
              {formatInt(result[key].apartments)}
              <span className="text-subtle"> / {formatArea(result[key].area)}</span>
            </span>
          </div>
        ))}
      </div>
      {totalApts === 0 ? (
        <p className="text-sm text-muted">Пока никто не проголосовал — будьте первым.</p>
      ) : (
        <p className="text-xs text-subtle tabular-nums">
          Итого: {formatInt(totalApts)} кв. · {formatArea(totalArea)}
        </p>
      )}
    </div>
  );
}

export function WeightToggle({
  value,
  onChange,
}: {
  value: WeightMode;
  onChange: (mode: WeightMode) => void;
}) {
  return (
    <div className="inline-flex rounded-sm border border-border bg-card p-0.5">
      {(
        [
          ["apartments", "По квартирам"],
          ["area", "По площади"],
        ] as const
      ).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            "h-9 rounded-xs px-3 text-sm transition-colors duration-150",
            value === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
