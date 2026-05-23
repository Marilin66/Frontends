import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';

class LegalMentionsScreen extends StatelessWidget {
  const LegalMentionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Mentions légales', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              '1. Éditeur de l\'application',
              'L\'application Hopitel est éditée par :\nHopitel SARL\nSiège social : Cotonou, Bénin\nImmatriculation : RCCM RB/COT/25 B 0000\nEmail : contact@hopitel.bj',
            ),
            _buildSection(
              '2. Hébergement',
              'L\'infrastructure backend de l\'application est hébergée par :\nRender Inc.\nAdresse : 525 Brannan St, San Francisco, CA 94107, États-Unis\nSite web : www.render.com',
            ),
            _buildSection(
              '3. Développement',
              'L\'application a été développée par l\'équipe technique de Hopitel dans le cadre de la modernisation du système de santé béninois.',
            ),
            _buildSection(
              '4. Propriété intellectuelle',
              'La structure générale de l\'application, ainsi que les textes, graphiques, images, sons et vidéos la composant, sont la propriété de l\'éditeur. Toute représentation et/ou reproduction et/ou exploitation partielle ou totale est strictement interdite.',
            ),
            _buildSection(
              '5. Protection des données personnelles',
              'Conformément à la loi n° 2017-20 portant Code du numérique en République du Bénin, vous disposez d\'un droit d\'accès, de rectification et d\'opposition aux données personnelles vous concernant.',
            ),
            _buildSection(
              '6. Contact',
              'Pour tout signalement de contenu illicite ou pour toute question, vous pouvez nous écrire à support@hopitel.bj.',
            ),
            const SizedBox(height: 40),
            Center(
              child: Text(
                '© 2026 Hopitel. Tous droits réservés.',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textHint,
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
