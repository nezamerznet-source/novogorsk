import { Badge } from "@/components/ui/badge";
import { CHOICE_LABEL, formatArea } from "@/lib/format";
import type { LedgerRow } from "@/lib/voting";

export function LedgerTable({ rows }: { rows: LedgerRow[] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-muted">
        Реестр пуст. Как только кто-то проголосует, здесь появится строка: корпус,
        квартира, голос и площадь.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border bg-card px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted sm:grid">
        <span>Квартира</span>
        <span>Площадь</span>
        <span>Голос</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li
            key={`${row.questionId}-${row.buildingId}-${row.apartment}`}
            className="grid grid-cols-2 items-center gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {row.buildingName}, кв.&nbsp;{row.apartment}
              </p>
              <p className="text-xs text-subtle sm:hidden">{formatArea(row.areaSqm)}</p>
            </div>
            <p className="hidden text-sm tabular-nums text-muted sm:block">
              {formatArea(row.areaSqm)}
            </p>
            <Badge tone={row.choice}>{CHOICE_LABEL[row.choice]}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
