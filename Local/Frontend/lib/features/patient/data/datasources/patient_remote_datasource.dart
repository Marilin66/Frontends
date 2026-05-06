import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/data/models/user_model.dart';
import '../models/creneau_model.dart';
import '../models/hopital_search_model.dart' hide HopitalServiceModel;
import '../models/medecin_search_model.dart';
import '../models/rendezvous_model.dart';
import '../models/resultat_model.dart';
import 'package:hopitel_app/features/super_admin/data/models/service_model.dart';
import 'package:hopitel_app/features/admin_hopital/data/models/hopital_service_model.dart';

class PatientRemoteDatasource {
  final DioClient _client;

  PatientRemoteDatasource(this._client);

  /// Récupérer la liste des rendez-vous du patient connecté
  Future<List<RendezVousModel>> getRendezvous({String? statut, int? serviceId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (statut != null && statut.isNotEmpty) {
        queryParams['statut'] = statut;
      }
      if (serviceId != null) {
        queryParams['service'] = serviceId;
      }

      final response = await _client.get(
        ApiConstants.rendezvous,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => RendezVousModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Créer un nouveau rendez-vous
  Future<RendezVousModel> createRendezvous(Map<String, dynamic> data) async {
    try {
      final response = await _client.post(ApiConstants.rendezvous, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return RendezVousModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Annuler un rendez-vous existant
  Future<void> annulerRendezvous(int id, String commentaire) async {
    try {
      await _client.post(
        '${ApiConstants.rendezvous}$id/annuler/',
        data: {'commentaire': commentaire},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer la liste des résultats médicaux du patient
  Future<List<ResultatModel>> getResultats() async {
    try {
      final response = await _client.get(ApiConstants.resultats);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => ResultatModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Partager un résultat avec un médecin
  Future<void> shareResultat(int resultatId, int medecinId) async {
    try {
      await _client.post(
        '${ApiConstants.resultats}$resultatId/partager/',
        data: {'medecin': medecinId},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Rechercher des hôpitaux par nom, ville ou service
  Future<List<HopitalSearchModel>> searchHopitaux({String? query, String? ville, int? serviceId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (query != null && query.isNotEmpty) {
        queryParams['search'] = query;
      }
      if (ville != null && ville.isNotEmpty) {
        queryParams['ville'] = ville;
      }
      if (serviceId != null) {
        queryParams['service'] = serviceId;
      }

      final response = await _client.get(
        ApiConstants.hopitaux,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => HopitalSearchModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Rechercher des médecins par nom ou par hôpital
  Future<List<MedecinSearchModel>> searchMedecins({
    String? query,
    int? hopitalId,
    int? serviceId,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (query != null && query.isNotEmpty) {
        queryParams['search'] = query;
      }
      if (hopitalId != null) {
        queryParams['hopital'] = hopitalId;
      }
      if (serviceId != null) {
        queryParams['service'] = serviceId;
      }

      final response = await _client.get(
        ApiConstants.medecins,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => MedecinSearchModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer la liste des services d'un hôpital
  Future<List<HopitalServiceModel>> getHopitalServices(int hopitalId) async {
    try {
      final response = await _client.get('/hopitaux/$hopitalId/services/');
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => HopitalServiceModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer la liste de tous les services disponibles
  Future<List<ServiceModel>> getAllServices() async {
    try {
      final response = await _client.get(ApiConstants.services);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les créneaux disponibles d'un médecin sur une période donnée
  Future<List<CreneauModel>> getCreneaux(
    int medecinId,
    String dateDebut,
    String dateFin,
  ) async {
    try {
      final response = await _client.get(
        '/medecins/$medecinId/creneaux/',
        queryParameters: {
          'date_debut': dateDebut,
          'date_fin': dateFin,
        },
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => CreneauModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mettre à jour le profil du patient connecté
  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _client.patch(ApiConstants.userMe, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return UserModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les hôpitaux à proximité d'une position GPS
  Future<List<HopitalSearchModel>> getNearbyHospitals({
    required double latitude,
    required double longitude,
    int radius = 10,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.hopitaux}nearby/',
        queryParameters: {
          'lat': latitude,
          'lng': longitude,
          'radius': radius,
        },
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => HopitalSearchModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Patient Intake (Pré-enregistrement) ───────────────────────────────────

  /// Récupère le formulaire de pré-consultation pour un RDV donné.
  /// Retourne null si aucun formulaire n'existe encore (HTTP 404).
  Future<Map<String, dynamic>?> getPreEnregistrement(int rendezvousId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.rendezvous}$rendezvousId/preenregistrement/',
      );
      final responseData = response.data;
      if (responseData == null || responseData is! Map<String, dynamic>) return null;
      return responseData;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> createPreEnregistrement(
    int rendezvousId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client.post(
        '${ApiConstants.rendezvous}$rendezvousId/preenregistrement/',
        data: data,
      );
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) return {};
      return responseData;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> updatePreEnregistrement(
    int rendezvousId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client.put(
        '${ApiConstants.rendezvous}$rendezvousId/preenregistrement/',
        data: data,
      );
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) return {};
      return responseData;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
