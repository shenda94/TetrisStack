// lib/schema.ts
import { getDB } from "./dbtetris";

export async function createScoreHis() {
    const db = await getDB();

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS t_score_his (
      id TEXT PRIMARY KEY,
      id_user TEXT NOT NULL,
      level TEXT NOT NULL,
      created_at TEXT NOT NULL,
      score_terkini TEXT
    )
  `);
}