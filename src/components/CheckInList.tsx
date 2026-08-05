"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckInForm } from "@/components/CheckInForm";
import { useCoach } from "@/lib/coach-context";
import type { CheckIn, Client } from "@/lib/types";
import { clientById, formatWeekLabel } from "@/lib/utils";

type Props = {
  checkIns: CheckIn[];
  clients: Client[];
  showClientName?: boolean;
  emptyMessage?: string;
};

export function CheckInList({
  checkIns,
  clients,
  showClientName = true,
  emptyMessage = "No check-ins yet.",
}: Props) {
  const { removeCheckIn } = useCoach();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await removeCheckIn(id);
      setConfirmDeleteId(null);
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  if (checkIns.length === 0) {
    return (
      <p className="border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-signal">{error}</p> : null}
      <ul className="divide-y divide-line border border-line bg-surface">
        {checkIns.map((ci) => {
          const client = clientById(clients, ci.clientId);
          if (editingId === ci.id) {
            return (
              <li key={ci.id} className="p-4">
                <CheckInForm
                  initial={ci}
                  onSaved={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            );
          }

          return (
            <li key={ci.id} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {showClientName && client ? (
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-display text-base font-semibold tracking-tight text-ink hover:text-signal"
                    >
                      {client.name}
                    </Link>
                  ) : null}
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Week of {formatWeekLabel(ci.weekOf)}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-ink-muted">
                  <span>{ci.bodyWeightLbs} lb</span>
                  <span>E{ci.energy}</span>
                  <span>S{ci.sleep}</span>
                  {ci.squatEst1rm != null ? (
                    <span>Sq {ci.squatEst1rm}</span>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink">{ci.notes}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(ci.id);
                    setConfirmDeleteId(null);
                  }}
                  className="font-semibold text-ink-muted hover:text-ink"
                >
                  Edit
                </button>
                {confirmDeleteId === ci.id ? (
                  <>
                    <span className="text-ink-muted">Delete this check-in?</span>
                    <button
                      type="button"
                      disabled={busyId === ci.id}
                      onClick={() => void handleDelete(ci.id)}
                      className="font-semibold text-signal disabled:opacity-60"
                    >
                      {busyId === ci.id ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="font-semibold text-ink-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(ci.id)}
                    className="font-semibold text-ink-muted hover:text-signal"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
