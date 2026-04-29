import 'package:dio/dio.dart';

import 'package:hopitel_app/core/constants/api_constants.dart';
import 'package:hopitel_app/core/network/dio_client.dart';
import 'package:hopitel_app/core/network/api_exception.dart';
import 'package:hopitel_app/features/patient/data/models/resultat_model.dart';
import 'package:hopitel_app/features/auth/data/models/user_model.dart';
import 'package:hopitel_app/features/laborantin/data/models/demande_analyse_model.dart';

class LaborantinRemoteDatasource {
  final DioClient _client;

  LaborantinRemoteDatasource(this._client);

  // --- Résultats (Historique / Direct) ---
  Future<List<ResultatModel>> getMyResults() async {
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

  Future<ResultatModel> uploadResult(FormData formData) async {
    try {
      final response = await _client.upload(ApiConstants.resultats, formData: formData);
      return ResultatModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // --- BioTrack (Lifecycle) ---
  Future<List<DemandeAnalyseModel>> getAnalyses({String? statut}) async {
    try {
      final response = await _client.get(
        ApiConstants.analyses,
        queryParameters: statut != null ? {'statut': statut} : null,
      );
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => DemandeAnalyseModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DemandeAnalyseModel> creerDemande(Map<String, dynamic> data) async {
    try {
      final response = await _client.post(ApiConstants.analyses, data: data);
      return DemandeAnalyseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> cloturerAnalyse(int id, FormData formData) async {
    try {
      final response = await _client.upload(
        '${ApiConstants.analyses}$id/cloturer/',
        formData: formData,
      );
      return response.data;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // --- Recherche ---
  Future<List<UserModel>> searchPatients(String query) async {
    try {
      final response = await _client.get(
        ApiConstants.patients,
        queryParameters: {'search': query},
      );
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
