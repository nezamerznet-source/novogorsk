import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { HousesMark } from "@/components/houses-mark";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/voting";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUserState();
  const me = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe(),
    enabled: Boolean(user),
    retry: false,
  });
  const isCouncil = me.data?.owner?.role === "council";
  const nav = [
    { to: "/", label: "Собрания" },
    ...(isCouncil ? [{ to: "/roll", label: "Реестр" }] : []),
    { to: "/create", label: "Новое" },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="no-print sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <HousesMark className="h-8 w-16" />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-base font-semibold tracking-tight text-foreground">
                  Открытое собрание
                </span>
                <span className="text-xs text-muted">Новогорск Курорт</span>
              </span>
            </Link>
            <AuthSlot />
          </div>
          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-11 flex-1 items-center justify-center rounded-sm px-3 text-sm transition-colors duration-150 sm:flex-none",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-card hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="no-print border-t border-border px-4 py-6 text-center text-xs text-muted sm:px-6">
        Неофициальный сервис собственников ЖК «Новогорск Курорт». Не заменяет
        собрание по ЖК РФ и протокол УК — нужен, чтобы сверить реальное мнение
        двора.
      </footer>
    </div>
  );
}
