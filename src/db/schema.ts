import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  startDate: text("start_date").notNull(),
  notes: text("notes"),
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
