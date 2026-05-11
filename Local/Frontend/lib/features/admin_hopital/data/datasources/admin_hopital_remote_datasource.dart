import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/data/models/user_model.dart';
import '../models/hopital_service_model.dart';
import '../../../super_admin/data/models/service_model.dart';

class AdminHopitalRemoteDatasource {
  final DioClient _client;

  AdminHopitalRemoteDatasource(this._client);

  Future<UserModel> getProfile() async {
    try {
      final response = await _client.get(ApiConstants.userMe);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return UserModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

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

  Future<List<UserModel>> getMedecins() async {
    try {
      final response = await _client.get(ApiConstants.medecins);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<UserModel> createMedecin(Map<String, dynamic> data) async {
    try {
      final response = await _client.post(ApiConstants.medecins, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return UserModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deactivateMedecin(int id) async {
    try {
      await _client.post('${ApiConstants.medecins}$id/desactiver/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> updateMedecin(int id, Map<String, dynamic> data) async {
    try {
      await _client.patch('${ApiConstants.medecins}$id/', data: data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Laborantins
  Future<List<UserModel>> getLaborantins() async {
    try {
      final response = await _client.get(ApiConstants.laborantins);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<UserModel> createLaborantin(Map<String, dynamic> data) async {
    try {
      final response = await _client.post(ApiConstants.laborantins, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return UserModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deactivateLaborantin(int id) async {
    try {
      await _client.delete('${ApiConstants.laborantins}$id/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> updateLaborantin(int id, Map<String, dynamic> data) async {
    try {
      await _client.patch('${ApiConstants.laborantins}$id/', data: data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

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

  Future<List<HopitalServiceModel>> getHopitalServices() async {
    try {
      final response = await _client.get('${ApiConstants.hopitaux}mes-services/');
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => HopitalServiceModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> updateHopitalServiceDescription(int id, String descriptionLocale) async {
    try {
      await _client.patch(
        '${ApiConstants.hopitaux}mes-services/$id/',
        data: {'description_locale': descriptionLocale},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> requestNewService(int hopitalId, Map<String, dynamic> data) async {
    try {
      await _client.post('${ApiConstants.hopitaux}$hopitalId/demandes/', data: data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _client.get('${ApiConstants.hopitaux}statistiques/');
      final responseData = response.data;
      if (responseData == null || responseData is! Map<String, dynamic>) return {};
      return responseData;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
  }

  /// Récupérer les demandes de service de l'hôpital
  Future<List<dynamic>> getDemandes() async {
    try {
      final response = await _client.get(ApiConstants.demandes);
      final data = response.data;
      final results =
          data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      // Import DemandeModel inline pour éviter les dépendances circulaires
      return results;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les patients de l'hôpital
  Future<List<UserModel>> getPatients({String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      final response = await _client.get(
        '${ApiConstants.hopitaux}patients/',
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      final data = response.data;
      final results =
          data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
