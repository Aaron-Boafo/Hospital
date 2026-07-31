import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DATA_KEY, LEGACY_DATA_KEY } from '../constants';

const DataContext = createContext(null);

function initialData() {
  return { wards: [], beds: [], labTests: [], labResults: [] };
}

function loadData() {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        wards: parsed.wards || [],
        beds: parsed.beds || [],
        labTests: parsed.labTests || [],
        labResults: parsed.labResults || [],
      };
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return initialData();
}

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      // localStorage unavailable (private mode)
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_DATA_KEY);
    } catch {
      // localStorage unavailable (private mode)
    }
  }, []);

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
    return newTest;
  }, []);

  const submitLabResult = useCallback((testId, results, completedBy, notes) => {
    setData(prev => ({
      ...prev,
      labTests: prev.labTests.map(t => t.id === testId ? { ...t, status: 'Completed' } : t),
      labResults: [...prev.labResults, {
        id: uuidv4(), testId, patientId: prev.labTests.find(t => t.id === testId)?.patientId,
        results, notes, completedBy, completedDate: new Date().toISOString().slice(0, 10),
      }],
    }));
  }, []);

  // --- BEDS ---
  const admitPatient = useCallback((bedId, patientId, patientName) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b =>
        b.id === bedId ? { ...b, status: 'Occupied', patientId, patientName, admittedDate: new Date().toISOString().slice(0, 10) } : b
      ),
    }));
  }, []);

  const dischargePatient = useCallback((bedId) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b =>
        b.id === bedId ? { ...b, status: 'Available', patientId: null, patientName: null, admittedDate: null } : b
      ),
    }));
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
  }, []);

  const removeWard = useCallback((wardId) => {
    const occupied = data.beds.some(b => b.wardId === wardId && b.status === 'Occupied');
    if (occupied) return { success: false, error: 'Cannot remove ward with occupied beds' };

    setData(prev => ({
      ...prev,
      wards: prev.wards.filter(w => w.id !== wardId),
      beds: prev.beds.filter(b => b.wardId !== wardId),
    }));
    return { success: true };
  }, [data.beds]);

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
    return { success: true };
  }, [data.beds]);

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
  }, []);

  const removeBed = useCallback((bedId) => {
    const bed = data.beds.find(b => b.id === bedId);
    if (!bed || bed.status !== 'Available') return { success: false, error: 'Only available beds can be removed' };

    setData(prev => ({
      ...prev,
      wards: prev.wards.map(w => w.id === bed.wardId ? { ...w, totalBeds: w.totalBeds - 1 } : w),
      beds: prev.beds.filter(b => b.id !== bedId),
    }));
    return { success: true };
  }, [data.beds]);

  const value = {
    wards: data.wards,
    beds: data.beds,
    labTests: data.labTests,
    labResults: data.labResults,
    orderLabTest, submitLabResult,
    admitPatient, dischargePatient,
    addWard, removeWard, updateWard, addBed, removeBed,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
