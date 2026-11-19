import { refreshProviderSessionsForDynamicTools } from "./0009-refresh-provider-sessions-1";
import type { EstackMigration } from "./migration";

export const migration: EstackMigration = {
  version: 14,
  name: "refresh-provider-sessions-4",
  up: refreshProviderSessionsForDynamicTools,
};
