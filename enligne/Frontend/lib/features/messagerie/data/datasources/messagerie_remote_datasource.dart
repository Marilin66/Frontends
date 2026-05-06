import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/conversation_model.dart';
import '../models/message_model.dart';

class MessagerieRemoteDatasource {
  final DioClient _client;

  MessagerieRemoteDatasource(this._client);

  /// Récupérer la liste des conversations de l'utilisateur connecté
  Future<List<ConversationModel>> getConversations() async {
    try {
      final response = await _client.get(ApiConstants.conversations);
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
          .map((e) => ConversationModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer les messages (soit par consultationId, soit par destinataireId)
  Future<List<MessageModel>> getMessages({int? consultationId, int? destinataireId}) async {
    try {
      final queryParams = <String, dynamic>{
        'consultation': consultationId,
        'destinataire': destinataireId,
      }..removeWhere((key, value) => value == null);

      final response = await _client.get(
        ApiConstants.messages,
        queryParameters: queryParams,
      );
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
          .map((e) => MessageModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Envoyer un message
  Future<MessageModel> sendMessage({
    int? consultationId,
    int? destinataireId,
    required String contenu,
  }) async {
    try {
      final response = await _client.post(
        ApiConstants.messages,
        data: {
          'consultation': consultationId,
          'destinataire': destinataireId,
          'contenu': contenu,
        }..removeWhere((key, value) => value == null),
      );
      return MessageModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Envoyer un message vocal
  Future<MessageModel> sendVoiceMessage({
    int? consultationId,
    int? destinataireId,
    required String audioPath,
  }) async {
    try {
      final formData = FormData.fromMap({
        'consultation': consultationId,
        'destinataire': destinataireId,
        'type_message': 'vocal',
        'contenu': '🎙 Message vocal',
        'audio': await MultipartFile.fromFile(audioPath, filename: 'voice_message.m4a'),
      }..removeWhere((key, value) => value == null));

      final response = await _client.post(
        ApiConstants.messages,
        data: formData,
      );
      return MessageModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Marquer un message comme lu
  Future<void> markAsRead(int messageId) async {
    try {
      await _client.post('${ApiConstants.messages}$messageId/mark-read/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
