

import { Card, CardContent, Button } from '@/components/ui';
import { Phone, AlertTriangle, ShieldCheck, Flame, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const emergencyNumbers = [
  {
    category: 'Urgence Médicale (SAMU)',
    number: '113',
    description: 'Pour tout besoin médical urgent et transport vers un hôpital.',
    icon: Heart,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  {
    category: 'Sapeurs-Pompiers',
    number: '118',
    description: 'Incendies, accidents de la route et secours aux victimes.',
    icon: Flame,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  {
    category: 'Police Secours',
    number: '117',
    description: 'Agression, vol ou menace contre la sécurité publique.',
    icon: ShieldCheck,
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    category: 'Violence Basée sur le Genre',
    number: '132',
    description: 'Écoute et assistance pour les victimes de violences domestiques.',
    icon: AlertTriangle,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  }
];

export default function EmergencyNumbersPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
          Numéros d'Urgence <span className="text-red-600">Bénin</span>
        </h1>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-white animate-pulse">
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-red-900 text-lg">Appel Gratuit</h3>
          <p className="text-red-700 leading-relaxed font-medium">
            Ces numéros sont accessibles gratuitement 24h/24 et 7j/7 depuis n'importe quel opérateur au Bénin, même sans forfait actif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {emergencyNumbers.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="border-none shadow-soft hover:shadow-elevated transition-all overflow-hidden group">
              <div className="flex h-full">
                <div className={`${item.color} w-2`}></div>
                <CardContent className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${item.lightColor} p-3 rounded-2xl ${item.textColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <a 
                      href={`tel:${item.number}`}
                      className="text-2xl font-black text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {item.number}
                    </a>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.category}</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <a href={`tel:${item.number}`} className="block">
                    <Button variant="danger" className="w-full font-black uppercase tracking-widest text-xs">
                      Appeler maintenant
                    </Button>
                  </a>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden mt-10">
        <CardContent className="p-8 relative">
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <h3 className="text-xl font-bold mb-4 relative z-10">À savoir</h3>
          <ul className="space-y-4 relative z-10 opacity-80 text-sm font-medium">
            <li className="flex gap-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              Indiquez clairement votre localisation exacte au service d'urgence.
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              Précisez la nature de l'incident et le nombre de victimes probables.
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              Ne raccrochez jamais le premier, attendez les instructions de l'opérateur.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
