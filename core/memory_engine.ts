import { Database } from "bun:sqlite";

export interface SessionSummary {
  session_id: string;
  domain: string;
  key_decisions: string;
  semantic_tags: string;
}

export class EpistemicMemoryEngine {
  private db: Database;

  constructor(dbPath: string = "sab_memory.db") {
    this.db = new Database(dbPath);
    this.initializeDb();
  }

  private initializeDb() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS epistemic_facts (
        session_id TEXT PRIMARY KEY,
        domain TEXT NOT NULL,
        key_decisions TEXT NOT NULL,
        semantic_tags TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public archiveSession(summary: SessionSummary) {
    const query = this.db.query(`
      INSERT INTO epistemic_facts (session_id, domain, key_decisions, semantic_tags)
      VALUES (?, ?, ?, ?)
    `);
    query.run(summary.session_id, summary.domain, summary.key_decisions, summary.semantic_tags);
    console.log(`[Memory] Session archived: ${summary.session_id}`);
  }

  public getMemoryFlash(domain: string): string[] {
    const query = this.db.query(`
      SELECT key_decisions FROM epistemic_facts WHERE domain = ? ORDER BY created_at DESC LIMIT 3
    `);
    const results = query.all(domain) as { key_decisions: string }[];
    return results.map((r) => r.key_decisions);
  }
}
