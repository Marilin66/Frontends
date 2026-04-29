class HopitalModel {
  final int id;
  final String nom;
  final String adresse;
  final String ville;
  final String telephone;
  final String email;
  final String siteWeb;
  final String description;
  final String? logo;
  final double? latitude;
  final double? longitude;
  final bool isActive;
  final String dateCreation;

  HopitalModel({
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
  });

  factory HopitalModel.fromJson(Map<String, dynamic> json) {
    return HopitalModel(
      id: json['id'] as int,
      nom: json['nom'] as String,
      adresse: json['adresse'] as String? ?? '',
      ville: json['ville'] as String? ?? '',
      telephone: json['telephone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      siteWeb: json['site_web'] as String? ?? '',
      description: json['description'] as String? ?? '',
      logo: json['logo'] as String?,
      latitude: double.tryParse(json['latitude']?.toString() ?? ''),
      longitude: double.tryParse(json['longitude']?.toString() ?? ''),
      isActive: json['is_active'] as bool? ?? true,
      dateCreation: json['date_creation'] as String,
    );
  }

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
    };
  }

  HopitalModel copyWith({
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
  }) {
    return HopitalModel(
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
    );
  }
}

class HopitalServiceModel {
  final int id;
  final int hopital;
  final int service;
  final String serviceNom;
  final bool isActive;

  HopitalServiceModel({
    required this.id,
    required this.hopital,
    required this.service,
    this.serviceNom = '',
    this.isActive = true,
  });

  factory HopitalServiceModel.fromJson(Map<String, dynamic> json) {
    return HopitalServiceModel(
      id: json['id'] as int,
      hopital: json['hopital'] as int? ?? 0,
      service: json['service'] as int? ?? 0,
      serviceNom: json['service_nom'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hopital': hopital,
      'service': service,
      'service_nom': serviceNom,
      'is_active': isActive,
    };
  }
}
