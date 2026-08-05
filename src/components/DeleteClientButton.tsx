"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCoach } from "@/lib/coach-context";

type Props = {
  clientId: string;
  clientName: string;
};

export function DeleteClientButton({ clientId, clientName }: Props) {
  const { removeClient } = useCoach();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await removeClient(clientId);
      router.push("/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-signal"
      >
        Remove client
      </button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <p className="text-xs text-ink-muted">
        Remove {clientName}? This deletes their workspace, notes, and check-ins.
      </p>
      {error ? <p className="text-xs text-signal">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          className="border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted"
          disabled={deleting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="bg-signal px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-60"
        >
          {deleting ? "Removing…" : "Confirm remove"}
        </button>
      </div>
    </div>
  );
}
