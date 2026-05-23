import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  factory ApiException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connexion au serveur expirée. Vérifiez votre connexion.',
          statusCode: error.response?.statusCode,
        );

      case DioExceptionType.connectionError:
        return ApiException(
          message: 'Impossible de se connecter au serveur.',
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error.response);

      default:
        return ApiException(
          message: 'Une erreur inattendue est survenue.',
        );
    }
  }

  static ApiException _handleBadResponse(Response? response) {
    final data = response?.data;
    String message = 'Erreur serveur.';
    Map<String, dynamic>? errors;

    if (data is Map<String, dynamic>) {
      if (data.containsKey('detail')) {
        message = data['detail'].toString();
      } else if (data.containsKey('message')) {
        message = data['message'].toString();
      } else if (data.containsKey('error')) {
        message = data['error'].toString();
      } else {
        // Erreurs de validation (champ par champ)
        errors = {};
        data.forEach((key, value) {
          if (value is List) {
            errors![key] = value.join(', ');
          } else {
            errors![key] = value.toString();
          }
        });
        message = 'Erreur de validation.';
      }
    }

    switch (response?.statusCode) {
      case 400:
        return ApiException(
          message: message,
          statusCode: 400,
          errors: errors,
        );
      case 401:
        return ApiException(
          message: 'Identifiants incorrects.',
          statusCode: 401,
        );
      case 403:
        return ApiException(
          message: 'Accès non autorisé.',
          statusCode: 403,
        );
      case 404:
        return ApiException(
          message: 'Ressource introuvable.',
          statusCode: 404,
        );
      case 500:
        return ApiException(
          message: data is Map<String, dynamic> && data.containsKey('error')
              ? data['error'].toString()
              : (message != 'Erreur serveur.' ? message : 'Erreur interne du serveur.'),
          statusCode: 500,
        );
      default:
        return ApiException(
          message: message,
          statusCode: response?.statusCode,
          errors: errors,
        );
    }
  }

  @override
  String toString() => message;
}
