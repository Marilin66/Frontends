
// User and Authentication Types — alignés avec les modèles Django

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  date_naissance?: string | null;
  sexe: 'M' | 'F' | 'Autre';
  role: UserRole;
  adresse?: string;
  photo?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  date_joined: string;
  last_login?: string | null;
  // Hôpital de rattachement (pour médecin, laborantin, admin_hopital)
  hopital?: number | null;
  hopital_nom?: string;
  // Profils étendus (renvoyés par /accounts/users/me/)
  patient_profile?: PatientProfile | null;
  medecin_profile?: MedecinProfile | null;
  laborantin_profile?: LaborantinProfile | null;
}

export type UserRole =
  | 'patient'
  | 'medecin'
  | 'admin_hopital'
  | 'admin_general'
  | 'laborantin';

// Correspond au modèle Patient Django
export interface PatientProfile {
  contact_urgence_nom?: string;
  contact_urgence_tel?: string;
  groupe_sanguin?: string;
  allergies?: string;
  numero_secu?: string;
}

// Correspond au modèle Medecin Django
export interface MedecinProfile {
  numero_ordre: string;
  biographie?: string;
  statut: 'actif' | 'inactif';
  duree_rdv_default: number;
}

// Correspond au modèle Laborantin Django
export interface LaborantinProfile {
  laboratoire?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  telephone: string;
  sexe: 'M' | 'F' | 'Autre';
  role?: string;
  date_naissance?: string;
  adresse?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
