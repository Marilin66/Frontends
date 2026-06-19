import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Système de typographie professionnel et cohérent.
/// Les styles sont ordonnés par importance visuelle descendante.
class AppTextStyles {
  AppTextStyles._();

  // ── Display / Hero ───────────────────────────────────────────────────────

  /// Titre hero ultra-large (pages d'accueil, onboarding)
  static TextStyle get hero => GoogleFonts.poppins(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
        height: 1.1,
        color: AppColors.textPrimary,
      );

  /// Titre hero large
  static TextStyle get heroSmall => GoogleFonts.poppins(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.3,
        height: 1.15,
        color: AppColors.textPrimary,
      );

  // ── Headings ─────────────────────────────────────────────────────────────

  /// Titre de section principal (H1)
  static TextStyle get h1 => GoogleFonts.poppins(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.3,
        height: 1.2,
        color: AppColors.textPrimary,
      );

  /// Titre de sous-section (H2)
  static TextStyle get h2 => GoogleFonts.poppins(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
        height: 1.3,
        color: AppColors.textPrimary,
      );

  /// Titre de carte ou de bloc (H3)
  static TextStyle get h3 => GoogleFonts.poppins(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: AppColors.textPrimary,
      );

  /// Titre de composant (H4)
  static TextStyle get h4 => GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: AppColors.textPrimary,
      );

  // ── Body ─────────────────────────────────────────────────────────────────

  /// Corps de texte large (paragraphes importants)
  static TextStyle get bodyLarge => GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.6,
        color: AppColors.textPrimary,
      );

  /// Corps de texte par défaut
  static TextStyle get bodyMedium => GoogleFonts.poppins(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: AppColors.textPrimary,
      );

  /// Petit corps de texte (légendes, descriptions secondaires)
  static TextStyle get bodySmall => GoogleFonts.poppins(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: AppColors.textSecondary,
      );

  // ── Labels / UI ──────────────────────────────────────────────────────────

  /// Label de champ ou de contrôle
  static TextStyle get label => GoogleFonts.poppins(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        height: 1.3,
        color: AppColors.textPrimary,
      );

  /// Petit label (badges, timestamps)
  static TextStyle get labelSmall => GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.3,
        height: 1.3,
        color: AppColors.textSecondary,
      );

  /// Label de bouton
  static TextStyle get button => GoogleFonts.poppins(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        height: 1.3,
        color: Colors.white,
      );

  /// Petit label de bouton
  static TextStyle get buttonSmall => GoogleFonts.poppins(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        height: 1.3,
        color: Colors.white,
      );

  // ── Utilitaires ──────────────────────────────────────────────────────────

  /// Texte d'aide (helper, subtil)
  static TextStyle get helper => GoogleFonts.poppins(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.3,
        color: AppColors.textHint,
      );

  /// Texte d'erreur
  static TextStyle get error => GoogleFonts.poppins(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.3,
        color: AppColors.error,
      );

  /// Texte de succès
  static TextStyle get success => GoogleFonts.poppins(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.3,
        color: AppColors.success,
      );

  /// Chiffres / statistiques
  static TextStyle get statValue => GoogleFonts.poppins(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
        height: 1.1,
        color: AppColors.textPrimary,
      );

  /// Label de stat (en dessous d'une valeur stat)
  static TextStyle get statLabel => GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        height: 1.3,
        color: AppColors.textSecondary,
      );

  /// Nom de médecin / utilisateur (cartes, listes)
  static TextStyle get userName => GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.2,
        color: AppColors.textPrimary,
      );

  /// Titre de notification
  static TextStyle get notificationTitle => GoogleFonts.poppins(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        height: 1.3,
        color: AppColors.textPrimary,
      );

  /// Contenu de notification
  static TextStyle get notificationBody => GoogleFonts.poppins(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        height: 1.4,
        color: AppColors.textSecondary,
      );

  /// Time stamp (dates relatives)
  static TextStyle get timestamp => GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        height: 1.2,
        color: AppColors.textHint,
      );
}
