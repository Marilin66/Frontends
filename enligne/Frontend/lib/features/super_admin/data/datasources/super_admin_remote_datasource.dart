import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/dashboard_stats_model.dart';
import '../models/hopital_model.dart' hide HopitalServiceModel;
import '../models/service_model.dart';
import '../models/demande_model.dart';
import 'package:hopitel_app/features/admin_hopital/data/models/hopital_service_model.dart';

class SuperAdminRemoteDatasource {
  final DioClient _client;

  SuperAdminRemoteDatasource(this._client);

  /// Récupérer les statistiques du dashboard (Global)
  Future<Map<String, dynamic>> getGlobalStats() async {
    try {
      final response = await _client.get(ApiConstants.hopitalStats);
      final responseData = response.data;
      if (responseData == null || responseData is! Map<String, dynamic>) return {};
      return responseData;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les statistiques du dashboard (Ancienne version, maintenue pour compatibilité)
  Future<DashboardStatsModel> getDashboardStats() async {
    try {
      // On tente d'utiliser le nouvel endpoint si possible
      final globalStats = await getGlobalStats();
      return DashboardStatsModel(
        totalHopitaux: globalStats['total_hopitaux'] ?? 0,
        totalPatients: globalStats['total_patients'] ?? 0,
        totalMedecins: globalStats['total_medecins'] ?? 0,
        totalRendezvous: globalStats['total_rdv'] ?? 0,
        rdvAujourdhui: 0,
        rdvSemaine: 0,
      );
    } catch (_) {
      // Fallback sur les appels multiples si l'endpoint global échoue
      try {
        final responses = await Future.wait([
          _client.get(ApiConstants.hopitaux),
          _client.get(ApiConstants.patients),
          _client.get(ApiConstants.medecins),
          _client.get(ApiConstants.rendezvous),
        ]);

        int extractCount(dynamic data) {
          if (data is Map && data.containsKey('count')) return data['count'] as int? ?? 0;
          if (data is List) return data.length;
          return 0;
        }

        return DashboardStatsModel(
          totalHopitaux: extractCount(responses[0].data),
          totalPatients: extractCount(responses[1].data),
          totalMedecins: extractCount(responses[2].data),
          totalRendezvous: extractCount(responses[3].data),
          rdvAujourdhui: 0,
          rdvSemaine: 0,
        );
      } on DioException catch (e) {
        throw ApiException.fromDioError(e);
      }
    }
  }

  /// Récupérer la liste des hôpitaux
  Future<List<HopitalModel>> getHopitaux({String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final response = await _client.get(
        ApiConstants.hopitaux,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => HopitalModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Créer un hôpital
  Future<HopitalModel> createHopital(Map<String, dynamic> data) async {
    try {
      final response = await _client.post(ApiConstants.hopitaux, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return HopitalModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mettre à jour un hôpital
  Future<HopitalModel> updateHopital(
    int id,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client.patch(
        '${ApiConstants.hopitaux}$id/',
        data: data,
      );
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return HopitalModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Activer/Désactiver un hôpital
  Future<void> toggleHopitalStatus(int id, bool isActive) async {
    try {
      await _client.patch(
        '${ApiConstants.hopitaux}$id/',
        data: {'is_active': isActive},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Créer un admin hôpital
  Future<void> createAdminHopital(Map<String, dynamic> data) async {
    try {
      await _client.post(ApiConstants.adminHopitaux, data: data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mettre à jour un admin hôpital
  Future<void> updateAdminHopital(int id, Map<String, dynamic> data) async {
    try {
      await _client.patch('${ApiConstants.adminHopitaux}$id/', data: data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Supprimer un admin hôpital
  Future<void> deleteAdminHopital(int id) async {
    try {
      await _client.delete('${ApiConstants.adminHopitaux}$id/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer la liste des admins hôpitaux
  Future<List<Map<String, dynamic>>> getAdminHopitaux() async {
    try {
      final response = await _client.get(ApiConstants.adminHopitaux);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer la liste des services
  Future<List<ServiceModel>> getServices() async {
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

  /// Créer un service
  Future<ServiceModel> createService(Map<String, dynamic> data) async {
    try {
      final response = await _client.post(ApiConstants.services, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return ServiceModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Supprimer un service
  Future<void> deleteService(int id) async {
    try {
      await _client.delete('${ApiConstants.services}$id/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mettre à jour un service global
  Future<ServiceModel> updateService(int id, Map<String, dynamic> data) async {
    try {
      final response =
          await _client.patch('${ApiConstants.services}$id/', data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return ServiceModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les services d'un hôpital précis
  Future<List<HopitalServiceModel>> getHopitalServices(int hopitalId) async {
    try {
      final response = await _client.get('${ApiConstants.hopitaux}$hopitalId/services/');
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => HopitalServiceModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les laborantins d'un hôpital précis ou tous
  Future<List<Map<String, dynamic>>> getLaborantins({int? hopitalId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (hopitalId != null) {
        queryParams['hopital'] = hopitalId;
      }
      final response = await _client.get(
        ApiConstants.laborantins,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les demandes
  Future<List<DemandeModel>> getDemandes() async {
    try {
      final response = await _client.get(ApiConstants.demandes);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => DemandeModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Valider Demande
  Future<void> validerDemande(int id) async {
    try {
      await _client.post('${ApiConstants.demandes}$id/valider/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Refuser Demande
  Future<void> refuserDemande(int id, String commentaire) async {
    try {
      await _client.post(
        '${ApiConstants.demandes}$id/refuser/',
        data: {'commentaire': commentaire},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
