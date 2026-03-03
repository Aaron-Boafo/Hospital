import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DataContext = createContext(null);

const STORAGE_KEY = 'hms_data';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
    const todaysPatients = data.patients.filter(p => p.createdAt === today).length;
    const todaysAppointments = data.appointments.filter(a => a.date === today).length;
    const todaysRevenue = data.bills.filter(b => b.date === today).reduce((sum, b) => sum + b.paid, 0);
    return { todaysPatients, todaysAppointments, todaysRevenue, totalPatients: data.patients.length };
  }, [data]);

  const value = {
    patients: data.patients,
    doctors: data.doctors,
    appointments: data.appointments,
    bills: data.bills,
    activities: data.activities,
    stats,
    addPatient, updatePatient, deletePatient,
    addDoctor, updateDoctor, toggleDoctorActive,
    addAppointment, updateAppointment, deleteAppointment,
    addBill, recordPayment,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
