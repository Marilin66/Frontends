import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';

class FaqScreen extends StatelessWidget {
  const FaqScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text(
          'FAQ & Guide d\'utilisation',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionTitle('Guide d\'utilisation rapide'),
          const SizedBox(height: 12),
          _buildGuideCard(
            icon: Icons.person_add_outlined,
            title: 'Créer un compte',
            description: 'Inscrivez-vous avec votre e-mail et remplissez votre profil. Une fois connecté, vous pourrez prendre rendez-vous, consulter vos résultats et discuter avec votre médecin.',
          ),
          const SizedBox(height: 12),
          _buildGuideCard(
            icon: Icons.calendar_today_outlined,
            title: 'Prendre rendez-vous',
            description: 'Allez dans l\'onglet "Rendez-vous", cherchez un hôpital ou un service spécifique, puis choisissez un créneau horaire disponible chez le médecin de votre choix.',
          ),
          const SizedBox(height: 12),
          _buildGuideCard(
            icon: Icons.science_outlined,
            title: 'Consulter des résultats',
            description: 'Si vous avez un code fourni par le laboratoire, allez dans "Mes Résultats" puis "Entrer un code laboratoire". Le PDF sera automatiquement ajouté à votre compte.',
          ),
          const SizedBox(height: 32),

          _buildSectionTitle('Questions Fréquemment Posées (FAQ)'),
          const SizedBox(height: 12),
          
          _buildFaqItem(
            question: 'Est-ce que mes données médicales sont sécurisées ?',
            answer: 'Oui, toutes vos données (profil, résultats, messages) sont chiffrées. Seuls vous et les professionnels de santé avec qui vous les partagez y ont accès.',
          ),
          _buildFaqItem(
            question: 'Comment partager mes résultats avec un autre médecin ?',
            answer: 'Dans la page de votre résultat, cliquez sur l\'icône "Partager". Recherchez le médecin souhaité et validez. Il pourra alors consulter votre document.',
          ),
          _buildFaqItem(
            question: 'À quoi sert l\'assistant IA (ChatBot) ?',
            answer: 'Notre ChatBot est disponible 24h/24 pour vous guider dans l\'application, vous fournir des informations générales de santé et vous orienter. Attention, il ne remplace pas une consultation médicale.',
          ),
          _buildFaqItem(
            question: 'Je ne trouve pas mon hôpital dans l\'application',
            answer: 'L\'application répertorie les hôpitaux partenaires. Si votre établissement n\'y figure pas, c\'est qu\'il n\'est pas encore affilié à notre réseau Hopitel.',
          ),
          _buildFaqItem(
            question: 'Comment annuler un rendez-vous ?',
            answer: 'Pour le moment, si le rendez-vous est confirmé, il est préférable de contacter directement l\'hôpital ou d\'envoyer un message au médecin concerné via l\'application.',
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: AppColors.primary,
      ),
    );
  }

  Widget _buildGuideCard({required IconData icon, required String title, required String description}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFaqItem({required String question, required String answer}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textHint.withValues(alpha: 0.1)),
      ),
      child: Theme(
        data: ThemeData().copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          collapsedIconColor: AppColors.primary,
          iconColor: AppColors.primary,
          title: Text(
            question,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          childrenPadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
          children: [
            Text(
              answer,
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
