class ServiceModel {
  final int id;
  final String nom;
  final String description;
  final String icone;
  final bool isActive;
  final String dateCreation;

  ServiceModel({
    required this.id,
    required this.nom,
    this.description = '',
    this.icone = '',
    this.isActive = true,
    required this.dateCreation,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as int? ?? 0,
      nom: json['nom'] as String? ?? '',
      description: json['description'] as String? ?? '',
      icone: json['icone'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
      dateCreation: json['date_creation'] as String? ?? '',
    );
  }

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
