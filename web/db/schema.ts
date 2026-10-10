import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One atomic demo aggregate: status, jobs, events, and recent request receipts
// are committed together using a revision compare-and-swap.
export const demoState = sqliteTable("demo_state", {
  id: text("id").primaryKey(),
  revision: integer("revision").notNull(),
  payload: text("payload").notNull(),
});

// Only a hash of the opaque bearer token is stored. Platform identity is
// checked again on every write; selecting a role is explicitly a demo feature.
export const demoSessions = sqliteTable("demo_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  actorId: text("actor_id").notNull(),
  actorName: text("actor_name").notNull(),
  expiresAt: text("expires_at").notNull(),
});
