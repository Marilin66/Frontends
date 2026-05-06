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
      { path: '/medecin/profile',      icon: Settings,      label: 'Paramètres' },
    ];
    if (role === 'admin_hopital') return [
      { path: '/admin-hopital',                icon: Home,          label: 'Accueil',   end: true },
      { path: '/admin-hopital/medecins',       icon: Stethoscope,   label: 'Médecins' },
      { path: '/admin-hopital/services',       icon: Activity,      label: 'Services' },
      { path: '/admin-hopital/messages',       icon: MessageCircle, label: 'Messages' },
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
      { path: '/laborantin',                   icon: LayoutDashboard, label: 'Dashboard', end: true },
      { path: '/laborantin/pending',           icon: FlaskConical,    label: 'En cours' },
      { path: '/laborantin/finished',          icon: History,         label: 'Clôturées' },
      { path: '/laborantin/messagerie',        icon: MessageCircle,   label: 'Messages' },
      { path: '/laborantin/profile',           icon: User,            label: 'Profil' },
    ];
    return [{ path: '/', icon: Home, label: 'Accueil', end: true }];
  };

  const items = getItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 py-1 min-w-0 transition-colors
                ${isActive ? 'text-primary' : 'text-slate-400'}`
              }
            >
              {({ isActive }) =>
                item.highlight ? (
                  <div className="relative -mt-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive ? 'bg-primary-dark' : 'bg-primary'}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[10px] font-medium truncate max-w-full px-1">{item.label}</span>
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
