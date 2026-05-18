import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/login_response.dart';
import '../models/user_model.dart';

class AuthRemoteDatasource {
  final DioClient _client;

  AuthRemoteDatasource(this._client);

  /// Connexion avec email et mot de passe
  Future<LoginResponse> login(String email, String password) async {
    try {
      final response = await _client.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return LoginResponse.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Inscription patient
  Future<void> register(Map<String, dynamic> data) async {
    try {
      await _client.post(ApiConstants.register, data: data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Demande de réinitialisation de mot de passe
  Future<void> requestPasswordReset(String email) async {
    try {
      await _client.post(ApiConstants.requestPasswordReset, data: {'email': email});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Confirmation de réinitialisation de mot de passe
  Future<void> resetPasswordConfirm(String token, String newPassword, String confirmPassword) async {
    try {
      await _client.post(
        ApiConstants.resetPasswordConfirm,
        data: {'token': token, 'new_password': newPassword, 'confirm_password': confirmPassword},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Récupérer le profil de l'utilisateur connecté
  Future<UserModel> getMe() async {
    try {
      final response = await _client.get(ApiConstants.userMe);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return UserModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mettre à jour le profil
  Future<UserModel> updateMe(Map<String, dynamic> data) async {
    try {
      final response = await _client.patch(ApiConstants.userMe, data: data);
      final responseData = response.data;
      if (responseData is! Map<String, dynamic>) throw const FormatException('Réponse inattendue');
      return UserModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Vérifier le compte avec le code à 6 chiffres
  Future<LoginResponse?> verifyCode(String email, String code) async {
    try {
      final response = await _client.post(ApiConstants.verifyCode, data: {'email': email, 'code': code});
      final responseData = response.data;
      if (responseData is Map<String, dynamic> && responseData.containsKey('access')) {
        return LoginResponse.fromJson(responseData);
      }
      return null;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Renvoyer le code de vérification
  Future<void> resendCode(String email) async {
    try {
      await _client.post(ApiConstants.resendCode, data: {'email': email});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
