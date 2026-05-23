class ConversationModel {
  final int? consultationId;
  final int? destinataireId;
  final String type; // 'consultation' or 'direct'
  final String titre;
  final String patientNom;
  final String medecinNom;
  final String dateRdv;
  final String dernierMessage;
  final String dateDernierMessage;
  final int nonLus;
  /// Indique si la consultation liée est clôturée (ajouté par le backend).
  /// Si true, l'envoi de messages doit être désactivé côté UI.
  final bool estCloture;
  final String? contactPhoto;

  ConversationModel({
    this.consultationId,
    this.destinataireId,
    required this.type,
    required this.titre,
    required this.patientNom,
    required this.medecinNom,
    required this.dateRdv,
    required this.dernierMessage,
    required this.dateDernierMessage,
    this.nonLus = 0,
    this.estCloture = false,
    this.contactPhoto,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      consultationId: json['consultation_id'] as int?,
      destinataireId: json['destinataire_id'] as int?,
      type: json['type'] as String? ?? 'consultation',
      titre: json['titre'] as String? ?? '',
      patientNom: json['patient_nom'] as String? ?? '',
      medecinNom: json['medecin_nom'] as String? ?? '',
      dateRdv: json['date_rdv'] as String? ?? '',
      dernierMessage: json['dernier_message'] as String? ?? '',
      dateDernierMessage: json['date_dernier_message'] as String? ?? '',
      nonLus: json['non_lus'] as int? ?? 0,
      estCloture: json['est_cloture'] as bool? ?? false,
      contactPhoto: json['contact_photo'] as String?,
    );
  }
}
