"use client";

import { useMemo, useState } from "react";
import { ClientCard } from "@/components/ClientCard";
import { useCoach } from "@/lib/coach-context";
import {
  checkInsForClient,
  formatWeekLabel,
  hasCheckInThisWeek,
} from "@/lib/utils";

export default function ClientsPage() {
  const { clients, checkIns, ready } = useCoach();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q) ||
        (c.notes?.toLowerCase().includes(q) ?? false)
    );
  }, [clients, query]);

  if (!ready) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Clients
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Your PT roster. Open a client for check-ins and progress charts.
        </p>
      </div>

      <label className="block max-w-md">
        <span className="sr-only">Search clients</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or goal…"
          className="w-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-ink-muted">
          No clients match “{query}”.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((client) => {
            const last = checkInsForClient(checkIns, client.id)[0];
            return (
              <ClientCard
                key={client.id}
                client={client}
                needsCheckIn={!hasCheckInThisWeek(checkIns, client.id)}
                lastCheckInLabel={
                  last ? formatWeekLabel(last.weekOf) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
