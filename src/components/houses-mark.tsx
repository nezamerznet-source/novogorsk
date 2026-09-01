import { cn } from "@/lib/utils";

export function HousesMark({
  className,
  title = "Новогорск Курорт",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 72 36"
      className={cn("text-primary", className)}
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M4 32V18 L14 9 L24 18 V32 H4Z" />
        <path d="M13 32 V24 H15 V32" fill="currentColor" />
        <path d="M26 32 V16 L36 6 L46 16 V32 H26Z" />
        <path d="M35 32 V23 H37 V32" fill="currentColor" />
        <path d="M48 32 V19 L58 10 L68 19 V32 H48Z" />
        <path d="M57 32 V25 H59 V32" fill="currentColor" />
      </g>
    </svg>
  );
}
