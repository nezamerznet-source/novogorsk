import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);

  if (isPending) {
    return <div className="h-11 w-24 animate-pulse rounded-sm bg-border/80" />;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex h-11 min-w-24 items-center justify-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 active:scale-[0.96] hover:opacity-90"
      >
        Войти
      </Link>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "Собственник";

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="hidden max-w-36 truncate text-sm font-medium text-foreground sm:block"
      >
        {label}
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="h-11"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut("/").catch(() => setSigningOut(false));
        }}
      >
        {signingOut ? "Выходим…" : "Выйти"}
      </Button>
    </div>
  );
}
