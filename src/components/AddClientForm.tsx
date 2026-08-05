"use client";

import { useState, type FormEvent } from "react";
import { useCoach } from "@/lib/coach-context";

type Props = {
  onCreated?: () => void;
  onCancel?: () => void;
};

export function AddClientForm({ onCreated, onCancel }: Props) {
  const { addClient } = useCoach();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !goal.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await addClient({
        name,
        goal,
        startDate,
        notes: notes.trim() || undefined,
      });
      setName("");
      setGoal("");
      setNotes("");
      setStartDate(new Date().toISOString().slice(0, 10));
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          New client
        </h2>
        <button
          type="button"
          onClick={() => onCancel?.()}
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
            placeholder="e.g. Add 20 lb to squat"
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
            Profile notes (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Schedule prefs, injuries, constraints…"
            className="mt-1.5 w-full resize-y border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-60"
      >
        {saving ? "Adding…" : "Add to roster"}
      </button>
    </form>
  );
}
