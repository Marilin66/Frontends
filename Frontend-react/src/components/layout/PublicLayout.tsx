// @ts-nocheck
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, LogIn, UserPlus, Phone, Building2, Bot, HeartPulse, FlaskConical, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Footer } from './Footer';

/**
 * Layout léger pour les pages publiques (sans authentification requise).
 * Affiche une navbar minimale avec liens vers les fonctionnalités publiques
 * et un bouton de connexion.
 */
export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    const routes: Record<string, string> = {
      patient: '/patient',
      medecin: '/medecin',
      admin_hopital: '/admin-hopital',
      admin_general: '/super-admin',
      super_admin: '/super-admin',
      laborantin: '/laborantin',
    };
    return routes[user.role] || '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      {/* ── Navbar publique Premium Unifiée ── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-20 flex items-center shrink-0">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 flex items-center justify-between gap-8">
          {/* Logo & Branding avec Animation Premium */}
          <Link to={getDashboardRoute()} className="flex items-center gap-4 shrink-0 group">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
              <img src="/logo.png" alt="Hopitel Logo" className="h-14 w-auto object-contain relative z-10 drop-shadow-md" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col"
            >
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                HOPITEL
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">
                Bénin Santé
              </span>
            </motion.div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Établissements', to: '/hospitals' },
              { label: 'Urgences', to: '/emergency', activeClass: 'hover:text-red-600', activeColor: 'text-red-600' },
              { label: 'Assistant IA', to: '/chatbot' },
              { label: 'Résultats', to: '/track-results' },
            ].map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to}
                className={({ isActive }) => `
                  relative text-sm font-bold transition-all duration-300 py-2
                  ${isActive 
                    ? (link.activeColor || 'text-primary') 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${link.to === '/emergency' ? 'bg-red-600' : 'bg-primary'}`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 mr-2"
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardRoute())}
                className="bg-primary text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Mon espace
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors px-2">Connexion</Link>
                <Link to="/register" className="bg-primary text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Barre de navigation mobile secondaire (optionnelle mais utile pour l'accès direct) */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {[
            { label: 'Hôpitaux', to: '/hospitals' },
            { label: 'Urgences', to: '/emergency' },
            { label: 'IA', to: '/chatbot' },
            { label: 'Résultats', to: '/track-results' },
          ].map((link, i) => (
            <NavLink 
              key={i} 
              to={link.to} 
              className={({ isActive }) => `
                text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl whitespace-nowrap border transition-all
                ${isActive 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}
              `}
            >
              {link.label}
            </NavLink>
          ))}
      </div>

      {/* ── Contenu ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* ── Footer Premium ── */}
      <Footer />
    </div>
  );
}
