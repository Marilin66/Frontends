import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';

class TermsOfUseScreen extends StatelessWidget {
  const TermsOfUseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Conditions d\'utilisation', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
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
              '1. Acceptation des conditions',
              'En utilisant l\'application Hopitel, vous acceptez d\'être lié par les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, vous ne devez pas utiliser notre application.',
            ),
            _buildSection(
              '2. Utilisation du service',
              'L\'utilisation de notre application est réservée aux personnes majeures selon la loi béninoise ou aux mineurs sous la supervision d\'un tuteur légal. Vous vous engagez à fournir des informations exactes et à ne pas utiliser le service de manière frauduleuse.',
            ),
            _buildSection(
              '3. Données de santé',
              'Les informations fournies via l\'application ne constituent pas un avis médical définitif. Nos services visent à faciliter la mise en relation avec des professionnels de santé qualifiés.',
            ),
            _buildSection(
              '4. Propriété intellectuelle',
              'Tout le contenu présent sur l\'application, y compris les logos, textes et graphiques, appartient à Hopitel et est protégé par les lois sur la propriété intellectuelle.',
            ),
            _buildSection(
              '5. Responsabilité',
              'Hopitel s\'efforce de maintenir l\'application disponible et à jour, mais ne pourra être tenue responsable en cas d\'interruptions techniques momentanées ou d\'erreurs dans les informations fournies par les utilisateurs.',
            ),
            _buildSection(
              '6. Résiliation',
              'Nous nous réservons le droit de suspendre ou de fermer votre compte en cas de non-respect des présentes conditions d\'utilisation.',
            ),
            _buildSection(
              '7. Modification des conditions',
              'Nous pouvons modifier ces conditions à tout moment. Vous serez informé de tout changement important via une notification dans l\'application.',
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
