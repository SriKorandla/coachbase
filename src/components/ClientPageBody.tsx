"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Client } from "@/lib/types";

type Props = {
  client: Client;
  onSaved: (client: Client) => void;
};

export function ClientPageBody({ client, onSaved }: Props) {
  const [value, setValue] = useState(client.pageBody ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(client.pageBody ?? "");
  }, [client.id, client.pageBody]);

  const dirty = value !== (client.pageBody ?? "");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageBody: value }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Failed to save");
      }
      const updated = (await res.json()) as Client;
      onSaved(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Page
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Freeform notes for this client — cues, block plans, context.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-ok">
              Saved
            </span>
          ) : dirty ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Unsaved
            </span>
          ) : null}
          <button
            type="submit"
            disabled={saving || !dirty}
            className="bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={10}
        placeholder="Write like a Notion page — current block, cues, reminders…"
        className="mt-4 w-full resize-y border border-line bg-paper px-3 py-3 font-mono text-sm leading-relaxed outline-none focus:border-ink"
      />
    </form>
  );
}
