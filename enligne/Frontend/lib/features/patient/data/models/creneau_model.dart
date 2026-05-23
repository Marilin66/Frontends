// ==========================================================================
// Modèle CreneauModel
// ==========================================================================
// Ce fichier définit le modèle de données pour un créneau horaire
// disponible pour la prise de rendez-vous.
//
// Il correspond au serializer [CreneauSerializer] côté backend Django.
//
// Un créneau représente une plage horaire libre dans l'agenda d'un
// médecin. Le patient consulte la liste des créneaux disponibles
// pour choisir le moment de son rendez-vous.
//
// Chaque créneau est défini par une date, une heure de début et
// une heure de fin.
// ==========================================================================

class CreneauModel {
  /// ID du créneau
  final int id;

  /// Date du créneau au format ISO 8601 (ex: "2025-03-19")
  ///
  /// Représente le jour pour lequel ce créneau est disponible
  final String date;

  /// Heure de début du créneau au format HH:MM (ex: "09:00")
  ///
  /// Indique le moment où le rendez-vous peut commencer
  final String heureDebut;

  /// Heure de fin du créneau au format HH:MM (ex: "09:30")
  ///
  /// Indique le moment où le créneau se termine
  final String heureFin;

  /// Constructeur du modèle CreneauModel
  ///
  /// Tous les champs sont requis car un créneau doit obligatoirement
  /// avoir une date, une heure de début et une heure de fin.
  CreneauModel({
    required this.id,
    required this.date,
    required this.heureDebut,
    required this.heureFin,
  });

  /// Factory constructor pour créer une instance de [CreneauModel]
  /// à partir d'un objet JSON.
  ///
  /// Cette méthode est appelée lors de la désérialisation de la
  /// liste des créneaux disponibles retournée par l'API backend.
  factory CreneauModel.fromJson(Map<String, dynamic> json) {
    return CreneauModel(
      id: json['id'] ?? 0,
      date: json['date'] as String? ?? '',
      heureDebut: json['heure_debut'] as String? ?? '',
      heureFin: json['heure_fin'] as String? ?? '',
    );
  }

  /// Convertit l'instance en Map JSON pour l'envoi vers l'API backend.
  ///
  /// Utilisé si le frontend doit envoyer un créneau sélectionné
  /// lors de la création d'un rendez-vous.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'heure_debut': heureDebut,
      'heure_fin': heureFin,
    };
  }

  /// Méthode copyWith pour créer une copie modifiée du modèle.
  ///
  /// Respecte le principe d'immutabilité des données.
  CreneauModel copyWith({
    int? id,
    String? date,
    String? heureDebut,
    String? heureFin,
  }) {
    return CreneauModel(
      id: id ?? this.id,
      date: date ?? this.date,
      heureDebut: heureDebut ?? this.heureDebut,
      heureFin: heureFin ?? this.heureFin,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is CreneauModel &&
        other.id == id &&
        other.date == date &&
        other.heureDebut == heureDebut &&
        other.heureFin == heureFin;
  }

  @override
  int get hashCode =>
      id.hashCode ^ date.hashCode ^ heureDebut.hashCode ^ heureFin.hashCode;
}
