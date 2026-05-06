// @ts-nocheck
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, LogIn, UserPlus, Phone, Building2, Bot, HeartPulse, FlaskConical } from 'lucide-react';

/**
 * Layout léger pour les pages publiques (sans authentification requise).
 * Affiche une navbar minimale avec liens vers les fonctionnalités publiques
 * et un bouton de connexion.
 */
export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Navbar publique ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg hidden sm:block">Hopitel</span>
          </Link>

          {/* Liens publics — desktop */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/hospitals"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Building2 className="w-4 h-4" /> Hôpitaux
            </Link>
            <Link
              to="/emergency"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-red-600 transition-all"
            >
              <Phone className="w-4 h-4" /> Urgences
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Bot className="w-4 h-4" /> Assistant IA
            </Link>
            <Link
              to="/tips"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <HeartPulse className="w-4 h-4" /> Conseils Santé
            </Link>
            <Link
              to="/track-results"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <FlaskConical className="w-4 h-4" /> Résultats Labo
            </Link>
          </div>

          {/* CTA auth */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardRoute())}
                className="flex items-center gap-2 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-all shadow-sm"
              >
                Mon espace
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:block">Connexion</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:block">S'inscrire</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Liens publics — mobile scroll */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar text-xs font-medium text-slate-600">
          <Link to="/hospitals" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5" /> Hôpitaux
          </Link>
          <Link to="/emergency" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 whitespace-nowrap">
            <Phone className="w-3.5 h-3.5" /> Urgences
          </Link>
          <Link to="/chatbot" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 whitespace-nowrap">
            <Bot className="w-3.5 h-3.5" /> Assistant IA
          </Link>
          <Link to="/tips" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 whitespace-nowrap">
            <HeartPulse className="w-3.5 h-3.5" /> Conseils
          </Link>
          <Link to="/track-results" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 whitespace-nowrap">
            <FlaskConical className="w-3.5 h-3.5" /> Résultats
          </Link>
        </div>
      </nav>

      {/* ── Contenu ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* ── Footer minimal ── */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Hopitel — République du Bénin</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Conditions</Link>
            <Link to="/emergency" className="hover:text-slate-900 transition-colors">Urgences</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
