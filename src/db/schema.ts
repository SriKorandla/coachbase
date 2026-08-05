import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  startDate: text("start_date").notNull(),
  notes: text("notes"),
  pageBody: text("page_body"),
});

export const checkIns = sqliteTable("check_ins", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  weekOf: text("week_of").notNull(),
  bodyWeightLbs: real("body_weight_lbs").notNull(),
  energy: integer("energy").notNull(),
  sleep: integer("sleep").notNull(),
  notes: text("notes").notNull(),
  squatEst1rm: real("squat_est_1rm"),
  createdAt: text("created_at").notNull(),
});

export const clientLinks = sqliteTable("client_links", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const clientNotes = sqliteTable("client_notes", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
