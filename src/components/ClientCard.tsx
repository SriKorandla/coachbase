import Link from "next/link";
import type { Client } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

type Props = {
  client: Client;
  needsCheckIn?: boolean;
  lastCheckInLabel?: string;
};

export function ClientCard({ client, needsCheckIn, lastCheckInLabel }: Props) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="group block border border-line bg-surface p-5 transition-colors hover:border-ink"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink group-hover:text-signal">
            {client.name}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">{client.goal}</p>
        </div>
        {needsCheckIn ? (
          <span className="shrink-0 bg-signal-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-signal">
            Due
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span>Started {formatShortDate(client.startDate)}</span>
        {lastCheckInLabel ? <span>Last check-in {lastCheckInLabel}</span> : null}
      </div>
    </Link>
  );
}
