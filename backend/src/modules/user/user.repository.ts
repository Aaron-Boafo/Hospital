import { eq } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import { users } from "@/shared/database/schema/schema.js";
import type { NewUser, User } from "@/shared/database/schema/types.js";

async function findById(id: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

async function findByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, firebaseUid))
    .limit(1);
  return rows[0];
}

async function findByEmail(email: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

async function create(input: NewUser): Promise<User> {
  const rows = await db.insert(users).values(input).returning();
  return rows[0]!;
}

async function linkFirebaseUid(id: string, firebaseUid: string): Promise<User | undefined> {
  const rows = await db
    .update(users)
    .set({ firebaseUid })
    .where(eq(users.id, id))
    .returning();
  return rows[0];
}

export const userRepository = {
  findById,
  findByFirebaseUid,
  findByEmail,
  create,
  linkFirebaseUid,
};
