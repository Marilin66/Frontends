// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'fon' | 'yoruba';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    welcome: 'Bonjour',
    dashboard: 'Tableau de bord',
    profile: 'Profil',
    logout: 'Déconnexion',
    settings: 'Paramètres',
    security: 'Sécurité',
    terms: 'Conditions d\'utilisation',
    language: 'Langue',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit_profile: 'Modifier le profil',
  },
  en: {
    welcome: 'Hello',
    dashboard: 'Dashboard',
    profile: 'Profile',
    logout: 'Logout',
    settings: 'Settings',
    security: 'Security',
    terms: 'Terms of Use',
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',
    edit_profile: 'Edit Profile',
  },
  fon: {
    welcome: 'Kú dǒ',
    dashboard: 'Azɔ̌watɛn',
    profile: 'Mɛɖée',
    logout: 'Tɔ́ntɔ́n gbe',
    settings: 'Kpanŋkpan',
    security: 'Gǎn hǎnyɛ',
    terms: 'Sɛ́n lìn',
    language: 'Gbe',
    save: 'Hɛ̀n dó',
    cancel: 'Jojo',
    edit_profile: 'Vɔ́ mɛɖée bló',
  },
  yoruba: {
    welcome: 'Ẹ n lẹ',
    dashboard: 'Ojúlé Iṣẹ́',
    profile: 'Ìrísí',
    logout: 'Jáde',
    settings: 'Ètò',
    security: 'Ààbò',
    terms: 'Àwọn Òfin',
    language: 'Èdè',
    save: 'Pamọ́',
    cancel: 'Dúró',
    edit_profile: 'Ṣàtúnṣe Ìrísí',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
