import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/admin_hopital_provider.dart';

typedef AdminHopitalSettingsContent = AdminHopitalSettingsScreen;

class AdminHopitalSettingsScreen extends ConsumerStatefulWidget {
  const AdminHopitalSettingsScreen({super.key});

  @override
  ConsumerState<AdminHopitalSettingsScreen> createState() => _AdminHopitalSettingsScreenState();
}

class _AdminHopitalSettingsScreenState extends ConsumerState<AdminHopitalSettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _telephoneController = TextEditingController();
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() {
    final profileAsync = ref.read(adminHopitalProfileProvider);
    profileAsync.whenData((profile) {
      if (profile != null) {
        _firstNameController.text = profile.firstName;
        _lastNameController.text = profile.lastName;
        _telephoneController.text = profile.telephone;
      }
    });
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _telephoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(adminHopitalProfileProvider, (previous, next) {
      if (!_isEditing && next.value != null) {
        _firstNameController.text = next.value!.firstName;
        _lastNameController.text = next.value!.lastName;
        _telephoneController.text = next.value!.telephone;
      }
    });

    final profileAsync = ref.watch(adminHopitalProfileProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (profile) {
          if (profile == null) {
            return const Center(child: Text('Profil non disponible'));
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _buildProfileHeader(profile),
              const SizedBox(height: 16),
              _buildSettingsSection(profile),
              const SizedBox(height: 16),
              _buildParametersSection(),
            ],
          );
        },
      ),
      floatingActionButton: (!_isEditing) 
        ? FloatingActionButton(
            onPressed: () => setState(() => _isEditing = true),
            backgroundColor: AppColors.adminHopital,
            child: const Icon(Icons.edit, color: Colors.white),
          )
        : null,
    );
  }

  Widget _buildProfileHeader(dynamic profile) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: AppColors.adminHopital.withValues(alpha: 0.1),
            child: const Icon(Icons.admin_panel_settings, size: 50, color: AppColors.adminHopital),
          ),
          const SizedBox(height: 16),
          Text(
            '${profile.firstName} ${profile.lastName}',
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            profile.email,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.adminHopital.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Admin Hôpital',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: AppColors.adminHopital,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(dynamic profile) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Informations',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            if (!_isEditing) ...[
              _buildInfoTile(Icons.person_outline, 'Prénom', profile.firstName),
              _buildInfoTile(Icons.person_outline, 'Nom', profile.lastName),
              _buildInfoTile(Icons.phone_outlined, 'Téléphone', profile.telephone),
              if (profile.hopitalNom != null)
                _buildInfoTile(Icons.business_outlined, 'Hôpital', profile.hopitalNom),
            ] else ...[
              TextFormField(
                controller: _firstNameController,
                decoration: const InputDecoration(labelText: 'Prénom'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _lastNameController,
                decoration: const InputDecoration(labelText: 'Nom'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _telephoneController,
                decoration: const InputDecoration(labelText: 'Téléphone'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _isEditing = false),
                      child: const Text('Annuler'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.adminHopital,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Enregistrer'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: AppColors.adminHopital),
      title: Text(label, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
      subtitle: Text(value, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500)),
    );
  }

  Widget _buildParametersSection() {
    return Container(
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
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.notifications_outlined, color: AppColors.textSecondary),
            title: Text('Notifications', style: GoogleFonts.poppins()),
            trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
            onTap: () => context.go('/admin-hopital/notifications'),
          ),
          ListTile(
            leading: const Icon(Icons.language_outlined, color: AppColors.textSecondary),
            title: Text('Langue', style: GoogleFonts.poppins()),
            trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
            onTap: () => context.go('/admin-hopital/language'),
          ),
          ListTile(
            leading: const Icon(Icons.lock_outline, color: AppColors.textSecondary),
            title: Text('Changer le mot de passe', style: GoogleFonts.poppins()),
            trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
            onTap: () => context.go('/admin-hopital/change-password'),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline, color: AppColors.textSecondary),
            title: Text('À propos', style: GoogleFonts.poppins()),
            trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
            onTap: () => context.go('/admin-hopital/about'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.error),
            title: Text('Déconnexion', style: GoogleFonts.poppins(color: AppColors.error)),
            onTap: () => _showLogoutDialog(),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog() {
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

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      final data = {
        'first_name': _firstNameController.text,
        'last_name': _lastNameController.text,
        'telephone': _telephoneController.text,
      };

      final success = await ref
          .read(adminHopitalProfileProvider.notifier)
          .updateProfile(data);

      if (success && mounted) {
        setState(() => _isEditing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profil mis à jour')),
        );
      }
    }
  }
}
