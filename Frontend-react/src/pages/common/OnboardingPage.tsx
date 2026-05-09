// @ts-nocheck
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  Activity, Search, Phone, Heart, Shield, ArrowRight, LogIn,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const featureCards = [
  {
    title: 'Hôpitaux & Cliniques',
    description: 'Localisez et explorez les établissements partenaires autour de vous sans créer de compte.',
    icon: Search,
    color: 'bg-primary',
    route: '/hospitals',
  },
  {
    title: 'Numéros d\'Urgence',
    description: 'La liste critique pour appeler le SAMU ou les pompiers, disponible même hors-ligne.',
    icon: Phone,
    color: 'bg-red-500',
    route: '/emergency',
  },
  {
    title: 'Suivi Patient Centralisé',
    description: 'Connectez-vous pour voir vos RDV, vos résultats d\'analyses labo et contacter vos médecins.',
    icon: Heart,
    color: 'bg-emerald-500',
    route: '/login',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">Hopitel</span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate('/hospitals')}>Hôpitaux</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/emergency')}>Urgences</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/chatbot')}>Assistant IA</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/track-results')}>Résultats Labo</Button>
            <Button size="sm" onClick={() => navigate('/login')}>Connexion</Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="bg-primary/5">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
                Accès Santé pour Tous 🩺
              </span>

              <h1 className="mt-5 text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-slate-900">
                L'excellence médicale à portée de main.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                Trouvez un hôpital proche, appelez les urgences rapidement ou connectez-vous pour consulter vos
                résultats et rendez-vous médicaux.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button onClick={() => navigate('/login')} className="h-11 px-6 text-sm font-semibold">
                  <LogIn className="mr-2 h-4 w-4" /> Se connecter
                </Button>
                <Button variant="outline" onClick={() => navigate('/hospitals')} className="h-11 px-6 text-sm font-semibold">
                  <Search className="mr-2 h-4 w-4" /> Explorer les hôpitaux
                </Button>
                <Button variant="outline" onClick={() => navigate('/chatbot')} className="h-11 px-6 text-sm font-semibold">
                  <Activity className="mr-2 h-4 w-4" /> Assistant IA
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mx-auto w-full max-w-md"
            >
              <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white p-6 shadow-xl">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-100" />
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Plateforme numérique de santé du Bénin
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Des services pensés pour vous</h2>
            <p className="mt-4 text-slate-500">
              Accédez librement à nos fonctionnalités d'urgence et au répertoire, ou créez un compte pour un suivi personnalisé.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 * index }}
                  onClick={() => navigate(feature.route)}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                    Découvrir <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Hopitel — Santé numérique accessible.</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Se connecter</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Créer un compte</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
