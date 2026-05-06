import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/medecin_provider.dart';

class MedecinProfileContent extends ConsumerWidget {
  const MedecinProfileContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(medecinProfileProvider);


    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/medecin/profile/edit'),
        backgroundColor: AppColors.medecin,
        child: const Icon(Icons.edit, color: Colors.white),
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (user) {
          if (user == null) return const Center(child: Text('Profil non disponible'));
          return ListView(
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
                      backgroundColor: AppColors.medecin.withValues(alpha: 0.1),
                      child: const Icon(Icons.medical_services, size: 50, color: AppColors.medecin),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user.fullName,
                      style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      user.email,
                      style: GoogleFonts.poppins(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.medecin.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Médecin',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: AppColors.medecin,
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
                    _buildInfoTile(Icons.phone_outlined, 'Téléphone', user.telephone),
                    if (user.hopitalNom != null)
                      _buildInfoTile(Icons.business_outlined, 'Hôpital', user.hopitalNom!),
                    if (user.medecinProfile?['specialite'] != null)
                      _buildInfoTile(Icons.workspace_premium, 'Spécialité', user.medecinProfile!['specialite']),
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
                      onTap: () => context.go('/medecin/notifications'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.language_outlined, color: AppColors.textSecondary),
                      title: Text('Langue', style: GoogleFonts.poppins()),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                      onTap: () => context.go('/medecin/language'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.lock_outline, color: AppColors.textSecondary),
                      title: Text('Changer le mot de passe', style: GoogleFonts.poppins()),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                      onTap: () => context.go('/medecin/change-password'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.info_outline, color: AppColors.textSecondary),
                      title: Text('À propos', style: GoogleFonts.poppins()),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                      onTap: () => context.go('/medecin/about'),
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
          );
        },
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: AppColors.medecin),
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
