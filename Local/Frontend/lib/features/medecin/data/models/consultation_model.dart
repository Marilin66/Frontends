class ConsultationModel {
  final int rendezVousId;
  final String patientNom;
  final String medecinNom;
  final DateTime dateRdv;
  final String motif;
  final String compteRendu;
  final String diagnostic;
  final String prescription;
  final DateTime dateConsultation;

  ConsultationModel({
    required this.rendezVousId,
    required this.patientNom,
    required this.medecinNom,
    required this.dateRdv,
    required this.motif,
    required this.compteRendu,
    required this.diagnostic,
    required this.prescription,
    required this.dateConsultation,
  });

  factory ConsultationModel.fromJson(Map<String, dynamic> json) {
    return ConsultationModel(
      rendezVousId: json['rendez_vous_id'] as int? ?? 0,
      patientNom: json['patient_nom'] as String? ?? '',
      medecinNom: json['medecin_nom'] as String? ?? '',
      dateRdv: DateTime.tryParse(json['date_rdv']?.toString() ?? '') ?? DateTime.now(),
      motif: json['motif'] as String? ?? '',
      compteRendu: json['compte_rendu'] as String? ?? '',
      diagnostic: json['diagnostic'] as String? ?? '',
      prescription: json['prescription'] as String? ?? '',
      dateConsultation: DateTime.tryParse(json['date_consultation']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rendez_vous_id': rendezVousId,
      'patient_nom': patientNom,
      'medecin_nom': medecinNom,
      'date_rdv': dateRdv.toIso8601String(),
      'motif': motif,
      'compte_rendu': compteRendu,
      'diagnostic': diagnostic,
      'prescription': prescription,
      'date_consultation': dateConsultation.toIso8601String(),
    };
  }

  ConsultationModel copyWith({
    int? rendezVousId,
    String? patientNom,
    String? medecinNom,
    DateTime? dateRdv,
    String? motif,
    String? compteRendu,
    String? diagnostic,
    String? prescription,
    DateTime? dateConsultation,
  }) {
    return ConsultationModel(
      rendezVousId: rendezVousId ?? this.rendezVousId,
      patientNom: patientNom ?? this.patientNom,
      medecinNom: medecinNom ?? this.medecinNom,
      dateRdv: dateRdv ?? this.dateRdv,
      motif: motif ?? this.motif,
      compteRendu: compteRendu ?? this.compteRendu,
      diagnostic: diagnostic ?? this.diagnostic,
      prescription: prescription ?? this.prescription,
      dateConsultation: dateConsultation ?? this.dateConsultation,
    );
  }
}
