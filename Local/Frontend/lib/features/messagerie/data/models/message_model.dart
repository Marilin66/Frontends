/// Types de messages supportés par le backend.
enum TypeMessage { texte, vocal, fichier }

class MessageModel {
  final int id;
  final int? consultation;
  final int expediteur;
  final String expediteurNom;
  final int destinataire;
  final String destinataireNom;
  final String contenu;
  final String dateEnvoi;
  final bool lu;
  final String? pieceJointe;
  /// Type du message : texte, vocal ou fichier (nouveau champ backend)
  final TypeMessage typeMessage;
  /// URL du fichier audio si typeMessage == TypeMessage.vocal
  final String? audio;
  final String? expediteurPhoto;

  MessageModel({
    required this.id,
    this.consultation,
    required this.expediteur,
    this.expediteurNom = '',
    required this.destinataire,
    this.destinataireNom = '',
    required this.contenu,
    required this.dateEnvoi,
    this.lu = false,
    this.pieceJointe,
    this.typeMessage = TypeMessage.texte,
    this.audio,
    this.expediteurPhoto,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    final rawType = json['type_message'] as String? ?? 'texte';
    TypeMessage parsedType;
    switch (rawType) {
      case 'vocal':
        parsedType = TypeMessage.vocal;
        break;
      case 'fichier':
        parsedType = TypeMessage.fichier;
        break;
      default:
        parsedType = TypeMessage.texte;
    }

    return MessageModel(
      id: (json['id'] as num).toInt(),
      consultation: json['consultation'] != null ? (json['consultation'] as num).toInt() : null,
      expediteur: (json['expediteur'] as num).toInt(),
      expediteurNom: json['expediteur_nom'] as String? ?? '',
      destinataire: (json['destinataire'] as num).toInt(),
      destinataireNom: json['destinataire_nom'] as String? ?? '',
      contenu: json['contenu'] as String? ?? '',
      dateEnvoi: json['date_envoi'] as String? ?? '',
      lu: json['lu'] as bool? ?? false,
      pieceJointe: json['piece_jointe'] as String?,
      typeMessage: parsedType,
      audio: json['audio'] as String?,
      expediteurPhoto: json['expediteur_photo'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'consultation': consultation,
      'expediteur': expediteur,
      'destinataire': destinataire,
      'contenu': contenu,
      'date_envoi': dateEnvoi,
      'lu': lu,
      'piece_jointe': pieceJointe,
      'type_message': typeMessage.name,
      'audio': audio,
    };
  }

  MessageModel copyWith({bool? lu}) {
    return MessageModel(
      id: id,
      consultation: consultation,
      expediteur: expediteur,
      expediteurNom: expediteurNom,
      destinataire: destinataire,
      destinataireNom: destinataireNom,
      contenu: contenu,
      dateEnvoi: dateEnvoi,
      lu: lu ?? this.lu,
      pieceJointe: pieceJointe,
      typeMessage: typeMessage,
      audio: audio,
    );
  }
}
