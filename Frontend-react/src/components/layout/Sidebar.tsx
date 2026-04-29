// @ts-nocheck
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, MessageCircle, FileText, Search, User, Users, Building, Bell, LifeBuoy, Bot, Activity, Map
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient': return '/patient/dashboard';
      case 'medecin': return '/doctor/dashboard';
      case 'admin_hopital': 
      case 'admin_general': return '/admin/dashboard';
      case 'super_admin': return '/super-admin/dashboard';
      case 'laborantin': return '/laborantin/dashboard';
      default: return '/';
    }
  };

  const navItems = [
    { path: getDashboardPath(), icon: Home, label: 'Accueil' },
    { path: '/notifications', icon: Bell, label: 'Alertes' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
  ];

  if (user?.role === 'patient') {
    navItems.push(
      { path: '/patient/search', icon: Search, label: 'Prendre RDV' },
      { path: '/patient/appointments', icon: Calendar, label: 'Mes RDV' },
      { path: '/patient/ai-agent', icon: Bot, label: 'IA Santé' },
      { path: '/results', icon: FileText, label: 'Résultats' }
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden" onClick={onClose} />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 z-[70] h-full w-72 bg-white/80 backdrop-blur-xl border-r border-fb-divider transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:static'} lg:flex lg:flex-col`}>
        <div className="flex-1 overflow-y-auto px-2 py-4">
           <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={onClose}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-fb font-semibold text-[15px] transition-colors ${isActive ? 'bg-[#E7F3FF] text-primary' : 'text-[#050505] hover:bg-fb-hover'}`}>
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-fb-divider">
          <Link to="/patient/ai-agent" className="bg-fb-hover rounded-fb p-3 flex items-center gap-3 hover:bg-fb-divider transition-all">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"><Bot className="text-white w-5 h-5" /></div>
            <div><p className="text-[#050505] font-semibold text-sm">Assistant IA</p><p className="text-[12px] text-fb-gray">Disponible</p></div>
          </Link>
        </div>
      </aside>
    </>
  );
}
