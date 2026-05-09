// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageCircle, FileText, Shield, MapPin, ArrowRight, CheckCircle, Star, Users, Building, Activity, Menu, X } from 'lucide-react';

const features = [
  { title: 'Prise de rendez-vous',   desc: 'Réservez une consultation en quelques clics avec les médecins disponibles.',          icon: Calendar,      color: 'text-blue-600 bg-blue-50' },
  { title: 'Résultats médicaux',     desc: 'Consultez vos analyses en ligne avec un accès sécurisé par code unique.',             icon: FileText,      color: 'text-emerald-600 bg-emerald-50' },
  { title: 'Messagerie santé',       desc: 'Échangez avec les professionnels de santé dans un espace privé et sécurisé.',         icon: MessageCircle, color: 'text-violet-600 bg-violet-50' },
  { title: 'Hôpitaux proches',       desc: 'Trouvez facilement les établissements de santé selon votre position GPS.',            icon: MapPin,        color: 'text-amber-600 bg-amber-50' },
  { title: 'Données protégées',      desc: 'Vos informations médicales sont chiffrées et protégées selon les normes RGPD.',       icon: Shield,        color: 'text-red-600 bg-red-50' },
  { title: 'Suivi continu',          desc: 'Gardez votre historique de santé complet et accessible à tout moment.',               icon: Heart,         color: 'text-pink-600 bg-pink-50' },
];

const stats = [
  { value: '50+',   label: 'Hôpitaux partenaires', icon: Building },
  { value: '500+',  label: 'Médecins certifiés',   icon: Users },
  { value: '10k+',  label: 'Patients actifs',      icon: Activity },
  { value: '99.9%', label: 'Disponibilité',        icon: Star },
];

export default function PublicHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">H</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">Hopitel</span>
          </div>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Fonctionnalités</a>
            <a href="#stats" className="hover:text-slate-900 transition-colors">Chiffres clés</a>
            <Link to="/hospitals" className="hover:text-slate-900 transition-colors">Hôpitaux</Link>
            <Link to="/emergency" className="hover:text-slate-900 transition-colors">Urgences</Link>
            <Link to="/chatbot" className="hover:text-slate-900 transition-colors">Assistant IA</Link>
            <Link to="/track-results" className="hover:text-slate-900 transition-colors">Résultats Labo</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">
              Connexion
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow-md">
              S'inscrire
            </Link>
            {/* Burger mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors touch-manipulation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {[
              { label: 'Fonctionnalités', href: '#features', internal: false },
              { label: 'Hôpitaux', href: '/hospitals', internal: true },
              { label: 'Urgences', href: '/emergency', internal: true },
              { label: 'Assistant IA', href: '/chatbot', internal: true },
              { label: 'Résultats Labo', href: '/track-results', internal: true },
              { label: 'Connexion', href: '/login', internal: true },
            ].map((item) =>
              item.internal ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 to-white pt-14 pb-16 lg:pt-28 lg:pb-32">
        {/* Décoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Plateforme de santé numérique — République du Bénin
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            Votre santé,{' '}
            <span className="text-primary">simplifiée.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme hospitalière connectée pour un suivi médical moderne, accessible à tous les citoyens du Bénin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 text-base">
              Commencer gratuitement <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/hospitals" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-8 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-base">
              Explorer les hôpitaux
            </Link>
            <Link to="/chatbot" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-8 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-base">
              Assistant IA gratuit
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            {['Gratuit pour les patients', 'Données sécurisées', 'Disponible 24h/24', 'Sans engagement'].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section id="stats" className="py-12 sm:py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2">{s.value}</p>
                <p className="text-slate-400 text-xs sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              Une plateforme complète pour gérer votre parcours de soins de A à Z.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:shadow-card-md hover:border-slate-300 transition-all group">
                <div className={`w-11 h-11 ${f.color.split(' ')[1]} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color.split(' ')[0]}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accès rapide sans compte ────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Accès immédiat, sans compte</h2>
            <p className="text-slate-500 text-sm sm:text-base">Ces services sont disponibles pour tous, sans inscription.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Hôpitaux & Carte', icon: MapPin, route: '/hospitals', color: 'text-blue-600 bg-blue-50' },
              { label: 'Urgences', icon: Shield, route: '/emergency', color: 'text-red-600 bg-red-50' },
              { label: 'Assistant IA', icon: MessageCircle, route: '/chatbot', color: 'text-violet-600 bg-violet-50' },
              { label: 'Résultats Labo', icon: FileText, route: '/track-results', color: 'text-emerald-600 bg-emerald-50' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.route}
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color.split(' ')[1]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color.split(' ')[0]}`} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Prêt à commencer ?</h2>
              <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-lg mx-auto">
                Rejoignez des milliers de patients qui gèrent leur santé avec Hopitel.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg text-base">
                  Créer mon compte <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/emergency" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white/80 hover:text-white font-medium px-6 py-4 transition-colors text-base">
                  Numéros d'urgence
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-white">Hopitel</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-400">
              <Link to="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
              <Link to="/emergency" className="hover:text-white transition-colors">Urgences</Link>
              <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
              <Link to="/register" className="hover:text-white transition-colors">Inscription</Link>
            </div>

            <p className="text-slate-500 text-sm">© 2026 Hopitel — République du Bénin</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
