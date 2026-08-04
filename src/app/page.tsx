"use client";

import Link from "next/link";
import { ClientCard } from "@/components/ClientCard";
import { CheckInList } from "@/components/CheckInList";
import { useCoach } from "@/lib/coach-context";
import {
  checkInsForClient,
  clientsNeedingCheckIn,
  formatWeekLabel,
  recentCheckIns,
} from "@/lib/utils";

export default function DashboardPage() {
  const { clients, checkIns, ready, error, resetData } = useCoach();

  if (!ready) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  if (error) {
    return (
      <p className="border border-line bg-surface px-5 py-6 text-sm text-signal">
        Could not load data: {error}
      </p>
    );
  }

  const needing = clientsNeedingCheckIn(clients, checkIns);
  const recent = recentCheckIns(checkIns, 5);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden border border-line bg-surface px-6 py-10 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-12deg, #111418 0 1px, transparent 1px 14px)",
          }}
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">
            Your coaching desk
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Coachbase
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink-muted sm:text-lg">
            Keep your PT roster, weekly check-in notes, and progress in one
            place.
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            <Stat label="Active clients" value={String(clients.length)} />
            <Stat
              label="Check-ins due"
              value={String(needing.length)}
              accent={needing.length > 0}
            />
            <Stat label="Logged check-ins" value={String(checkIns.length)} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Needs check-in
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Clients without a check-in for the current week.
            </p>
          </div>
          <Link
            href="/check-ins"
            className="text-sm font-semibold text-signal hover:underline"
          >
            Log one
          </Link>
        </div>
        {needing.length === 0 ? (
          <p className="border border-line bg-surface px-5 py-6 text-sm text-ink-muted">
            Everyone is caught up for this week.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {needing.map((client) => {
              const last = checkInsForClient(checkIns, client.id)[0];
              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  needsCheckIn
                  lastCheckInLabel={
                    last ? formatWeekLabel(last.weekOf) : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Recent check-ins
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Latest notes across your roster.
            </p>
          </div>
          <Link
            href="/clients"
            className="text-sm font-semibold text-ink hover:text-signal"
          >
            View roster
          </Link>
        </div>
        <CheckInList checkIns={recent} clients={clients} />
      </section>

      <div className="border-t border-line pt-6">
        <button
          type="button"
          onClick={() => {
            void resetData();
          }}
          className="text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-display text-3xl font-bold tracking-tight ${
          accent ? "text-signal" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
    </div>
  );
}
