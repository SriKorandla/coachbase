"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { ClientNote } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

type Props = {
  clientId: string;
};

export function ClientNotesDb({ clientId }: Props) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`);
      if (!res.ok) throw new Error("Failed to load notes");
      setNotes((await res.json()) as ClientNote[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }, [notes, query]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) {
      setTitle(selected.title);
      setBody(selected.body);
      setCreating(false);
    }
  }, [selected]);

  function startCreate() {
    setCreating(true);
    setSelectedId(null);
    setTitle("");
    setBody("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (creating || !selectedId) {
        const res = await fetch(`/api/clients/${clientId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        });
        if (!res.ok) throw new Error("Failed to create note");
        const note = (await res.json()) as ClientNote;
        setNotes((prev) => [note, ...prev]);
        setSelectedId(note.id);
        setCreating(false);
      } else {
        const res = await fetch(
          `/api/clients/${clientId}/notes/${selectedId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body }),
          }
        );
        if (!res.ok) throw new Error("Failed to update note");
        const note = (await res.json()) as ClientNote;
        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/clients/${clientId}/notes/${selectedId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((n) => n.id !== selectedId));
      setSelectedId(null);
      setCreating(false);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  }

  const showEditor = creating || selected != null;

  return (
    <section className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Notes
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            A searchable database of coaching notes for this client.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal"
        >
          New note
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
          {loading ? (
            <p className="mt-4 text-sm text-ink-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="mt-4 border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
              {notes.length === 0 ? "No notes yet." : "No matches."}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line border border-line">
              {filtered.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(note.id);
                      setCreating(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-paper ${
                      selectedId === note.id ? "bg-paper" : ""
                    }`}
                  >
                    <p className="font-medium text-ink">{note.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
                      {note.body}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-muted">
                      Updated {formatShortDate(note.updatedAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          {showEditor ? (
            <form onSubmit={handleSave} className="border border-line p-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="w-full border border-line bg-paper px-3 py-2 font-display text-lg font-semibold outline-none focus:border-ink"
                required
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Write the note…"
                className="mt-3 w-full resize-y border border-line bg-paper px-3 py-3 text-sm leading-relaxed outline-none focus:border-ink"
                required
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal disabled:opacity-60"
                >
                  {saving ? "Saving…" : creating ? "Create note" : "Save note"}
                </button>
                {!creating && selectedId ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    className="border border-line px-4 py-2 text-sm font-semibold text-ink-muted hover:text-signal"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="flex h-full min-h-40 items-center justify-center border border-dashed border-line px-4 text-center text-sm text-ink-muted">
              Select a note or create a new one.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
