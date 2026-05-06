class DisponibiliteModel {
  final int id;
  final int medecin;
  final String medecinNom;
  final String type;
  final String typeDisplay;
  final int? jourSemaine;
  final String? jourSemaineDisplay;
  final DateTime? dateSpecifique;
  final String heureDebut;
  final String heureFin;
  final bool isActive;
  final DateTime dateCreation;

  DisponibiliteModel({
    required this.id,
    required this.medecin,
    required this.medecinNom,
    required this.type,
    required this.typeDisplay,
    this.jourSemaine,
    this.jourSemaineDisplay,
    this.dateSpecifique,
    required this.heureDebut,
    required this.heureFin,
    required this.isActive,
    required this.dateCreation,
  });

  factory DisponibiliteModel.fromJson(Map<String, dynamic> json) {
    return DisponibiliteModel(
      id: json['id'] as int? ?? 0,
      medecin: json['medecin'] as int? ?? 0,
      medecinNom: json['medecin_nom'] as String? ?? '',
      type: json['type'] as String? ?? '',
      typeDisplay: json['type_display'] as String? ?? '',
      jourSemaine: json['jour_semaine'] as int?,
      jourSemaineDisplay: json['jour_semaine_display'] as String?,
      dateSpecifique: json['date_specifique'] != null
          ? DateTime.tryParse(json['date_specifique'].toString()) 
          : null,
      heureDebut: json['heure_debut'] as String? ?? '',
      heureFin: json['heure_fin'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
      dateCreation: DateTime.tryParse(json['date_creation']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'medecin': medecin,
      'medecin_nom': medecinNom,
      'type': type,
      'type_display': typeDisplay,
      'jour_semaine': jourSemaine,
      'jour_semaine_display': jourSemaineDisplay,
      'date_specifique': dateSpecifique?.toIso8601String().split('T')[0],
      'heure_debut': heureDebut,
      'heure_fin': heureFin,
      'is_active': isActive,
      'date_creation': dateCreation.toIso8601String(),
    };
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'type': type,
      'jour_semaine': jourSemaine,
      'date_specifique': dateSpecifique?.toIso8601String().split('T')[0],
      'heure_debut': heureDebut,
      'heure_fin': heureFin,
    };
  }

  DisponibiliteModel copyWith({
    int? id,
    int? medecin,
    String? medecinNom,
    String? type,
    String? typeDisplay,
    int? jourSemaine,
    String? jourSemaineDisplay,
    DateTime? dateSpecifique,
    String? heureDebut,
    String? heureFin,
    bool? isActive,
    DateTime? dateCreation,
  }) {
    return DisponibiliteModel(
      id: id ?? this.id,
      medecin: medecin ?? this.medecin,
      medecinNom: medecinNom ?? this.medecinNom,
      type: type ?? this.type,
      typeDisplay: typeDisplay ?? this.typeDisplay,
      jourSemaine: jourSemaine ?? this.jourSemaine,
      jourSemaineDisplay: jourSemaineDisplay ?? this.jourSemaineDisplay,
      dateSpecifique: dateSpecifique ?? this.dateSpecifique,
      heureDebut: heureDebut ?? this.heureDebut,
      heureFin: heureFin ?? this.heureFin,
      isActive: isActive ?? this.isActive,
      dateCreation: dateCreation ?? this.dateCreation,
    );
  }
}

class CreneauModel {
  final DateTime date;
  final String heureDebut;
  final String heureFin;

  CreneauModel({
    required this.date,
    required this.heureDebut,
    required this.heureFin,
  });

  factory CreneauModel.fromJson(Map<String, dynamic> json) {
    return CreneauModel(
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      heureDebut: json['heure_debut'] as String? ?? '',
      heureFin: json['heure_fin'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String().split('T')[0],
      'heure_debut': heureDebut,
      'heure_fin': heureFin,
    };
  }
}
