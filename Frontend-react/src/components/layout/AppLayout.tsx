/**
 * PRIORITÉ ABSOLUE : Cohérence, sobriété, lisibilité, alignement, spacing, uniformité, UX.
 * Si un choix visuel semble "créatif" mais réduit l'aspect professionnel, il doit être rejeté.
 * Chaque page doit sembler appartenir au même produit, avec le même langage visuel.
 * En cas de doute, choisir la solution la plus simple, la plus claire et la plus élégante.
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui';
import { ShieldCheck, Server } from 'lucide-react';

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
      {/* Premium Background avec dégradés sophistiqués */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/15 dark:via-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/15 dark:via-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-emerald-500/5 to-sky-500/5 dark:from-emerald-500/8 dark:to-sky-500/8 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-[440px] animate-fade-in-up">
        {/* Branding Premium */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <img src="/logo.png" alt="Hopitel Logo" className="h-28 w-auto object-contain relative z-10" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            HOPITEL
          </h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mt-1.5">
            Bénin Santé
          </p>
        </div>

        {/* Authentication Card Premium */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full" />
          <Outlet />
        </div>

        {/* Subtle Footer */}
        <footer className="mt-10 text-center">
           <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                <ShieldCheck className="w-3 h-3" />
                <span>Chiffré AES-256</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                <Server className="w-3 h-3" />
                <span>RGPD</span>
              </div>
           </div>
           <div className="flex items-center justify-center gap-4">
              <span className="text-[11px] text-slate-400 font-semibold">© 2026 Hopitel</span>
              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="text-[11px] text-slate-400 font-semibold">Ministère de la Santé</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
