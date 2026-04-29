import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';

class ChatbotRemoteDatasource {
  final DioClient _client;

  ChatbotRemoteDatasource(this._client);

  /// Récupère l'historique du chatbot pour le patient connecté
  Future<List<Map<String, dynamic>>> getHistory() async {
    try {
      final response = await _client.get(ApiConstants.chatbotHistory);
      final data = response.data;
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<Map<String, dynamic>> askQuestion(String question) async {
    try {
      final response = await _client.post(
        ApiConstants.chatbotMessage,
        data: {'message': question},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

