// @ts-nocheck
import React from 'react';
import { Card, Button } from '@/components/ui';
import { ShieldCheck, FileText, Lock, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in space-y-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Conditions d'Utilisation</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Dernière mise à jour : 9 Avril 2026. Veuillez lire attentivement ces conditions avant d'utiliser la plateforme Hopitel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <Card className="p-8 space-y-4 border-none shadow-premium bg-gradient-to-br from-white to-gray-50">
          <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center text-info">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Confidentialité</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Vos données de santé sont cryptées et stockées de manière sécurisée. Seuls les professionnels de santé que vous autorisez peuvent y accéder.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border-none shadow-premium bg-gradient-to-br from-white to-gray-50">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Sécurité</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Nous utilisons les standards les plus élevés (ISO 27001) pour protéger la plateforme contre les accès non autorisés.
          </p>
        </Card>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-12 shadow-premium border border-gray-100 space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">1</div>
            <h2 className="text-2xl font-bold text-gray-900">Acceptation des conditions</h2>
          </div>
          <p className="text-gray-600 leading-relaxed ml-11">
            En utilisant Hopitel, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces termes, vous ne devez pas utiliser nos services. Nous nous réservons le droit de modifier ces conditions à tout moment.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">2</div>
            <h2 className="text-2xl font-bold text-gray-900">Utilisation du Service</h2>
          </div>
          <ul className="space-y-3 ml-11">
            <li className="flex items-start gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Vous devez fournir des informations exactes lors de votre inscription.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Votre compte est personnel et vous êtes responsable de sa sécurité.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Il est interdit d'utiliser le service à des fins illégales ou nuisibles.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">3</div>
            <h2 className="text-2xl font-bold text-gray-900">Responsabilité Médicale</h2>
          </div>
          <div className="p-6 bg-warning/10 border border-warning/20 rounded-2xl flex gap-4 ml-11">
            <AlertCircle className="w-8 h-8 text-warning flex-shrink-0" />
            <p className="text-sm text-amber-900 font-medium leading-relaxed">
              <strong>ATTENTION :</strong> Hopitel est une plateforme de mise en relation et de gestion de données. Elle ne remplace en aucun cas un diagnostic médical direct par un professionnel de santé diplômé. En cas d'urgence, appelez immédiatement les services de secours.
            </p>
          </div>
        </section>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t">
        <div className="flex items-center gap-2 text-gray-500">
          <FileText className="w-5 h-5" />
          <span className="text-sm">Besoin d'aide ? <a href="#" className="font-bold text-primary hover:underline">Contactez notre support</a></span>
        </div>
        <Link to="/">
          <Button size="lg" className="px-10 font-bold shadow-lg shadow-primary/20">Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
