class ConversationModel {
  final int id;
  final int consultation;
  final String patientNom;
  final String medecinNom;
  final String dernierMessage;
  final DateTime dateDernierMessage;
  final int messagesNonLus;

  ConversationModel({
    required this.id,
    required this.consultation,
    required this.patientNom,
    required this.medecinNom,
    required this.dernierMessage,
    required this.dateDernierMessage,
    required this.messagesNonLus,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id'] as int? ?? 0,
      consultation: json['consultation'] as int? ?? 0,
      patientNom: json['patient_nom'] as String? ?? '',
      medecinNom: json['medecin_nom'] as String? ?? '',
      dernierMessage: json['dernier_message'] as String? ?? '',
      dateDernierMessage: json['date_dernier_message'] != null
          ? (DateTime.tryParse(json['date_dernier_message'].toString()) ?? DateTime.now())
          : DateTime.now(),
      messagesNonLus: json['messages_non_lus'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'consultation': consultation,
      'patient_nom': patientNom,
      'medecin_nom': medecinNom,
      'dernier_message': dernierMessage,
      'date_dernier_message': dateDernierMessage.toIso8601String(),
      'messages_non_lus': messagesNonLus,
    };
  }
}
