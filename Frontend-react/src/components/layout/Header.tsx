// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Badge } from '@/components/ui';
import { Bell, Menu, Search, LogOut, User as UserIcon, Settings, ChevronDown, HelpCircle, Calendar, Stethoscope, Activity, FlaskConical, Shield, MessageSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ROLE_LABELS: Record<string, string> = {
  patient:       'Patient',
  medecin:       'Médecin',
  admin_hopital: 'Admin Hôpital',
  admin_general: 'Admin Général',
  super_admin:   'Super Admin',
  laborantin:    'Laborantin',
};

const ROLE_BADGE: Record<string, string> = {
  patient:       'bg-blue-100 text-blue-700',
  medecin:       'bg-emerald-100 text-emerald-700',
  admin_hopital: 'bg-orange-100 text-orange-700',
  admin_general: 'bg-orange-100 text-orange-700',
  super_admin:   'bg-violet-100 text-violet-700',
  laborantin:    'bg-cyan-100 text-cyan-700',
};

export function Header({ onMenuClick, onNotificationsClick, notificationCount = 0 }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || 'patient';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setShowMenu(false); }, [location.pathname]);

  const getProfilePath = () => {
    if (role === 'super_admin' || role === 'admin_general') return '/super-admin/profile';
    const r = role.replace('_', '-');
    return `/${r}/profile`;
  };

  const getSettingsPath = () => {
    if (role === 'super_admin' || role === 'admin_general') return '/super-admin/settings';
    const r = role.replace('_', '-');
    return `/${r}/settings`;
  };

  const getDashboardHome = () => {
    if (!user) return '/';
    const routes: Record<string, string> = {
      patient:       '/patient',
      medecin:       '/medecin',
      admin_hopital: '/admin-hopital',
      admin_general: '/super-admin',
      super_admin:   '/super-admin',
      laborantin:    '/laborantin',
    };
    return routes[role] || '/';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard') || path === '/patient' || path === '/medecin' || path === '/admin-hopital' || path === '/super-admin' || path === '/laborantin') {
      if (role === 'admin_hopital') return 'Administration Hospitalière';
      if (role === 'super_admin' || role === 'admin_general') return 'Super Supervision Globale';
      if (role === 'medecin') return 'Espace Médical';
      if (role === 'laborantin') return 'Gestion Laboratoire';
      return 'Tableau de bord';
    }
    if (path.includes('/messagerie')) return 'Messagerie';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/profile')) return 'Mon Profil';
    if (path.includes('/settings')) return 'Paramètres';
    if (path.includes('/medecins')) return 'Gestion des Médecins';
    if (path.includes('/patients')) return 'Gestion des Patients';
    if (path.includes('/services')) return 'Gestion des Services';
    if (path.includes('/demandes')) return 'Suivi des Demandes';
    if (path.includes('/appointments') || path.includes('/rendez-vous')) return 'Rendez-vous';
    if (path.includes('/results') || path.includes('/laboratoire')) return 'Résultats & Analyses';
    if (path.includes('/journey')) return 'Parcours Patient';
    if (path.includes('/nearby')) return 'Hôpitaux à proximité';
    if (path.includes('/ai-agent')) return 'Assistant IA';
    return '';
  };

  return (
    <header className="sticky top-0 z-50 h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-6 gap-4 shadow-sm transition-colors duration-300">
      {/* Logo & Branding Premium */}
      <Link to={getDashboardHome()} className="flex items-center gap-3 pr-6 border-r border-slate-100 dark:border-slate-800 mr-2 group">
        <motion.img 
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          whileHover={{ rotate: 5, scale: 1.1 }}
          src="/logo.png" 
          alt="Hopitel Logo" 
          className="h-10 w-auto object-contain drop-shadow-sm" 
        />
        <div className="hidden sm:block">
          <p className="font-black text-slate-900 dark:text-white text-lg tracking-tighter leading-none transition-colors">HOPITEL</p>
          <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-0.5">Espace Santé</p>
        </div>
      </Link>

      {/* Burger mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Lien de recherche central */}
      {role === 'patient' && (
        <div className="hidden lg:flex flex-1 justify-center">
          <Link 
            to="/patient/search" 
            className="flex items-center gap-3 px-6 py-2.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">Trouver un médecin</span>
          </Link>
        </div>
      )}

      {/* Titre de page dynamique */}
      <div className="flex-1 ml-4 hidden md:block">
        <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          {getPageTitle()}
        </h2>
      </div>

      <div className={`flex-1 md:hidden ${role === 'patient' ? 'lg:hidden' : ''}`} />

      {/* Actions droite */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
          title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-slate-800"></span>
          )}
        </button>

        {/* Messagerie */}
        <button
          onClick={() => {
            const base = role === 'admin_general' ? 'super_admin' : role;
            navigate(`/${base.replace('_', '-')}/messagerie`);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* User profile style Premium */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 h-11 px-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="relative">
              <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" className="w-8 h-8 ring-2 ring-slate-100" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="hidden md:block text-left mr-1">
              <p className="text-sm font-bold text-slate-900 leading-none">{user?.first_name}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 py-2 animate-slide-up overflow-hidden ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE[role]}`}>
                  {ROLE_LABELS[role]}
                </div>
              </div>

              <div className="p-1.5">
                {[
                  { icon: UserIcon, label: 'Mon profil', sub: 'Informations personnelles', path: getProfilePath() },
                  { icon: Settings, label: 'Paramètres', sub: 'Sécurité & Compte', path: getSettingsPath() },
                  { icon: HelpCircle, label: 'Centre d\'aide', sub: 'Besoin d\'assistance ?', path: '/faq' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(item.path); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100">
                      <item.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-none">{item.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-1.5 pt-1 mt-1 border-t border-slate-50">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-100">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="font-bold">Déconnexion</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
