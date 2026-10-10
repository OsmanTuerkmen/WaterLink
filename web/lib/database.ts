import { env } from "cloudflare:workers";

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error("WaterLink requires the DB binding and its migrations.");
  return env.DB;
}
