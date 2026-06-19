
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, Search, MessageSquare, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "Comment prendre rendez-vous sur Hopitel ?",
    a: "C'est très simple ! Connectez-vous à votre compte Patient, recherchez un hôpital ou un médecin, choisissez un créneau disponible et validez. Vous recevrez une confirmation une fois que le médecin aura validé."
  },
  {
    q: "Comment accéder à mes résultats d'analyses ?",
    a: "Si vous avez effectué une analyse dans un laboratoire partenaire, vous recevrez un code d'accès par SMS ou Email. Allez dans la section 'Résultats Labo' de la page d'accueil et entrez ce code pour télécharger votre rapport PDF."
  },
  {
    q: "Est-ce que mes données sont sécurisées ?",
    a: "Oui, la sécurité est notre priorité. Toutes vos données médicales sont chiffrées et ne sont accessibles qu'aux professionnels de santé que vous consultez."
  },
  {
    q: "L'assistant IA peut-il faire un diagnostic ?",
    a: "Non. L'assistant IA Hopitel est là pour vous orienter, répondre à des questions générales de santé et vous aider à naviguer sur la plateforme. En cas d'urgence, contactez toujours les numéros d'urgence ou un médecin."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Centre d'aide</h1>
        <p className="text-slate-500 font-medium">Réponses aux questions les plus fréquentes sur Hopitel.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-bold text-slate-900">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-6 pb-6 text-slate-600 text-sm leading-relaxed"
              >
                {faq.a}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-primary/5 rounded-[2rem] border border-primary/10 text-center">
        <h3 className="font-black text-primary uppercase mb-2">Encore des questions ?</h3>
        <p className="text-slate-600 text-sm mb-6 font-medium">Notre équipe est là pour vous aider 24h/24.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:support@hopitel.bj" className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-900 hover:border-primary transition-all shadow-sm">
            <Mail className="w-4 h-4 text-primary" /> Nous écrire
          </a>
          <a href="tel:+22900000000" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
            <Phone className="w-4 h-4" /> Appeler le support
          </a>
        </div>
      </div>
    </div>
  );
}
