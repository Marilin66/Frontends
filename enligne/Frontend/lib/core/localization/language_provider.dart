/// Provider de langue avec persistence SharedPreferences.
///
/// Gère la langue sélectionnée par l'utilisateur et la sauvegarde
/// pour que le choix persiste entre les sessions.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

/// Modèle de langue app supportée.
enum SupportedLanguage {
  french('fr', 'Français', '🇫🇷'),
  english('en', 'English', '🇬🇧'),
  fon('fon', 'Fon', '🇧🇯'),
  yoruba('yoruba', 'Yorùbá', '🇳🇬');

  const SupportedLanguage(this.code, this.label, this.flag);

  final String code;
  final String label;
  final String flag;

  static SupportedLanguage fromCode(String code) {
    return SupportedLanguage.values.firstWhere(
      (l) => l.code == code,
      orElse: () => SupportedLanguage.french,
    );
  }
}

/// État de la langue de l'application.
@immutable
class LanguageState {
  const LanguageState({
    this.language = SupportedLanguage.french,
    this.isLoaded = false,
  });

  final SupportedLanguage language;
  final bool isLoaded;

  String get languageCode => language.code;
  Locale get locale => Locale(language.code);

  LanguageState copyWith({
    SupportedLanguage? language,
    bool? isLoaded,
  }) {
    return LanguageState(
      language: language ?? this.language,
      isLoaded: isLoaded ?? this.isLoaded,
    );
  }
}

/// Notifier gérant le changement de langue avec persistence.
class LanguageNotifier extends Notifier<LanguageState> {
  @override
  LanguageState build() {
    _loadSavedLanguage();
    return const LanguageState();
  }

  /// Charge la langue sauvegardée depuis SharedPreferences.
  Future<void> _loadSavedLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedCode = prefs.getString(AppConstants.languageKey);
      if (savedCode != null) {
        final lang = SupportedLanguage.fromCode(savedCode);
        state = state.copyWith(language: lang, isLoaded: true);
      } else {
        state = state.copyWith(isLoaded: true);
      }
    } catch (_) {
      state = state.copyWith(isLoaded: true);
    }
  }

  /// Change la langue et la sauvegarde.
  Future<void> setLanguage(SupportedLanguage language) async {
    if (state.language == language) return;
    state = state.copyWith(language: language);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.languageKey, language.code);
    } catch (_) {
      // Silencieux — la langue est en mémoire même si la persistence échoue
    }
  }
}

/// Provider de langue principal.
final languageProvider =
    NotifierProvider<LanguageNotifier, LanguageState>(LanguageNotifier.new);
