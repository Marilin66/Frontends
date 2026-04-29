// @ts-nocheck
// Hospital Types
export interface Hopital {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  photo?: string;
  est_public: boolean;
  est_actif: boolean;
  jours_ouverture: number;
  heure_ouverture: string;
  heure_fermeture: string;
  created_at: string;
  updated_at: string;
  nombre_services?: number;
  nombre_medecins?: number;
}

export interface Service {
  id: number;
  hopital: number;
  hopital_nom: string;
  nom: string;
  description?: string;
  est_actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface HopitalService {
  id: number;
  hopital: number;
  service: number;
  service_nom: string;
  description?: string;
  prix_consultation: number;
  duree_consultation: number;
  est_disponible: boolean;
  created_at: string;
  updated_at: string;
}

// Doctor Types
export interface Medecin {
  id: number;
  utilisateur: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  photo?: string;
  hopital: number;
  hopital_nom: string;
  specialite: string;
  matricule: string;
  description?: string;
  annees_experience: number;
  is_verified: boolean;
  moyenne_evaluation?: number;
  nombre_avis?: number;
}

export interface Disponibilite {
  id: number;
  medecin: number;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  est_disponible: boolean;
  created_at: string;
  updated_at: string;
}

// Appointment Types
export interface RendezVous {
  id: number;
  patient: number;
  patient_nom: string;
  medecin: number;
  medecin_nom: string;
  medecin_specialite?: string;
  hopital?: number;
  hopital_nom?: string;
  service?: number;
  service_nom?: string;
  date_heure: string;
  duree: number;
  motif: string;
  statut: AppointmentStatus;
  statut_display?: string;
  notes?: string;
  commentaire_annulation?: string;
  has_consultation: boolean;
  consultation_id?: number | null;
  cree_le?: string;
  modifie_le?: string;
  /** Données de pré-enregistrement (Patient Intake) si déjà remplies par le patient */
  pre_enregistrement?: {
    symptomes_principaux?: string;
    debut_symptomes?: string;
    traitements_en_cours?: string;
    observations?: string;
  } | null;
}

export type AppointmentStatus = 'en_attente' | 'confirme' | 'en_cours' | 'termine' | 'annule' | 'absent';

export interface Creneau {
  id: number;
  medecin: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  est_disponible: boolean;
}

// Medical Results Types
export interface ResultatMedical {
  id: number;
  patient: number;
  patient_nom: string;
  medecin_prescripteur: number;
  medecin_nom: string;
  laborantin: number;
  laborantin_nom: string;
  hopital: number;
  hopital_nom: string;
  type_examen: string;
  description?: string;
  resultat_fichier?: string;
  statut: ResultatStatus;
  observations?: string;
  code_recuperation: string;
  date_creation: string;
  date_mise_a_jour: string;
}

export type ResultatStatus = 'en_attente' | 'en_cours' | 'pret' | 'livre';

// Notification Types
export interface Notification {
  id: number;
  utilisateur: number;
  titre: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  lien?: string;
  created_at: string;
}

export type NotificationType = 'rendez_vous' | 'resultat' | 'message' | 'systeme' | 'alerte';

// Message Types
export interface Conversation {
  consultation_id: number | null;
  destinataire_id: number;
  titre: string;
  dernier_message?: Message | string;
  date_dernier_message: string;
  non_lus: number;
  type: 'consultation' | 'direct';
  est_cloture: boolean;
}

export interface Message {
  id: number;
  consultation: number | null;
  destinataire: number;
  destinataire_nom: string;
  expediteur: number;
  expediteur_nom: string;
  expediteur_photo?: string;
  contenu: string;
  lu: boolean;
  created_at: string;
  /** Type de message : 'texte' | 'vocal' | 'fichier' */
  type_message?: 'texte' | 'vocal' | 'fichier';
  /** URL du fichier audio si type_message === 'vocal' */
  audio?: string | null;
  /** URL de la pièce jointe */
  piece_jointe?: string | null;
}