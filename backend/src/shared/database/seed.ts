import { db } from "./db.js";
import {
  activityLogs,
  appointments,
  beds,
  billItems,
  bills,
  doctors,
  labResults,
  labTests,
  medicines,
  patients,
  payments,
  prescriptions,
  prescriptionItems,
  users,
  vitalSigns,
  visitRecords,
  wards,
} from "./schema/schema.js";

const PASSWORD_SENTINEL = "!firebase-auth!";

const today = () => new Date().toISOString().slice(0, 10);

const ids = {
  admin: "98eb18c1-4749-4450-bfe9-56102c0f12b3",
  receptionist: "77777777-7777-4777-8777-777777777777",
  doctorUser: "88888888-8888-4888-8888-888888888888",
  accountant: "99999999-9999-4999-8999-999999999999",
  patientJohn: "90cb9936-37f6-48ca-a018-1e08b218989e",
  patientMaria: "55555555-5555-4555-8555-555555555555",
  patientRobert: "66666666-6666-4666-8666-666666666666",
  doctorWilson: "11111111-1111-4111-8111-111111111111",
  doctorChen: "22222222-2222-4222-8222-222222222222",
  doctorHassan: "33333333-3333-4333-8333-333333333333",
  doctorMartin: "44444444-4444-4444-8444-444444444444",
  appointment1: "a1000000-0000-4000-8000-000000000001",
  appointment2: "a2000000-0000-4000-8000-000000000002",
  appointment3: "a3000000-0000-4000-8000-000000000003",
  bill: "b1000000-0000-4000-8000-000000000001",
  wardGeneral: "c1000000-0000-4000-8000-000000000001",
  wardMaternity: "c2000000-0000-4000-8000-000000000002",
  wardEmergency: "c3000000-0000-4000-8000-000000000003",
};

async function wipe() {
  await db.delete(payments);
  await db.delete(billItems);
  await db.delete(bills);
  await db.delete(prescriptionItems);
  await db.delete(prescriptions);
  await db.delete(appointments);
  await db.delete(beds);
  await db.delete(labResults);
  await db.delete(labTests);
  await db.delete(vitalSigns);
  await db.delete(visitRecords);
  await db.delete(wards);
  await db.delete(medicines);
  await db.delete(doctors);
  await db.delete(patients);
  await db.delete(activityLogs);
  await db.delete(users);
}

async function seed() {
  const date = today();

  await db.insert(users).values([
    {
      id: ids.admin,
      username: "admin",
      passwordHash: PASSWORD_SENTINEL,
      name: "Dr. Sarah Admin",
      role: "ADMIN",
      email: "admin@medicare.com",
      phone: "+233 54 000 0001",
    },
    {
      id: ids.doctorUser,
      username: "doctor",
      passwordHash: PASSWORD_SENTINEL,
      name: "Dr. James Wilson",
      role: "DOCTOR",
      email: "wilson@medicare.com",
      phone: "+233 54 000 0002",
    },
    {
      id: ids.receptionist,
      username: "receptionist",
      passwordHash: PASSWORD_SENTINEL,
      name: "Emily Carter",
      role: "RECEPTIONIST",
      email: "carter@medicare.com",
      phone: "+233 54 000 0003",
    },
    {
      id: ids.accountant,
      username: "accountant",
      passwordHash: PASSWORD_SENTINEL,
      name: "Michael Brown",
      role: "ACCOUNTANT",
      email: "brown@medicare.com",
      phone: "+233 54 000 0004",
    },
  ]);

  await db.insert(patients).values([
    {
      id: ids.patientJohn,
      name: "John Smith",
      dob: "1985-06-15",
      gender: "MALE",
      phone: "555-0101",
      address: "123 Main St",
      emergencyContact: "555-0102",
    },
    {
      id: ids.patientMaria,
      name: "Maria Garcia",
      dob: "1990-03-22",
      gender: "FEMALE",
      phone: "555-0201",
      address: "456 Oak Ave",
      emergencyContact: "555-0202",
    },
    {
      id: ids.patientRobert,
      name: "Robert Johnson",
      dob: "1978-11-08",
      gender: "MALE",
      phone: "555-0301",
      address: "789 Pine Rd",
      emergencyContact: "555-0302",
    },
  ]);

  await db.insert(doctors).values([
    {
      id: ids.doctorWilson,
      name: "Dr. James Wilson",
      department: "GENERAL MEDICINE",
      phone: "555-1001",
      email: "wilson@hospital.com",
    },
    {
      id: ids.doctorChen,
      name: "Dr. Lisa Chen",
      department: "PEDIATRICS",
      phone: "555-1002",
      email: "chen@hospital.com",
    },
    {
      id: ids.doctorHassan,
      name: "Dr. Ahmed Hassan",
      department: "CARDIOLOGY",
      phone: "555-1003",
      email: "hassan@hospital.com",
    },
    {
      id: ids.doctorMartin,
      name: "Dr. Sophie Martin",
      department: "ORTHOPEDICS",
      phone: "555-1004",
      email: "martin@hospital.com",
      active: false,
    },
  ]);

  await db.insert(appointments).values([
    {
      id: ids.appointment1,
      patientId: ids.patientJohn,
      doctorId: ids.doctorWilson,
      date,
      time: "09:00",
      status: "SCHEDULED",
      notes: "Regular checkup",
    },
    {
      id: ids.appointment2,
      patientId: ids.patientMaria,
      doctorId: ids.doctorChen,
      date,
      time: "10:30",
      status: "SCHEDULED",
      notes: "Follow-up visit",
    },
    {
      id: ids.appointment3,
      patientId: ids.patientRobert,
      doctorId: ids.doctorHassan,
      date,
      time: "14:00",
      status: "COMPLETED",
      notes: "Heart checkup",
    },
  ]);

  await db.insert(bills).values([
    {
      id: ids.bill,
      patientId: ids.patientRobert,
      total: "225.00",
      paid: "225.00",
      status: "PAID",
      paymentMethod: "CARD",
      date,
    },
  ]);

  await db.insert(billItems).values([
    { billId: ids.bill, description: "Consultation", amount: "150.00" },
    { billId: ids.bill, description: "ECG Test", amount: "75.00" },
  ]);

  await db.insert(payments).values([
    {
      billId: ids.bill,
      amount: "225.00",
      method: "CARD",
      paidAt: new Date(Date.now() - 3600000 * 2),
    },
  ]);

  await db.insert(medicines).values([
    {
      name: "Amoxicillin 500mg",
      category: "ANTIBIOTICS",
      unitPrice: "15.00",
      quantity: 200,
      reorderLevel: 30,
      expiryDate: "2026-12-31",
      supplier: "PharmaCo Ltd",
    },
    {
      name: "Paracetamol 500mg",
      category: "ANALGESICS",
      unitPrice: "5.00",
      quantity: 500,
      reorderLevel: 50,
      expiryDate: "2027-06-30",
      supplier: "HealthMed Supply",
    },
    {
      name: "Metformin 850mg",
      category: "ANTIDIABETICS",
      unitPrice: "12.00",
      quantity: 150,
      reorderLevel: 25,
      expiryDate: "2026-09-30",
      supplier: "PharmaCo Ltd",
    },
    {
      name: "Amlodipine 5mg",
      category: "ANTIHYPERTENSIVES",
      unitPrice: "10.00",
      quantity: 180,
      reorderLevel: 20,
      expiryDate: "2027-03-31",
      supplier: "MediSource Inc",
    },
    {
      name: "Omeprazole 20mg",
      category: "ANTACIDS",
      unitPrice: "8.00",
      quantity: 120,
      reorderLevel: 15,
      expiryDate: "2026-11-30",
      supplier: "HealthMed Supply",
    },
    {
      name: "Vitamin C 1000mg",
      category: "VITAMINS",
      unitPrice: "7.00",
      quantity: 300,
      reorderLevel: 40,
      expiryDate: "2027-08-31",
      supplier: "VitaPlus Labs",
    },
    {
      name: "Azithromycin 500mg",
      category: "ANTIBIOTICS",
      unitPrice: "20.00",
      quantity: 80,
      reorderLevel: 20,
      expiryDate: "2026-10-31",
      supplier: "PharmaCo Ltd",
    },
    {
      name: "Ibuprofen 400mg",
      category: "ANALGESICS",
      unitPrice: "6.00",
      quantity: 250,
      reorderLevel: 30,
      expiryDate: "2027-05-31",
      supplier: "MediSource Inc",
    },
  ]);

  await db.insert(activityLogs).values([
    {
      text: "Dr. Smith completed appointment with John Doe",
      type: "SUCCESS",
      time: new Date(Date.now() - 3600000 * 2),
    },
    {
      text: `Bill #BIL-001 paid (GH₵225) - Robert Johnson`,
      type: "INFO",
      time: new Date(),
    },
    {
      text: "New patient registered: Alice Williams",
      type: "ACCENT",
      time: new Date(Date.now() - 86400000),
    },
  ]);

  const wardRows = [
    { id: ids.wardGeneral, name: "General Medicine", totalBeds: 20 },
    { id: ids.wardMaternity, name: "Maternity", totalBeds: 15 },
    { id: ids.wardEmergency, name: "Emergency", totalBeds: 8 },
  ];
  await db.insert(wards).values(wardRows);

  const bedRows = wardRows.flatMap((ward) =>
    Array.from({ length: ward.totalBeds }, (_, i) => ({
      wardId: ward.id,
      number: i + 1,
      status: "AVAILABLE" as const,
    })),
  );
  await db.insert(beds).values(bedRows);
}

async function main() {
  const fresh = process.argv.includes("--fresh");
  const existing = await db.query.patients.findFirst({ columns: { id: true } });
  if (existing && !fresh) {
    console.log("Database already seeded — run with --fresh to reset first.");
    return;
  }
  if (fresh) {
    console.log("Wiping existing data...");
    await wipe();
  }
  await seed();
  console.log("Seed complete: 4 users, 3 patients, 4 doctors, 3 appointments, 1 bill, 8 medicines, 3 wards, 43 beds, 3 activities.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
