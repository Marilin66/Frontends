import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
// import '../../../../core/utils/helpers.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class SuperAdminSettingsContent extends ConsumerWidget {
  const SuperAdminSettingsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Mon Profil', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header section
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
                  backgroundColor: AppColors.superAdmin.withValues(alpha: 0.1),
                  child: const Icon(Icons.admin_panel_settings, size: 50, color: AppColors.superAdmin),
                ),
                const SizedBox(height: 16),
                Text(
                  user?.fullName ?? 'Super Admin',
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
                    color: AppColors.superAdmin.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Administrateur Général',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: AppColors.superAdmin,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Informations section
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
                _buildInfoTile(Icons.work_outline, 'Rôle', 'Super Administrateur'),
                if (user?.dateJoined != null)
                  _buildInfoTile(Icons.calendar_today_outlined, 'Membre depuis', user!.dateJoined.split('T')[0]),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Paramètres section
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
                  leading: const Icon(Icons.notifications_outlined, color: AppColors.textSecondary),
                  title: Text('Notifications', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/super-admin/notifications'),
                ),
                ListTile(
                  leading: const Icon(Icons.language_outlined, color: AppColors.textSecondary),
                  title: Text('Langue', style: GoogleFonts.poppins()),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Français', style: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 13)),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: AppColors.textHint),
                    ],
                  ),
                  onTap: () => context.go('/super-admin/language'),
                ),
                ListTile(
                  leading: const Icon(Icons.lock_outline, color: AppColors.textSecondary),
                  title: Text('Changer le mot de passe', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/super-admin/change-password'),
                ),
                ListTile(
                  leading: const Icon(Icons.info_outline, color: AppColors.textSecondary),
                  title: Text('À propos', style: GoogleFonts.poppins()),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                  onTap: () => context.go('/super-admin/about'),
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
      leading: Icon(icon, color: AppColors.superAdmin),
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
