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
        setUnreadCount(list.filter((n: any) => !n.est_lu).length);
      })
      .catch(() => {});
  }, [user]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar desktop fixe */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNotificationsClick={() => navigate('/notifications')}
          notificationCount={unreadCount}
        />

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Conteneur centré avec max-width large pour le web */}
          <div className="max-w-screen-xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-10 pb-24 lg:pb-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav uniquement sur mobile */}
      <BottomNav />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
      {/* Décoration de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/25">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Hopitel</h1>
          <p className="text-slate-500 text-sm mt-1">Plateforme de santé numérique</p>
        </div>

        {/* Card formulaire */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Hopitel — République du Bénin
        </p>
      </div>
    </div>
  );
}
