
import { ShieldAlert, Scale, FileText, Gavel } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Mentions Légales</h1>
        <p className="text-slate-500 font-medium">Informations juridiques concernant la plateforme Hopitel.</p>
      </div>

      <div className="space-y-12">
        <section className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-slate-900 uppercase">Éditeur de la Plateforme</h2>
          </div>
          <div className="text-slate-600 text-sm space-y-4 leading-relaxed font-medium">
            <p>La plateforme Hopitel est éditée par :</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Dénomination :</strong> Hopitel Tech Bénin</li>
              <li><strong>Siège social :</strong> Cotonou, République du Bénin</li>
              <li><strong>Email :</strong> contact@hopitel.bj</li>
              <li><strong>Directeur de publication :</strong> Direction Technique Hopitel</li>
            </ul>
          </div>
        </section>

        <section className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-slate-900 uppercase">Hébergement</h2>
          </div>
          <div className="text-slate-600 text-sm leading-relaxed font-medium">
            <p>La plateforme est hébergée sur des infrastructures sécurisées conformes aux normes de protection des données de santé (HDS).</p>
          </div>
        </section>

        <section className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-slate-900 uppercase">Propriété Intellectuelle</h2>
          </div>
          <div className="text-slate-600 text-sm leading-relaxed font-medium">
            <p>L'ensemble du contenu de la plateforme Hopitel (logos, textes, graphismes, icônes) est la propriété exclusive de Hopitel Tech Bénin. Toute reproduction ou distribution sans autorisation préalable est strictement interdite.</p>
          </div>
        </section>

        <section className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Gavel className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-slate-900 uppercase">Loi Applicable</h2>
          </div>
          <div className="text-slate-600 text-sm leading-relaxed font-medium">
            <p>Les présentes mentions légales sont régies par le droit en vigueur en République du Bénin. En cas de litige, les tribunaux compétents de Cotonou seront seuls saisis.</p>
          </div>
        </section>
      </div>

      <p className="mt-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
        Dernière mise à jour : Mai 2026
      </p>
    </div>
  );
}
