"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "Login failed");
      }
      router.replace(from.startsWith("/") ? from : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <div className="border border-line bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">
          Coach access
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Coachbase
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your password to open the coaching desk.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
              required
            />
          </label>

          {error ? <p className="text-sm text-signal">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-60"
          >
            {saving ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-20 text-center text-sm text-ink-muted">
          Loading…
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
