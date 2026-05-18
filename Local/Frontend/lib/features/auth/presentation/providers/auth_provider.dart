import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/user_model.dart';

// Imports pour l'invalidation des providers au logout
import '../../../medecin/presentation/providers/medecin_provider.dart';
import '../../../chatbot/presentation/providers/chatbot_provider.dart';
import '../../../patient/presentation/providers/patient_provider.dart';
import '../../../laborantin/presentation/providers/laborantin_provider.dart';

// État d'authentification
enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? token;
  final String? errorMessage;
  final Map<String, dynamic>? validationErrors;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.token,
    this.errorMessage,
    this.validationErrors,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? token,
    String? errorMessage,
    bool clearError = false,
    Map<String, dynamic>? validationErrors,
    bool clearValidationErrors = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      token: token ?? this.token,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      validationErrors: clearValidationErrors ? null : (validationErrors ?? this.validationErrors),
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  late final AuthRemoteDatasource _datasource;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  AuthState build() {
    final client = ref.read(dioClientProvider);
    _datasource = AuthRemoteDatasource(client);
    // Vérifier l'auth au démarrage
    Future.microtask(() => checkAuth());
    return const AuthState();
  }

  /// Vérifier si l'utilisateur est déjà connecté
  Future<void> checkAuth() async {
    state = state.copyWith(status: AuthStatus.loading);

    final token = await _storage.read(key: AppConstants.accessTokenKey);
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      final user = await _datasource.getMe();
      state = state.copyWith(status: AuthStatus.authenticated, user: user, token: token);
    } catch (_) {
      await _clearTokens();
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  /// Connexion
  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);

    try {
      final response = await _datasource.login(email, password);

      // Stocker les tokens
      await _storage.write(
        key: AppConstants.accessTokenKey,
        value: response.access,
      );
      await _storage.write(
        key: AppConstants.refreshTokenKey,
        value: response.refresh,
      );

      // Récupérer le profil
      final user = await _datasource.getMe();

      state = state.copyWith(status: AuthStatus.authenticated, user: user, token: response.access);
    } on ApiException catch (e) {
      String msg = e.message;
      if (msg.toLowerCase().contains('actif') || msg.toLowerCase().contains('active')) {
        msg = "Votre compte n'est pas encore activé. Vérifiez votre e-mail.";
      }
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: msg,
      );
    } catch (_) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Une erreur est survenue.',
      );
    }
  }

  /// Inscription patient
  Future<bool> register(Map<String, dynamic> data) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);

    try {
      await _datasource.register(data);
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
        validationErrors: e.errors,
      );
      return false;
    }
  }

  /// Vérifier le code de validation à 6 chiffres
  Future<bool> verifyCode(String email, String code) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);
    try {
      final loginResponse = await _datasource.verifyCode(email, code);
      if (loginResponse != null) {
        // Stocker les tokens pour l'auto-connexion
        await _storage.write(
          key: AppConstants.accessTokenKey,
          value: loginResponse.access,
        );
        await _storage.write(
          key: AppConstants.refreshTokenKey,
          value: loginResponse.refresh,
        );

        // Récupérer le profil et hydrater l'état
        final user = await _datasource.getMe();
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          token: loginResponse.access,
        );
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    }
  }

  /// Renvoyer le code de validation
  Future<bool> resendCode(String email) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);
    try {
      await _datasource.resendCode(email);
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    }
  }

  /// Demande de réinitialisation de mot de passe
  Future<bool> requestPasswordReset(String email) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);
    try {
      await _datasource.requestPasswordReset(email);
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(status: AuthStatus.error, errorMessage: e.message, validationErrors: e.errors);
      return false;
    }
  }

  /// Confirmation de réinitialisation de mot de passe
  Future<bool> resetPasswordConfirm(String token, String newPassword, String confirmPassword) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);
    try {
      await _datasource.resetPasswordConfirm(token, newPassword, confirmPassword);
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(status: AuthStatus.error, errorMessage: e.message, validationErrors: e.errors);
      return false;
    }
  }

  /// Déconnexion
  Future<void> logout() async {
    await _clearTokens();

    // Invalider TOUS les providers de données utilisateur
    // pour éviter que les données de l'ancien utilisateur
    // ne soient affichées au prochain login.
    ref.invalidate(chatbotProvider);
    ref.invalidate(medecinRendezvousProvider);
    ref.invalidate(medecinDisponibilitesProvider);
    ref.invalidate(medecinProfileProvider);
    ref.invalidate(patientRendezvousProvider);
    ref.invalidate(patientResultatsProvider);
    ref.invalidate(laborantinPendingAnalysesProvider);
    ref.invalidate(laborantinFinishedAnalysesProvider);
    ref.invalidate(patientSearchProvider);

    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Mettre le profil à jour
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true, clearValidationErrors: true);
    try {
      final updatedUser = await _datasource.updateMe(data);
      state = state.copyWith(status: AuthStatus.authenticated, user: updatedUser);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
        validationErrors: e.errors,
      );
      return false;
    }
  }

  /// Mettre à jour le profil en mémoire manuellement
  void updateUser(UserModel user) {
    state = state.copyWith(user: user);
  }

  Future<void> _clearTokens() async {
    await _storage.delete(key: AppConstants.accessTokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
  }
}

// Providers
final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);

/// Provider pour vérifier le rôle courant
final currentUserRoleProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).user?.role;
});
