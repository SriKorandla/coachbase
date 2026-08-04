import type { CheckIn, Client } from "./types";

/** ISO date (YYYY-MM-DD) for Monday of the current week (local). */
export function currentWeekOf(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekOf: string): string {
  const d = new Date(`${weekOf}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function clientById(
  clients: Client[],
  id: string
): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function checkInsForClient(
  checkIns: CheckIn[],
  clientId: string
): CheckIn[] {
  return checkIns
    .filter((c) => c.clientId === clientId)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

export function recentCheckIns(checkIns: CheckIn[], limit = 5): CheckIn[] {
  return [...checkIns]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function clientsNeedingCheckIn(
  clients: Client[],
  checkIns: CheckIn[],
  weekOf = currentWeekOf()
): Client[] {
  const checked = new Set(
    checkIns.filter((c) => c.weekOf === weekOf).map((c) => c.clientId)
  );
  return clients.filter((c) => !checked.has(c.id));
}

export function hasCheckInThisWeek(
  checkIns: CheckIn[],
  clientId: string,
  weekOf = currentWeekOf()
): boolean {
  return checkIns.some((c) => c.clientId === clientId && c.weekOf === weekOf);
}
