/// Écran de sélection de langue — 4 langues supportées.
///
/// FR 🇫🇷 / EN 🇬🇧 / Fon 🇧🇯 / Yorùbá 🇳🇬
/// Le choix est persisté via SharedPreferences et propagé via le languageProvider.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/universal_back_button.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class PatientLanguageContent extends ConsumerStatefulWidget {
  final Color primaryColor;

  const PatientLanguageContent({
    super.key,
    this.primaryColor = AppColors.patient,
  });

  @override
  ConsumerState<PatientLanguageContent> createState() =>
      _PatientLanguageContentState();
}

class _PatientLanguageContentState
    extends ConsumerState<PatientLanguageContent> {
  @override
  Widget build(BuildContext context) {
    final langState = ref.watch(languageProvider);
    final current = langState.language;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          t(context, AppStrings.language),
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
        leading: const UniversalBackButton(),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            t(context, AppStrings.choosePreferredLanguage),
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 20),

          // ── Liste des langues ──────────────────────────────────────
          ...SupportedLanguage.values.map((lang) {
            final isSelected = current == lang;
            return _LanguageOption(
              language: lang,
              isSelected: isSelected,
              primaryColor: widget.primaryColor,
              onTap: () => _changeLanguage(lang),
            );
          }),

          const SizedBox(height: 40),

          // ── Note d'information ─────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Note',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  t(context, AppStrings.languageNote),
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _changeLanguage(SupportedLanguage language) async {
    await ref.read(languageProvider.notifier).setLanguage(language);

    if (!mounted) return;

    // Message de confirmation dans la bonne langue
    final messages = {
      SupportedLanguage.french: 'Langue changée en Français',
      SupportedLanguage.english: 'Language changed to English',
      SupportedLanguage.fon: 'Gbe shɛ̀',
      SupportedLanguage.yoruba: 'Èdè ti yí',
    };

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          messages[language] ?? 'Language changed',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: widget.primaryColor,
      ),
    );

    // Retour à la page précédente
    if (context.canPop()) {
      context.pop();
    } else {
      final role = ref.read(authProvider).user?.role;
      context.go(_getProfileRoute(role));
    }
  }

  String _getProfileRoute(String? role) {
    switch (role) {
      case AppConstants.rolePatient:
        return '/patient/profile';
      case AppConstants.roleMedecin:
        return '/medecin/profile';
      case AppConstants.roleAdminHopital:
        return '/admin-hopital/settings';
      case AppConstants.roleAdminGeneral:
        return '/super-admin/settings';
      case AppConstants.roleLaborantin:
        return '/laborantin/profile';
      default:
        return '/login';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Widget privé : Option de langue
// ═══════════════════════════════════════════════════════════════════════════

class _LanguageOption extends StatelessWidget {
  final SupportedLanguage language;
  final bool isSelected;
  final Color primaryColor;
  final VoidCallback onTap;

  const _LanguageOption({
    required this.language,
    required this.isSelected,
    required this.primaryColor,
    required this.onTap,
  });

  /// Description sous le nom de la langue.
  String get _subtitle {
    switch (language) {
      case SupportedLanguage.french:
        return 'Langue par défaut';
      case SupportedLanguage.english:
        return 'English language';
      case SupportedLanguage.fon:
        return 'Gbé Fon — Bénin';
      case SupportedLanguage.yoruba:
        return 'Èdè Yorùbá — Nigeria';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? primaryColor : Colors.transparent,
          width: 2,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: primaryColor.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: ListTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: primaryColor.withValues(alpha: isSelected ? 0.15 : 0.05),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              language.flag,
              style: const TextStyle(fontSize: 24),
            ),
          ),
        ),
        title: Text(
          language.label,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? primaryColor : AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          _subtitle,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        trailing: isSelected
            ? Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: primaryColor,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  color: Colors.white,
                  size: 16,
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }
}
