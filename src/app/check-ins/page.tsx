"use client";

import { CheckInForm } from "@/components/CheckInForm";
import { CheckInList } from "@/components/CheckInList";
import { useCoach } from "@/lib/coach-context";
import { recentCheckIns } from "@/lib/utils";

export default function CheckInsPage() {
  const { clients, checkIns, ready } = useCoach();

  if (!ready) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  const feed = recentCheckIns(checkIns, checkIns.length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Check-ins
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Log a weekly check-in for any client, or review the full feed.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CheckInForm />
        </div>
        <div className="lg:col-span-3">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
            All check-ins
          </h2>
          <CheckInList checkIns={feed} clients={clients} />
        </div>
      </div>
    </div>
  );
}
