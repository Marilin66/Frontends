class RendezVousMedecinModel {
  final int id;
  final int patient;
  final String patientNom;
  final int medecin;
  final String medecinNom;
  final DateTime dateHeure;
  final int duree;
  final String motif;
  final String statut;
  final String statutDisplay;
  final String? commentaireAnnulation;
  final DateTime creeLe;
  final DateTime modifieLe;
  final bool hasConsultation;
  final int? consultationId;
  final Map<String, dynamic>? preEnregistrement;

  RendezVousMedecinModel({
    required this.id,
    required this.patient,
    required this.patientNom,
    required this.medecin,
    required this.medecinNom,
    required this.dateHeure,
    required this.duree,
    required this.motif,
    required this.statut,
    required this.statutDisplay,
    this.commentaireAnnulation,
    required this.creeLe,
    required this.modifieLe,
    required this.hasConsultation,
    this.consultationId,
    this.preEnregistrement,
  });

  factory RendezVousMedecinModel.fromJson(Map<String, dynamic> json) {
    return RendezVousMedecinModel(
      id: json['id'] as int,
      patient: json['patient'] as int,
      patientNom: json['patient_nom'] as String? ?? '',
      medecin: json['medecin'] as int,
      medecinNom: json['medecin_nom'] as String? ?? '',
      dateHeure: DateTime.parse(json['date_heure'] as String),
      duree: json['duree'] as int,
      motif: json['motif'] as String? ?? '',
      statut: json['statut'] as String? ?? '',
      statutDisplay: json['statut_display'] as String? ?? '',
      commentaireAnnulation: json['commentaire_annulation'] as String?,
      creeLe: DateTime.parse(json['cree_le'] as String),
      modifieLe: DateTime.parse(json['modifie_le'] as String),
      hasConsultation: json['has_consultation'] as bool? ?? false,
      consultationId: json['consultation_id'] as int?,
      preEnregistrement: json['pre_enregistrement'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patient': patient,
      'patient_nom': patientNom,
      'medecin': medecin,
      'medecin_nom': medecinNom,
      'date_heure': dateHeure.toIso8601String(),
      'duree': duree,
      'motif': motif,
      'statut': statut,
      'statut_display': statutDisplay,
      'commentaire_annulation': commentaireAnnulation,
      'cree_le': creeLe.toIso8601String(),
      'modifie_le': modifieLe.toIso8601String(),
      'has_consultation': hasConsultation,
      'consultation_id': consultationId,
      'pre_enregistrement': preEnregistrement,
    };
  }

  RendezVousMedecinModel copyWith({
    int? id,
    int? patient,
    String? patientNom,
    int? medecin,
    String? medecinNom,
    DateTime? dateHeure,
    int? duree,
    String? motif,
    String? statut,
    String? statutDisplay,
    String? commentaireAnnulation,
    DateTime? creeLe,
    DateTime? modifieLe,
    bool? hasConsultation,
    int? consultationId,
    Map<String, dynamic>? preEnregistrement,
  }) {
    return RendezVousMedecinModel(
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
    );
  }
}
