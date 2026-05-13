/**
 * PRIORITÉ ABSOLUE : Cohérence, sobriété, lisibilité, alignement, spacing, uniformité, UX.
 * Si un choix visuel semble “créatif” mais réduit l’aspect professionnel, il doit être rejeté.
 * Chaque page doit sembler appartenir au même produit, avec le même langage visuel.
 * En cas de doute, choisir la solution la plus simple, la plus claire et la plus élégante.
 */
// @ts-nocheck
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoading, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.get(endpoints.notifications)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res.results || [];
        setUnreadCount(list.filter((n: any) => !n.est_lu && !n.lu).length);
      })
      .catch(() => {});
  }, [user]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans selection:bg-primary/10 transition-colors">
      {/* Top Navigation Bar */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationsClick={() => navigate('/notifications')}
        notificationCount={unreadCount}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar handled by its own component with internal overlay */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          <div className="min-h-full p-4 sm:p-6 lg:p-10 pb-28 lg:pb-12">
            <div className="max-w-7xl mx-auto animate-fade-in">
               <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile Access */}
      <BottomNav />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden transition-colors">
      {/* Sophisticated Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] animate-slide-up">
        {/* Minimalist Branding */}
        <div className="text-center mb-10 flex flex-col items-center">
          <img src="/logo.png" alt="Hopitel Logo" className="h-24 w-auto object-contain mb-4" />
          <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest mt-2">
            Plateforme de Santé Bénin
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
          <Outlet />
        </div>

        {/* Subtle Footer */}
        <footer className="mt-12 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
             Infrastructures Sécurisées
           </p>
           <div className="flex items-center justify-center gap-4">
              <span className="text-[11px] text-slate-400 font-medium">© 2026 Hopitel</span>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="text-[11px] text-slate-400 font-medium">Ministère de la Santé</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
