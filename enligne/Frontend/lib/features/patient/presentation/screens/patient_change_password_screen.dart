import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/widgets/universal_back_button.dart';

class PatientChangePasswordContent extends ConsumerStatefulWidget {
  const PatientChangePasswordContent({super.key});

  @override
  ConsumerState<PatientChangePasswordContent> createState() => _PatientChangePasswordContentState();
}

class _PatientChangePasswordContentState extends ConsumerState<PatientChangePasswordContent> {
  bool _isLoading = false;

  Future<void> _requestPasswordReset() async {
    final user = ref.read(authProvider).user;
    if (user == null || user.email.isEmpty) {
      Helpers.showSnackBar(context, 'Impossible de trouver votre adresse email.');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final success = await ref.read(authProvider.notifier).requestPasswordReset(user.email);
      if (mounted) {
        if (success) {
          Helpers.showSnackBar(context, 'Un e-mail de réinitialisation a été envoyé à ${user.email}.');
          context.pop();
        } else {
          Helpers.showSnackBar(context, ref.read(authProvider).errorMessage ?? 'Erreur lors de l\'envoi de l\'email.');
        }
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Mot de passe', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.lock_reset, size: 64, color: AppColors.primary),
              ),
              const SizedBox(height: 32),
              Text(
                'Modifier votre mot de passe',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Pour des raisons de sécurité, la modification de votre mot de passe se fait via un lien sécurisé envoyé à votre adresse e-mail :\n\n${user?.email ?? ""}',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _requestPasswordReset,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(
                          'M\'envoyer le lien',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
