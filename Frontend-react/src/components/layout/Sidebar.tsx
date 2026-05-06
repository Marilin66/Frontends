// @ts-nocheck
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, MessageCircle, FileText, Search, User, Users,
  Building, Bell, Bot, Activity, Stethoscope, FlaskConical,
  LayoutDashboard, Settings, LogOut, BarChart2, History,
  ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';

// Couleurs accent par rôle
const ROLE_ACCENT: Record<string, { active: string; dot: string; logo: string }> = {
  patient:       { active: 'text-blue-600 bg-blue-50',    dot: 'bg-blue-600',   logo: 'bg-blue-600' },
  medecin:       { active: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-600', logo: 'bg-emerald-700' },
  admin_hopital: { active: 'text-orange-600 bg-orange-50', dot: 'bg-orange-500', logo: 'bg-orange-600' },
  admin_general: { active: 'text-orange-600 bg-orange-50', dot: 'bg-orange-500', logo: 'bg-orange-600' },
  super_admin:   { active: 'text-violet-700 bg-violet-50', dot: 'bg-violet-600', logo: 'bg-violet-700' },
  laborantin:    { active: 'text-cyan-700 bg-cyan-50',    dot: 'bg-cyan-600',   logo: 'bg-cyan-700' },
};

interface NavItem { path: string; icon: any; label: string; end?: boolean; badge?: number }

function NavItem({ item, accent, onClose }: { item: NavItem; accent: string; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${isActive
          ? `${accent} font-semibold`
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? '' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function NavSection({ title, items, accent, onClose }: { title?: string; items: NavItem[]; accent: string; onClose: () => void }) {
  return (
    <div className="mb-5">
      {title && (
        <p className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.path}>
            <NavItem item={item} accent={accent} onClose={onClose} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';
  const colors = ROLE_ACCENT[role] || ROLE_ACCENT.patient;

  const getNavSections = () => {
    if (role === 'patient') return [
      {
        items: [
          { path: '/patient', icon: Home, label: 'Tableau de bord', end: true },
        ]
      },
      {
        title: 'Santé',
        items: [
          { path: '/patient/search',       icon: Search,        label: 'Trouver un médecin' },
          { path: '/patient/appointments', icon: Calendar,      label: 'Mes rendez-vous' },
          { path: '/patient/results',      icon: FileText,      label: 'Mes résultats' },
          { path: '/patient/nearby',       icon: Building,      label: 'Hôpitaux proches' },
          { path: '/patient/ai-agent',     icon: Bot,           label: 'Assistant IA' },
        ]
      },
      {
        title: 'Communication',
        items: [
          { path: '/patient/messagerie',   icon: MessageCircle, label: 'Messages' },
          { path: '/notifications',        icon: Bell,          label: 'Notifications' },
        ]
      },
      {
        title: 'Compte',
        items: [
          { path: '/patient/profile',      icon: User,          label: 'Mon profil' },
        ]
      },
    ];

    if (role === 'medecin') return [
      {
        items: [
          { path: '/medecin', icon: Home, label: 'Tableau de bord', end: true },
        ]
      },
      {
        title: 'Clinique',
        items: [
          { path: '/medecin/agenda',       icon: Calendar,      label: 'Mon agenda' },
          { path: '/medecin/patients',     icon: Users,         label: 'Mes patients' },
          { path: '/medecin/results',      icon: FileText,      label: 'Résultats' },
        ]
      },
      {
        title: 'Communication',
        items: [
          { path: '/medecin/messagerie',   icon: MessageCircle, label: 'Messages' },
          { path: '/notifications',        icon: Bell,          label: 'Notifications' },
        ]
      },
      {
        title: 'Compte',
        items: [
          { path: '/medecin/profile',      icon: Settings,      label: 'Paramètres' },
        ]
      },
    ];

    if (role === 'admin_hopital') return [
      {
        items: [
          { path: '/admin-hopital', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
        ]
      },
      {
        title: 'Gestion',
        items: [
          { path: '/admin-hopital/medecins',    icon: Stethoscope,   label: 'Médecins' },
          { path: '/admin-hopital/laborantins', icon: FlaskConical,  label: 'Laborantins' },
          { path: '/admin-hopital/services',    icon: Activity,      label: 'Services' },
          { path: '/admin-hopital/demandes',    icon: FileText,      label: 'Demandes' },
          { path: '/admin-hopital/patients',    icon: Users,         label: 'Patients' },
          { path: '/admin-hopital/stats',       icon: BarChart2,     label: 'Statistiques' },
        ]
      },
      {
        title: 'Communication',
        items: [
          { path: '/admin-hopital/messages',    icon: MessageCircle, label: 'Messages' },
          { path: '/notifications',             icon: Bell,          label: 'Notifications' },
        ]
      },
      {
        title: 'Compte',
        items: [
          { path: '/admin-hopital/settings',    icon: Settings,      label: 'Paramètres' },
        ]
      },
    ];

    if (role === 'super_admin' || role === 'admin_general') return [
      {
        items: [
          { path: '/super-admin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
        ]
      },
      {
        title: 'Administration',
        items: [
          { path: '/super-admin/hopitaux',    icon: Building,      label: 'Hôpitaux' },
          { path: '/super-admin/users',       icon: Users,         label: 'Administrateurs' },
          { path: '/super-admin/services',    icon: Activity,      label: 'Services globaux' },
          { path: '/super-admin/demandes',    icon: FileText,      label: 'Demandes' },
          { path: '/super-admin/stats',       icon: BarChart2,     label: 'Statistiques' },
        ]
      },
      {
        title: 'Communication',
        items: [
          { path: '/super-admin/messagerie',  icon: MessageCircle, label: 'Messages' },
          { path: '/notifications',           icon: Bell,          label: 'Notifications' },
        ]
      },
      {
        title: 'Compte',
        items: [
          { path: '/super-admin/settings',    icon: Settings,      label: 'Paramètres' },
        ]
      },
    ];

    if (role === 'laborantin') return [
      {
        items: [
          { path: '/laborantin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
        ]
      },
      {
        title: 'Analyses',
        items: [
          { path: '/laborantin/pending',      icon: FlaskConical,  label: 'En cours' },
          { path: '/laborantin/finished',     icon: History,       label: 'Clôturées' },
        ]
      },
      {
        title: 'Communication',
        items: [
          { path: '/laborantin/messagerie',   icon: MessageCircle, label: 'Messages' },
          { path: '/notifications',           icon: Bell,          label: 'Notifications' },
        ]
      },
      {
        title: 'Compte',
        items: [
          { path: '/laborantin/profile',      icon: User,          label: 'Profil' },
        ]
      },
    ];

    return [{ items: [{ path: '/', icon: Home, label: 'Accueil', end: true }] }];
  };

  const sections = getNavSections();

  const profilePath = role === 'patient'    ? '/patient/profile'
    : role === 'medecin'                    ? '/medecin/profile'
    : role === 'laborantin'                 ? '/laborantin/profile'
    : (role === 'super_admin' || role === 'admin_general') ? '/super-admin/settings'
    : '/admin-hopital/settings';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className={`w-9 h-9 ${colors.logo} rounded-xl flex items-center justify-center shadow-sm`}>
            <span className="text-white font-bold text-base">H</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-base leading-none">Hopitel</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Santé numérique</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 custom-scrollbar">
        {sections.map((section, i) => (
          <NavSection
            key={i}
            title={section.title}
            items={section.items}
            accent={colors.active}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* User card en bas */}
      <div className="flex-shrink-0 p-3 border-t border-slate-100">
        <Link
          to={profilePath}
          onClick={onClose}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" className="w-9 h-9" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${colors.dot} rounded-full border-2 border-white`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer mobile */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 z-50 h-full w-72 lg:hidden shadow-2xl"
      >
        {sidebarContent}
      </motion.aside>

      {/* Sidebar desktop — toujours visible, largeur fixe */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
