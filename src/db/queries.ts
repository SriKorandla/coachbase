import { and, desc, eq } from "drizzle-orm";
import { db, libsql } from "@/db";
import { checkIns, clients } from "@/db/schema";
import { CLIENTS, SEED_CHECK_INS } from "@/lib/data";
import type { CheckIn, CheckInInput, Client, Rating } from "@/lib/types";

function mapClient(row: typeof clients.$inferSelect): Client {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    startDate: row.startDate,
    notes: row.notes ?? undefined,
  };
}

function mapCheckIn(row: typeof checkIns.$inferSelect): CheckIn {
  return {
    id: row.id,
    clientId: row.clientId,
    weekOf: row.weekOf,
    bodyWeightLbs: row.bodyWeightLbs,
    energy: row.energy as Rating,
    sleep: row.sleep as Rating,
    notes: row.notes,
    squatEst1rm: row.squatEst1rm ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function ensureSchema() {
  await libsql.executeMultiple(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      goal TEXT NOT NULL,
      start_date TEXT NOT NULL,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      week_of TEXT NOT NULL,
      body_weight_lbs REAL NOT NULL,
      energy INTEGER NOT NULL,
      sleep INTEGER NOT NULL,
      notes TEXT NOT NULL,
      squat_est_1rm REAL,
      created_at TEXT NOT NULL
    );
  `);
}

export async function seedIfEmpty() {
  await ensureSchema();
  const existing = await db.select({ id: clients.id }).from(clients).limit(1);
  if (existing.length > 0) return;

  await db.insert(clients).values(
    CLIENTS.map((c) => ({
      id: c.id,
      name: c.name,
      goal: c.goal,
      startDate: c.startDate,
      notes: c.notes ?? null,
    }))
  );

  await db.insert(checkIns).values(
    SEED_CHECK_INS.map((c) => ({
      id: c.id,
      clientId: c.clientId,
      weekOf: c.weekOf,
      bodyWeightLbs: c.bodyWeightLbs,
      energy: c.energy,
      sleep: c.sleep,
      notes: c.notes,
      squatEst1rm: c.squatEst1rm ?? null,
      createdAt: c.createdAt,
    }))
  );
}

export async function resetAndSeed() {
  await ensureSchema();
  await db.delete(checkIns);
  await db.delete(clients);

  await db.insert(clients).values(
    CLIENTS.map((c) => ({
      id: c.id,
      name: c.name,
      goal: c.goal,
      startDate: c.startDate,
      notes: c.notes ?? null,
    }))
  );

  await db.insert(checkIns).values(
    SEED_CHECK_INS.map((c) => ({
      id: c.id,
      clientId: c.clientId,
      weekOf: c.weekOf,
      bodyWeightLbs: c.bodyWeightLbs,
      energy: c.energy,
      sleep: c.sleep,
      notes: c.notes,
      squatEst1rm: c.squatEst1rm ?? null,
      createdAt: c.createdAt,
    }))
  );
}

export async function listClients(): Promise<Client[]> {
  await seedIfEmpty();
  const rows = await db.select().from(clients).orderBy(clients.name);
  return rows.map(mapClient);
}

export async function getClient(id: string): Promise<Client | null> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);
  return rows[0] ? mapClient(rows[0]) : null;
}

export async function listCheckIns(clientId?: string): Promise<CheckIn[]> {
  await seedIfEmpty();
  const rows = clientId
    ? await db
        .select()
        .from(checkIns)
        .where(eq(checkIns.clientId, clientId))
        .orderBy(desc(checkIns.weekOf))
    : await db.select().from(checkIns).orderBy(desc(checkIns.createdAt));
  return rows.map(mapCheckIn);
}

export async function upsertCheckIn(input: CheckInInput): Promise<CheckIn> {
  await seedIfEmpty();

  const existing = await db
    .select()
    .from(checkIns)
    .where(
      and(
        eq(checkIns.clientId, input.clientId),
        eq(checkIns.weekOf, input.weekOf)
      )
    )
    .limit(1);

  const createdAt = new Date().toISOString();
  const id = existing[0]?.id ?? `ci-${Date.now()}`;

  const row = {
    id,
    clientId: input.clientId,
    weekOf: input.weekOf,
    bodyWeightLbs: input.bodyWeightLbs,
    energy: input.energy,
    sleep: input.sleep,
    notes: input.notes,
    squatEst1rm: input.squatEst1rm ?? null,
    createdAt: existing[0]?.createdAt ?? createdAt,
  };

  if (existing[0]) {
    await db
      .update(checkIns)
      .set({
        bodyWeightLbs: row.bodyWeightLbs,
        energy: row.energy,
        sleep: row.sleep,
        notes: row.notes,
        squatEst1rm: row.squatEst1rm,
      })
      .where(eq(checkIns.id, id));
  } else {
    await db.insert(checkIns).values(row);
  }

  return mapCheckIn(row);
}
