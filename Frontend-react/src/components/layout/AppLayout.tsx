// @ts-nocheck
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const response = await api.get(endpoints.notifications);
          const results = Array.isArray(response) ? response : response.results || [];
          setUnreadCount(results.filter((n) => !n.est_lu).length);
        } catch (error) { console.error('Erreur notifications:', error); }
      }
    };
    fetchNotifications();
  }, [user]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-premium-mesh flex overflow-hidden">
      {/* Sidebar - Fixe sur Desktop, Drawer sur Mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Plus fin et intégré */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          onNotificationsClick={() => navigate('/notifications')} 
          notificationCount={unreadCount} 
        />
        
        {/* Zone de contenu principale - Scrollable indépendamment */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Navigation mobile uniquement */}
      <BottomNav />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
           <img src="/logo.png" alt="Hopitel Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
           <h1 className="text-4xl font-bold text-primary tracking-tight">hopitel</h1>
           <p className="text-xl text-fb-gray mt-2">Gestion Hospitalière Connectée</p>
        </div>
        <div className="bg-white p-6 rounded-fb shadow-fb-md border border-fb-divider">
           <Outlet />
        </div>
      </div>
    </div>
  );
}
