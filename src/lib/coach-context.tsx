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
import type {
  CheckIn,
  CheckInInput,
  Client,
  ClientCreateInput,
} from "@/lib/types";

type CoachStore = {
  clients: Client[];
  checkIns: CheckIn[];
  ready: boolean;
  error: string | null;
  addCheckIn: (input: CheckInInput) => Promise<void>;
  addClient: (input: ClientCreateInput) => Promise<Client>;
  removeClient: (id: string) => Promise<void>;
  updateClient: (client: Client) => void;
  resetData: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CoachContext = createContext<CoachStore | null>(null);

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
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

  const addCheckIn = useCallback(async (input: CheckInInput) => {
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
  }, []);

  const addClient = useCallback(async (input: ClientCreateInput) => {
    const created = await fetchJson<Client>("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    setClients((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    return created;
  }, []);

  const removeClient = useCallback(async (id: string) => {
    await fetchJson<{ ok: boolean }>(`/api/clients/${id}`, {
      method: "DELETE",
    });
    setClients((prev) => prev.filter((c) => c.id !== id));
    setCheckIns((prev) => prev.filter((c) => c.clientId !== id));
  }, []);

  const updateClient = useCallback((client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  }, []);

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
      addClient,
      removeClient,
      updateClient,
      resetData,
      refresh,
    }),
    [
      clients,
      checkIns,
      ready,
      error,
      addCheckIn,
      addClient,
      removeClient,
      updateClient,
      resetData,
      refresh,
    ]
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
