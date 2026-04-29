import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Politique de confidentialité', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
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
              '1. Introduction',
              'Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment Hopitel collecte, utilise et protège vos informations personnelles lorsque vous utilisez notre application.',
            ),
            _buildSection(
              '2. Collecte des données',
              'Nous collectons des informations que vous nous fournissez directement, telles que votre nom, adresse e-mail, numéro de téléphone, date de naissance, sexe et informations de santé nécessaires pour la prise de rendez-vous et le suivi médical.',
            ),
            _buildSection(
              '3. Utilisation des données',
              'Vos données sont utilisées pour :\n• Gérer votre compte utilisateur\n• Faciliter la prise de rendez-vous\n• Permettre la communication avec les professionnels de santé\n• Améliorer nos services et votre expérience utilisateur',
            ),
            _buildSection(
              '4. Protection des données',
              'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, perte ou destruction. Vos données de santé sont cryptées et stockées de manière sécurisée.',
            ),
            _buildSection(
              '5. Partage des données',
              'Nous ne partageons vos données qu\'avec les professionnels de santé que vous choisissez de consulter. Nous ne vendons jamais vos données personnelles à des tiers.',
            ),
            _buildSection(
              '6. Vos droits',
              'Vous avez le droit d\'accéder à vos données, de les rectifier, de demander leur suppression ou de vous opposer à leur traitement. Vous pouvez exercer ces droits à tout moment via les paramètres de l\'application.',
            ),
            _buildSection(
              '7. Contact',
              'Pour toute question concernant cette politique, veuillez nous contacter à support@hopitel.bj.',
            ),
            const SizedBox(height: 40),
            Center(
              child: Text(
                'Dernière mise à jour : 31 Mars 2026',
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
