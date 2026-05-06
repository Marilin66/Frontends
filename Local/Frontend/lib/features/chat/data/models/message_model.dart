class MessageModel {
  final int id;
  final int consultation;
  final int expediteur;
  final String expediteurNom;
  final int destinataire;
  final String destinataireNom;
  final String contenu;
  final DateTime dateEnvoi;
  final bool lu;
  final String? pieceJointe;

  MessageModel({
    required this.id,
    required this.consultation,
    required this.expediteur,
    required this.expediteurNom,
    required this.destinataire,
    required this.destinataireNom,
    required this.contenu,
    required this.dateEnvoi,
    required this.lu,
    this.pieceJointe,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'] as int? ?? 0,
      consultation: json['consultation'] as int? ?? 0,
      expediteur: json['expediteur'] as int? ?? 0,
      expediteurNom: json['expediteur_nom'] as String? ?? '',
      destinataire: json['destinataire'] as int? ?? 0,
      destinataireNom: json['destinataire_nom'] as String? ?? '',
      contenu: json['contenu'] as String? ?? '',
      dateEnvoi: DateTime.tryParse(json['date_envoi']?.toString() ?? '') ?? DateTime.now(),
      lu: json['lu'] as bool? ?? false,
      pieceJointe: json['piece_jointe'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'consultation': consultation,
      'expediteur': expediteur,
      'expediteur_nom': expediteurNom,
      'destinataire': destinataire,
      'destinataire_nom': destinataireNom,
      'contenu': contenu,
      'date_envoi': dateEnvoi.toIso8601String(),
      'lu': lu,
      'piece_jointe': pieceJointe,
    };
  }

  bool isFromUser(int userId) => expediteur == userId;
}
