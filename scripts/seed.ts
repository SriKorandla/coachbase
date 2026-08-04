import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { CLIENTS, SEED_CHECK_INS } from "../src/lib/data";
import * as schema from "../src/db/schema";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./data/coachbase.db";
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  await client.executeMultiple(`
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

  await db.delete(schema.checkIns);
  await db.delete(schema.clients);

  await db.insert(schema.clients).values(
    CLIENTS.map((c) => ({
      id: c.id,
      name: c.name,
      goal: c.goal,
      startDate: c.startDate,
      notes: c.notes ?? null,
    }))
  );

  await db.insert(schema.checkIns).values(
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

  console.log(
    `Seeded ${CLIENTS.length} clients and ${SEED_CHECK_INS.length} check-ins → ${url}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
