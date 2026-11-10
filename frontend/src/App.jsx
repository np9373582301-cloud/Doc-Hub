import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Landing Page
import Landing from './pages/Landing';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminLayout from './components/common/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import PatientDetail from './pages/admin/PatientDetail';
import Dentists from './pages/admin/Dentists';
import Appointments from './pages/admin/Appointments';
import Treatments from './pages/admin/Treatments';
import Prescriptions from './pages/admin/Prescriptions';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import Admins from './pages/admin/Admins';
import Inquiries from './pages/admin/Inquiries';
import Settings from './pages/admin/Settings';

// Dentist / Doctor Pages
import DentistDashboard from './pages/dentist/Dashboard';
import DoctorProfile from './pages/dentist/Profile';
import DentistAppointments from './pages/dentist/Appointments';
import DentistPatients from './pages/dentist/Patients';
import DentistTreatments from './pages/dentist/Treatments';
import DentistPrescriptions from './pages/dentist/Prescriptions';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientProfile from './pages/patient/Profile';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import TreatmentHistory from './pages/patient/TreatmentHistory';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import MyBills from './pages/patient/MyBills';

// Helper to get current user from context OR localStorage
const getCurrentUser = (contextUser) => {
  if (contextUser) return contextUser;
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const currentUser = getCurrentUser(user);
  if (!currentUser) return <Navigate to="/login" replace />;
  const isSuper = currentUser.isSuperAdmin || currentUser.role === 'superadmin' || currentUser.email === 'np9373582301@gmail.com';
  if (roles && !roles.includes(currentUser.role) && !(isSuper && roles.includes('admin'))) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  const currentUser = getCurrentUser(user);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (currentUser.role === 'dentist') return <Navigate to="/dentist/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Landing Page as first page at "/" */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

    {/* Admin Routes */}
    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout role="admin" /></ProtectedRoute>}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="patients" element={<Patients />} />
      <Route path="patients/:id" element={<PatientDetail />} />
      <Route path="dentists" element={<Dentists />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="treatments" element={<Treatments />} />
      <Route path="prescriptions" element={<Prescriptions />} />
      <Route path="billing" element={<Billing />} />
      <Route path="reports" element={<Reports />} />
      <Route path="admins" element={<Admins />} />
      <Route path="inquiries" element={<Inquiries />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    {/* Dentist Routes */}
    <Route path="/dentist" element={<ProtectedRoute roles={['dentist']}><AdminLayout role="dentist" /></ProtectedRoute>}>
      <Route path="dashboard" element={<DentistDashboard />} />
      <Route path="profile" element={<DoctorProfile />} />
      <Route path="appointments" element={<DentistAppointments />} />
      <Route path="patients" element={<DentistPatients />} />
      <Route path="patients/:id" element={<PatientDetail />} />
      <Route path="treatments" element={<DentistTreatments />} />
      <Route path="prescriptions" element={<DentistPrescriptions />} />
    </Route>

    {/* Patient Routes */}
    <Route path="/patient" element={<ProtectedRoute roles={['patient']}><AdminLayout role="patient" /></ProtectedRoute>}>
      <Route path="dashboard" element={<PatientDashboard />} />
      <Route path="profile" element={<PatientProfile />} />
      <Route path="book-appointment" element={<BookAppointment />} />
      <Route path="appointments" element={<MyAppointments />} />
      <Route path="treatments" element={<TreatmentHistory />} />
      <Route path="prescriptions" element={<MyPrescriptions />} />
      <Route path="bills" element={<MyBills />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
