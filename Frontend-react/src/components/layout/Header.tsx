// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Badge } from '@/components/ui';
import { Bell, Menu, Search, LogOut, User as UserIcon, Settings, ChevronDown, HelpCircle } from 'lucide-react';

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
  const [showMenu, setShowMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
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

  // Fermer le menu au changement de route
  useEffect(() => { setShowMenu(false); }, [location.pathname]);

  const getProfilePath = () => {
    if (role === 'patient') return '/patient/profile';
    if (role === 'medecin') return '/medecin/profile';
    if (role === 'laborantin') return '/laborantin/profile';
    return '/admin-hopital/settings';
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200/80 flex items-center px-6 gap-4 shadow-sm">
      {/* Burger mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb / titre de page — desktop uniquement */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 min-w-0">
        <span className="font-medium text-slate-900 truncate">
          {ROLE_LABELS[role]}
        </span>
      </div>

      {/* Barre de recherche — desktop */}
      <div className={`hidden md:flex flex-1 max-w-md relative transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un médecin, hôpital, service..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full h-10 pl-10 pr-4 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Actions droite */}
      <div className="flex items-center gap-1">
        {/* Aide */}
        <button className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Séparateur */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" className="w-8 h-8 flex-shrink-0" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.first_name} {user?.last_name}</p>
              <p className={`text-[11px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${ROLE_BADGE[role]}`}>
                {ROLE_LABELS[role]}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 py-2 animate-slide-up overflow-hidden">
              {/* Header utilisateur */}
              <div className="px-4 py-3 border-b border-slate-100 mb-1">
                <div className="flex items-center gap-3">
                  <Avatar name={`${user?.first_name} ${user?.last_name}`} size="md" className="w-11 h-11 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${ROLE_BADGE[role]}`}>
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="px-2">
                <button
                  onClick={() => { navigate(getProfilePath()); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Mon profil</p>
                    <p className="text-xs text-slate-400">Informations personnelles</p>
                  </div>
                </button>

                <button
                  onClick={() => { navigate('/notifications'); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                    <Bell className="w-4 h-4 text-slate-500" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Notifications</p>
                    {notificationCount > 0 && (
                      <p className="text-xs text-red-500">{notificationCount} non lue{notificationCount > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => { navigate(getProfilePath()); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Paramètres</p>
                    <p className="text-xs text-slate-400">Sécurité, langue, préférences</p>
                  </div>
                </button>
              </div>

              {/* Déconnexion */}
              <div className="px-2 pt-1 mt-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="font-medium">Déconnexion</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
