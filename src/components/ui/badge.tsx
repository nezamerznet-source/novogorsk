import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "open" | "closed" | "draft" | "for" | "against" | "abstain";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide",
        tone === "neutral" && "bg-card text-muted border border-border",
        tone === "open" && "bg-primary text-primary-foreground",
        tone === "closed" && "bg-card text-muted border border-border",
        tone === "draft" && "bg-wash text-muted border border-border",
        tone === "for" && "bg-for text-primary-foreground",
        tone === "against" && "bg-against text-primary-foreground",
        tone === "abstain" && "bg-abstain text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}
