import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/app_colors.dart';

class Helpers {
  Helpers._();

  /// Ouvrir Google Maps avec les coordonnées fournies
  static Future<void> launchMaps(double lat, double lng, String label) async {
    final googleMapsUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    final appleMapsUrl = Uri.parse('https://maps.apple.com/?q=$label&ll=$lat,$lng');

    try {
      if (await canLaunchUrl(googleMapsUrl)) {
        await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(appleMapsUrl)) {
        await launchUrl(appleMapsUrl, mode: LaunchMode.externalApplication);
      } else {
        throw 'Could not launch maps';
      }
    } catch (e) {
      debugPrint('Erreur lors du lancement des cartes : $e');
    }
  }

  // Formater une date
  static String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy', 'fr_FR').format(date);
  }

  static String formatDateTime(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm', 'fr_FR').format(date);
  }

  static String formatTime(DateTime date) {
    return DateFormat('HH:mm', 'fr_FR').format(date);
  }

  // Afficher un SnackBar
  static void showSnackBar(
    BuildContext context,
    String message, {
    bool isError = false,
  }) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  // Obtenir les initiales d'un nom
  static String getInitials(String firstName, String lastName) {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l';
  }

  // Couleur selon le statut RDV
  static Color getStatusColor(String status) {
    switch (status) {
      case 'en_attente':
        return AppColors.warning;
      case 'confirme':
        return AppColors.info;
      case 'termine':
        return AppColors.success;
      case 'annule':
      case 'refuse':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  // Label du statut RDV
  static String getStatusLabel(String status) {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'confirme':
        return 'Confirmé';
      case 'termine':
        return 'Terminé';
      case 'annule':
        return 'Annulé';
      case 'refuse':
        return 'Refusé';
      default:
        return status;
    }
  }

  // Icône selon le service
  static IconData getServiceIcon(String icone) {
    switch (icone.toLowerCase()) {
      case 'cardiology':
      case 'cardiologie':
        return Icons.favorite_outline;
      case 'dentist':
      case 'dentaire':
        return Icons.medical_services_outlined;
      case 'pediatrics':
      case 'pédiatrie':
        return Icons.child_care_outlined;
      case 'neurology':
      case 'neurologie':
        return Icons.psychology_outlined;
      case 'ophthalmology':
      case 'ophtalmologie':
        return Icons.visibility_outlined;
      case 'dermatology':
      case 'dermatologie':
        return Icons.health_and_safety_outlined;
      case 'emergency':
      case 'urgences':
        return Icons.emergency_outlined;
      default:
        return Icons.medical_services_outlined;
    }
  }
}
