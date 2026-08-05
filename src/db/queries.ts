import { and, asc, desc, eq } from "drizzle-orm";
import { db, libsql } from "@/db";
import { checkIns, clientLinks, clientNotes, clients } from "@/db/schema";
import {
  CLIENTS,
  SEED_CHECK_INS,
  SEED_LINKS,
  SEED_NOTES,
} from "@/lib/data";
import type {
  CheckIn,
  CheckInInput,
  Client,
  ClientCreateInput,
  ClientLink,
  ClientLinkInput,
  ClientNote,
  ClientNoteInput,
  Rating,
} from "@/lib/types";

function mapClient(row: typeof clients.$inferSelect): Client {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    startDate: row.startDate,
    notes: row.notes ?? undefined,
    pageBody: row.pageBody ?? undefined,
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

function mapLink(row: typeof clientLinks.$inferSelect): ClientLink {
  return {
    id: row.id,
    clientId: row.clientId,
    label: row.label,
    url: row.url,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

function mapNote(row: typeof clientNotes.$inferSelect): ClientNote {
  return {
    id: row.id,
    clientId: row.clientId,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function tryAlter(sql: string) {
  try {
    await libsql.execute(sql);
  } catch {
    // Column/table already exists on older local DBs
  }
}

export async function ensureSchema() {
  await libsql.executeMultiple(`
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
  await tryAlter("ALTER TABLE clients ADD COLUMN page_body TEXT");
}

function seedTimestamp(offsetHours = 0) {
  const d = new Date();
  d.setHours(d.getHours() - offsetHours);
  return d.toISOString();
}

async function insertSeedWorkspace() {
  await db.insert(clientLinks).values(
    SEED_LINKS.map((l) => ({
      id: l.id,
      clientId: l.clientId,
      label: l.label,
      url: l.url,
      sortOrder: l.sortOrder,
      createdAt: seedTimestamp(),
    }))
  );

  await db.insert(clientNotes).values(
    SEED_NOTES.map((n, i) => {
      const ts = seedTimestamp(i * 12);
      return {
        id: n.id,
        clientId: n.clientId,
        title: n.title,
        body: n.body,
        createdAt: ts,
        updatedAt: ts,
      };
    })
  );
}

async function insertSeedClientsAndCheckIns() {
  await db.insert(clients).values(
    CLIENTS.map((c) => ({
      id: c.id,
      name: c.name,
      goal: c.goal,
      startDate: c.startDate,
      notes: c.notes ?? null,
      pageBody: c.pageBody ?? null,
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

  await insertSeedWorkspace();
}

export async function seedIfEmpty() {
  await ensureSchema();
  const existing = await db.select({ id: clients.id }).from(clients).limit(1);
  if (existing.length > 0) return;
  await insertSeedClientsAndCheckIns();
}

export async function resetAndSeed() {
  await ensureSchema();
  await db.delete(clientNotes);
  await db.delete(clientLinks);
  await db.delete(checkIns);
  await db.delete(clients);
  await insertSeedClientsAndCheckIns();
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

export async function createClient(
  input: ClientCreateInput
): Promise<Client> {
  await seedIfEmpty();
  const startDate =
    input.startDate?.trim() || new Date().toISOString().slice(0, 10);
  const row = {
    id: `c-${Date.now()}`,
    name: input.name.trim(),
    goal: input.goal.trim(),
    startDate,
    notes: input.notes?.trim() || null,
    pageBody: null as string | null,
  };
  await db.insert(clients).values(row);
  return mapClient(row);
}

export async function deleteClient(id: string): Promise<boolean> {
  await seedIfEmpty();
  const existing = await getClient(id);
  if (!existing) return false;

  await db.delete(clientNotes).where(eq(clientNotes.clientId, id));
  await db.delete(clientLinks).where(eq(clientLinks.clientId, id));
  await db.delete(checkIns).where(eq(checkIns.clientId, id));
  await db.delete(clients).where(eq(clients.id, id));
  return true;
}

export async function updateClientPageBody(
  id: string,
  pageBody: string
): Promise<Client | null> {
  await seedIfEmpty();
  const existing = await getClient(id);
  if (!existing) return null;
  await db
    .update(clients)
    .set({ pageBody })
    .where(eq(clients.id, id));
  return getClient(id);
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

export async function listClientLinks(clientId: string): Promise<ClientLink[]> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clientLinks)
    .where(eq(clientLinks.clientId, clientId))
    .orderBy(asc(clientLinks.sortOrder), asc(clientLinks.createdAt));
  return rows.map(mapLink);
}

export async function createClientLink(
  clientId: string,
  input: ClientLinkInput
): Promise<ClientLink> {
  await seedIfEmpty();
  const existing = await listClientLinks(clientId);
  const row = {
    id: `link-${Date.now()}`,
    clientId,
    label: input.label.trim(),
    url: input.url.trim(),
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: new Date().toISOString(),
  };
  await db.insert(clientLinks).values(row);
  return mapLink(row);
}

export async function updateClientLink(
  clientId: string,
  linkId: string,
  input: Partial<ClientLinkInput>
): Promise<ClientLink | null> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clientLinks)
    .where(and(eq(clientLinks.id, linkId), eq(clientLinks.clientId, clientId)))
    .limit(1);
  if (!rows[0]) return null;

  const next = {
    label: input.label?.trim() ?? rows[0].label,
    url: input.url?.trim() ?? rows[0].url,
    sortOrder: input.sortOrder ?? rows[0].sortOrder,
  };
  await db
    .update(clientLinks)
    .set(next)
    .where(eq(clientLinks.id, linkId));
  return mapLink({ ...rows[0], ...next });
}

export async function deleteClientLink(
  clientId: string,
  linkId: string
): Promise<boolean> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clientLinks)
    .where(and(eq(clientLinks.id, linkId), eq(clientLinks.clientId, clientId)))
    .limit(1);
  if (!rows[0]) return false;
  await db.delete(clientLinks).where(eq(clientLinks.id, linkId));
  return true;
}

export async function listClientNotes(clientId: string): Promise<ClientNote[]> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clientNotes)
    .where(eq(clientNotes.clientId, clientId))
    .orderBy(desc(clientNotes.updatedAt));
  return rows.map(mapNote);
}

export async function createClientNote(
  clientId: string,
  input: ClientNoteInput
): Promise<ClientNote> {
  await seedIfEmpty();
  const now = new Date().toISOString();
  const row = {
    id: `note-${Date.now()}`,
    clientId,
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(clientNotes).values(row);
  return mapNote(row);
}

export async function updateClientNote(
  clientId: string,
  noteId: string,
  input: Partial<ClientNoteInput>
): Promise<ClientNote | null> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clientNotes)
    .where(and(eq(clientNotes.id, noteId), eq(clientNotes.clientId, clientId)))
    .limit(1);
  if (!rows[0]) return null;

  const next = {
    title: input.title?.trim() ?? rows[0].title,
    body: input.body?.trim() ?? rows[0].body,
    updatedAt: new Date().toISOString(),
  };
  await db.update(clientNotes).set(next).where(eq(clientNotes.id, noteId));
  return mapNote({ ...rows[0], ...next });
}

export async function deleteClientNote(
  clientId: string,
  noteId: string
): Promise<boolean> {
  await seedIfEmpty();
  const rows = await db
    .select()
    .from(clientNotes)
    .where(and(eq(clientNotes.id, noteId), eq(clientNotes.clientId, clientId)))
    .limit(1);
  if (!rows[0]) return false;
  await db.delete(clientNotes).where(eq(clientNotes.id, noteId));
  return true;
}
