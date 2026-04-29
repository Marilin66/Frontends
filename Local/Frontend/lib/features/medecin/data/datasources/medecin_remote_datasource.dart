import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/data/models/user_model.dart';
import '../models/consultation_model.dart';
import '../models/disponibilite_model.dart';
import '../models/rendezvous_medecin_model.dart';

class MedecinRemoteDatasource {
  final DioClient _client;

  MedecinRemoteDatasource(this._client);

  Future<List<RendezVousMedecinModel>> getRendezvous({String? statut}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (statut != null && statut.isNotEmpty) {
        queryParams['statut'] = statut;
      }

      final response = await _client.get(
        ApiConstants.rendezvous,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => RendezVousMedecinModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> confirmerRendezvous(int id) async {
    try {
      await _client.post('${ApiConstants.rendezvous}$id/confirmer/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> refuserRendezvous(int id, String commentaire) async {
    try {
      await _client.post(
        '${ApiConstants.rendezvous}$id/refuser/',
        data: {'commentaire': commentaire},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<int?> terminerRendezvous(int id) async {
    try {
      final response = await _client.post('${ApiConstants.rendezvous}$id/terminer/');
      return response.data['id'] as int?;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ConsultationModel> getConsultation(int rendezVousId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.consultations}$rendezVousId/',
      );
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ConsultationModel> createConsultation(
    int rendezVousId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client.post(
        ApiConstants.consultations,
        data: {
          'rendez_vous': rendezVousId,
          ...data,
        },
      );
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ConsultationModel> updateConsultation(
    int rendezVousId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client.patch(
        '${ApiConstants.consultations}$rendezVousId/',
        data: data,
      );
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<DisponibiliteModel>> getDisponibilites() async {
    try {
      final response = await _client.get(ApiConstants.disponibilites);
      final data = response.data;
      final results = data is List ? data : (data['results'] as List<dynamic>?) ?? [];
      return results
          .map((e) => DisponibiliteModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DisponibiliteModel> createDisponibilite(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client.post(
        ApiConstants.disponibilites,
        data: data,
      );
      return DisponibiliteModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deleteDisponibilite(int id) async {
    try {
      await _client.delete('${ApiConstants.disponibilites}$id/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<UserModel> getProfile() async {
    try {
      final response = await _client.get(ApiConstants.userMe);
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _client.patch(ApiConstants.userMe, data: data);
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
