

// ── Hospital Types ────────────────────────────────────────────────────────────
export interface Hopital {
  id: number;
  nom: string;
  code_court?: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  site_web?: string;
  description?: string;
  logo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  date_creation: string;
  // Champs calculés renvoyés par le serializer
  nombre_services?: number;
  nombre_medecins?: number;
}

export interface Service {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  image?: string | null;
  is_active: boolean;
  date_creation: string;
}

export interface HopitalService {
  id: number;
  hopital: number;
  hopital_nom?: string;
  service: number;
  service_nom: string;
  service_description?: string;
  service_icone?: string;
  description_locale?: string;
  date_ajout: string;
}

export interface DemandeAjoutService {
  id: number;
  hopital: number;
  hopital_nom?: string;
  service_existant?: number | null;
  service_existant_nom?: string;
  nom_nouveau_service: string;
  description_nouveau_service?: string;
  statut: 'en_attente' | 'valide' | 'refuse';
  date_demande: string;
  date_traitement?: string | null;
  commentaire?: string;
  demande_par: number;
  traite_par?: number | null;
}

// ── Doctor Types ──────────────────────────────────────────────────────────────
export interface Medecin {
  id: number;
  // Champs de l'utilisateur (aplatis par le serializer)
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  photo?: string | null;
  sexe?: string;
  date_naissance?: string | null;
  // Champs du profil Medecin
  numero_ordre: string;
  biographie?: string;
  statut: 'actif' | 'inactif';
  duree_rdv_default: number;
  // Hôpital de rattachement
  hopital?: number | null;
  hopital_nom?: string;
  // Services exercés
  services?: string[];
}

export interface Laborantin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  photo?: string | null;
  laboratoire?: string;
  hopital?: number | null;
  hopital_nom?: string;
  is_active?: boolean;
}

// ── Availability & Appointment Types ─────────────────────────────────────────
export interface Disponibilite {
  id: number;
  medecin: number;
  type: 'recurrent' | 'exception' | 'indisponible';
  jour_semaine?: number | null;   // 1=Lundi … 7=Dimanche
  date_specifique?: string | null;
  heure_debut: string;            // "HH:MM"
  heure_fin: string;
  is_active: boolean;
  date_creation: string;
}

export interface Creneau {
  date: string;
  heure_debut: string;
  heure_fin: string;
  disponible: boolean;
}

export interface RendezVous {
  id: number;
  patient: number;
  patient_nom?: string;
  medecin: number;
  medecin_nom?: string;
  date_heure: string;
  duree: number;
  motif?: string;
  statut: AppointmentStatus;
  statut_display?: string;
  commentaire_annulation?: string;
  cree_le: string;
  modifie_le: string;
  // Consultation liée (si terminé)
  has_consultation?: boolean;
  consultation_id?: number | null;
  // Pré-enregistrement patient
  pre_enregistrement?: PreEnregistrement | null;
}

export type AppointmentStatus = 'en_attente' | 'confirme' | 'annule' | 'refuse' | 'termine';

export interface PreEnregistrement {
  symptomes_principaux: string;
  debut_symptomes?: string | null;
  traitements_en_cours?: string;
  observations?: string;
  soumis_le?: string;
  mis_a_jour_le?: string;
}

export interface Consultation {
  rendez_vous: number;   // PK = rendez_vous id
  compte_rendu?: string;
  diagnostic?: string;
  prescription?: string;
  date_consultation: string;
  est_cloture: boolean;
  date_cloture?: string | null;
}

// ── Medical Results Types ─────────────────────────────────────────────────────
export interface DemandeAnalyse {
  id: number;
  hopital: number;
  hopital_nom?: string;
  laborantin?: number | null;
  patient?: number | null;
  patient_nom: string;
  patient_prenom: string;
  patient_email: string;
  patient_telephone?: string;
  patient_ddn?: string | null;
  type_analyse: string;
  statut: 'en_cours' | 'cloture';
  date_inscription: string;
  date_cloture?: string | null;
  resultat?: number | null;
}

export interface Resultat {
  id: number;
  patient?: number | null;
  patient_nom?: string;
  laborantin?: number | null;
  hopital?: number | null;
  hopital_nom?: string;
  consultation?: number | null;
  titre: string;
  fichier?: string;
  date_analyse: string;
  date_depot: string;
  code_acces: string;
  patient_nom_externe?: string;
  patient_email_externe?: string;
  laboratoire?: string;
  partages?: number[];
}

// ── Notification Types ────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  utilisateur: number;
  message: string;
  type: NotificationType;
  est_lu: boolean;
  lien?: string;
  cree_le: string;
}

export type NotificationType =
  | 'rdv_confirme'
  | 'rdv_refuse'
  | 'rdv_annule'
  | 'resultat'
  | 'message'
  | 'alerte'
  | 'systeme';

// ── Message Types ─────────────────────────────────────────────────────────────
export interface Conversation {
  consultation_id: number | null;
  destinataire_id: number;
  titre: string;
  dernier_message?: Message | string | null;
  date_dernier_message: string;
  non_lus: number;
  type: 'consultation' | 'direct';
  est_cloture: boolean;
}

export interface Message {
  id: number;
  consultation?: number | null;
  expediteur: number;
  expediteur_nom?: string;
  expediteur_photo?: string | null;
  destinataire: number;
  destinataire_nom?: string;
  contenu: string;
  type_message: 'texte' | 'vocal' | 'fichier';
  audio?: string | null;
  piece_jointe?: string | null;
  date_envoi: string;
  lu: boolean;
}

// ── Chatbot Types ─────────────────────────────────────────────────────────────
export interface ChatSession {
  id: number;
  patient: number;
  date_creation: string;
}

export interface ChatMessage {
  id: number;
  session: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
