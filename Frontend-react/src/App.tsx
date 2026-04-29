// @ts-nocheck
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppLayout, AuthLayout } from '@/components/layout';
import { PageLoader } from '@/components/ui';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import HospitalDetailPage from '@/pages/patient/HospitalDetailPage';
import AppointmentBookingPage from '@/pages/patient/AppointmentBookingPage';
import AIAgentPage from '@/pages/patient/AIAgentPage';
import NearbyHospitalsPage from '@/pages/patient/NearbyHospitalsPage';
import TermsPage from '@/pages/common/TermsPage';
import OnboardingPage from '@/pages/common/OnboardingPage';
import EmergencyNumbersPage from '@/pages/common/EmergencyNumbersPage';
import PublicHomePage from '@/pages/public/PublicHomePage';
import TrackResultsPage from '@/pages/public/TrackResultsPage';

// Patient Pages
import PatientDashboard from '@/pages/patient/PatientDashboard';
import EditProfilePage from '@/pages/patient/EditProfilePage';
import HealthTipsPage from '@/pages/patient/HealthTipsPage';
import PatientIntakePage from '@/pages/patient/PatientIntakePage';

// Doctor Pages
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminDoctorsPage from '@/pages/admin/AdminDoctorsPage';
import AdminServicesPage from '@/pages/admin/AdminServicesPage';
import AdminStaffPage from '@/pages/admin/AdminStaffPage';

// Super Admin Pages
import SuperAdminDashboard from '@/pages/super-admin/SuperAdminDashboard';
import EntitiesPage from '@/pages/super-admin/EntitiesPage';
import UsersPage from '@/pages/super-admin/UsersPage';
import EntityDetailPage from '@/pages/super-admin/EntityDetailPage';

// Laborantin Pages
import LaborantinDashboard from '@/pages/laborantin/LaborantinDashboard';

// Common Pages
import SearchPage from '@/pages/common/SearchPage';
import AppointmentsPage from '@/pages/common/AppointmentsPage';
import ResultsPage from '@/pages/common/ResultsPage';
import DoctorAgendaPage from '@/pages/common/DoctorAgendaPage';
import PatientsPage from '@/pages/common/PatientsPage';
import NotificationsPage from '@/pages/common/NotificationsPage';
import MessagesPage from '@/pages/common/MessagesPage';
import ProfilePage from '@/pages/common/ProfilePage';
import ChangePasswordPage from '@/pages/common/ChangePasswordPage';
import SecurityPage from '@/pages/common/SecurityPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// Role-based Route Component
function RoleRoute({ children, allowedRoles, redirectPath = '/' }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to={redirectPath} replace />;
  return <>{children}</>;
}

// Central Dashboard Redirector
function DashboardRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    patient: '/patient/dashboard',
    medecin: '/doctor/dashboard',
    admin_hopital: '/admin/dashboard',
    super_admin: '/super-admin/dashboard',
    laborantin: '/laborantin/dashboard',
    admin_general: '/admin/dashboard',
  };

  return <Navigate to={routes[user.role] || '/login'} replace />;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/emergency" element={<EmergencyNumbersPage />} />
        <Route path="/track-results" element={<TrackResultsPage />} />
      </Route>

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/app" element={<DashboardRedirect />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        {/* Patient Routes */}
        <Route path="/patient">
          <Route path="dashboard" element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>} />
          <Route path="search" element={<RoleRoute allowedRoles={['patient']}><SearchPage /></RoleRoute>} />
          <Route path="appointments" element={<RoleRoute allowedRoles={['patient']}><AppointmentsPage /></RoleRoute>} />
          <Route path="hopital/:id" element={<RoleRoute allowedRoles={['patient']}><HospitalDetailPage /></RoleRoute>} />
          <Route path="appointments/book/:doctorId" element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="medecin/:doctorId/rendezvous" element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="hopital/:hospitalId/service/:serviceId" element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="ai-agent" element={<RoleRoute allowedRoles={['patient']}><AIAgentPage /></RoleRoute>} />
          <Route path="nearby" element={<RoleRoute allowedRoles={['patient']}><NearbyHospitalsPage /></RoleRoute>} />
          <Route path="profile/edit" element={<RoleRoute allowedRoles={['patient']}><EditProfilePage /></RoleRoute>} />
          <Route path="health-tips" element={<RoleRoute allowedRoles={['patient']}><HealthTipsPage /></RoleRoute>} />
          {/* Patient Intake — Formulaire de pré-consultation */}
          <Route path="rdv/:rdvId/intake" element={<RoleRoute allowedRoles={['patient']}><PatientIntakePage /></RoleRoute>} />
          <Route path="rdv/:rdvId/intake/:medecinNom" element={<RoleRoute allowedRoles={['patient']}><PatientIntakePage /></RoleRoute>} />
        </Route>
        
        <Route path="/doctor">
          <Route path="dashboard" element={<RoleRoute allowedRoles={['medecin']}><DoctorDashboard /></RoleRoute>} />
          <Route path="agenda" element={<RoleRoute allowedRoles={['medecin']}><DoctorAgendaPage /></RoleRoute>} />
          <Route path="patients" element={<RoleRoute allowedRoles={['medecin']}><PatientsPage /></RoleRoute>} />
        </Route>
        
        <Route path="/admin">
          <Route path="dashboard" element={<RoleRoute allowedRoles={['admin_hopital', 'admin_general']}><AdminDashboard /></RoleRoute>} />
          <Route path="medecins" element={<RoleRoute allowedRoles={['admin_hopital', 'admin_general']}><AdminDoctorsPage /></RoleRoute>} />
          <Route path="services" element={<RoleRoute allowedRoles={['admin_hopital', 'admin_general']}><AdminServicesPage /></RoleRoute>} />
          <Route path="staff" element={<RoleRoute allowedRoles={['admin_hopital', 'admin_general']}><AdminStaffPage /></RoleRoute>} />
        </Route>
        
        <Route path="/super-admin">
          <Route path="dashboard" element={<RoleRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></RoleRoute>} />
          <Route path="entities" element={<RoleRoute allowedRoles={['super_admin']}><EntitiesPage /></RoleRoute>} />
          <Route path="entities/:id" element={<RoleRoute allowedRoles={['super_admin']}><EntityDetailPage /></RoleRoute>} />
          <Route path="users" element={<RoleRoute allowedRoles={['super_admin']}><UsersPage /></RoleRoute>} />
        </Route>
        
        <Route path="/laborantin">
          <Route path="dashboard" element={<RoleRoute allowedRoles={['laborantin']}><LaborantinDashboard /></RoleRoute>} />
        </Route>
        
        <Route path="/results" element={<RoleRoute allowedRoles={['patient', 'medecin', 'laborantin']}><ResultsPage /></RoleRoute>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/security" element={<SecurityPage />} />
        <Route path="/profile/security/change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-surface">
            <AppRoutes />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
