import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isDesktop = size.width > 900;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          _buildResponsiveAppBar(context, isDesktop),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildHeroSection(context, isDesktop),
                const SizedBox(height: 60),
                _buildFeaturesSection(context, isDesktop),
                const SizedBox(height: 80),
                _buildFooter(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  SliverAppBar _buildResponsiveAppBar(BuildContext context, bool isDesktop) {
    return SliverAppBar(
      pinned: true,
      backgroundColor: Colors.white,
      elevation: 1,
      centerTitle: !isDesktop,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.health_and_safety, color: AppColors.primary, size: 32),
          const SizedBox(width: 8),
          Text(
            'Hopitel',
            style: GoogleFonts.poppins(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
        ],
      ),
      actions: isDesktop
          ? [
              TextButton(
                onPressed: () => context.push('/hospitals'),
                child: Text('Hôpitaux & Cliniques', style: GoogleFonts.poppins(color: AppColors.textPrimary)),
              ),
              const SizedBox(width: 16),
              TextButton(
                onPressed: () => context.push('/emergency'),
                child: Text('Urgences', style: GoogleFonts.poppins(color: AppColors.textPrimary)),
              ),
              const SizedBox(width: 24),
              ElevatedButton(
                onPressed: () => context.go('/login'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Espace Connexion'),
              ),
              const SizedBox(width: 24),
            ]
          : null,
    );
  }

  Widget _buildHeroSection(BuildContext context, bool isDesktop) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: isDesktop ? 80 : 24, vertical: 60),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.05),
      ),
      child: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 40,
        runSpacing: 40,
        children: [
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              crossAxisAlignment: isDesktop ? CrossAxisAlignment.start : CrossAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Accès Santé pour Tous 🩺',
                    style: GoogleFonts.poppins(
                      color: AppColors.secondary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'L\'excellence médicale à portée de main.',
                  textAlign: isDesktop ? TextAlign.left : TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: isDesktop ? 48 : 36,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Trouvez un hôpital proche, appelez les urgences rapidement ou connectez-vous pour consulter vos résultats et rendez-vous médicaux, même sans connexion internet.',
                  textAlign: isDesktop ? TextAlign.left : TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    height: 1.6,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 40),
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  alignment: isDesktop ? WrapAlignment.start : WrapAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => context.go('/login'),
                      icon: const Icon(Icons.person),
                      label: const Text('Se Connecter'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        textStyle: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => context.push('/hospitals'),
                      icon: const Icon(Icons.search),
                      label: const Text('Explorer les Hôpitaux'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        textStyle: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                        side: const BorderSide(color: AppColors.primary),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (isDesktop)
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  'assets/images/onboarding_hero.png',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 400,
                    color: AppColors.primary.withValues(alpha: 0.1),
                    child: const Center(child: Icon(Icons.medical_services_outlined, size: 120, color: AppColors.primary)),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFeaturesSection(BuildContext context, bool isDesktop) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isDesktop ? 80 : 24),
      child: Column(
        children: [
          Text(
            'Des services pensés pour vous',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Accédez librement à nos fonctionnalités d\'urgence et au répertoire, ou créez un compte pour un suivi personnalisé.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 48),
          Wrap(
            spacing: 24,
            runSpacing: 24,
            alignment: WrapAlignment.center,
            children: [
              _buildFeatureCard(
                context,
                title: 'Hôpitaux & Cliniques',
                description: 'Localisez et explorez les établissements partenaires autour de vous sans créer de compte.',
                icon: Icons.local_hospital,
                color: AppColors.primary,
                route: '/hospitals',
              ),
              _buildFeatureCard(
                context,
                title: 'Numéros d\'Urgence',
                description: 'La liste critique pour appeler le SAMU ou les pompiers, disponible même hors-ligne.',
                icon: Icons.emergency,
                color: AppColors.error,
                route: '/emergency',
              ),
              _buildFeatureCard(
                context,
                title: 'Suivi Patient Centralisé',
                description: 'Connectez-vous pour voir vos RDV, vos résultats d\'analyses labo et contacter vos médecins.',
                icon: Icons.folder_shared,
                color: AppColors.secondary,
                route: '/login',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return InkWell(
      onTap: () {
        if (route == '/login') {
          context.go(route);
        } else {
          context.push(route);
        }
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 320,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              description,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Text(
                  'Accéder',
                  style: GoogleFonts.poppins(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Icon(Icons.arrow_forward_rounded, color: color, size: 18),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      width: double.infinity,
      color: AppColors.textPrimary,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.health_and_safety, color: Colors.white, size: 24),
              const SizedBox(width: 8),
              Text(
                'Hopitel',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            '© 2026 Hopitel. Tous droits réservés.',
            style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
