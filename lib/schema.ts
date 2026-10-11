// lib/schema.ts
import { getDB } from "./dbtetris";

export async function createUserTable() {
    const db = await getDB();

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS t_user (
      id TEXT PRIMARY KEY,
      nm_user TEXT NOT NULL,
      level TEXT NOT NULL,
      created_at TEXT NOT NULL,
      score_terkini TEXT
    )
  `);
}