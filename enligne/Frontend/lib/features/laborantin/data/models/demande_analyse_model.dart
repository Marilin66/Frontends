class DemandeAnalyseModel {
  final int id;
  final int hopitalId;
  final String hopitalNom;
  final int? laborantinId;
  final String? laborantinNom;
  final int? patientId;
  final String patientNom;
  final String patientPrenom;
  final String patientEmail;
  final String? patientTelephone;
  final String? patientDdn;
  final String typeAnalyse;
  final String statut;
  final String statutDisplay;
  final String dateInscription;
  final String? dateCloture;
  final int? resultatId;
  final String? resultatCode;

  DemandeAnalyseModel({
    required this.id,
    required this.hopitalId,
    required this.hopitalNom,
    this.laborantinId,
    this.laborantinNom,
    this.patientId,
    required this.patientNom,
    required this.patientPrenom,
    required this.patientEmail,
    this.patientTelephone,
    this.patientDdn,
    required this.typeAnalyse,
    required this.statut,
    required this.statutDisplay,
    required this.dateInscription,
    this.dateCloture,
    this.resultatId,
    this.resultatCode,
  });

  factory DemandeAnalyseModel.fromJson(Map<String, dynamic> json) {
    return DemandeAnalyseModel(
      id: json['id'],
      hopitalId: json['hopital'],
      hopitalNom: json['hopital_nom'] ?? '',
      laborantinId: json['laborantin'],
      laborantinNom: json['laborantin_nom'],
      patientId: json['patient'],
      patientNom: json['patient_nom'] ?? '',
      patientPrenom: json['patient_prenom'] ?? '',
      patientEmail: json['patient_email'] ?? '',
      patientTelephone: json['patient_telephone'],
      patientDdn: json['patient_ddn'],
      typeAnalyse: json['type_analyse'] ?? '',
      statut: json['statut'] ?? 'en_cours',
      statutDisplay: json['statut_display'] ?? 'En cours',
      dateInscription: json['date_inscription'] ?? '',
      dateCloture: json['date_cloture'],
      resultatId: json['resultat'],
      resultatCode: json['resultat_code'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hopital': hopitalId,
      'patient': patientId,
      'patient_nom': patientNom,
      'patient_prenom': patientPrenom,
      'patient_email': patientEmail,
      'patient_telephone': patientTelephone,
      'patient_ddn': patientDdn,
      'type_analyse': typeAnalyse,
      'statut': statut,
    };
  }
}
