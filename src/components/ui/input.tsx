import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-150",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
