// @ts-nocheck
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppLayout, AuthLayout } from '@/components/layout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageLoader } from '@/components/ui';
import { AIBubble } from '@/components/ui/AIBubble';

// ── Public ──────────────────────────────────────────────────────────────────
import PublicHomePage        from '@/pages/public/PublicHomePage';
import TrackResultsPage      from '@/pages/public/TrackResultsPage';
import PublicChatbotPage     from '@/pages/public/PublicChatbotPage';
import PublicHospitalsPage   from '@/pages/public/PublicHospitalsPage';
import HospitalDetailPage      from '@/pages/patient/HospitalDetailPage';
import TermsPage           from '@/pages/common/TermsPage';
import FAQPage             from '@/pages/common/FAQPage';
import GuidePage           from '@/pages/common/GuidePage';
import LegalPage           from '@/pages/common/LegalPage';
import EmergencyNumbersPage from '@/pages/common/EmergencyNumbersPage';
import OnboardingPage      from '@/pages/common/OnboardingPage';

// ── Auth ─────────────────────────────────────────────────────────────────────
import LoginPage           from '@/pages/auth/LoginPage';
import RegisterPage        from '@/pages/auth/RegisterPage';
import ForgotPasswordPage  from '@/pages/auth/ForgotPasswordPage';
import VerifyCodePage      from '@/pages/auth/VerifyCodePage';

// ── Common (partagées) ───────────────────────────────────────────────────────
import HealthTipsPage      from '@/pages/patient/HealthTipsPage';
import NotificationsPage   from '@/pages/common/NotificationsPage';
import MessagesPage        from '@/pages/common/MessagesPage';
import ProfilePage         from '@/pages/common/ProfilePage';
import ChangePasswordPage  from '@/pages/common/ChangePasswordPage';
import SecurityPage        from '@/pages/common/SecurityPage';
import SettingsPage        from '@/pages/common/SettingsPage';
import ResultsPage         from '@/pages/common/ResultsPage';
import PatientsPage        from '@/pages/common/PatientsPage';
import SearchPage              from '@/pages/common/SearchPage';
import AppointmentsPage        from '@/pages/common/AppointmentsPage';

// ── Patient ──────────────────────────────────────────────────────────────────
import PatientDashboard        from '@/pages/patient/PatientDashboard';
import AppointmentBookingPage  from '@/pages/patient/AppointmentBookingPage';
import AIAgentPage             from '@/pages/patient/AIAgentPage';
import NearbyHospitalsPage     from '@/pages/patient/NearbyHospitalsPage';
import EditProfilePage         from '@/pages/patient/EditProfilePage';
import PatientIntakePage       from '@/pages/patient/PatientIntakePage';
import PatientConsultationDetailPage from '@/pages/patient/ConsultationDetailPage';
import ResultSharePage         from '@/pages/patient/ResultSharePage';

// ── Médecin ──────────────────────────────────────────────────────────────────
import DoctorDashboard    from '@/pages/doctor/DoctorDashboard';
import DoctorAgendaPage   from '@/pages/common/DoctorAgendaPage';
import ConsultationsPage       from '@/pages/doctor/ConsultationsPage';
import ConsultationDetailPage  from '@/pages/doctor/ConsultationDetailPage';

// ── Admin Hôpital ─────────────────────────────────────────────────────────────
import AdminDashboard     from '@/pages/admin/AdminDashboard';
import AdminDoctorsPage   from '@/pages/admin/AdminDoctorsPage';
import AdminServicesPage  from '@/pages/admin/AdminServicesPage';
import AdminStaffPage     from '@/pages/admin/AdminStaffPage';
import AdminDemandesPage  from '@/pages/admin/AdminDemandesPage';
import AdminPatientsPage  from '@/pages/admin/AdminPatientsPage';
import AdminStatsPage     from '@/pages/admin/AdminStatsPage';
import AdminAppointmentsPage from '@/pages/admin/AdminAppointmentsPage';
import AdminConsultationsPage from '@/pages/admin/AdminConsultationsPage';
import AdminLaboratoryPage from '@/pages/admin/AdminLaboratoryPage';
import AdminPostCarePage from '@/pages/admin/AdminPostCarePage';
import AdminPatientJourneyPage from '@/pages/admin/AdminPatientJourneyPage';

// ── Super Admin ───────────────────────────────────────────────────────────────
import SuperAdminDashboard    from '@/pages/super-admin/SuperAdminDashboard';
import EntitiesPage           from '@/pages/super-admin/EntitiesPage';
import EntityDetailPage       from '@/pages/super-admin/EntityDetailPage';
import CreateHospitalPage     from '@/pages/super-admin/CreateHospitalPage';
import UsersPage              from '@/pages/super-admin/UsersPage';
import SuperAdminStatsPage    from '@/pages/super-admin/SuperAdminStatsPage';
import SuperAdminServicesPage from '@/pages/super-admin/SuperAdminServicesPage';
import SuperAdminDemandesPage from '@/pages/super-admin/SuperAdminDemandesPage';

// ── Laborantin ────────────────────────────────────────────────────────────────
import LaborantinDashboard  from '@/pages/laborantin/LaborantinDashboard';
import LaborantinPendingPage  from '@/pages/laborantin/LaborantinPendingPage';
import LaborantinFinishedPage from '@/pages/laborantin/LaborantinFinishedPage';

// ─────────────────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  const routes: Record<string, string> = {
    patient:       '/patient',
    medecin:       '/medecin',
    admin_hopital: '/admin-hopital',
    admin_general: '/super-admin',
    super_admin:   '/super-admin',
    laborantin:    '/laborantin',
  };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route element={<PublicLayout />}>
        <Route path="/hospitals"      element={<PublicHospitalsPage />} />
        <Route path="/nearby"          element={<PublicHospitalsPage />} />
        <Route path="/chatbot"         element={<PublicChatbotPage />} />
        <Route path="/track-results"   element={<TrackResultsPage />} />
        <Route path="/hopital/:id"     element={<HospitalDetailPage />} />
        <Route path="/terms"          element={<TermsPage />} />
        <Route path="/faq"            element={<FAQPage />} />
        <Route path="/guide"          element={<GuidePage />} />
        <Route path="/legal"          element={<LegalPage />} />
        <Route path="/emergency"      element={<EmergencyNumbersPage />} />
        <Route path="/tips"            element={<HealthTipsPage />} />
        <Route path="/onboarding"      element={<OnboardingPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code"     element={<VerifyCodePage />} />
      </Route>
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/app"       element={<DashboardRedirect />} />
        <Route path="/patient">
          <Route index element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>} />
          <Route path="search"       element={<RoleRoute allowedRoles={['patient']}><SearchPage /></RoleRoute>} />
          <Route path="appointments" element={<RoleRoute allowedRoles={['patient']}><AppointmentsPage /></RoleRoute>} />
          <Route path="messagerie"   element={<RoleRoute allowedRoles={['patient']}><MessagesPage /></RoleRoute>} />

          <Route path="hopital/:id"                        element={<RoleRoute allowedRoles={['patient']}><HospitalDetailPage /></RoleRoute>} />
          <Route path="hopital/:hospitalId/rendezvous"     element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="hopital/:hospitalId/service/:serviceId" element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="medecin/:doctorId/rendezvous"       element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="rdv/:rdvId/intake"                  element={<RoleRoute allowedRoles={['patient']}><PatientIntakePage /></RoleRoute>} />
          <Route path="rdv/:rdvId/intake/:medecinNom"      element={<RoleRoute allowedRoles={['patient']}><PatientIntakePage /></RoleRoute>} />
          <Route path="nearby"       element={<RoleRoute allowedRoles={['patient']}><NearbyHospitalsPage /></RoleRoute>} />
          <Route path="ai-agent"     element={<RoleRoute allowedRoles={['patient']}><AIAgentPage /></RoleRoute>} />
          <Route path="results"      element={<RoleRoute allowedRoles={['patient']}><ResultsPage /></RoleRoute>} />
          <Route path="results/:id/share" element={<RoleRoute allowedRoles={['patient']}><ResultSharePage /></RoleRoute>} />
          <Route path="consultation/:id"  element={<RoleRoute allowedRoles={['patient']}><PatientConsultationDetailPage /></RoleRoute>} />
          <Route path="result-code"  element={<RoleRoute allowedRoles={['patient']}><TrackResultsPage /></RoleRoute>} />
          <Route path="profile"      element={<RoleRoute allowedRoles={['patient']}><ProfilePage /></RoleRoute>} />
          <Route path="profile/edit" element={<RoleRoute allowedRoles={['patient']}><EditProfilePage /></RoleRoute>} />
          <Route path="settings"     element={<RoleRoute allowedRoles={['patient']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['patient']}><ChangePasswordPage /></RoleRoute>} />
        </Route>
        <Route path="/medecin">
          <Route index         element={<RoleRoute allowedRoles={['medecin']}><DoctorDashboard /></RoleRoute>} />
          <Route path="agenda"     element={<RoleRoute allowedRoles={['medecin']}><DoctorAgendaPage /></RoleRoute>} />
          <Route path="patients"   element={<RoleRoute allowedRoles={['medecin']}><PatientsPage /></RoleRoute>} />
          <Route path="consultations"    element={<RoleRoute allowedRoles={['medecin']}><ConsultationsPage /></RoleRoute>} />
          <Route path="consultations/:id" element={<RoleRoute allowedRoles={['medecin']}><ConsultationDetailPage /></RoleRoute>} />
          <Route path="messagerie" element={<RoleRoute allowedRoles={['medecin']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"    element={<RoleRoute allowedRoles={['medecin']}><ProfilePage /></RoleRoute>} />
          <Route path="settings"   element={<RoleRoute allowedRoles={['medecin']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['medecin']}><ChangePasswordPage /></RoleRoute>} />
          <Route path="results"    element={<RoleRoute allowedRoles={['medecin']}><ResultsPage /></RoleRoute>} />
        </Route>
        <Route path="/admin-hopital">
          <Route index              element={<RoleRoute allowedRoles={['admin_hopital']}><AdminDashboard /></RoleRoute>} />
          <Route path="medecins"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminDoctorsPage /></RoleRoute>} />
          <Route path="laborantins" element={<RoleRoute allowedRoles={['admin_hopital']}><AdminStaffPage /></RoleRoute>} />
          <Route path="services"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminServicesPage /></RoleRoute>} />
          <Route path="demandes"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminDemandesPage /></RoleRoute>} />
          <Route path="patients"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminPatientsPage /></RoleRoute>} />
          <Route path="rendez-vous" element={<RoleRoute allowedRoles={['admin_hopital']}><AdminAppointmentsPage /></RoleRoute>} />
          <Route path="consultations" element={<RoleRoute allowedRoles={['admin_hopital']}><AdminConsultationsPage /></RoleRoute>} />
          <Route path="laboratoire" element={<RoleRoute allowedRoles={['admin_hopital']}><AdminLaboratoryPage /></RoleRoute>} />
          <Route path="post-suivi"  element={<RoleRoute allowedRoles={['admin_hopital']}><AdminPostCarePage /></RoleRoute>} />
          <Route path="patient/:patientId/journey" element={<RoleRoute allowedRoles={['admin_hopital']}><AdminPatientJourneyPage /></RoleRoute>} />
          <Route path="stats"       element={<RoleRoute allowedRoles={['admin_hopital']}><AdminStatsPage /></RoleRoute>} />
          <Route path="messagerie"    element={<RoleRoute allowedRoles={['admin_hopital']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"     element={<RoleRoute allowedRoles={['admin_hopital']}><ProfilePage /></RoleRoute>} />
          <Route path="settings"    element={<RoleRoute allowedRoles={['admin_hopital']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['admin_hopital']}><ChangePasswordPage /></RoleRoute>} />
        </Route>
        <Route path="/super-admin">
          <Route index              element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><SuperAdminDashboard /></RoleRoute>} />
          <Route path="hopitaux"    element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><EntitiesPage /></RoleRoute>} />
          <Route path="hopitaux/nouveau" element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><CreateHospitalPage /></RoleRoute>} />
          <Route path="hopitaux/:id" element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><EntityDetailPage /></RoleRoute>} />
          <Route path="users"       element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><UsersPage /></RoleRoute>} />
          <Route path="stats"       element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><SuperAdminStatsPage /></RoleRoute>} />
          <Route path="services"    element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><SuperAdminServicesPage /></RoleRoute>} />
          <Route path="demandes"    element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><SuperAdminDemandesPage /></RoleRoute>} />
          <Route path="messagerie"  element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"     element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><ProfilePage /></RoleRoute>} />
          <Route path="settings"    element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><ChangePasswordPage /></RoleRoute>} />
        </Route>
        <Route path="/laborantin">
          <Route index              element={<RoleRoute allowedRoles={['laborantin']}><LaborantinDashboard /></RoleRoute>} />
          <Route path="pending"     element={<RoleRoute allowedRoles={['laborantin']}><LaborantinPendingPage /></RoleRoute>} />
          <Route path="finished"    element={<RoleRoute allowedRoles={['laborantin']}><LaborantinFinishedPage /></RoleRoute>} />
          <Route path="messagerie"  element={<RoleRoute allowedRoles={['laborantin']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"     element={<RoleRoute allowedRoles={['laborantin']}><ProfilePage /></RoleRoute>} />
          <Route path="settings"    element={<RoleRoute allowedRoles={['laborantin']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['laborantin']}><ChangePasswordPage /></RoleRoute>} />
        </Route>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/results"       element={<ResultsPage />} />
        
        {/* Anciennes routes → redirections pour compatibilité */}
        <Route path="/profile"       element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/dashboard"  element={<Navigate to="/admin-hopital" replace />} />
        <Route path="/admin/medecins"   element={<Navigate to="/admin-hopital/medecins" replace />} />
        <Route path="/admin/services"   element={<Navigate to="/admin-hopital/services" replace />} />
        <Route path="/admin/staff"      element={<Navigate to="/admin-hopital/laborantins" replace />} />
        <Route path="/doctor/dashboard" element={<Navigate to="/medecin" replace />} />
        <Route path="/doctor/agenda"    element={<Navigate to="/medecin/agenda" replace />} />
        <Route path="/doctor/patients"  element={<Navigate to="/medecin/patients" replace />} />
        <Route path="/patient/dashboard" element={<Navigate to="/patient" replace />} />
        <Route path="/laborantin/dashboard" element={<Navigate to="/laborantin" replace />} />
        <Route path="/super-admin/entities"    element={<Navigate to="/super-admin/hopitaux" replace />} />
        <Route path="/super-admin/entities/:id" element={<Navigate to="/super-admin/hopitaux" replace />} />
        <Route path="/super-admin/dashboard"   element={<Navigate to="/super-admin" replace />} />
        <Route path="/help"                    element={<Navigate to="/faq" replace />} />
        <Route path="/parameters"              element={<Navigate to="/dashboard" replace />} />
        <Route path="*"                        element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
              <AppRoutes />
              <AIBubble />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
