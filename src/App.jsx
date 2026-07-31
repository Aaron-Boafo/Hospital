import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import DecisionSupport from './pages/DecisionSupport';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Lab from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import Prescriptions from './pages/Prescriptions';
import Beds from './pages/Beds';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
        <ThemeProvider>
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
              <Route path="decision-support" element={
                <ProtectedRoute feature="clinical"><DecisionSupport /></ProtectedRoute>
              } />
              <Route path="staff" element={
                <ProtectedRoute feature="staff"><Staff /></ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute feature="reports"><Reports /></ProtectedRoute>
              } />
              <Route path="laboratory" element={
                <ProtectedRoute feature="laboratory"><Lab /></ProtectedRoute>
              } />
              <Route path="pharmacy" element={
                <ProtectedRoute feature="pharmacy"><Pharmacy /></ProtectedRoute>
              } />
              <Route path="prescriptions" element={
                <ProtectedRoute feature="prescriptions"><Prescriptions /></ProtectedRoute>
              } />
              <Route path="beds" element={
                <ProtectedRoute feature="beds"><Beds /></ProtectedRoute>
              } />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}