import Link from "next/link";
import type { CheckIn, Client } from "@/lib/types";
import { clientById, formatWeekLabel } from "@/lib/utils";

type Props = {
  checkIns: CheckIn[];
  clients: Client[];
  showClientName?: boolean;
  emptyMessage?: string;
};

export function CheckInList({
  checkIns,
  clients,
  showClientName = true,
  emptyMessage = "No check-ins yet.",
}: Props) {
  if (checkIns.length === 0) {
    return (
      <p className="border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border border-line bg-surface">
      {checkIns.map((ci) => {
        const client = clientById(clients, ci.clientId);
        return (
          <li key={ci.id} className="px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {showClientName && client ? (
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-display text-base font-semibold tracking-tight text-ink hover:text-signal"
                  >
                    {client.name}
                  </Link>
                ) : null}
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Week of {formatWeekLabel(ci.weekOf)}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-ink-muted">
                <span>{ci.bodyWeightLbs} lb</span>
                <span>E{ci.energy}</span>
                <span>S{ci.sleep}</span>
                {ci.squatEst1rm != null ? (
                  <span>Sq {ci.squatEst1rm}</span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink">{ci.notes}</p>
          </li>
        );
      })}
    </ul>
  );
}
