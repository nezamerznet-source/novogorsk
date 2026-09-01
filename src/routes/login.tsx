import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizePhone } from "@/lib/format";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <div className="mx-auto h-80 max-w-md animate-pulse rounded-xl bg-border/80" />;
  }
  if (user) {
    return <Navigate to="/profile" />;
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        if (!normalizePhone(phone)) {
          throw new Error("Укажите телефон: +7 999 123-45-67");
        }
        const { error: err } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim(),
        });
        if (err) throw new Error(err.message ?? "Не удалось зарегистрироваться");
        try {
          sessionStorage.setItem("novogorsk-owner-phone", phone.trim());
        } catch {
          /* ignore */
        }
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (err) throw new Error(err.message ?? "Неверный email или пароль");
      }
      await authClient.getSession();
      await navigate({ to: "/profile" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Собственник
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {mode === "in" ? "Войти" : "Регистрация"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          После входа укажите корпус, квартиру и телефон — и сможете голосовать.
          Список соседей видит только совет дома.
        </p>
      </div>

      {!authEnabled ? (
        <p className="text-sm text-muted">Вход временно выключен.</p>
      ) : (
        <form onSubmit={(e) => void onEmail(e)} className="space-y-3 rounded-xl border border-border bg-surface p-5">
          {mode === "up" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Иван Петров"
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@mail.ru"
            />
          </div>
          {mode === "up" ? (
            <div className="space-y-1.5">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+7 999 123-45-67"
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </div>
          {error ? <p className="text-sm text-against">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Подождите…" : mode === "in" ? "Войти" : "Создать аккаунт"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted hover:text-foreground"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
            }}
          >
            {mode === "in" ? "Нет аккаунта — зарегистрироваться" : "Уже есть аккаунт — войти"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-subtle">
        <Link to="/" className="hover:text-foreground">
          На главную
        </Link>
      </p>
    </div>
  );
}
