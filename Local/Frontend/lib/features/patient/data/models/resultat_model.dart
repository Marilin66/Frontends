// ==========================================================================
// Modèle ResultatModel
// ==========================================================================
// Ce fichier définit le modèle de données pour un résultat d'analyse
// médicale (résultat de laboratoire).
//
// Il correspond au serializer du backend Django qui gère les résultats
// déposés par les laborantins et consultables par les patients et médecins.
//
// Un résultat contient un fichier (PDF, image, etc.), un code d'accès
// unique, et peut être partagé avec un ou plusieurs médecins.
// ==========================================================================

/// Modèle représentant un médecin avec lequel un résultat est partagé.
///
/// Contient uniquement l'identifiant et le nom du médecin pour
/// l'affichage dans la liste des partages.
class MedecinPartageModel {
  /// Identifiant unique du médecin
  final int id;

  /// Nom complet du médecin
  final String nom;

  /// Constructeur du modèle MedecinPartageModel
  MedecinPartageModel({
    required this.id,
    required this.nom,
  });

  /// Factory constructor pour créer une instance à partir d'un JSON.
  ///
  /// Utilisé lors de la désérialisation de la liste des médecins
  /// partagés contenue dans la réponse du résultat.
  factory MedecinPartageModel.fromJson(Map<String, dynamic> json) {
    return MedecinPartageModel(
      id: json['id'] as int,
      nom: json['nom'] as String? ?? '',
    );
  }

  /// Convertit l'instance en Map JSON pour l'envoi vers l'API.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
    };
  }
}

/// Modèle principal représentant un résultat d'analyse médicale.
///
/// Ce modèle encapsule toutes les informations relatives à un résultat
/// de laboratoire : le fichier, les métadonnées, et les partages.
class ResultatModel {
  /// Identifiant unique du résultat dans la base de données
  final int id;

  /// Identifiant du patient propriétaire du résultat (clé étrangère)
  final int patient;

  /// Nom complet du patient (champ en lecture seule)
  final String patientNom;

  /// Identifiant du laborantin ayant déposé le résultat (nullable si supprimé)
  final int? laborantin;

  /// Nom complet du laborantin (nullable)
  final String? laborantinNom;

  /// Identifiant de la consultation associée (nullable si résultat indépendant)
  final int? consultation;

  /// Identifiant de la consultation associée (doublon du serializer backend)
  final int? consultationId;

  /// Titre descriptif du résultat (ex: "Bilan sanguin complet")
  final String titre;

  /// URL du fichier du résultat (PDF, image, etc.) stocké sur le serveur
  final String fichier;

  /// Date à laquelle l'analyse a été effectuée
  final String dateAnalyse;

  /// Date à laquelle le résultat a été déposé dans le système
  final String dateDepot;

  /// Code d'accès unique permettant de consulter le résultat sans authentification
  final String codeAcces;

  /// Nom du laboratoire ayant effectué l'analyse
  final String laboratoire;

  /// Liste des médecins avec lesquels ce résultat est partagé.
  /// Chaque élément contient l'id et le nom du médecin.
  final List<MedecinPartageModel> medecinsPartages;

  /// Constructeur du modèle ResultatModel
  /// Les champs obligatoires sont marqués avec [required],
  /// les champs optionnels ont des valeurs par défaut
  ResultatModel({
    required this.id,
    required this.patient,
    this.patientNom = '',
    this.laborantin,
    this.laborantinNom,
    this.consultation,
    this.consultationId,
    this.titre = '',
    this.fichier = '',
    this.dateAnalyse = '',
    this.dateDepot = '',
    this.codeAcces = '',
    this.laboratoire = '',
    this.medecinsPartages = const [],
  });

  /// Factory constructor pour créer une instance de [ResultatModel]
  /// à partir d'un objet JSON.
  ///
  /// La liste [medecins_partages] est convertie en liste d'objets
  /// [MedecinPartageModel] via un mapping de chaque élément JSON.
  factory ResultatModel.fromJson(Map<String, dynamic> json) {
    return ResultatModel(
      id: json['id'] as int,
      patient: json['patient'] as int,
      patientNom: json['patient_nom'] as String? ?? '',
      laborantin: json['laborantin'] as int?,
      laborantinNom: json['laborantin_nom'] as String?,
      consultation: json['consultation'] as int?,
      consultationId: json['consultation_id'] as int?,
      titre: json['titre'] as String? ?? '',
      fichier: json['fichier'] as String? ?? '',
      dateAnalyse: json['date_analyse'] as String? ?? '',
      dateDepot: json['date_depot'] as String? ?? '',
      codeAcces: json['code_acces'] as String? ?? '',
      laboratoire: json['laboratoire'] as String? ?? '',
      medecinsPartages: (json['medecins_partages'] as List<dynamic>?)
              ?.map((e) =>
                  MedecinPartageModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  /// Convertit l'instance en Map JSON pour l'envoi vers l'API backend.
  ///
  /// Les clés correspondent aux noms de champs attendus par le
  /// serializer Django (snake_case).
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patient': patient,
      'patient_nom': patientNom,
      'laborantin': laborantin,
      'laborantin_nom': laborantinNom,
      'consultation': consultation,
      'consultation_id': consultationId,
      'titre': titre,
      'fichier': fichier,
      'date_analyse': dateAnalyse,
      'date_depot': dateDepot,
      'code_acces': codeAcces,
      'laboratoire': laboratoire,
      'medecins_partages':
          medecinsPartages.map((e) => e.toJson()).toList(),
    };
  }

  /// Méthode copyWith pour créer une copie modifiée du modèle.
  ///
  /// Permet de modifier un ou plusieurs champs tout en conservant
  /// les autres valeurs inchangées (immutabilité).
  ResultatModel copyWith({
    int? id,
    int? patient,
    String? patientNom,
    int? laborantin,
    String? laborantinNom,
    int? consultation,
    int? consultationId,
    String? titre,
    String? fichier,
    String? dateAnalyse,
    String? dateDepot,
    String? codeAcces,
    String? laboratoire,
    List<MedecinPartageModel>? medecinsPartages,
  }) {
    return ResultatModel(
      id: id ?? this.id,
      patient: patient ?? this.patient,
      patientNom: patientNom ?? this.patientNom,
      laborantin: laborantin ?? this.laborantin,
      laborantinNom: laborantinNom ?? this.laborantinNom,
      consultation: consultation ?? this.consultation,
      consultationId: consultationId ?? this.consultationId,
      titre: titre ?? this.titre,
      fichier: fichier ?? this.fichier,
      dateAnalyse: dateAnalyse ?? this.dateAnalyse,
      dateDepot: dateDepot ?? this.dateDepot,
      codeAcces: codeAcces ?? this.codeAcces,
      laboratoire: laboratoire ?? this.laboratoire,
      medecinsPartages: medecinsPartages ?? this.medecinsPartages,
    );
  }
}
