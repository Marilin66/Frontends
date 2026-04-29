// @ts-nocheck
// User and Authentication Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  date_naissance?: string;
  sexe: string;
  role: UserRole;
  adresse: string;
  photo?: string;
  is_active: boolean;
  is_email_verified: boolean;
  date_joined: string;
  last_login?: string;
  hopital?: number;
  hopital_nom?: string;
  patient_profile?: PatientProfile;
  medecin_profile?: MedecinProfile;
  laborantin_profile?: LaborantinProfile;
}

export type UserRole =
  | 'patient'
  | 'medecin'
  | 'admin_hopital'
  | 'admin_general'
  | 'super_admin'
  | 'laborantin';

export interface PatientProfile {
  id: number;
  utilisateur: number;
  code_unique: string;
  groupe_sanguin?: string;
  allergies?: string;
  antecedents_medicaux?: string;
  contact_urgence_nom?: string;
  contact_urgence_tel?: string;
}

export interface MedecinProfile {
  id: number;
  utilisateur: number;
  hopital: number;
  hopital_nom: string;
  specialite: string;
  matricule: string;
  description?: string;
  annees_experience: number;
  is_verified: boolean;
}

export interface LaborantinProfile {
  id: number;
  utilisateur: number;
  hopital: number;
  hopital_nom: string;
  matricule: string;
  specialite: string;
  is_verified: boolean;
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
  sexe: string;
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
