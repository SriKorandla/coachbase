import { createClient, type Client as LibsqlClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function databaseUrl() {
  return process.env.DATABASE_URL ?? "file:./data/coachbase.db";
}

declare global {
  // eslint-disable-next-line no-var
  var __coachbaseLibsql: LibsqlClient | undefined;
}

function getClient() {
  if (!globalThis.__coachbaseLibsql) {
    globalThis.__coachbaseLibsql = createClient({
      url: databaseUrl(),
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return globalThis.__coachbaseLibsql;
}

export const libsql = getClient();
export const db = drizzle(libsql, { schema });
