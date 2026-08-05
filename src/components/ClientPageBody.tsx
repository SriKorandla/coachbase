"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Client } from "@/lib/types";

type Props = {
  client: Client;
  onSaved: (client: Client) => void;
};

export function ClientPageBody({ client, onSaved }: Props) {
  const [value, setValue] = useState(client.pageBody ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(client.pageBody ?? "");
    setEditing(false);
  }, [client.id, client.pageBody]);

  const dirty = value !== (client.pageBody ?? "");
  const content = client.pageBody?.trim() ?? "";

  async function handleSave() {
    if (saving || !dirty) return;
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
      setEditing(false);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(client.pageBody ?? "");
    setEditing(false);
    setError(null);
  }

  return (
    <div className="border border-line bg-surface p-5 sm:p-6">
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
          ) : null}
          {editing ? (
            <>
              {dirty ? (
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Unsaved
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !dirty}
                onClick={() => void handleSave()}
                className="bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-signal"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={10}
          placeholder={"## Current block\nWrite cues, plans, reminders…"}
          className="mt-4 w-full resize-y border border-line bg-paper px-3 py-3 font-mono text-sm leading-relaxed outline-none focus:border-ink"
        />
      ) : content ? (
        <div className="markdown-body mt-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="mt-4 border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted">
          No page content yet. Click Edit to add notes.
        </p>
      )}
    </div>
  );
}
