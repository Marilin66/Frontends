class DemandeModel {
  final int id;
  final int hopital;
  final String hopitalNom;
  final int? serviceExistant;
  final String? serviceExistantNom;
  final String? nomNouveauService;
  final String? descriptionNouveauService;
  final String statut;
  final String dateDemande;
  final String? dateTraitement;
  final int demandePar;
  final String demandeParNom;

  DemandeModel({
    required this.id,
    required this.hopital,
    required this.hopitalNom,
    this.serviceExistant,
    this.serviceExistantNom,
    this.nomNouveauService,
    this.descriptionNouveauService,
    required this.statut,
    required this.dateDemande,
    this.dateTraitement,
    required this.demandePar,
    required this.demandeParNom,
  });

  factory DemandeModel.fromJson(Map<String, dynamic> json) {
    return DemandeModel(
      id: json['id'] as int? ?? 0,
      hopital: json['hopital'] as int? ?? 0,
      hopitalNom: json['hopital_nom'] as String? ?? 'Inconnu',
      serviceExistant: json['service_existant'] as int?,
      serviceExistantNom: json['service_existant_nom'] as String?,
      nomNouveauService: json['nom_nouveau_service'] as String?,
      descriptionNouveauService: json['description_nouveau_service'] as String?,
      statut: json['statut'] as String? ?? 'en_attente',
      dateDemande: json['date_demande'] as String? ?? '',
      dateTraitement: json['date_traitement'] as String?,
      demandePar: json['demande_par'] as int? ?? 0,
      demandeParNom: json['demande_par_nom'] as String? ?? 'Inconnu',
    );
  }

  String get serviceAffiche => nomNouveauService ?? serviceExistantNom ?? 'N/A';
  String get descriptionAffiche => descriptionNouveauService ?? '';
}
