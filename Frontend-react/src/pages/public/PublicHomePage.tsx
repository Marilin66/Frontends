// @ts-nocheck
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Calendar, MessageCircle, FileText, Shield, MapPin } from 'lucide-react';

const features = [
  {
    title: 'Prise de rendez-vous rapide',
    description: 'Réservez une consultation en quelques clics avec les médecins disponibles.',
    icon: Calendar,
  },
  {
    title: 'Résultats médicaux sécurisés',
    description: 'Consultez vos analyses en ligne avec un accès sécurisé.',
    icon: FileText,
  },
  {
    title: 'Messagerie santé',
    description: 'Échangez avec les professionnels dans un espace privé.',
    icon: MessageCircle,
  },
  {
    title: 'Hôpitaux proches',
    description: 'Trouvez facilement les établissements selon votre position.',
    icon: MapPin,
  },
  {
    title: 'Protection des données',
    description: 'Vos informations médicales sont protégées et chiffrées.',
    icon: Shield,
  },
  {
    title: 'Suivi continu',
    description: 'Gardez votre historique de santé à portée de main.',
    icon: Heart,
  },
];

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-surface text-[#1C1E21]">
      <section className="relative overflow-hidden border-b border-fb-divider bg-white">
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center">
          <div>
            <img src="/logo.png" alt="Hopitel Logo" className="w-24 h-24 mx-auto mb-6 object-contain" />
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1C1E21] leading-tight">
              Votre santé, <span className="text-primary">simplifiée.</span>
            </h1>
            <p className="mt-6 text-xl text-fb-gray max-w-2xl mx-auto font-normal">
              La plateforme hospitalière connectée pour un suivi médical moderne et accessible à tous.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="btn-primary h-12 px-10 text-lg">
                Créer un compte
              </Link>
              <Link to="/login" className="btn-secondary h-12 px-10 text-lg">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1C1E21]">Fonctionnalités principales</h2>
          <p className="text-fb-gray mt-2 text-lg">Tout ce dont vous avez besoin pour gérer votre santé.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card-fb hover:shadow-fb-md transition-all cursor-default group">
                <div className="w-12 h-12 rounded-full bg-fb-hover text-fb-gray flex items-center justify-center mb-5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1C1E21]">{item.title}</h3>
                <p className="mt-2 text-base text-fb-gray leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
      
      <footer className="bg-white border-t border-fb-divider py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-fb-gray text-sm">
          <p>© 2026 Hopitel - Plateforme Hospitalière Connectée. République du Bénin.</p>
        </div>
      </footer>
    </div>
  );
}
