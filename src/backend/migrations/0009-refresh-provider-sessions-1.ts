import type { DatabaseSync } from "node:sqlite";
import type { EstackMigration } from "./migration";

export function refreshProviderSessionsForDynamicTools(db: DatabaseSync, appliedAt: string): void {
  db.prepare(
    `UPDATE projection_provider_sessions
     SET state = 'inactive', updated_at = ?
     WHERE state = 'active'`,
  ).run(appliedAt);
}

export const migration: EstackMigration = {
  version: 9,
  name: "refresh-provider-sessions-1",
  up: refreshProviderSessionsForDynamicTools,
};
