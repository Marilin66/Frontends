import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/conversation_model.dart';
import '../models/message_model.dart';

class ChatRemoteDatasource {
  final DioClient _client;

  ChatRemoteDatasource(this._client);

  Future<List<ConversationModel>> getConversations() async {
    try {
      final response = await _client.get(ApiConstants.conversations);
      final results = response.data['results'] as List<dynamic>;
      return results
          .map((e) => ConversationModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<MessageModel>> getMessages(int conversationId) async {
    try {
      final response = await _client.get(
        ApiConstants.messages,
        queryParameters: {'conversation': conversationId},
      );
      final results = response.data['results'] as List<dynamic>;
      return results
          .map((e) => MessageModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<MessageModel> sendMessage({
    required int consultation,
    required int destinataire,
    required String contenu,
  }) async {
    try {
      final response = await _client.post(
        ApiConstants.messages,
        data: {
          'consultation': consultation,
          'destinataire': destinataire,
          'contenu': contenu,
        },
      );
      return MessageModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> markAsRead(int messageId) async {
    try {
      await _client.post('${ApiConstants.messages}$messageId/lire/');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
