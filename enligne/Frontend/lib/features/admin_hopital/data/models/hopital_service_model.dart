class HopitalServiceModel {
  final int id;
  final int service;
  final String serviceNom;
  final String serviceDescription;
  final String serviceIcone;
  final String? serviceImage;
  final String? descriptionLocale;
  final String dateAjout;

  HopitalServiceModel({
    required this.id,
    required this.service,
    this.serviceNom = '',
    this.serviceDescription = '',
    this.serviceIcone = '',
    this.serviceImage,
    this.descriptionLocale,
    required this.dateAjout,
  });

  factory HopitalServiceModel.fromJson(Map<String, dynamic> json) {
    final details = json['service_details'] is Map ? json['service_details'] as Map<String, dynamic> : null;
    return HopitalServiceModel(
      id: json['id'] is int ? json['id'] as int : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      service: json['service'] is int ? json['service'] as int : int.tryParse(json['service']?.toString() ?? '') ?? 0,
      serviceNom: json['service_nom']?.toString() ?? details?['nom']?.toString() ?? '',
      serviceDescription: json['service_description']?.toString() ?? details?['description']?.toString() ?? '',
      serviceIcone: json['service_icone']?.toString() ?? details?['icone']?.toString() ?? '',
      serviceImage: json['service_image']?.toString() ?? details?['image']?.toString(),
      descriptionLocale: json['description_locale']?.toString(),
      dateAjout: json['date_ajout']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service': service,
      'service_nom': serviceNom,
      'service_description': serviceDescription,
      'service_icone': serviceIcone,
      'service_image': serviceImage,
      'description_locale': descriptionLocale,
      'date_ajout': dateAjout,
    };
  }
}
