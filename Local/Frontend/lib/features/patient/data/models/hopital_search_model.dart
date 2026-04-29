// ==========================================================================
// Modèle HopitalSearchModel
// ==========================================================================
// Ce fichier définit le modèle de données pour la recherche d'hôpitaux
// par un patient.
//
// Il correspond au serializer [HopitalListSerializer] côté backend Django.
//
// Ce modèle est distinct du [HopitalModel] utilisé par le super admin
// car il inclut la liste des services proposés par chaque hôpital,
// permettant au patient de filtrer et choisir un établissement.
// ==========================================================================

/// Modèle représentant un service proposé par un hôpital.
///
/// Chaque hôpital peut proposer plusieurs services médicaux
/// (cardiologie, pédiatrie, radiologie, etc.).
class HopitalServiceModel {
  /// Identifiant unique du service
  final int id;

  /// Nom du service (ex: "Cardiologie", "Pédiatrie")
  final String nom;

  /// Description détaillée du service médical
  final String description;

  /// Nom de l'icône associée au service pour l'affichage
  final String icone;

  /// Indique si le service est actuellement actif et disponible
  final bool isActive;

  /// Date de création du service dans le système
  final String dateCreation;

  /// Constructeur du modèle HopitalServiceModel
  HopitalServiceModel({
    required this.id,
    required this.nom,
    this.description = '',
    this.icone = '',
    this.isActive = true,
    required this.dateCreation,
  });

  /// Factory constructor pour créer une instance à partir d'un JSON.
  ///
  /// Chaque champ est casté avec une valeur par défaut sécurisée
  /// en cas de donnée manquante dans la réponse API.
  factory HopitalServiceModel.fromJson(Map<String, dynamic> json) {
    return HopitalServiceModel(
      id: json['id'] as int,
      nom: json['nom'] as String,
      description: json['description'] as String? ?? '',
      icone: json['icone'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
      dateCreation: json['date_creation'] as String,
    );
  }

  /// Convertit l'instance en Map JSON.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'description': description,
      'icone': icone,
      'is_active': isActive,
      'date_creation': dateCreation,
    };
  }
}

/// Modèle principal représentant un hôpital dans le contexte de
/// la recherche par le patient.
///
/// Contient toutes les informations de l'hôpital ainsi que la liste
/// complète de ses services, permettant au patient de choisir un
/// établissement adapté à ses besoins médicaux.
class HopitalSearchModel {
  /// Identifiant unique de l'hôpital dans la base de données
  final int id;

  /// Nom officiel de l'hôpital
  final String nom;

  /// Adresse postale complète de l'hôpital
  final String adresse;

  /// Ville où se situe l'hôpital
  final String ville;

  /// Numéro de téléphone de contact de l'hôpital
  final String telephone;

  /// Adresse email de contact de l'hôpital
  final String email;

  /// URL du site web officiel de l'hôpital
  final String siteWeb;

  /// Description générale de l'hôpital et de ses activités
  final String description;

  /// URL du logo de l'hôpital (nullable si aucun logo n'est défini)
  final String? logo;

  /// Coordonnée GPS : latitude de l'hôpital (pour la carte)
  final double? latitude;

  /// Coordonnée GPS : longitude de l'hôpital (pour la carte)
  final double? longitude;

  /// Indique si l'hôpital est actuellement actif dans le système
  final bool isActive;

  /// Date de création de l'enregistrement de l'hôpital
  final String dateCreation;

  /// Liste des services médicaux proposés par cet hôpital.
  /// Permet au patient de voir quels services sont disponibles
  /// avant de prendre rendez-vous.
  final List<HopitalServiceModel> services;

  /// Constructeur du modèle HopitalSearchModel
  /// Inclut tous les champs de l'hôpital plus la liste des services
  HopitalSearchModel({
    required this.id,
    required this.nom,
    this.adresse = '',
    this.ville = '',
    this.telephone = '',
    this.email = '',
    this.siteWeb = '',
    this.description = '',
    this.logo,
    this.latitude,
    this.longitude,
    this.isActive = true,
    required this.dateCreation,
    this.services = const [],
  });

  /// Factory constructor pour créer une instance de [HopitalSearchModel]
  /// à partir d'un objet JSON.
  ///
  /// La liste [services] est désérialisée en mappant chaque élément
  /// JSON vers un objet [HopitalServiceModel].
  factory HopitalSearchModel.fromJson(Map<String, dynamic> json) {
    return HopitalSearchModel(
      id: json['id'] as int,
      nom: json['nom'] as String,
      adresse: json['adresse'] as String? ?? '',
      ville: json['ville'] as String? ?? '',
      telephone: json['telephone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      siteWeb: json['site_web'] as String? ?? '',
      description: json['description'] as String? ?? '',
      logo: json['logo'] as String?,
      latitude: _parseNum(json['latitude'])?.toDouble(),
      longitude: _parseNum(json['longitude'])?.toDouble(),
      isActive: json['is_active'] as bool? ?? true,
      dateCreation: json['date_creation'] as String,
      services: (json['services'] as List<dynamic>?)
              ?.map((e) =>
                  HopitalServiceModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  /// Convertit l'instance en Map JSON pour l'envoi vers l'API backend.
  ///
  /// Les clés utilisent le format snake_case attendu par Django.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'adresse': adresse,
      'ville': ville,
      'telephone': telephone,
      'email': email,
      'site_web': siteWeb,
      'description': description,
      'logo': logo,
      'latitude': latitude,
      'longitude': longitude,
      'is_active': isActive,
      'date_creation': dateCreation,
      'services': services.map((e) => e.toJson()).toList(),
    };
  }

  /// Méthode copyWith pour créer une copie modifiée du modèle.
  ///
  /// Respecte le principe d'immutabilité en retournant une
  /// nouvelle instance avec les champs modifiés.
  HopitalSearchModel copyWith({
    int? id,
    String? nom,
    String? adresse,
    String? ville,
    String? telephone,
    String? email,
    String? siteWeb,
    String? description,
    String? logo,
    double? latitude,
    double? longitude,
    bool? isActive,
    String? dateCreation,
    List<HopitalServiceModel>? services,
  }) {
    return HopitalSearchModel(
      id: id ?? this.id,
      nom: nom ?? this.nom,
      adresse: adresse ?? this.adresse,
      ville: ville ?? this.ville,
      telephone: telephone ?? this.telephone,
      email: email ?? this.email,
      siteWeb: siteWeb ?? this.siteWeb,
      description: description ?? this.description,
      logo: logo ?? this.logo,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isActive: isActive ?? this.isActive,
      dateCreation: dateCreation ?? this.dateCreation,
      services: services ?? this.services,
    );
  }

  static num? _parseNum(dynamic value) {
    if (value == null) return null;
    if (value is num) return value;
    if (value is String) return num.tryParse(value);
    return null;
  }
}
