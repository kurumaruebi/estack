import { withTransaction } from "../database/sqlite-transaction";
import type { EstackDatabase } from "../estack-database";

/**
 * Runs `work` in one SQLite transaction. Inside a transaction that is open already, such as a run
 * start that also keeps its version and its first steps, it runs in that one, as `dispatch` does.
 */
export function workflowTransaction<T>(database: EstackDatabase, work: () => T): T {
  return withTransaction(database.connection, work);
}
