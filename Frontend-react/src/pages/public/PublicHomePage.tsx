// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MessageCircle, FileText, Shield, MapPin, ArrowRight, CheckCircle, Star, Users, Building, Activity, Menu, X, Bot, ChevronRight, HeartPulse, Sun, Moon } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { Footer } from '@/components/layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  { title: 'Prise de rendez-vous',   desc: 'Réservez une consultation en quelques clics avec les médecins disponibles.',          icon: Calendar,      color: 'text-blue-600 bg-blue-50',      path: '/register' },
  { title: 'Résultats médicaux',     desc: 'Consultez vos analyses en ligne avec un accès sécurisé par code unique.',             icon: FileText,      color: 'text-emerald-600 bg-emerald-50', path: '/track-results' },
  { title: 'Assistant Santé IA',     desc: 'Posez vos questions à notre IA pour une orientation rapide et des conseils.',         icon: Bot,           color: 'text-violet-600 bg-violet-50',   path: '/chatbot' },
  { title: 'Hôpitaux proches',       desc: 'Trouvez facilement les établissements de santé selon votre position GPS.',            icon: MapPin,        color: 'text-amber-600 bg-amber-50',     path: '/hospitals' },
  { title: 'Données protégées',      desc: 'Vos informations médicales sont chiffrées et protégées selon les normes RGPD.',       icon: Shield,        color: 'text-red-600 bg-red-50',         path: '/register' },
  { title: 'Suivi continu',          desc: 'Gardez votre historique de santé complet et accessible à tout moment.',               icon: Heart,         color: 'text-pink-600 bg-pink-50',        path: '/register' },
];

const stats = [
  { value: '50+',   label: 'Hôpitaux partenaires', icon: Building },
  { value: '500+',  label: 'Médecins certifiés',   icon: Users },
  { value: '10k+',  label: 'Patients actifs',      icon: Activity },
  { value: '99.9%', label: 'Disponibilité',        icon: Star },
];

export default function PublicHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const routes: Record<string, string> = {
        patient: '/patient',
        medecin: '/medecin',
        admin_hopital: '/admin-hopital',
        admin_general: '/super-admin',
        super_admin: '/super-admin',
        laborantin: '/laborantin',
      };
      navigate(routes[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  const getHomePath = () => {
    if (!isAuthenticated || !user) return '/';
    const routes: Record<string, string> = {
      patient: '/patient',
      medecin: '/medecin',
      admin_hopital: '/admin-hopital',
      admin_general: '/super-admin',
      super_admin: '/super-admin',
      laborantin: '/laborantin',
    };
    return routes[user.role] || '/';
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 dark:text-white overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ── Navigation Header Premium ── */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-20 flex items-center justify-between px-6 lg:px-12 transition-colors">
        <div className="flex items-center gap-4 group">
          <Link to={getHomePath()} className="flex items-center gap-4">
            <motion.img 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ rotate: 10, scale: 1.1 }}
              src="/logo.png" 
              alt="Hopitel Logo" 
              className="h-14 w-auto object-contain drop-shadow-md mix-blend-multiply dark:mix-blend-normal" 
            />
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none block">
                HOPITEL
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                Bénin
              </span>
            </motion.div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {[
            { label: 'Accueil', to: getHomePath(), end: true },
            { label: 'Établissements', to: '/hospitals' },
            { label: 'Assistant IA', to: '/chatbot' },
            { label: 'Mes Résultats', to: '/track-results' },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `
                relative text-sm font-black transition-all duration-300 py-2
                ${isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-primary'}
              `}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavDot"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 ml-2 mr-2" />
          <Link to="/login" className="text-sm font-black text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Connexion</Link>
          <Link to="/register" className="bg-primary text-white px-7 py-2.5 rounded-full text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Inscription
          </Link>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>
      {/* ── Hero Section Élargie & Animée Premium ── */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-52 px-6 overflow-hidden bg-white dark:bg-slate-950 transition-colors">
        {/* Background Image with Parallax & Maximum Visibility */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <img 
              src="/hero-bg.jpg" 
              alt="" 
              className="w-full h-full object-cover opacity-100 dark:opacity-40"
            />
            {/* Un dégradé léger pour la lisibilité */}
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950 transition-colors" />
          </motion.div>
        </div>

        {/* Background Digital particles (PC only) */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          {/* Floating Icons/Elements for PC to fill the width */}
          <motion.div 
            animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-[8%] hidden xl:block opacity-30"
          >
            <div className="w-24 h-24 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/50 shadow-2xl">
               <Activity className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 30, 0], x: [0, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-[8%] hidden xl:block opacity-30"
          >
            <div className="w-28 h-28 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl">
               <HeartPulse className="w-14 h-14 text-emerald-500" />
            </div>
          </motion.div>
        </div>

        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          {/* Titre Ultra-Massif Élargi (Badge supprimé) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto pt-4 sm:pt-10"
          >
            <h1 className="text-5xl md:text-8xl lg:text-[115px] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-10 drop-shadow-sm">
              Votre santé, <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">simplifiée.</span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute bottom-2 sm:bottom-4 left-0 h-2 sm:h-6 bg-primary/10 -z-10"
                />
              </span>
            </h1>
          </motion.div>

          {/* Sous-titre Élargi */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-xl lg:text-3xl text-slate-500 dark:text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed mb-16"
          >
            La plateforme hospitalière connectée pour un suivi médical moderne, <br className="hidden lg:block" />
            accessible à tous les citoyens du Bénin.
          </motion.p>

          {/* Boutons Élargis (Bouton IA supprimé) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Button 
              onClick={() => navigate('/register')}
              className="bg-primary text-white font-bold h-20 px-12 rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all group text-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="flex items-center gap-4 relative z-10">
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <Button 
              variant="outline"
              onClick={() => navigate('/hospitals')}
              className="h-20 px-10 rounded-[2rem] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm text-xl backdrop-blur-sm"
            >
              Explorer les hôpitaux
            </Button>
          </motion.div>
        </div>

        {/* Floating Chat Bubble (Assistant IA) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
          className="fixed bottom-10 right-10 z-[100]"
        >
          <Link to="/chatbot" className="group relative flex items-center gap-4">
             <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 pointer-events-none">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Besoin d'aide ? Chattez avec l'IA</p>
             </div>
             <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all group-hover:rotate-12">
                <Bot className="w-10 h-10 text-white" />
                <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full animate-pulse" />
             </div>
          </Link>
        </motion.div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-6 py-16 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">{s.value}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Expertise Domains ── */}
      <section id="services" className="py-24 lg:py-40 px-6 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight">Domaines d'Expertise</h2>
            <p className="text-slate-500 mt-6 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Des solutions innovantes pour chaque étape de votre parcours de santé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full ring-1 ring-slate-100/50 dark:ring-slate-800/50">
                {/* Image Header Style */}
                <div className={`h-56 relative overflow-hidden ${f.color.split(' ')[1]} flex items-center justify-center transition-all duration-700 group-hover:scale-105`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <f.icon className={`w-24 h-24 ${f.color.split(' ')[0]} opacity-10 group-hover:opacity-20 transition-opacity duration-700 group-hover:scale-125 transition-transform`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                      <f.icon className={`w-8 h-8 ${f.color.split(' ')[0]}`} />
                    </div>
                  </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium flex-1">
                    {f.desc}
                  </p>
                  <Link to={f.path} className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">
                    Découvrir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile & App Showcase (Inspiré CarEasy Style) ── */}
      <section className="py-24 lg:py-40 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative z-10">
            <Badge className="bg-primary text-white border-transparent font-bold mb-8 px-4 py-1 animate-pulse">Nouveau : Version 2.0 disponible</Badge>
            <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
              Hopitel dans <span className="text-primary">votre poche</span>
            </h2>
            <p className="text-slate-400 mt-8 text-xl leading-relaxed font-medium">
              Trouvez un prestataire, prenez rendez-vous et suivez vos interventions depuis votre smartphone. Disponible partout, tout le temps.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-14">
               {[
                 { label: '100% Gratuit', sub: 'Pour tous', icon: Shield },
                 { label: 'Ultra léger', sub: '< 15 Mo', icon: Activity },
                 { label: 'Android/iOS', sub: 'Disponible', icon: Bot },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col gap-3 group">
                   <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                     <item.icon className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <p className="font-bold text-white text-base">{item.label}</p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{item.sub}</p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="mt-16 flex flex-wrap gap-4">
               <Button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-primary hover:text-white px-10 h-16 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 border border-slate-100 dark:border-slate-800">
                 Créer un compte gratuitement
               </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[120px]" />
            <div className="relative bg-slate-800 rounded-[3.5rem] p-4 border border-white/10 shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)] rotate-2 hover:rotate-0 transition-transform duration-1000 group">
               <div className="bg-slate-950 rounded-[3rem] overflow-hidden aspect-[9/19] relative ring-1 ring-white/10">
                  {/* Mockup Content */}
                  <div className="absolute top-0 w-full h-8 bg-black/40 backdrop-blur-md z-20 flex justify-center items-end pb-1">
                    <div className="w-16 h-4 bg-black rounded-full" />
                  </div>
                  <div className="p-8 pt-16">
                     <div className="flex items-center gap-3 mb-10">
                       <div className="w-12 h-12 bg-primary rounded-2xl shadow-lg" />
                       <div className="space-y-2">
                         <div className="h-3 bg-white/20 rounded-full w-24" />
                         <div className="h-2 bg-white/5 rounded-full w-16" />
                       </div>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="h-2 bg-white/10 rounded-full w-full" />
                          <div className="h-2 bg-white/10 rounded-full w-5/6" />
                        </div>
                        <div className="h-40 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center">
                           <Activity className="w-10 h-10 text-white/10" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-24 bg-primary/10 rounded-2xl border border-primary/20" />
                           <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pre-Footer CTA (CarEasy Style) ── */}
      <section className="py-24 lg:py-40 bg-primary relative overflow-hidden text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl lg:text-8xl font-bold text-white tracking-tight leading-[1]">Prêt à démarrer ?</h2>
          <p className="text-primary-foreground/80 mt-10 text-xl lg:text-2xl font-medium">
            Rejoignez des milliers de Béninois qui font confiance à Hopitel pour leur santé.
          </p>
          <div className="mt-16">
            <Link to="/register" className="inline-flex bg-white text-primary px-16 py-7 rounded-[2.5rem] text-xl font-extrabold shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all">
              Créer un compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[110] bg-white lg:hidden flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Hopitel Logo" className="h-10 w-auto object-contain" />
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { label: 'Accueil', to: '/', icon: Activity },
                { label: 'Hôpitaux', to: '/hospitals', icon: Building },
                { label: 'Services', to: '#services', isAnchor: true, icon: Star },
                { label: 'Résultats Labo', to: '/track-results', icon: FileText },
                { label: 'Assistant IA', to: '/chatbot', icon: Bot },
                { label: 'Urgences', to: '/emergency', icon: Activity },
                { label: 'Conseils Santé', to: '/tips', icon: Heart },
              ].map((link, i) => (
                link.isAnchor ? (
                  <a
                    key={i}
                    href={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-slate-900 py-2 border-b border-slate-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <link.icon className="w-5 h-5" />
                    </div>
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={i}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-slate-900 py-2 border-b border-slate-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <link.icon className="w-5 h-5" />
                    </div>
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center text-lg font-bold text-slate-700 bg-slate-50 rounded-2xl"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center text-lg font-bold text-white bg-primary rounded-2xl shadow-xl shadow-primary/20"
              >
                S'inscrire
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
