import type { Building } from "@/lib/voting";
import { cn } from "@/lib/utils";

export function BuildingPicker({
  buildings,
  value,
  onChange,
}: {
  buildings: Building[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  const selected = buildings.find((b) => b.id === value) ?? null;
  const houseNo = selected?.houseNo ?? buildings[0]?.houseNo ?? 52;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Дом <span className="font-medium text-foreground tabular-nums">{houseNo}</span>
      </p>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">Корпус</p>
        <div className="grid grid-cols-3 gap-2">
          {buildings.map((b) => {
            const isSelected = value === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange(b.id)}
                className={cn(
                  "flex min-h-12 items-center justify-center rounded-md border text-base font-medium tabular-nums transition-[background-color,border-color,transform] duration-150",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:border-strong",
                )}
              >
                {b.corpusNo}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-subtle">
        {selected ? selected.name : "Выберите корпус"}
      </p>
    </div>
  );
}
