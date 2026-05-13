// @ts-nocheck
import { BookOpen, User, Calendar, FlaskConical, MessageSquare, ShieldCheck } from 'lucide-react';

const steps = [
  {
    title: "Créez votre compte",
    desc: "Inscrivez-vous gratuitement en tant que Patient avec votre nom, email et téléphone.",
    icon: User,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Trouvez un spécialiste",
    desc: "Recherchez un hôpital ou un médecin par spécialité ou proximité.",
    icon: Calendar,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Gérez vos soins",
    desc: "Prenez rendez-vous, remplissez votre fiche pré-consultation et discutez avec votre médecin.",
    icon: MessageSquare,
    color: "bg-violet-50 text-violet-600"
  },
  {
    title: "Suivez vos résultats",
    desc: "Recevez vos résultats d'analyses directement sur votre espace sécurisé.",
    icon: FlaskConical,
    color: "bg-orange-50 text-orange-600"
  }
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Guide d'utilisation</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Découvrez comment tirer le meilleur parti de la plateforme Hopitel pour votre santé.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-6 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
              <step.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase mb-2 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase mb-4">La sécurité avant tout</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl font-medium">
              Chez Hopitel, nous utilisons des technologies de pointe pour garantir que vos données médicales restent strictement confidentielles. Seul vous et les médecins autorisés peuvent consulter votre dossier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
