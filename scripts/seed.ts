import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  CLIENTS,
  SEED_CHECK_INS,
  SEED_LINKS,
  SEED_NOTES,
} from "../src/lib/data";
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
      notes TEXT,
      page_body TEXT
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
    CREATE TABLE IF NOT EXISTS client_links (
      id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS client_notes (
      id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  try {
    await client.execute("ALTER TABLE clients ADD COLUMN page_body TEXT");
  } catch {
    // already present
  }

  await db.delete(schema.clientNotes);
  await db.delete(schema.clientLinks);
  await db.delete(schema.checkIns);
  await db.delete(schema.clients);

  const now = new Date().toISOString();

  await db.insert(schema.clients).values(
    CLIENTS.map((c) => ({
      id: c.id,
      name: c.name,
      goal: c.goal,
      startDate: c.startDate,
      notes: c.notes ?? null,
      pageBody: c.pageBody ?? null,
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

  await db.insert(schema.clientLinks).values(
    SEED_LINKS.map((l) => ({
      id: l.id,
      clientId: l.clientId,
      label: l.label,
      url: l.url,
      sortOrder: l.sortOrder,
      createdAt: now,
    }))
  );

  await db.insert(schema.clientNotes).values(
    SEED_NOTES.map((n) => ({
      id: n.id,
      clientId: n.clientId,
      title: n.title,
      body: n.body,
      createdAt: now,
      updatedAt: now,
    }))
  );

  console.log(
    `Seeded ${CLIENTS.length} clients, ${SEED_CHECK_INS.length} check-ins, ${SEED_LINKS.length} links, ${SEED_NOTES.length} notes → ${url}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
