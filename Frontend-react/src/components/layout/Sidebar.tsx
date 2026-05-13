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

function NavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mx-2
        ${isActive
          ? `bg-blue-50 dark:bg-primary/10 text-primary shadow-sm ring-1 ring-blue-100 dark:ring-primary/20`
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className={`ml-auto ${isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function NavSection({ title, items, onClose }: { title?: string; items: NavItem[]; onClose: () => void }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{title}</p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.path}>
            <NavItem item={item} onClose={onClose} />
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
          { path: '/patient', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
          { path: '/patient/messagerie', icon: MessageCircle, label: 'Messagerie' },
        ]
      },
      {
        title: 'Ma Santé',
        items: [
          { path: '/patient/appointments', icon: Calendar,      label: 'Mes rendez-vous' },
          { path: '/patient/results',      icon: FileText,      label: 'Mes documents' },
          { path: '/patient/nearby',       icon: Building,      label: 'Hôpitaux' },
          { path: '/patient/ai-agent',     icon: Bot,           label: 'Assistant IA' },
        ]
      },

    ];

    if (role === 'medecin') return [
      {
        items: [
          { path: '/medecin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
          { path: '/medecin/messagerie', icon: MessageCircle, label: 'Messagerie' },
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

    ];

    if (role === 'admin_hopital') return [
      {
        items: [
          { path: '/admin-hopital', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
          { path: '/admin-hopital/messagerie', icon: MessageCircle, label: 'Messagerie' },
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
        ]
      },

    ];

    if (role === 'super_admin' || role === 'admin_general') return [
      {
        items: [
          { path: '/super-admin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
          { path: '/super-admin/messagerie', icon: MessageCircle, label: 'Messagerie' },
        ]
      },
      {
        title: 'Administration',
        items: [
          { path: '/super-admin/hopitaux',    icon: Building,      label: 'Hôpitaux' },
          { path: '/super-admin/users',       icon: Users,         label: 'Administrateurs' },
          { path: '/super-admin/services',    icon: Activity,      label: 'Services globaux' },
          { path: '/super-admin/demandes',    icon: FileText,      label: 'Demandes' },
        ]
      },

    ];

    if (role === 'laborantin') return [
      {
        items: [
          { path: '/laborantin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
          { path: '/laborantin/messagerie', icon: MessageCircle, label: 'Messagerie' },
        ]
      },
      {
        title: 'Analyses',
        items: [
          { path: '/laborantin/pending',      icon: FlaskConical,  label: 'En cours' },
          { path: '/laborantin/finished',     icon: History,       label: 'Clôturées' },
        ]
      },

    ];

    return [{ items: [{ path: '/', icon: Home, label: 'Accueil', end: true }] }];
  };

  const sections = getNavSections();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none transition-colors duration-300">
      {/* Branding mobile only (visible in drawer) */}
      <div className="lg:hidden p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <img src="/logo.png" alt="Hopitel Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Navigation — commence directement en haut car le logo est dans le header sur desktop */}
      <nav className="flex-1 overflow-y-auto pt-4 pb-4 custom-scrollbar">
        {sections.map((section, i) => (
          <NavSection
            key={i}
            title={section.title}
            items={section.items}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* Logout en bas */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-white transition-all group border border-transparent hover:border-red-100 hover:shadow-sm"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer mobile */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 z-[110] h-full w-72 lg:hidden shadow-2xl"
      >
        {sidebarContent}
      </motion.aside>

      {/* Sidebar desktop — toujours visible, largeur fixe sous le header */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-full bg-white dark:bg-slate-900 transition-colors">
        {sidebarContent}
      </aside>
    </>
  );
}
