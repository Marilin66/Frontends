// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Button } from '@/components/ui';
import { 
  Bell, 
  Menu, 
  Search, 
  LogOut, 
  User as UserIcon, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export function Header({ onMenuClick, onNotificationsClick, notificationCount = 0 }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleLabel = (role) => {
    const labels = {
      patient: 'Patient Certifié',
      medecin: 'Praticien',
      admin_hopital: 'Directeur',
      admin_general: 'Administrateur Général',
      super_admin: 'Gouverneur',
      laborantin: 'Analyste',
    };
    return labels[role] || role;
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 10, scale: 0.95 }
  };

  return (
    <header className={`sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-fb-divider transition-all ${isScrolled ? 'shadow-fb' : ''} h-14 lg:h-16`}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={onMenuClick} className="lg:hidden h-9 w-9 rounded-full bg-fb-hover flex items-center justify-center hover:bg-fb-divider">
            <Menu className="w-5 h-5 text-fb-gray" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Hopitel Logo" className="w-9 h-9 lg:w-10 lg:h-10 object-contain" />
            <span className="hidden sm:block text-lg lg:text-2xl font-bold text-primary">hopitel</span>
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 max-w-xl relative items-center group">
          <Search className="absolute left-3 w-4 h-4 text-fb-gray group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Rechercher sur Hopitel"
            className="w-full pl-10 pr-4 h-10 bg-surface border-none rounded-full focus:bg-white focus:ring-1 focus:ring-primary/20 text-[15px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onNotificationsClick} className="relative h-10 w-10 rounded-full bg-fb-hover flex items-center justify-center hover:bg-fb-divider group">
            <Bell className="w-5 h-5 text-[#050505]" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 bg-error text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center p-1 rounded-full hover:bg-fb-hover">
               <Avatar src={user?.photo} name={user ? `${user.first_name} ${user.last_name}` : undefined} size="sm" className="w-9 h-9 border border-fb-divider" />
               <ChevronDown className="w-4 h-4 text-fb-gray ml-1" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div 
                  variants={menuVariants} initial="hidden" animate="visible" exit="exit"
                  className="absolute right-0 mt-3 w-80 bg-white rounded-fb shadow-fb-md border border-fb-divider p-2"
                >
                   <div className="px-4 py-3 hover:bg-fb-hover rounded-fb mb-2 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar src={user?.photo} size="md" className="w-10 h-10" />
                        <div className="min-w-0">
                          <p className="text-[17px] font-semibold text-[#050505] truncate">{user?.first_name} {user?.last_name}</p>
                          <p className="text-[14px] text-fb-gray truncate">{getRoleLabel(user?.role)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-[15px] font-semibold text-[#050505] hover:bg-fb-hover rounded-fb group" onClick={() => setShowUserMenu(false)}>
                         <div className="w-9 h-9 bg-fb-hover rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5" /></div>
                         <span className="flex-1">Voir mon profil</span>
                         <ChevronRight className="w-5 h-5 text-fb-gray" />
                      </Link>
                      <div className="h-px bg-fb-divider my-2 mx-2" />
                      <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-[15px] font-semibold text-[#050505] hover:bg-fb-hover rounded-fb group">
                        <div className="w-9 h-9 bg-fb-hover rounded-full flex items-center justify-center"><LogOut className="w-5 h-5" /></div>
                        <span className="flex-1 text-left">Déconnexion</span>
                      </button>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
