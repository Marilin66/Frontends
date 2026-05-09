// @ts-nocheck
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppLayout, AuthLayout } from '@/components/layout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageLoader } from '@/components/ui';
import { AIBubble } from '@/components/ui/AIBubble';

// ── Public ──────────────────────────────────────────────────────────────────
import PublicHomePage        from '@/pages/public/PublicHomePage';
import TrackResultsPage      from '@/pages/public/TrackResultsPage';
import PublicChatbotPage     from '@/pages/public/PublicChatbotPage';
import PublicHospitalsPage   from '@/pages/public/PublicHospitalsPage';

// ── Auth ─────────────────────────────────────────────────────────────────────
import LoginPage           from '@/pages/auth/LoginPage';
import RegisterPage        from '@/pages/auth/RegisterPage';
import ForgotPasswordPage  from '@/pages/auth/ForgotPasswordPage';

// ── Common (partagées) ───────────────────────────────────────────────────────
import OnboardingPage      from '@/pages/common/OnboardingPage';
import EmergencyNumbersPage from '@/pages/common/EmergencyNumbersPage';
import HealthTipsPage      from '@/pages/patient/HealthTipsPage';
import TermsPage           from '@/pages/common/TermsPage';
import NotificationsPage   from '@/pages/common/NotificationsPage';
import MessagesPage        from '@/pages/common/MessagesPage';
import ProfilePage         from '@/pages/common/ProfilePage';
import ChangePasswordPage  from '@/pages/common/ChangePasswordPage';
import SecurityPage        from '@/pages/common/SecurityPage';
import SettingsPage        from '@/pages/common/SettingsPage';
import ResultsPage         from '@/pages/common/ResultsPage';
import PatientsPage        from '@/pages/common/PatientsPage';

// ── Patient ──────────────────────────────────────────────────────────────────
import PatientDashboard        from '@/pages/patient/PatientDashboard';
import SearchPage              from '@/pages/common/SearchPage';
import AppointmentsPage        from '@/pages/common/AppointmentsPage';
import HospitalDetailPage      from '@/pages/patient/HospitalDetailPage';
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

/** Redirige vers le home du rôle après connexion */
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
      {/* ── Page publique d'accueil ── */}
      <Route path="/" element={<PublicHomePage />} />

      {/* ── Routes publiques avec layout ── */}
      <Route element={<PublicLayout />}>
        <Route path="/hospitals"      element={<PublicHospitalsPage />} />
        <Route path="/nearby"          element={<PublicHospitalsPage />} />
        <Route path="/chatbot"         element={<PublicChatbotPage />} />
        <Route path="/track-results"   element={<TrackResultsPage />} />
        <Route path="/hopital/:id"     element={<HospitalDetailPage />} />
        <Route path="/terms"           element={<TermsPage />} />
        <Route path="/emergency"       element={<EmergencyNumbersPage />} />
        <Route path="/tips"            element={<HealthTipsPage />} />
        <Route path="/onboarding"      element={<OnboardingPage />} />
      </Route>

      {/* ── Auth layout ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* ── App layout (authentifié) ── */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

        {/* Redirections génériques */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/app"       element={<DashboardRedirect />} />

        {/* ── PATIENT (/patient/*) ── identique au PatientShell Flutter ── */}
        <Route path="/patient">
          <Route index element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>} />
          <Route path="search"       element={<RoleRoute allowedRoles={['patient']}><SearchPage /></RoleRoute>} />
          <Route path="appointments" element={<RoleRoute allowedRoles={['patient']}><AppointmentsPage /></RoleRoute>} />
          <Route path="messagerie"   element={<RoleRoute allowedRoles={['patient']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"      element={<RoleRoute allowedRoles={['patient']}><ProfilePage /></RoleRoute>} />
          {/* Sous-pages patient */}
          <Route path="hopital/:id"                        element={<RoleRoute allowedRoles={['patient']}><HospitalDetailPage /></RoleRoute>} />
          <Route path="hopital/:hospitalId/service/:serviceId" element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="medecin/:doctorId/rendezvous"       element={<RoleRoute allowedRoles={['patient']}><AppointmentBookingPage /></RoleRoute>} />
          <Route path="rdv/:rdvId/intake"                  element={<RoleRoute allowedRoles={['patient']}><PatientIntakePage /></RoleRoute>} />
          <Route path="rdv/:rdvId/intake/:medecinNom"      element={<RoleRoute allowedRoles={['patient']}><PatientIntakePage /></RoleRoute>} />
          {/* nearby & ai-agent restent accessibles aux patients connectés (avec sidebar) */}
          <Route path="nearby"       element={<RoleRoute allowedRoles={['patient']}><NearbyHospitalsPage /></RoleRoute>} />
          <Route path="ai-agent"     element={<RoleRoute allowedRoles={['patient']}><AIAgentPage /></RoleRoute>} />
          <Route path="results"      element={<RoleRoute allowedRoles={['patient']}><ResultsPage /></RoleRoute>} />
          <Route path="results/:id/share" element={<RoleRoute allowedRoles={['patient']}><ResultSharePage /></RoleRoute>} />
          <Route path="consultation/:id"  element={<RoleRoute allowedRoles={['patient']}><PatientConsultationDetailPage /></RoleRoute>} />
          {/* result-code accessible aussi sans auth via /track-results */}
          <Route path="result-code"  element={<RoleRoute allowedRoles={['patient']}><TrackResultsPage /></RoleRoute>} />
          <Route path="profile/edit" element={<RoleRoute allowedRoles={['patient']}><EditProfilePage /></RoleRoute>} />
          <Route path="profile/security" element={<RoleRoute allowedRoles={['patient']}><SecurityPage /></RoleRoute>} />
          <Route path="profile/security/change-password" element={<RoleRoute allowedRoles={['patient']}><ChangePasswordPage /></RoleRoute>} />
        </Route>

        {/* ── MÉDECIN (/medecin/*) ── identique au MedecinShell Flutter ── */}
        <Route path="/medecin">
          <Route index         element={<RoleRoute allowedRoles={['medecin']}><DoctorDashboard /></RoleRoute>} />
          <Route path="agenda"     element={<RoleRoute allowedRoles={['medecin']}><DoctorAgendaPage /></RoleRoute>} />
          <Route path="patients"   element={<RoleRoute allowedRoles={['medecin']}><PatientsPage /></RoleRoute>} />
          <Route path="consultations"    element={<RoleRoute allowedRoles={['medecin']}><ConsultationsPage /></RoleRoute>} />
          <Route path="consultations/:id" element={<RoleRoute allowedRoles={['medecin']}><ConsultationDetailPage /></RoleRoute>} />
          <Route path="messagerie" element={<RoleRoute allowedRoles={['medecin']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"    element={<RoleRoute allowedRoles={['medecin']}><SettingsPage /></RoleRoute>} />
          <Route path="profile/change-password" element={<RoleRoute allowedRoles={['medecin']}><ChangePasswordPage /></RoleRoute>} />
          <Route path="results"    element={<RoleRoute allowedRoles={['medecin']}><ResultsPage /></RoleRoute>} />
        </Route>

        {/* ── ADMIN HÔPITAL (/admin-hopital/*) ── */}
        <Route path="/admin-hopital">
          <Route index              element={<RoleRoute allowedRoles={['admin_hopital']}><AdminDashboard /></RoleRoute>} />
          <Route path="medecins"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminDoctorsPage /></RoleRoute>} />
          <Route path="laborantins" element={<RoleRoute allowedRoles={['admin_hopital']}><AdminStaffPage /></RoleRoute>} />
          <Route path="services"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminServicesPage /></RoleRoute>} />
          <Route path="demandes"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminDemandesPage /></RoleRoute>} />
          <Route path="patients"    element={<RoleRoute allowedRoles={['admin_hopital']}><AdminPatientsPage /></RoleRoute>} />
          <Route path="stats"       element={<RoleRoute allowedRoles={['admin_hopital']}><AdminStatsPage /></RoleRoute>} />
          <Route path="messages"    element={<RoleRoute allowedRoles={['admin_hopital']}><MessagesPage /></RoleRoute>} />
          <Route path="settings"    element={<RoleRoute allowedRoles={['admin_hopital']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['admin_hopital']}><ChangePasswordPage /></RoleRoute>} />
        </Route>

        {/* ── SUPER ADMIN (/super-admin/*) ── */}
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
          <Route path="settings"    element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><SettingsPage /></RoleRoute>} />
          <Route path="settings/change-password" element={<RoleRoute allowedRoles={['super_admin', 'admin_general']}><ChangePasswordPage /></RoleRoute>} />
        </Route>

        {/* ── LABORANTIN (/laborantin/*) ── identique au LaborantinShell Flutter ── */}
        <Route path="/laborantin">
          <Route index              element={<RoleRoute allowedRoles={['laborantin']}><LaborantinDashboard /></RoleRoute>} />
          <Route path="pending"     element={<RoleRoute allowedRoles={['laborantin']}><LaborantinPendingPage /></RoleRoute>} />
          <Route path="finished"    element={<RoleRoute allowedRoles={['laborantin']}><LaborantinFinishedPage /></RoleRoute>} />
          <Route path="messagerie"  element={<RoleRoute allowedRoles={['laborantin']}><MessagesPage /></RoleRoute>} />
          <Route path="profile"     element={<RoleRoute allowedRoles={['laborantin']}><SettingsPage /></RoleRoute>} />
          <Route path="profile/change-password" element={<RoleRoute allowedRoles={['laborantin']}><ChangePasswordPage /></RoleRoute>} />
        </Route>

        {/* ── Routes communes (notifications, résultats globaux) ── */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/results"       element={<ResultsPage />} />

        {/* Anciennes routes → redirections pour compatibilité */}
        <Route path="/messages"      element={<Navigate to="/dashboard" replace />} />
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
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-surface">
            <AppRoutes />
            <AIBubble />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
