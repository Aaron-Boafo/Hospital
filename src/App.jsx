import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Billing from './pages/Billing';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={
              <ProtectedRoute feature="dashboard">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={
                <ProtectedRoute feature="patients"><Patients /></ProtectedRoute>
              } />
              <Route path="appointments" element={
                <ProtectedRoute feature="appointments"><Appointments /></ProtectedRoute>
              } />
              <Route path="doctors" element={
                <ProtectedRoute feature="doctors"><Doctors /></ProtectedRoute>
              } />
              <Route path="billing" element={
                <ProtectedRoute feature="billing"><Billing /></ProtectedRoute>
              } />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}