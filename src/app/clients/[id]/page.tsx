"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckInForm } from "@/components/CheckInForm";
import { CheckInList } from "@/components/CheckInList";
import { ClientLinks } from "@/components/ClientLinks";
import { ClientNotesDb } from "@/components/ClientNotesDb";
import { ClientPageBody } from "@/components/ClientPageBody";
import { DeleteClientButton } from "@/components/DeleteClientButton";
import { ProgressCharts } from "@/components/ProgressCharts";
import { useCoach } from "@/lib/coach-context";
import {
  checkInsForClient,
  clientById,
  formatShortDate,
  hasCheckInThisWeek,
} from "@/lib/utils";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { clients, checkIns, ready, updateClient } = useCoach();

  if (!ready) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  const client = clientById(clients, params.id);
  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Client not found</h1>
        <Link href="/clients" className="text-sm font-semibold text-signal">
          Back to roster
        </Link>
      </div>
    );
  }

  const clientCheckIns = checkInsForClient(checkIns, client.id);
  const due = !hasCheckInThisWeek(checkIns, client.id);

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/clients"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
        >
          ← Roster
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {client.name}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-ink-muted">
              {client.goal}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span>Started {formatShortDate(client.startDate)}</span>
              <span>{clientCheckIns.length} check-ins</span>
            </div>
            {client.notes ? (
              <p className="mt-4 max-w-2xl border-l-2 border-signal pl-3 text-sm text-ink">
                {client.notes}
              </p>
            ) : null}
          </div>
          {due ? (
            <span className="bg-signal-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-signal">
              Check-in due
            </span>
          ) : (
            <span className="border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ok">
              Checked in
            </span>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Workspace
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Page notes, program links, and a notes database for this client.
          </p>
        </div>
        <ClientPageBody client={client} onSaved={updateClient} />
        <ClientLinks clientId={client.id} />
        <ClientNotesDb clientId={client.id} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">
          Progress
        </h2>
        <ProgressCharts checkIns={clientCheckIns} />
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <CheckInForm defaultClientId={client.id} />
        </section>
        <section className="lg:col-span-3">
          <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">
            Check-in history
          </h2>
          <CheckInList
            checkIns={clientCheckIns}
            clients={clients}
            showClientName={false}
            emptyMessage="No check-ins for this client yet."
          />
        </section>
      </div>
    </div>
  );
}
