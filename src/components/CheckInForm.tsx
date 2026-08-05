"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useCoach } from "@/lib/coach-context";
import type { CheckIn, CheckInInput, Rating } from "@/lib/types";
import { currentWeekOf } from "@/lib/utils";

type Props = {
  defaultClientId?: string;
  initial?: CheckIn;
  onSaved?: () => void;
  onCancel?: () => void;
};

const ratings: Rating[] = [1, 2, 3, 4, 5];

export function CheckInForm({
  defaultClientId,
  initial,
  onSaved,
  onCancel,
}: Props) {
  const { clients, addCheckIn, saveCheckIn } = useCoach();
  const editing = Boolean(initial);

  const [clientId, setClientId] = useState(
    initial?.clientId ?? defaultClientId ?? clients[0]?.id ?? ""
  );
  const [weekOf, setWeekOf] = useState(initial?.weekOf ?? currentWeekOf());
  const [bodyWeightLbs, setBodyWeightLbs] = useState(
    initial ? String(initial.bodyWeightLbs) : "160"
  );
  const [energy, setEnergy] = useState<Rating>(initial?.energy ?? 4);
  const [sleep, setSleep] = useState<Rating>(initial?.sleep ?? 4);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [squatEst1rm, setSquatEst1rm] = useState(
    initial?.squatEst1rm != null ? String(initial.squatEst1rm) : ""
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const lockedClient = Boolean(defaultClientId) || editing;

  useEffect(() => {
    if (initial) {
      setClientId(initial.clientId);
      setWeekOf(initial.weekOf);
      setBodyWeightLbs(String(initial.bodyWeightLbs));
      setEnergy(initial.energy);
      setSleep(initial.sleep);
      setNotes(initial.notes);
      setSquatEst1rm(
        initial.squatEst1rm != null ? String(initial.squatEst1rm) : ""
      );
      return;
    }
    if (defaultClientId) setClientId(defaultClientId);
    else if (!clientId && clients[0]) setClientId(clients[0].id);
  }, [defaultClientId, clients, clientId, initial]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId || !notes.trim() || saving) return;

    const input: CheckInInput = {
      clientId,
      weekOf,
      bodyWeightLbs: Number(bodyWeightLbs) || 0,
      energy,
      sleep,
      notes: notes.trim(),
      squatEst1rm: squatEst1rm ? Number(squatEst1rm) : undefined,
    };

    setSaving(true);
    setFormError(null);
    try {
      if (initial) {
        await saveCheckIn(initial.id, input);
      } else {
        await addCheckIn(input);
        setNotes("");
      }
      setSaved(true);
      onSaved?.();
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
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
          {editing ? "Edit check-in" : "Log check-in"}
        </h2>
        <div className="flex items-center gap-3">
          {saved ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-ok">
              Saved
            </span>
          ) : null}
          {editing && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
      {formError ? (
        <p className="mt-3 text-sm text-signal">{formError}</p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {!lockedClient ? (
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Client
            </span>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Week of
          </span>
          <input
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Body weight (lb)
          </span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={bodyWeightLbs}
            onChange={(e) => setBodyWeightLbs(e.target.value)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Energy (1–5)
          </span>
          <select
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value) as Rating)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {ratings.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Sleep (1–5)
          </span>
          <select
            value={sleep}
            onChange={(e) => setSleep(Number(e.target.value) as Rating)}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {ratings.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Est. squat 1RM (lb, optional)
          </span>
          <input
            type="number"
            step="1"
            min="0"
            value={squatEst1rm}
            onChange={(e) => setSquatEst1rm(e.target.value)}
            placeholder="e.g. 225"
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How did the week go? Wins, issues, adjustments…"
            className="mt-1.5 w-full resize-y border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-60"
      >
        {saving ? "Saving…" : editing ? "Update check-in" : "Save check-in"}
      </button>
    </form>
  );
}
