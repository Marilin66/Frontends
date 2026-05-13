// @ts-nocheck
import { NavLink } from 'react-router-dom';
import {
  Home, Search, Calendar, MessageCircle, User, Bot,
  LayoutDashboard, FlaskConical, History, Stethoscope,
  Activity, Settings, Building, Users, BarChart2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem { path: string; icon: any; label: string; end?: boolean; highlight?: boolean }

export function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getItems = (): NavItem[] => {
    if (role === 'patient') return [
      { path: '/patient',              icon: Home,          label: 'Accueil',   end: true },
      { path: '/patient/search',       icon: Search,        label: 'Recherche' },
      { path: '/patient/ai-agent',     icon: Bot,           label: 'IA',        highlight: true },
      { path: '/patient/appointments', icon: Calendar,      label: 'RDV' },
      { path: '/patient/profile',      icon: User,          label: 'Profil' },
    ];
    if (role === 'medecin') return [
      { path: '/medecin',              icon: Home,          label: 'Accueil',   end: true },
      { path: '/medecin/agenda',       icon: Calendar,      label: 'Agenda' },
      { path: '/medecin/patients',     icon: Users,         label: 'Patients' },
      { path: '/medecin/messagerie',   icon: MessageCircle, label: 'Messages' },
      { path: '/medecin/settings',     icon: Settings,      label: 'Paramètres' },
    ];
    if (role === 'admin_hopital') return [
      { path: '/admin-hopital',                icon: Home,          label: 'Accueil',   end: true },
      { path: '/admin-hopital/medecins',       icon: Stethoscope,   label: 'Médecins' },
      { path: '/admin-hopital/services',       icon: Activity,      label: 'Services' },
      { path: '/admin-hopital/messagerie',     icon: MessageCircle, label: 'Messages' },
      { path: '/admin-hopital/settings',       icon: Settings,      label: 'Paramètres' },
    ];
    if (role === 'super_admin' || role === 'admin_general') return [
      { path: '/super-admin',                  icon: LayoutDashboard, label: 'Accueil',   end: true },
      { path: '/super-admin/hopitaux',         icon: Building,        label: 'Hôpitaux' },
      { path: '/super-admin/demandes',         icon: Activity,        label: 'Demandes' },
      { path: '/super-admin/messagerie',       icon: MessageCircle,   label: 'Messages' },
      { path: '/super-admin/settings',         icon: Settings,        label: 'Paramètres' },
    ];
    if (role === 'laborantin') return [
      { path: '/laborantin',                   icon: LayoutDashboard, label: 'Accueil',   end: true },
      { path: '/laborantin/pending',           icon: FlaskConical,    label: 'Analyses' },
      { path: '/laborantin/finished',          icon: History,         label: 'Archives' },
      { path: '/laborantin/messagerie',        icon: MessageCircle,   label: 'Messages' },
      { path: '/laborantin/settings',          icon: Settings,        label: 'Paramètres' },
    ];
    return [{ path: '/', icon: Home, label: 'Accueil', end: true }];
  };

  const items = getItems();

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 shadow-2xl shadow-slate-900/10 rounded-[2rem] transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 py-1 min-w-0 transition-all
                ${isActive ? 'text-primary scale-110' : 'text-slate-400'}`
              }
            >
              {({ isActive }) =>
                item.highlight ? (
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive ? 'bg-primary-dark rotate-6' : 'bg-primary'}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                    </div>
                    <span className={`text-[9px] font-bold truncate max-w-full px-1 uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                      {item.label}
                    </span>
                  </>
                )
              }
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
