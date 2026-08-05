"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useCoach } from "@/lib/coach-context";
import type { Client } from "@/lib/types";

type Props = {
  client: Client;
};

export function EditClientProfile({ client }: Props) {
  const { saveClientProfile } = useCoach();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(client.name);
  const [goal, setGoal] = useState(client.goal);
  const [startDate, setStartDate] = useState(client.startDate);
  const [notes, setNotes] = useState(client.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(client.name);
    setGoal(client.goal);
    setStartDate(client.startDate);
    setNotes(client.notes ?? "");
  }, [client]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !goal.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveClientProfile(client.id, {
        name,
        goal,
        startDate,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
      >
        Edit profile
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="basis-full w-full border border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Edit profile
        </h2>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            setName(client.name);
            setGoal(client.goal);
            setStartDate(client.startDate);
            setNotes(client.notes ?? "");
          }}
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Goal
          </span>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Profile notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-y border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
