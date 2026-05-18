import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/api_constants.dart';
import '../constants/app_constants.dart';

final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

class DioClient {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Cache en mémoire pour les tokens temporaires (stayLoggedIn == false)
  static String? _tempAccessToken;
  static String? _tempRefreshToken;

  static void setTempTokens({String? access, String? refresh}) {
    _tempAccessToken = access;
    _tempRefreshToken = refresh;
  }

  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 60),  // 60s — Render free tier peut prendre 30-60s à se réveiller
        receiveTimeout: const Duration(seconds: 60),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          var token = await _storage.read(key: AppConstants.accessTokenKey);
          token ??= _tempAccessToken;
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Réessayer la requête originale
              var token = await _storage.read(key: AppConstants.accessTokenKey);
              token ??= _tempAccessToken;
              error.requestOptions.headers['Authorization'] = 'Bearer $token';
              final response = await _dio.fetch(error.requestOptions);
              return handler.resolve(response);
            }
          }
          return handler.next(error);
        },
      ),
    );

    // Logger en mode debug
    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => debugPrint(obj.toString()),
        ),
      );
    }
  }

  Future<bool> _refreshToken() async {
    try {
      var refreshToken = await _storage.read(key: AppConstants.refreshTokenKey);
      refreshToken ??= _tempRefreshToken;
      if (refreshToken == null) return false;

      final response = await Dio().post(
        '${ApiConstants.baseUrl}${ApiConstants.refreshToken}',
        data: {'refresh': refreshToken},
      );

      if (response.statusCode == 200) {
        final newAccess = response.data['access'];
        final newRefresh = response.data['refresh'];

        final hasPersistentTokens = await _storage.read(key: AppConstants.accessTokenKey) != null;
        if (hasPersistentTokens) {
          await _storage.write(
            key: AppConstants.accessTokenKey,
            value: newAccess,
          );
          if (newRefresh != null) {
            await _storage.write(
              key: AppConstants.refreshTokenKey,
              value: newRefresh,
            );
          }
        } else {
          _tempAccessToken = newAccess;
          if (newRefresh != null) {
            _tempRefreshToken = newRefresh;
          }
        }
        return true;
      }
    } catch (_) {}
    return false;
  }

  // Méthodes HTTP
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.get(path, queryParameters: queryParameters);

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.post(path, data: data, queryParameters: queryParameters);

  Future<Response> put(
    String path, {
    dynamic data,
  }) =>
      _dio.put(path, data: data);

  Future<Response> patch(
    String path, {
    dynamic data,
  }) =>
      _dio.patch(path, data: data);

  Future<Response> delete(String path) => _dio.delete(path);

  // Upload de fichier
  Future<Response> upload(
    String path, {
    required FormData formData,
  }) =>
      _dio.post(
        path,
        data: formData,
      );
}
