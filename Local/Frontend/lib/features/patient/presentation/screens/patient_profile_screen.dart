import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class PatientProfileContent extends ConsumerWidget {
  const PatientProfileContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/patient/profile/edit'),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.edit, color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  child: const Icon(Icons.person, size: 50, color: AppColors.primary),
                ),
                const SizedBox(height: 16),
                Text(
                  user?.fullName ?? 'Patient',
                  style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                Text(
                  user?.email ?? '',
                  style: GoogleFonts.poppins(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Patient',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Informations',
                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                _buildInfoTile(Icons.phone_outlined, 'Téléphone', user?.telephone ?? 'Non renseigné'),
                if (user?.dateNaissance != null)
                  _buildInfoTile(Icons.cake_outlined, 'Date de naissance', user!.dateNaissance!),
                if (user?.sexe != null)
                  _buildInfoTile(Icons.person_pin_outlined, 'Sexe', user!.sexe == 'M' ? 'Masculin' : (user.sexe == 'F' ? 'Féminin' : 'Autre')),
                if (user?.adresse.isNotEmpty == true)
                  _buildInfoTile(Icons.location_on_outlined, 'Adresse', user!.adresse),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (user?.role == 'patient' && user?.patientProfile != null) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Informations Médicales',
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildInfoTile(Icons.bloodtype_outlined, 'Groupe Sanguin', (user?.patientProfile?['groupe_sanguin'] as String?) ?? '--')),
                        Expanded(child: _buildInfoTile(Icons.badge_outlined, 'NPI / Sécu', (user?.patientProfile?['numero_secu'] as String?) ?? '--')),
                      ],
                    ),
                  _buildInfoTile(Icons.warning_amber_rounded, 'Allergies', (user?.patientProfile?['allergies'] as String?) ?? 'Aucune'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Contact d\'Urgence',
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoTile(Icons.person_outline, 'Nom du contact', (user?.patientProfile?['contact_urgence_nom'] as String?) ?? 'Non renseigné'),
                  _buildInfoTile(Icons.phone_android_outlined, 'Téléphone', (user?.patientProfile?['contact_urgence_tel'] as String?) ?? 'Non renseigné'),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Paramètres',
                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                ListTile(
                  leading: const Icon(Icons.smart_toy_outlined, color: AppColors.textSecondary),
                  title: Text('Assistant IA', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/patient/chatbot'),
                ),
                ListTile(
                  leading: const Icon(Icons.vpn_key_outlined, color: AppColors.textSecondary),
                  title: Text('Accès par code', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/patient/result-code'),
                ),
                ListTile(
                  leading: const Icon(Icons.notifications_outlined, color: AppColors.textSecondary),
                  title: Text('Notifications', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/patient/notification-settings'),
                ),
                ListTile(
                  leading: const Icon(Icons.language_outlined, color: AppColors.textSecondary),
                  title: Text('Langue', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/patient/language'),
                ),
                ListTile(
                  leading: const Icon(Icons.lock_outline, color: AppColors.textSecondary),
                  title: Text('Changer le mot de passe', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/patient/change-password'),
                ),
                ListTile(
                  leading: const Icon(Icons.info_outline, color: AppColors.textSecondary),
                  title: Text('À propos', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/patient/about'),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.logout, color: AppColors.error),
                  title: Text('Déconnexion', style: GoogleFonts.poppins(color: AppColors.error)),
                  onTap: () => _showLogoutDialog(context, ref),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(label, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
      subtitle: Text(value, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500)),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Déconnexion', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Text(
          'Êtes-vous sûr de vouloir vous déconnecter ?',
          style: GoogleFonts.poppins(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );
  }
}
