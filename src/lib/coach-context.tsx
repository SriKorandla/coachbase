"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CheckIn, CheckInInput, Client } from "@/lib/types";

type CoachStore = {
  clients: Client[];
  checkIns: CheckIn[];
  ready: boolean;
  error: string | null;
  addCheckIn: (input: CheckInInput) => Promise<void>;
  resetData: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CoachContext = createContext<CoachStore | null>(null);

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function CoachProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextClients, nextCheckIns] = await Promise.all([
      fetchJson<Client[]>("/api/clients"),
      fetchJson<CheckIn[]>("/api/check-ins"),
    ]);
    setClients(nextClients);
    setCheckIns(nextCheckIns);
    setError(null);
  }, []);

  useEffect(() => {
    refresh()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => setReady(true));
  }, [refresh]);

  const addCheckIn = useCallback(
    async (input: CheckInInput) => {
      const saved = await fetchJson<CheckIn>("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setCheckIns((prev) => {
        const withoutDup = prev.filter(
          (c) => !(c.clientId === saved.clientId && c.weekOf === saved.weekOf)
        );
        return [saved, ...withoutDup];
      });
    },
    []
  );

  const resetData = useCallback(async () => {
    const data = await fetchJson<{ clients: Client[]; checkIns: CheckIn[] }>(
      "/api/reset",
      { method: "POST" }
    );
    setClients(data.clients);
    setCheckIns(data.checkIns);
  }, []);

  const value = useMemo(
    () => ({
      clients,
      checkIns,
      ready,
      error,
      addCheckIn,
      resetData,
      refresh,
    }),
    [clients, checkIns, ready, error, addCheckIn, resetData, refresh]
  );

  return (
    <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
  );
}

export function useCoach() {
  const ctx = useContext(CoachContext);
  if (!ctx) throw new Error("useCoach must be used within CoachProvider");
  return ctx;
}
