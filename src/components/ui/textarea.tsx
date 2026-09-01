import { type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-sm text-foreground",
        "placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-150",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
