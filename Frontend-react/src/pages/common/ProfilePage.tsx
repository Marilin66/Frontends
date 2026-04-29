// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Avatar,
  Badge,
} from '@/components/ui';
import { 
  User, 
  Mail, 
  Phone, 
  LogOut, 
  Bell, 
  Settings,
  Save,
  Camera,
  MapPin,
  ChevronRight,
  Lock,
  Globe,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telephone: user?.telephone || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { language: currentLang, setLanguage } = useTranslation();


  const handleSave = async () => {
    try {
      setIsLoading(true);
      await api.patch(endpoints.me, formData);
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6 pb-8"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <Avatar 
              name={`${user?.first_name} ${user?.last_name}`} 
              size="xl" 
              className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {user?.first_name} {user?.last_name}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Compte vérifié
              </Badge>
            </div>
            
            <div className="space-y-1 text-slate-600">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {user?.telephone || 'Non renseigné'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Cotonou, Bénin
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "primary"}
              className="whitespace-nowrap"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Lock className="w-5 h-5" />, title: "Sécurité", desc: "Mot de passe", link: "/profile/security" },
          { icon: <Bell className="w-5 h-5" />, title: "Notifications", desc: "Alertes", link: "/notifications" },
          { icon: <Globe className="w-5 h-5" />, title: "Langue", desc: currentLang === 'fr' ? 'Français' : currentLang },
          { icon: <Settings className="w-5 h-5" />, title: "Préférences", desc: "Paramètres" }
        ].map((action, index) => (
          <Link key={index} to={action.link || '#'} className="block">
            <Card className="p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  {action.icon}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
              </div>
              <h3 className="font-semibold text-slate-900">{action.title}</h3>
              <p className="text-sm text-slate-500">{action.desc}</p>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* Personal Information */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Prénom</label>
                <Input 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nom</label>
                <Input 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Nom"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Téléphone</label>
              <Input 
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                disabled={!isEditing}
                placeholder="Numéro de téléphone"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>
            
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSave} 
                  isLoading={isLoading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Settings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'fr', label: 'Français' },
                { id: 'en', label: 'English' },
                { id: 'fon', label: 'Fon' },
                { id: 'yoruba', label: 'Yoruba' }
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentLang === lang.id 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout */}
      <motion.div variants={itemVariants}>
        <Button 
          onClick={logout}
          variant="outline"
          className="w-full sm:w-auto border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </motion.div>
    </motion.div>
  );
}

