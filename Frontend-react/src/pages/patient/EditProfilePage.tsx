// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, Button, Input, PageLoader } from '@/components/ui';
import { 
  User, 
  Stethoscope, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  Phone,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function EditProfilePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    telephone: user?.telephone || '',
    bloodGroup: '',
    allergies: '',
    chronicDiseases: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  if (isLoading) return <PageLoader />;

  const steps = [
    { id: 1, name: 'Infos Personnelles', icon: User },
    { id: 2, name: 'Dossier Médical', icon: Stethoscope },
    { id: 3, name: 'Urgence', icon: ShieldAlert },
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">Compléter mon Profil</h1>
        <p className="text-gray-500 font-medium">Ces informations aident les médecins à mieux vous soigner.</p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10" />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
              ${step >= s.id ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'bg-white text-gray-400 border-2 border-gray-100'}
            `}>
              <s.icon className={`w-6 h-6 ${step === s.id ? 'animate-pulse' : ''}`} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>
              {s.name}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-elevated rounded-[40px] overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-12">
          {step === 1 && (
            <div className="space-y-6 animate-scale-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Prénom</label>
                   <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-14 rounded-2xl border-none bg-gray-50 focus:bg-white" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nom</label>
                   <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-14 rounded-2xl border-none bg-gray-50 focus:bg-white" />
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <Input value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="pl-12 h-14 rounded-2xl border-none bg-gray-50 focus:bg-white" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-scale-in">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Groupe Sanguin</label>
                <div className="flex gap-3 flex-wrap">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setFormData({...formData, bloodGroup: g})}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${formData.bloodGroup === g ? 'bg-error text-white shadow-lg shadow-error/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Allergies connues</label>
                <textarea 
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm font-medium"
                  placeholder="Ex: Pencilline, Arachides..."
                  value={formData.allergies}
                  onChange={e => setFormData({...formData, allergies: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-scale-in">
              <div className="p-4 bg-error/5 rounded-2xl flex items-start gap-3 border border-error/10">
                <AlertCircle className="w-5 h-5 text-error mt-0.5" />
                <p className="text-xs text-error font-medium leading-relaxed">
                  Ces informations sont vitales en cas d'urgence. Veillez à ce que le contact soit joignable.
                </p>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nom du contact d'urgence</label>
                 <Input value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="h-14 rounded-2xl border-none bg-gray-50 focus:bg-white" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Téléphone d'urgence</label>
                 <Input value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="h-14 rounded-2xl border-none bg-gray-50 focus:bg-white" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className="rounded-xl px-2"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Retour
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNext} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl">
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => navigate('/patient/profile')} variant="success" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-success/20">
                Enregistrer le profil <Save className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
