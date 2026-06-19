// ── Shared API response types for Hopitel React frontend ──────────────────────

/** Base model returned by the Django backend */
export interface ApiListResponse<T> {
  count?: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
}

/** Normalize an API response that may be an array or paginated object */
export function toArray<T>(data: T[] | ApiListResponse<T> | unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) {
    return (data as ApiListResponse<T>).results ?? [];
  }
  return [];
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string;
  role: UserRole;
  hopital?: number;
  hopital_nom?: string;
  is_active?: boolean;
  date_naissance?: string;
  sexe?: string;
}

export type UserRole =
  | 'patient'
  | 'medecin'
  | 'admin_hopital'
  | 'admin'
  | 'super_admin'
  | 'laborantin';

// ── Hospital ──────────────────────────────────────────────────────────────────

export interface Hopital {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  is_active: boolean;
  code_court?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  site_web?: string;
}

export interface HopitalPayload {
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  code_court?: string;
  description?: string;
  site_web?: string;
  latitude?: number;
  longitude?: number;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_email?: string;
  admin_telephone?: string;
  admin_date_naissance?: string;
  admin_sexe?: string;
}

// ── Doctor (Médecin) ──────────────────────────────────────────────────────────

export interface Medecin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone?: string;
  specialite?: string;
  specialite_nom?: string;
  is_active?: boolean;
  nombre_consultations?: number;
  numero_ordre?: string;
  biographie?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface MedecinCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  date_naissance: string;
  sexe: string;
  numero_ordre?: string;
  biographie?: string;
  service_ids?: number[];
}

// ── Patient ───────────────────────────────────────────────────────────────────

export interface Patient {
  id: number;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  telephone?: string;
  date_naissance?: string;
  sexe?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

// ── Laborantin ────────────────────────────────────────────────────────────────

export interface Laborantin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone?: string;
  is_active?: boolean;
  laboratoire?: string;
}

export interface LaborantinCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  date_naissance: string;
  sexe: string;
  laboratoire?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface Service {
  id: number;
  nom: string;
  description?: string;
  service_nom?: string;
  description_locale?: string;
  service_description?: string;
}

// ── Rendez-vous ───────────────────────────────────────────────────────────────

export interface RendezVous {
  id: number;
  patient_id?: number;
  patient_nom?: string;
  medecin_id?: number;
  medecin_nom?: string;
  date_heure?: string;
  date?: string;
  statut: RendezVousStatut;
  motif?: string;
  consultation_id?: number;
  hopital_id?: number;
  service_nom?: string;
}

export type RendezVousStatut =
  | 'en_attente'
  | 'confirme'
  | 'termine'
  | 'annule'
  | 'refuse';

// ── Consultation ──────────────────────────────────────────────────────────────

export interface Consultation {
  id: number;
  rendez_vous_id?: number;
  patient_id?: number;
  patient_nom?: string;
  medecin_nom?: string;
  motif?: string;
  date_rdv?: string;
  est_cloture?: boolean;
  notes?: string;
}

// ── Demande de service ────────────────────────────────────────────────────────

export interface DemandeService {
  id: number;
  statut: 'en_attente' | 'valide' | 'refuse';
  nom_nouveau_service?: string;
  service_existant_nom?: string;
  description_nouveau_service?: string;
  date_demande?: string;
  demande_par_nom?: string;
  hopital?: number;
}

// ── Admin Hospital Stats ──────────────────────────────────────────────────────

export interface HopitalStats {
  total_medecins?: number;
  total_services?: number;
  total_rdv?: number;
  rdv_en_attente?: number;
  demandes_en_attente?: number;
  rendezvous?: {
    total?: number;
    en_attente?: number;
    confirmes?: number;
    termines?: number;
  };
  consultations?: {
    total?: number;
    en_cours?: number;
    cloturees?: number;
  };
  laboratoire?: {
    total_demandes?: number;
    en_cours?: number;
    terminees?: number;
  };
  daily_logins?: DailyLogin[];
  recent_activity?: ActivityItem[];
}

// ── Super Admin Stats ─────────────────────────────────────────────────────────

export interface SuperAdminStats {
  total_hopitaux?: number;
  total_medecins?: number;
  total_patients?: number;
  total_rdv?: number;
  total_analyses?: number;
  active_users?: number;
  total_messages?: number;
  daily_logins?: DailyLogin[];
  recent_activity?: ActivityItem[];
  system_performance?: {
    cpu?: number;
    memory?: number;
    storage?: number;
  };
}

export interface DailyLogin {
  day: string;
  count: number;
}

export interface ActivityItem {
  type?: string;
  action?: string;
  description?: string;
  user?: string;
  timestamp?: string;
}

// ── Error handling ────────────────────────────────────────────────────────────

export interface ApiError {
  response?: {
    status?: number;
    data?: Record<string, string | string[]>;
  };
}

export interface FieldErrorMap {
  [field: string]: string;
}

// ── Lab Analysis ─────────────────────────────────────────────────────────────

export interface DemandeAnalyse {
  id: number;
  statut: string;
  patient_prenom?: string;
  patient_nom?: string;
  patient_email?: string;
  patient_telephone?: string;
  type_analyse?: string;
  date_inscription?: string;
  date_cloture?: string;
  resultat_code?: string;
  code_acces?: string;
}

export interface Notification {
  id: number;
  titre?: string;
  message?: string;
  est_lu?: boolean;
  lu?: boolean;
  date_creation?: string;
  type?: string;
}
