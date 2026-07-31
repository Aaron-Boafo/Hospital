import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DATA_KEY, LEGACY_DATA_KEY } from '../constants';

const DataContext = createContext(null);

function initialData() {
  return { labTests: [], labResults: [] };
}

function loadData() {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
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

  const value = {
    labTests: data.labTests,
    labResults: data.labResults,
    orderLabTest, submitLabResult,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
