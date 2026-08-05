"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ClientLink } from "@/lib/types";

type Props = {
  clientId: string;
};

export function ClientLinks({ clientId }: Props) {
  const [links, setLinks] = useState<ClientLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/links`);
      if (!res.ok) throw new Error("Failed to load links");
      setLinks((await res.json()) as ClientLink[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load links");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !url.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Failed to add link");
      }
      const created = (await res.json()) as ClientLink;
      setLinks((prev) => [...prev, created]);
      setLabel("");
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(linkId: string) {
    if (!editLabel.trim() || !editUrl.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel, url: editUrl }),
      });
      if (!res.ok) throw new Error("Failed to update link");
      const updated = (await res.json()) as ClientLink;
      setLinks((prev) => prev.map((l) => (l.id === linkId ? updated : l)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update link");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(linkId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/links/${linkId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete link");
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete link");
    }
  }

  return (
    <section className="border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Links
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Program sheets, docs, and other resources.
      </p>

      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading…</p>
      ) : links.length === 0 ? (
        <p className="mt-4 border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
          No links yet. Add a Google Sheet program below.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border border-line">
          {links.map((link) => (
            <li key={link.id} className="px-4 py-3">
              {editingId === link.id ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                    placeholder="Label"
                  />
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                    placeholder="https://"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleUpdate(link.id)}
                      className="bg-ink px-3 py-2 text-xs font-semibold text-paper"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="border border-line px-3 py-2 text-xs font-semibold text-ink-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink hover:text-signal"
                  >
                    {link.label}
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      ↗
                    </span>
                  </a>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(link.id);
                        setEditLabel(link.label);
                        setEditUrl(link.url);
                      }}
                      className="font-semibold text-ink-muted hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(link.id)}
                      className="font-semibold text-ink-muted hover:text-signal"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-4 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Training sheet"
          className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          required
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/…"
          className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add link"}
        </button>
      </form>
    </section>
  );
}
