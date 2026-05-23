import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/notification_model.dart';

class NotificationRemoteDatasource {
  final DioClient _client;

  NotificationRemoteDatasource(this._client);

  /// Récupérer la liste des notifications de l'utilisateur connecté
  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await _client.get(ApiConstants.notifications);
      final data = response.data;
      List<dynamic> results;
      if (data is Map<String, dynamic> && data.containsKey('results')) {
        results = data['results'] as List<dynamic>;
      } else if (data is List) {
        results = data;
      } else {
        results = [];
      }
      return results
          .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Marquer une notification comme lue
  Future<void> markAsRead(int id) async {
    try {
      await _client.post('${ApiConstants.notifications}$id/mark-read/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Marquer toutes les notifications comme lues
  Future<void> markAllAsRead() async {
    try {
      await _client.post('${ApiConstants.notifications}mark-all-read/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
