import { eq } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import { appointments } from "@/shared/database/schema/schema.js";
import type { NewAppointment } from "@/shared/database/schema/types.js";
import type { AppointmentStatus } from "./appointment.constants.js";

type AppointmentWithRefs = NonNullable<Awaited<ReturnType<typeof findById>>>;

const withRefs = {
  patient: { columns: { id: true, name: true } as const },
  doctor: { columns: { id: true, name: true } as const },
};

async function findMany(filters: {
  date?: string;
  status?: AppointmentStatus;
}): Promise<AppointmentWithRefs[]> {
  return db.query.appointments.findMany({
    with: withRefs,
    ...(filters.date || filters.status
      ? {
          where: {
            ...(filters.date ? { date: filters.date } : {}),
            ...(filters.status ? { status: filters.status } : {}),
          },
        }
      : {}),
    orderBy: { date: "asc", time: "asc" },
  });
}

async function findById(id: string) {
  return db.query.appointments.findFirst({
    with: withRefs,
    where: { id },
  });
}

async function create(input: NewAppointment) {
  const rows = await db.insert(appointments).values(input).returning();
  return rows[0]!;
}

async function update(id: string, input: Partial<typeof appointments.$inferInsert>) {
  const rows = await db
    .update(appointments)
    .set(input)
    .where(eq(appointments.id, id))
    .returning();
  return rows[0];
}

async function remove(id: string): Promise<void> {
  await db.delete(appointments).where(eq(appointments.id, id));
}

export const appointmentRepository = { findMany, findById, create, update, remove };
