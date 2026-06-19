// ==========================================================================
// Modèle RendezVousModel
// ==========================================================================
// Ce fichier définit le modèle de données pour un rendez-vous médical.
// Il correspond au serializer [RendezVousSerializer] côté backend Django.
//
// Un rendez-vous relie un [patient] à un [medecin] à une date et heure
// précises, avec un motif de consultation et un statut de suivi.
//
// Ce modèle est utilisé dans la couche "data" de l'architecture Clean
// Architecture pour transformer les données JSON reçues depuis l'API
// REST en objets Dart exploitables par l'application.
// ==========================================================================

class RendezVousModel {
  /// Identifiant unique du rendez-vous dans la base de données
  final int id;

  /// Identifiant du patient associé à ce rendez-vous (clé étrangère)
  final int patient;

  /// Nom complet du patient (champ en lecture seule fourni par le serializer)
  final String patientNom;

  /// Identifiant du médecin assigné à ce rendez-vous (clé étrangère)
  final int medecin;

  /// Nom complet du médecin (champ en lecture seule fourni par le serializer)
  final String medecinNom;

  /// Spécialité du médecin
  final String medecinSpecialite;

  /// Date et heure du rendez-vous au format ISO 8601 (ex: "2025-03-19T14:30:00")
  final String dateHeure;

  /// Durée du rendez-vous en minutes (par défaut définie par le médecin)
  final int duree;

  /// Motif de la consultation (raison pour laquelle le patient consulte)
  final String motif;

  /// Statut actuel du rendez-vous (ex: "planifie", "confirme", "annule", "termine")
  final String statut;

  /// Libellé lisible du statut pour l'affichage (ex: "Planifié", "Confirmé")
  final String statutDisplay;

  /// Commentaire optionnel en cas d'annulation du rendez-vous
  final String commentaireAnnulation;

  /// Date de création du rendez-vous (générée automatiquement par le backend)
  final String creeLe;

  /// Date de dernière modification du rendez-vous
  final String modifieLe;

  /// Indique si une consultation a été créée suite à ce rendez-vous
  final bool hasConsultation;

  /// ID de la consultation associée (si disponible)
  final int? consultationId;

  /// Données de pré-enregistrement (Patient Intake) soumises par le patient avant la consultation.
  /// Injectées directement par le backend dans la liste des RDV du médecin.
  /// Null si le patient n'a pas encore rempli le formulaire.
  final Map<String, dynamic>? preEnregistrement;

  /// Constructeur du modèle RendezVousModel
  /// Les champs obligatoires sont marqués avec [required],
  /// les champs optionnels ont des valeurs par défaut
  RendezVousModel({
    required this.id,
    required this.patient,
    this.patientNom = '',
    required this.medecin,
    this.medecinNom = '',
    this.medecinSpecialite = '',
    required this.dateHeure,
    this.duree = 30,
    this.motif = '',
    this.statut = 'planifie',
    this.statutDisplay = '',
    this.commentaireAnnulation = '',
    this.creeLe = '',
    this.modifieLe = '',
    this.hasConsultation = false,
    this.consultationId,
    this.preEnregistrement,
  });

  /// Factory constructor pour créer une instance de [RendezVousModel]
  /// à partir d'un objet JSON.
  ///
  /// Cette méthode est appelée lors de la désérialisation des données
  /// reçues depuis l'API REST du backend Django.
  ///
  /// Chaque champ est casté vers son type Dart approprié avec une
  /// valeur par défaut en cas de valeur nulle dans le JSON.
  factory RendezVousModel.fromJson(Map<String, dynamic> json) {
    return RendezVousModel(
      id: json['id'] as int? ?? 0,
      patient: json['patient'] as int? ?? 0,
      patientNom: json['patient_nom'] as String? ?? '',
      medecin: json['medecin'] as int? ?? 0,
      medecinNom: json['medecin_nom'] as String? ?? '',
      medecinSpecialite: json['medecin_specialite'] as String? ?? '',
      dateHeure: json['date_heure'] as String? ?? '',
      duree: json['duree'] as int? ?? 30,
      motif: json['motif'] as String? ?? '',
      statut: json['statut'] as String? ?? 'planifie',
      statutDisplay: json['statut_display'] as String? ?? '',
      commentaireAnnulation: json['commentaire_annulation'] as String? ?? '',
      creeLe: json['cree_le'] as String? ?? '',
      modifieLe: json['modifie_le'] as String? ?? '',
      hasConsultation: json['has_consultation'] as bool? ?? false,
      consultationId: json['consultation_id'] as int?,
      preEnregistrement: json['pre_enregistrement'] as Map<String, dynamic>?,
    );
  }

  /// Convertit l'instance en Map JSON pour l'envoi vers l'API backend.
  ///
  /// Cette méthode est utilisée lors de la création ou la mise à jour
  /// d'un rendez-vous via une requête POST ou PUT/PATCH.
  ///
  /// Les clés correspondent aux noms de champs attendus par le
  /// serializer Django (snake_case).
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patient': patient,
      'patient_nom': patientNom,
      'medecin': medecin,
      'medecin_nom': medecinNom,
      'medecin_specialite': medecinSpecialite,
      'date_heure': dateHeure,
      'duree': duree,
      'motif': motif,
      'statut': statut,
      'statut_display': statutDisplay,
      'commentaire_annulation': commentaireAnnulation,
      'cree_le': creeLe,
      'modifie_le': modifieLe,
      'has_consultation': hasConsultation,
      'consultation_id': consultationId,
      'pre_enregistrement': preEnregistrement,
    };
  }

  /// Méthode copyWith pour créer une copie modifiée du modèle.
  ///
  /// Utile pour mettre à jour un seul champ sans modifier l'instance
  /// originale (principe d'immutabilité des données).
  RendezVousModel copyWith({
    int? id,
    int? patient,
    String? patientNom,
    int? medecin,
    String? medecinNom,
    String? dateHeure,
    int? duree,
    String? motif,
    String? statut,
    String? statutDisplay,
    String? commentaireAnnulation,
    String? creeLe,
    String? modifieLe,
    bool? hasConsultation,
    Map<String, dynamic>? preEnregistrement,
  }) {
    return RendezVousModel(
      id: id ?? this.id,
      patient: patient ?? this.patient,
      patientNom: patientNom ?? this.patientNom,
      medecin: medecin ?? this.medecin,
      medecinNom: medecinNom ?? this.medecinNom,
      dateHeure: dateHeure ?? this.dateHeure,
      duree: duree ?? this.duree,
      motif: motif ?? this.motif,
      statut: statut ?? this.statut,
      statutDisplay: statutDisplay ?? this.statutDisplay,
      commentaireAnnulation: commentaireAnnulation ?? this.commentaireAnnulation,
      creeLe: creeLe ?? this.creeLe,
      modifieLe: modifieLe ?? this.modifieLe,
      hasConsultation: hasConsultation ?? this.hasConsultation,
      consultationId: consultationId ?? this.consultationId,
      preEnregistrement: preEnregistrement ?? this.preEnregistrement,
      medecinSpecialite: medecinSpecialite ?? this.medecinSpecialite,
    );
  }
}
