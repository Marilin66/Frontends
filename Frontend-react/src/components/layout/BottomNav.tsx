// @ts-nocheck
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

export function BottomNav() {
  const { user } = useAuth();
  
  if (!user) return null;

  let navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/patient/search', icon: Search, label: 'Recherche' },
    { path: '/patient/ai-agent', icon: Bot, label: 'IA Santé', highlight: true },
    { path: '/patient/appointments', icon: Calendar, label: 'RDV' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  // Adapter les items selon le rôle
  if (user.role === 'medecin') {
    navItems = [
      { path: '/', icon: Home, label: 'Accueil' },
      { path: '/doctor/patients', icon: Search, label: 'Patients' },
      { path: '/doctor/agenda', icon: Calendar, label: 'Agenda' },
      { path: '/messages', icon: MessageCircle, label: 'Messages' },
      { path: '/profile', icon: User, label: 'Profil' },
    ];
  } else if (user.role === 'admin_hopital' || user.role === 'admin_general') {
    navItems = [
      { path: '/', icon: Home, label: 'Accueil' },
      { path: '/admin/medecins', icon: Search, label: 'Médecins' },
      { path: '/admin/services', icon: Calendar, label: 'Services' },
      { path: '/messages', icon: MessageCircle, label: 'Messages' },
      { path: '/profile', icon: User, label: 'Profil' },
    ];
  } else if (user.role === 'laborantin') {
    navItems = [
      { path: '/', icon: Home, label: 'Accueil' },
      { path: '/results', icon: Search, label: 'Résultats' },
      { path: '/messages', icon: MessageCircle, label: 'Messages' },
      { path: '/profile', icon: User, label: 'Profil' },
    ];
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary-light/95 backdrop-blur-xl border-t border-slate-200 z-[500] px-2 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex flex-col items-center justify-center gap-1 transition-all relative px-3 py-1",
                isActive ? "text-primary scale-110" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {item.highlight ? (
                <div className="relative -mt-8">
                  <div className="absolute inset-0 bg-primary/15 rounded-full blur-lg animate-pulse" />
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border-2 transition-all",
                    "bg-primary border-secondary-light text-white"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              ) : (
                <>
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest italic">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
