// ==========================================================================
// Modèle MedecinSearchModel
// ==========================================================================
// Ce fichier définit le modèle de données pour la recherche de médecins
// par un patient.
//
// Il correspond à la vue [MedecinDetailView] côté backend Django qui
// retourne les informations de l'utilisateur (user) ainsi que son
// profil médecin (medecin_profile) et ses services associés.
//
// Ce modèle permet au patient de consulter les détails d'un médecin
// avant de prendre rendez-vous : spécialité, biographie, services, etc.
// ==========================================================================

/// Modèle représentant un service auquel un médecin est affilié.
///
/// Un médecin peut exercer dans plusieurs services au sein d'un hôpital
/// (ex: un cardiologue peut aussi intervenir en urgences).
class MedecinServiceModel {
  /// Identifiant du service (clé étrangère vers la table Service)
  final int service;

  /// Nom du service (champ en lecture seule fourni par le serializer)
  final String serviceNom;

  /// Constructeur du modèle MedecinServiceModel
  MedecinServiceModel({
    required this.service,
    this.serviceNom = '',
  });

  /// Factory constructor pour créer une instance à partir d'un JSON.
  factory MedecinServiceModel.fromJson(Map<String, dynamic> json) {
    return MedecinServiceModel(
      service: json['service'] as int? ?? 0,
      serviceNom: json['service_nom'] as String? ?? '',
    );
  }

  /// Convertit l'instance en Map JSON.
  Map<String, dynamic> toJson() {
    return {
      'service': service,
      'service_nom': serviceNom,
    };
  }
}

/// Modèle représentant le profil professionnel d'un médecin.
///
/// Contient les informations spécifiques au métier de médecin :
/// numéro d'ordre, biographie, statut professionnel et durée
/// par défaut des rendez-vous.
class MedecinProfileModel {
  /// Numéro d'inscription à l'ordre des médecins
  final String numeroOrdre;

  /// Biographie professionnelle du médecin (parcours, spécialités)
  final String biographie;

  /// Statut professionnel du médecin (ex: "actif", "en_conge", "inactif")
  final String statut;

  /// Durée par défaut d'un rendez-vous en minutes pour ce médecin
  final int dureeRdvDefault;

  /// Constructeur du modèle MedecinProfileModel
  MedecinProfileModel({
    this.numeroOrdre = '',
    this.biographie = '',
    this.statut = '',
    this.dureeRdvDefault = 30,
  });

  /// Factory constructor pour créer une instance à partir d'un JSON.
  ///
  /// Ces données proviennent du champ imbriqué "medecin_profile"
  /// dans la réponse JSON du backend.
  factory MedecinProfileModel.fromJson(Map<String, dynamic> json) {
    return MedecinProfileModel(
      numeroOrdre: json['numero_ordre'] as String? ?? '',
      biographie: json['biographie'] as String? ?? '',
      statut: json['statut'] as String? ?? '',
      dureeRdvDefault: json['duree_rdv_default'] as int? ?? 30,
    );
  }

  /// Convertit l'instance en Map JSON.
  Map<String, dynamic> toJson() {
    return {
      'numero_ordre': numeroOrdre,
      'biographie': biographie,
      'statut': statut,
      'duree_rdv_default': dureeRdvDefault,
    };
  }
}

/// Modèle principal représentant un médecin dans le contexte de
/// la recherche par le patient.
///
/// Combine les informations de l'utilisateur (nom, email, téléphone),
/// le profil médecin (numéro d'ordre, biographie) et la liste des
/// services dans lesquels le médecin exerce.
class MedecinSearchModel {
  /// Identifiant unique de l'utilisateur (user id dans Django)
  final int id;

  /// Adresse email du médecin
  final String email;

  /// Prénom du médecin
  final String firstName;

  /// Nom de famille du médecin
  final String lastName;

  /// Numéro de téléphone du médecin
  final String telephone;

  /// URL de la photo de profil du médecin (nullable si aucune photo)
  final String? photo;

  /// Identifiant de l'hôpital où exerce le médecin (nullable)
  final int? hopital;

  /// Nom de l'hôpital où exerce le médecin (nullable)
  final String? hopitalNom;

  /// Profil professionnel du médecin contenant les informations
  /// spécifiques à son exercice médical
  final MedecinProfileModel medecinProfile;

  /// Liste des services dans lesquels le médecin exerce.
  /// Permet au patient de vérifier que le médecin couvre
  /// la spécialité recherchée.
  final List<MedecinServiceModel> services;

  /// Constructeur du modèle MedecinSearchModel
  MedecinSearchModel({
    required this.id,
    this.email = '',
    this.firstName = '',
    this.lastName = '',
    this.telephone = '',
    this.photo,
    this.hopital,
    this.hopitalNom,
    required this.medecinProfile,
    this.services = const [],
  });

  /// Factory constructor pour créer une instance de [MedecinSearchModel]
  /// à partir d'un objet JSON.
  ///
  /// Le champ [medecin_profile] est un objet JSON imbriqué qui est
  /// désérialisé en [MedecinProfileModel].
  /// Le champ [services] est une liste d'objets JSON désérialisée
  /// en liste de [MedecinServiceModel].
  factory MedecinSearchModel.fromJson(Map<String, dynamic> json) {
    return MedecinSearchModel(
      id: json['id'] as int? ?? 0,
      email: json['email'] as String? ?? '',
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      telephone: json['telephone'] as String? ?? '',
      photo: json['photo'] as String?,
      hopital: json['hopital'] as int?,
      hopitalNom: json['hopital_nom'] as String?,
      medecinProfile: json['medecin_profile'] != null
          ? MedecinProfileModel.fromJson(
              json['medecin_profile'] as Map<String, dynamic>)
          : MedecinProfileModel(
              numeroOrdre: json['numero_ordre'] as String? ?? '',
              biographie: json['biographie'] as String? ?? '',
              statut: json['statut'] as String? ?? '',
            ),
      services: (json['services'] as List<dynamic>?)
              ?.map((e) =>
                  MedecinServiceModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  /// Convertit l'instance en Map JSON pour l'envoi vers l'API backend.
  ///
  /// Les objets imbriqués (medecinProfile, services) sont également
  /// convertis en JSON via leurs propres méthodes toJson().
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'telephone': telephone,
      'photo': photo,
      'hopital': hopital,
      'hopital_nom': hopitalNom,
      'medecin_profile': medecinProfile.toJson(),
      'services': services.map((e) => e.toJson()).toList(),
    };
  }

  /// Méthode copyWith pour créer une copie modifiée du modèle.
  ///
  /// Permet de modifier certains champs tout en conservant
  /// l'immutabilité de l'instance originale.
  MedecinSearchModel copyWith({
    int? id,
    String? email,
    String? firstName,
    String? lastName,
    String? telephone,
    String? photo,
    int? hopital,
    String? hopitalNom,
    MedecinProfileModel? medecinProfile,
    List<MedecinServiceModel>? services,
  }) {
    return MedecinSearchModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      telephone: telephone ?? this.telephone,
      photo: photo ?? this.photo,
      hopital: hopital ?? this.hopital,
      hopitalNom: hopitalNom ?? this.hopitalNom,
      medecinProfile: medecinProfile ?? this.medecinProfile,
      services: services ?? this.services,
    );
  }

  /// Propriété calculée retournant le nom complet du médecin.
  ///
  /// Concatène le prénom et le nom de famille pour un affichage
  /// pratique dans l'interface utilisateur.
  String get fullName => '$firstName $lastName'.trim();
}
