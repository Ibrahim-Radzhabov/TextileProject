import { promises as fs } from "node:fs";

const E2E_DB_PATH = "/tmp/store-platform-e2e.sqlite3";

async function removeIfExists(path: string) {
  try {
    await fs.rm(path, { force: true });
  } catch {
    // No-op: the db file may not exist yet.
  }
}

export default async function globalSetup() {
  await removeIfExists(E2E_DB_PATH);
}
