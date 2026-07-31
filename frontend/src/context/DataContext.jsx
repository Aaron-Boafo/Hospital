import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LAB_TESTS = [
  'Complete Blood Count (CBC)', 'Blood Glucose', 'Lipid Panel', 'Liver Function Test',
  'Kidney Function Test', 'Urinalysis', 'Thyroid Panel', 'Blood Grouping & Rh',
  'HbA1c', 'ECG (Electrocardiogram)', 'Chest X-Ray', 'MRI Scan',
  'CT Scan', 'Ultrasound', 'Malaria Test', 'Typhoid Test',
  'HIV Test', 'Hepatitis B Test', 'Pregnancy Test', 'Stool Analysis',
];

const DataContext = createContext(null);

const STORAGE_KEY = 'hms_data';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const defaults = getDefaultData();
      return { ...defaults, ...parsed, beds: parsed.beds || defaults.beds };
    }
  } catch {}
  return getDefaultData();
}

function getDefaultData() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    patients: [
      { id: 'PAT-001', name: 'John Smith', dob: '1985-06-15', gender: 'Male', phone: '555-0101', address: '123 Main St', emergencyContact: '555-0102', createdAt: today },
      { id: 'PAT-002', name: 'Maria Garcia', dob: '1990-03-22', gender: 'Female', phone: '555-0201', address: '456 Oak Ave', emergencyContact: '555-0202', createdAt: today },
      { id: 'PAT-003', name: 'Robert Johnson', dob: '1978-11-08', gender: 'Male', phone: '555-0301', address: '789 Pine Rd', emergencyContact: '555-0302', createdAt: today },
    ],
    doctors: [
      { id: 'DOC-001', name: 'Dr. James Wilson', department: 'General Medicine', phone: '555-1001', email: 'wilson@hospital.com', active: true },
      { id: 'DOC-002', name: 'Dr. Lisa Chen', department: 'Pediatrics', phone: '555-1002', email: 'chen@hospital.com', active: true },
      { id: 'DOC-003', name: 'Dr. Ahmed Hassan', department: 'Cardiology', phone: '555-1003', email: 'hassan@hospital.com', active: true },
      { id: 'DOC-004', name: 'Dr. Sophie Martin', department: 'Orthopedics', phone: '555-1004', email: 'martin@hospital.com', active: false },
    ],
    appointments: [
      { id: 'APT-001', patientId: 'PAT-001', patientName: 'John Smith', doctorId: 'DOC-001', doctorName: 'Dr. James Wilson', date: today, time: '09:00', status: 'Scheduled', notes: 'Regular checkup' },
      { id: 'APT-002', patientId: 'PAT-002', patientName: 'Maria Garcia', doctorId: 'DOC-002', doctorName: 'Dr. Lisa Chen', date: today, time: '10:30', status: 'Scheduled', notes: 'Follow-up visit' },
      { id: 'APT-003', patientId: 'PAT-003', patientName: 'Robert Johnson', doctorId: 'DOC-003', doctorName: 'Dr. Ahmed Hassan', date: today, time: '14:00', status: 'Completed', notes: 'Heart checkup' },
    ],
    bills: [
      { id: 'BIL-001', patientId: 'PAT-003', patientName: 'Robert Johnson', items: [{ description: 'Consultation', amount: 150 }, { description: 'ECG Test', amount: 75 }], total: 225, paid: 225, paymentMethod: 'Card', status: 'Paid', date: today },
    ],
    activities: [
      { id: 'ACT-001', text: 'Dr. Smith completed appointment with John Doe', type: 'success', time: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'ACT-002', text: 'Bill #BIL-001 paid (GH₵225) - Robert Johnson', type: 'info', time: new Date().toISOString() },
    { id: 'ACT-003', text: 'New patient registered: Alice Williams', type: 'accent', time: new Date(Date.now() - 86400000).toISOString() },
    ],
    vitalSigns: [],
    visitRecords: [],
    labTests: [],
    labResults: [],
    medicines: [
      { id: 'MED-001', name: 'Amoxicillin 500mg', category: 'Antibiotics', unitPrice: 15, quantity: 200, reorderLevel: 30, expiryDate: '2026-12-31', supplier: 'PharmaCo Ltd', createdAt: '2026-01-01' },
      { id: 'MED-002', name: 'Paracetamol 500mg', category: 'Analgesics', unitPrice: 5, quantity: 500, reorderLevel: 50, expiryDate: '2027-06-30', supplier: 'HealthMed Supply', createdAt: '2026-01-01' },
      { id: 'MED-003', name: 'Metformin 850mg', category: 'Antidiabetics', unitPrice: 12, quantity: 150, reorderLevel: 25, expiryDate: '2026-09-30', supplier: 'PharmaCo Ltd', createdAt: '2026-01-01' },
      { id: 'MED-004', name: 'Amlodipine 5mg', category: 'Antihypertensives', unitPrice: 10, quantity: 180, reorderLevel: 20, expiryDate: '2027-03-31', supplier: 'MediSource Inc', createdAt: '2026-01-01' },
      { id: 'MED-005', name: 'Omeprazole 20mg', category: 'Antacids', unitPrice: 8, quantity: 120, reorderLevel: 15, expiryDate: '2026-11-30', supplier: 'HealthMed Supply', createdAt: '2026-01-01' },
      { id: 'MED-006', name: 'Vitamin C 1000mg', category: 'Vitamins', unitPrice: 7, quantity: 300, reorderLevel: 40, expiryDate: '2027-08-31', supplier: 'VitaPlus Labs', createdAt: '2026-01-01' },
      { id: 'MED-007', name: 'Azithromycin 500mg', category: 'Antibiotics', unitPrice: 20, quantity: 80, reorderLevel: 20, expiryDate: '2026-10-31', supplier: 'PharmaCo Ltd', createdAt: '2026-01-01' },
      { id: 'MED-008', name: 'Ibuprofen 400mg', category: 'Analgesics', unitPrice: 6, quantity: 250, reorderLevel: 30, expiryDate: '2027-05-31', supplier: 'MediSource Inc', createdAt: '2026-01-01' },
    ],
    prescriptions: [],
    wards: [
      { id: 'WARD-001', name: 'General Medicine', totalBeds: 20 },
      { id: 'WARD-002', name: 'Maternity', totalBeds: 15 },
      { id: 'WARD-003', name: 'Emergency', totalBeds: 8 },
    ],
    beds: (() => {
      const beds = [];
      const wardNames = ['General Medicine', 'Maternity', 'Emergency'];
      const totals = [20, 15, 8];
      let bedNum = 1;
      wardNames.forEach((name, wi) => {
        for (let i = 1; i <= totals[wi]; i++) {
          beds.push({
            id: `BED-${String(bedNum).padStart(3, '0')}`,
            wardId: `WARD-${String(wi + 1).padStart(3, '0')}`,
            wardName: name,
            number: i,
            status: 'Available',
            patientId: null,
            patientName: null,
            admittedDate: null,
          });
          bedNum++;
        }
      });
      return beds;
    })(),
    theme: 'light',
  };
}

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addActivity = useCallback((text, type = 'accent') => {
    setData(prev => ({
      ...prev,
      activities: [{ id: uuidv4(), text, type, time: new Date().toISOString() }, ...prev.activities].slice(0, 50),
    }));
  }, []);

  // --- PATIENTS ---
  const addPatient = useCallback((patient) => {
    const id = 'PAT-' + String(Date.now()).slice(-5);
    const newPatient = { ...patient, id, createdAt: new Date().toISOString().slice(0, 10) };
    setData(prev => ({ ...prev, patients: [...prev.patients, newPatient] }));
    addActivity(`New patient registered: ${patient.name}`, 'accent');
    return newPatient;
  }, [addActivity]);

  const updatePatient = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    addActivity(`Patient ${updates.name || id} details updated`, 'info');
  }, [addActivity]);

  const deletePatient = useCallback((id) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.filter(p => p.id !== id),
    }));
    addActivity(`Patient ${id} removed`, 'warning');
  }, [addActivity]);

  // --- DOCTORS ---
  const addDoctor = useCallback((doctor) => {
    const id = 'DOC-' + String(Date.now()).slice(-5);
    const newDoctor = { ...doctor, id, active: true };
    setData(prev => ({ ...prev, doctors: [...prev.doctors, newDoctor] }));
    addActivity(`New doctor added: ${doctor.name}`, 'accent');
    return newDoctor;
  }, [addActivity]);

  const updateDoctor = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      doctors: prev.doctors.map(d => d.id === id ? { ...d, ...updates } : d),
    }));
    addActivity(`Doctor ${updates.name || id} updated`, 'info');
  }, [addActivity]);

  const toggleDoctorActive = useCallback((id) => {
    setData(prev => ({
      ...prev,
      doctors: prev.doctors.map(d => d.id === id ? { ...d, active: !d.active } : d),
    }));
    const doc = data.doctors.find(d => d.id === id);
    addActivity(`Doctor ${doc?.name || id} ${doc?.active ? 'deactivated' : 'activated'}`, 'warning');
  }, [addActivity, data.doctors]);

  // --- APPOINTMENTS ---
  const addAppointment = useCallback((apt) => {
    const id = 'APT-' + String(Date.now()).slice(-5);
    const newApt = { ...apt, id, status: 'Scheduled' };
    setData(prev => ({ ...prev, appointments: [...prev.appointments, newApt] }));
    addActivity(`New appointment: ${apt.patientName} with ${apt.doctorName}`, 'accent');
    return newApt;
  }, [addActivity]);

  const updateAppointment = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
    if (updates.status) {
      addActivity(`Appointment ${id} marked as ${updates.status}`, updates.status === 'Completed' ? 'success' : 'warning');
    }
  }, [addActivity]);

  const deleteAppointment = useCallback((id) => {
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.filter(a => a.id !== id),
    }));
    addActivity(`Appointment ${id} deleted`, 'warning');
  }, [addActivity]);

  // --- VITAL SIGNS ---
  const addVitalSign = useCallback((vitals) => {
    const newVitals = { ...vitals, id: uuidv4() };
    setData(prev => ({ ...prev, vitalSigns: [...prev.vitalSigns, newVitals] }));
    addActivity(`Vitals recorded for ${vitals.patientName}`, 'success');
    return newVitals;
  }, [addActivity]);

  const getPatientVitals = useCallback((patientId) => {
    return data.vitalSigns.filter(v => v.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  }, [data.vitalSigns]);

  // --- VISIT RECORDS ---
  const addVisitRecord = useCallback((visit) => {
    const newVisit = { ...visit, id: uuidv4() };
    setData(prev => ({ ...prev, visitRecords: [...prev.visitRecords, newVisit] }));
    addActivity(`Visit recorded for ${visit.patientName}`, 'info');
    return newVisit;
  }, [addActivity]);

  const getPatientVisits = useCallback((patientId) => {
    return data.visitRecords.filter(v => v.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  }, [data.visitRecords]);

  // --- LAB TESTS ---
  const orderLabTest = useCallback((test) => {
    const newTest = {
      id: 'LAB-' + String(Date.now()).slice(-5),
      patientId: test.patientId,
      patientName: test.patientName,
      testType: test.testType,
      orderedBy: test.orderedBy,
      orderedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setData(prev => ({ ...prev, labTests: [...prev.labTests, newTest] }));
    addActivity(`Lab test ordered for ${test.patientName}: ${test.testType}`, 'info');
    return newTest;
  }, [addActivity]);

  const submitLabResult = useCallback((testId, results, completedBy, notes) => {
    setData(prev => ({
      ...prev,
      labTests: prev.labTests.map(t => t.id === testId ? { ...t, status: 'Completed' } : t),
      labResults: [...prev.labResults, {
        id: uuidv4(), testId, patientId: prev.labTests.find(t => t.id === testId)?.patientId,
        results, notes, completedBy, completedDate: new Date().toISOString().slice(0, 10),
      }],
    }));
    addActivity(`Lab results submitted for test ${testId}`, 'success');
  }, [addActivity]);

  const getPatientLabResults = useCallback((patientId) => {
    return data.labResults
      .filter(r => r.patientId === patientId)
      .map(r => ({ ...r, test: data.labTests.find(t => t.id === r.testId) }))
      .sort((a, b) => b.completedDate.localeCompare(a.completedDate));
  }, [data.labResults, data.labTests]);

  // --- MEDICINES ---
  const addMedicine = useCallback((medicine) => {
    const id = 'MED-' + String(Date.now()).slice(-5);
    const newMed = { ...medicine, id, createdAt: new Date().toISOString().slice(0, 10) };
    setData(prev => ({ ...prev, medicines: [...prev.medicines, newMed] }));
    addActivity(`New medicine added: ${medicine.name}`, 'accent');
    return newMed;
  }, [addActivity]);

  const updateMedicine = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
    addActivity(`Medicine ${updates.name || id} updated`, 'info');
  }, [addActivity]);

  const deleteMedicine = useCallback((id) => {
    setData(prev => ({ ...prev, medicines: prev.medicines.filter(m => m.id !== id) }));
    addActivity(`Medicine ${id} removed`, 'warning');
  }, [addActivity]);

  // --- PRESCRIPTIONS ---
  const createPrescription = useCallback((prescription) => {
    const id = 'PRX-' + String(Date.now()).slice(-5);
    const newPrx = {
      ...prescription,
      id,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
    };
    setData(prev => ({ ...prev, prescriptions: [...prev.prescriptions, newPrx] }));
    addActivity(`Prescription created for ${prescription.patientName}`, 'info');
    return newPrx;
  }, [addActivity]);

  const dispensePrescription = useCallback((prxId) => {
    setData(prev => {
      const prx = prev.prescriptions.find(p => p.id === prxId);
      if (!prx || prx.status !== 'Pending') return prev;

      let allDispensed = true;
      const updatedItems = prx.items.map(item => {
        const medicine = prev.medicines.find(m => m.id === item.medicineId);
        if (!medicine || medicine.quantity < item.quantity) {
          allDispensed = false;
          return { ...item, dispensed: 'Partial' };
        }
        return { ...item, dispensed: 'Dispensed' };
      });

      const newMedicines = prev.medicines.map(m => {
        const item = prx.items.find(i => i.medicineId === m.id);
        return item ? { ...m, quantity: m.quantity - item.quantity } : m;
      });

      const billItems = prx.items.map(item => ({
        description: `${item.medicineName} x${item.quantity} (${item.dosage})`,
        amount: item.total || 0,
      }));

      const newBill = {
        id: 'BIL-' + String(Date.now()).slice(-5),
        patientId: prx.patientId,
        patientName: prx.patientName,
        items: billItems,
        total: billItems.reduce((s, i) => s + i.amount, 0),
        paid: 0,
        status: 'Unpaid',
        paymentMethod: '',
        date: new Date().toISOString().slice(0, 10),
      };

      return {
        ...prev,
        prescriptions: prev.prescriptions.map(p =>
          p.id === prxId ? { ...p, items: updatedItems, status: allDispensed ? 'Dispensed' : 'Partial' } : p
        ),
        medicines: newMedicines,
        bills: [...prev.bills, newBill],
      };
    });
    addActivity(`Prescription ${prxId} dispensed — bill created`, 'success');
  }, [addActivity]);

  const getPatientPrescriptions = useCallback((patientId) => {
    return data.prescriptions.filter(p => p.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  }, [data.prescriptions]);

  // --- BEDS ---
  const admitPatient = useCallback((bedId, patientId, patientName) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b =>
        b.id === bedId ? { ...b, status: 'Occupied', patientId, patientName, admittedDate: new Date().toISOString().slice(0, 10) } : b
      ),
    }));
    addActivity(`Patient ${patientName} admitted to bed ${bedId}`, 'success');
  }, [addActivity]);

  const dischargePatient = useCallback((bedId) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b =>
        b.id === bedId ? { ...b, status: 'Available', patientId: null, patientName: null, admittedDate: null } : b
      ),
    }));
    addActivity(`Bed ${bedId} vacated — patient discharged`, 'info');
  }, [addActivity]);

  const updateTheme = useCallback((newTheme) => {
    setData(prev => ({ ...prev, theme: newTheme }));
  }, []);

  // --- WARD / BED MANAGEMENT ---
  const addWard = useCallback((name, totalBeds) => {
    setData(prev => {
      const wardId = 'WARD-' + String(prev.wards.length + 1).padStart(3, '0');
      const count = Math.max(1, parseInt(totalBeds) || 1);
      const newWard = { id: wardId, name, totalBeds: count };

      const maxBedNum = prev.beds.reduce((max, b) => Math.max(max, parseInt(b.id.split('-')[1])), 0);
      const newBeds = Array.from({ length: count }, (_, i) => ({
        id: 'BED-' + String(maxBedNum + i + 1).padStart(3, '0'),
        wardId, wardName: name, number: i + 1,
        status: 'Available', patientId: null, patientName: null, admittedDate: null,
      }));

      return { ...prev, wards: [...prev.wards, newWard], beds: [...prev.beds, ...newBeds] };
    });
    addActivity(`New ward created: ${name} (${totalBeds} beds)`, 'accent');
  }, [addActivity]);

  const removeWard = useCallback((wardId) => {
    const occupied = data.beds.some(b => b.wardId === wardId && b.status === 'Occupied');
    if (occupied) return { success: false, error: 'Cannot remove ward with occupied beds' };

    setData(prev => ({
      ...prev,
      wards: prev.wards.filter(w => w.id !== wardId),
      beds: prev.beds.filter(b => b.wardId !== wardId),
    }));
    addActivity(`Ward ${wardId} removed`, 'warning');
    return { success: true };
  }, [addActivity, data.beds]);

  const updateWard = useCallback((wardId, updates) => {
    const occupiedCount = data.beds.filter(b => b.wardId === wardId && b.status === 'Occupied').length;
    const newTotal = updates.totalBeds !== undefined ? Math.max(1, parseInt(updates.totalBeds) || 1) : undefined;

    if (newTotal !== undefined && newTotal < occupiedCount) {
      return { success: false, error: `Cannot reduce below ${occupiedCount} occupied beds` };
    }

    setData(prev => {
      let newBeds = [...prev.beds];
      const ward = prev.wards.find(w => w.id === wardId);
      if (!ward) return prev;

      if (updates.name) {
        newBeds = newBeds.map(b => b.wardId === wardId ? { ...b, wardName: updates.name } : b);
      }

      if (newTotal !== undefined) {
        const currentCount = ward.totalBeds;
        if (newTotal > currentCount) {
          const maxBedNum = newBeds.reduce((max, b) => Math.max(max, parseInt(b.id.split('-')[1])), 0);
          const diff = newTotal - currentCount;
          for (let i = 1; i <= diff; i++) {
            newBeds.push({
              id: 'BED-' + String(maxBedNum + i).padStart(3, '0'),
              wardId, wardName: updates.name || ward.name, number: currentCount + i,
              status: 'Available', patientId: null, patientName: null, admittedDate: null,
            });
          }
        } else if (newTotal < currentCount) {
          const availableIds = newBeds
            .filter(b => b.wardId === wardId && b.status === 'Available')
            .sort((a, b) => b.number - a.number)
            .slice(0, currentCount - newTotal)
            .map(b => b.id);
          newBeds = newBeds.filter(b => !availableIds.includes(b.id));
        }
      }

      return {
        ...prev,
        wards: prev.wards.map(w => w.id === wardId ? {
          ...w, name: updates.name || w.name, totalBeds: newTotal ?? w.totalBeds,
        } : w),
        beds: newBeds,
      };
    });
    addActivity(`Ward ${wardId} updated`, 'info');
    return { success: true };
  }, [addActivity, data.beds]);

  const addBed = useCallback((wardId) => {
    setData(prev => {
      const ward = prev.wards.find(w => w.id === wardId);
      if (!ward) return prev;

      const nextNum = prev.beds.filter(b => b.wardId === wardId).length + 1;
      const maxBedNum = prev.beds.reduce((max, b) => Math.max(max, parseInt(b.id.split('-')[1])), 0);

      const newBed = {
        id: 'BED-' + String(maxBedNum + 1).padStart(3, '0'),
        wardId, wardName: ward.name, number: nextNum,
        status: 'Available', patientId: null, patientName: null, admittedDate: null,
      };

      return {
        ...prev,
        wards: prev.wards.map(w => w.id === wardId ? { ...w, totalBeds: w.totalBeds + 1 } : w),
        beds: [...prev.beds, newBed],
      };
    });
    addActivity(`Bed added to ward ${wardId}`, 'info');
  }, [addActivity]);

  const removeBed = useCallback((bedId) => {
    const bed = data.beds.find(b => b.id === bedId);
    if (!bed || bed.status !== 'Available') return { success: false, error: 'Only available beds can be removed' };

    setData(prev => ({
      ...prev,
      wards: prev.wards.map(w => w.id === bed.wardId ? { ...w, totalBeds: w.totalBeds - 1 } : w),
      beds: prev.beds.filter(b => b.id !== bedId),
    }));
    addActivity(`Bed ${bedId} removed`, 'warning');
    return { success: true };
  }, [addActivity, data.beds]);

  const bedStats = useMemo(() => {
    const bedsList = data.beds || [];
    const total = bedsList.length;
    const occupied = bedsList.filter(b => b.status === 'Occupied').length;
    const available = total - occupied;
    const maintenance = bedsList.filter(b => b.status === 'Maintenance').length;
    return { total, occupied, available, maintenance, occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0 };
  }, [data.beds]);

  // --- BILLS ---
  const addBill = useCallback((bill) => {
    const id = 'BIL-' + String(Date.now()).slice(-5);
    const newBill = { ...bill, id, date: new Date().toISOString().slice(0, 10), status: 'Unpaid', paid: 0 };
    setData(prev => ({ ...prev, bills: [...prev.bills, newBill] }));
    addActivity(`Bill created for ${bill.patientName}: GH₵${bill.total}`, 'info');
    return newBill;
  }, [addActivity]);

  const recordPayment = useCallback((id, amount, method) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => {
        if (b.id !== id) return b;
        const newPaid = b.paid + amount;
        return { ...b, paid: newPaid, paymentMethod: method, status: newPaid >= b.total ? 'Paid' : 'Partial' };
      }),
    }));
    addActivity(`Payment of GH₵${amount} recorded for bill ${id}`, 'success');
  }, [addActivity]);

  // --- DASHBOARD STATS ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const patientsList = data.patients || [];
    const appointmentsList = data.appointments || [];
    const billsList = data.bills || [];
    const todaysPatients = patientsList.filter(p => p.createdAt === today).length;
    const todaysAppointments = appointmentsList.filter(a => a.date === today).length;
    const todaysRevenue = billsList.filter(b => b.date === today).reduce((sum, b) => sum + b.paid, 0);
    return { todaysPatients, todaysAppointments, todaysRevenue, totalPatients: patientsList.length };
  }, [data]);

  const value = {
    patients: data.patients,
    doctors: data.doctors,
    appointments: data.appointments,
    bills: data.bills,
    activities: data.activities,
    vitalSigns: data.vitalSigns,
    visitRecords: data.visitRecords,
    labTests: data.labTests,
    labResults: data.labResults,
    medicines: data.medicines,
    prescriptions: data.prescriptions,
    wards: data.wards,
    beds: data.beds,
    stats, themePreference: data.theme,
    addPatient, updatePatient, deletePatient,
    addDoctor, updateDoctor, toggleDoctorActive,
    addAppointment, updateAppointment, deleteAppointment,
    addBill, recordPayment,
    addVitalSign, getPatientVitals,
    addVisitRecord, getPatientVisits,
    orderLabTest, submitLabResult, getPatientLabResults,
    addMedicine, updateMedicine, deleteMedicine,
    createPrescription, dispensePrescription, getPatientPrescriptions,
    admitPatient, dischargePatient, updateTheme, bedStats,
    addWard, removeWard, updateWard, addBed, removeBed,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
