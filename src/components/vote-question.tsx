import { LedgerTable } from "@/components/ledger-table";
import { ResultsMeter } from "@/components/results-meter";
import { Button } from "@/components/ui/button";
import { CHOICE_LABEL, type Choice } from "@/lib/format";
import type { QuestionDetail, WeightMode } from "@/lib/voting";
import { cn } from "@/lib/utils";

const CHOICES: Choice[] = ["for", "against", "abstain"];

export function VoteQuestion({
  question,
  mode,
  myChoice,
  canVote,
  pending,
  preview,
  showLedger,
  onVote,
}: {
  question: QuestionDetail;
  mode: WeightMode;
  myChoice: Choice | null;
  canVote: boolean;
  pending: boolean;
  preview?: boolean;
  showLedger?: boolean;
  onVote: (choice: Choice) => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Вопрос {question.ordinal}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-foreground sm:text-2xl">
        {question.title}
      </h2>
      {question.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{question.description}</p>
      ) : null}

      {preview ? (
        <p className="mt-4 text-sm text-subtle">Голосование откроется после публикации советом.</p>
      ) : (
        <>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {CHOICES.map((choice) => {
          const selected = myChoice === choice;
          return (
            <Button
              key={choice}
              variant={selected ? choice : "outline"}
              className={cn("h-12 w-full", !canVote && "opacity-70")}
              disabled={!canVote || pending}
              onClick={() => onVote(choice)}
            >
              {CHOICE_LABEL[choice]}
            </Button>
          );
        })}
      </div>

      <div className="mt-6">
        <ResultsMeter result={question.result} mode={mode} />
      </div>

      {showLedger ? (
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-medium text-muted hover:text-foreground">
            Кто как проголосовал ({question.ledger.length})
          </summary>
          <div className="mt-3">
            <LedgerTable rows={question.ledger} />
          </div>
        </details>
      ) : null}
        </>
      )}
    </article>
  );
}
