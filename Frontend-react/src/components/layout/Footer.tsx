
import { Link } from 'react-router-dom';
import { 
  Download, 
  Mail, 
  MapPin, 
  Clock
} from 'lucide-react';

/**
 * Footer complet inspiré par le design premium de CarEasy (Bénin).
 * Adapté pour le système de santé Hopitel.
 */
export function Footer() {
  return (
    <footer className="hidden lg:block bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* ── Colonne 1 : Logo & Branding ── */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Hopitel Logo" className="h-12 w-auto object-contain group-hover:scale-110 transition-transform brightness-0 invert" />
            </Link>
            
            <p className="text-sm leading-relaxed text-slate-400">
              Hopitel est la plateforme de santé de référence au Bénin. Nous connectons les patients 
              aux meilleurs établissements de santé pour une prise en charge rapide et sécurisée.
            </p>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Suivez-nous</p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Facebook' },
                  { label: 'Instagram' },
                  { label: 'Twitter' },
                  { label: 'Youtube' }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-slate-800 text-slate-400"
                    title={social.label}
                  >
                    <span className="text-xs font-black">{social.label[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-4">
               <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Application Mobile</p>
               <a 
                href="#" 
                className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl hover:border-primary/50 transition-all group"
               >
                 <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center group-hover:text-primary transition-colors">
                   <Download className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                   <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">Télécharger pour</p>
                   <p className="text-sm font-black text-white mt-1 leading-none">Android .apk</p>
                 </div>
               </a>
            </div>
          </div>

          {/* ── Colonne 2 : Nos Services ── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Nos Services</h4>
            <ul className="space-y-3">
              {[
                { label: 'Consultation Médicale', to: '/hospitals' },
                { label: 'Résultats d\'Analyses', to: '/track-results' },
                { label: 'Urgences & Garde', to: '/emergency' },
                { label: 'Assistant Santé IA', to: '/chatbot' },
                { label: 'Conseils Santé', to: '/tips' },
                { label: 'Suivi de Dossier', to: '/login' },
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-slate-400 hover:text-primary flex items-center gap-2 group transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Colonne 3 : Plateforme ── */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Plateforme</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Trouver un hôpital', to: '/hospitals' },
                  { label: 'Urgences Bénin', to: '/emergency' },
                  { label: 'Créer un compte', to: '/register' },
                  { label: 'Se connecter', to: '/login' },
                ].map((link, i) => (
                  <li key={i}>
                    <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Professionnels</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Espace Médecin', to: '/login' },
                  { label: 'Espace Laborantin', to: '/login' },
                  { label: 'Admin Hôpital', to: '/login' },
                ].map((link, i) => (
                  <li key={i}>
                    <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Colonne 4 : Aide & Contact ── */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Aide & Support</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Centre d\'aide / FAQ', to: '/faq' },
                  { label: 'Guide d\'utilisation', to: '/guide' },
                  { label: 'Politique de confidentialité', to: '/terms' },
                  { label: 'Mentions légales', to: '/legal' },
                ].map((link, i) => (
                  <li key={i}>
                    <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Carte Contact Direct */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Contact Direct</h5>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Email</p>
                    <a href="mailto:support@hopitel.bj" className="text-sm font-black text-white hover:text-primary transition-colors">support@hopitel.bj</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Siège Social</p>
                    <p className="text-sm font-black text-white">Cotonou, Bénin</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Horaires Support</p>
                    <p className="text-sm font-black text-white">Lundi — Dimanche : 24h/24</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Barre de bas de page ── */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            © {new Date().getFullYear()} <span className="text-slate-400">Hopitel</span> — Tous droits réservés
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            {[
              { label: 'Confidentialité', to: '/terms' },
              { label: 'Cookies', to: '#' },
              { label: 'Aide', to: '#' },
              { label: 'Mentions légales', to: '#' }
            ].map((link, i) => (
              <Link key={i} to={link.to} className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
