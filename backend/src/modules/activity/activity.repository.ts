import { desc, notInArray } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import { activityLogs } from "@/shared/database/schema/schema.js";
import type { ActivityLog, NewActivityLog } from "@/shared/database/schema/types.js";

async function list(limit = 50): Promise<ActivityLog[]> {
  return db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.time))
    .limit(limit);
}

async function create(input: NewActivityLog): Promise<ActivityLog> {
  const rows = await db.insert(activityLogs).values(input).returning();
  return rows[0]!;
}

async function pruneToLatest(keep = 50): Promise<void> {
  const latest = await db
    .select({ id: activityLogs.id })
    .from(activityLogs)
    .orderBy(desc(activityLogs.time))
    .limit(keep);
  if (latest.length < keep) return;
  await db
    .delete(activityLogs)
    .where(
      notInArray(
        activityLogs.id,
        latest.map((row) => row.id),
      ),
    );
}

export const activityRepository = { list, create, pruneToLatest };
