import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';

class EmergencyNumbersScreen extends StatelessWidget {
  const EmergencyNumbersScreen({super.key});

  final List<Map<String, String>> emergencies = const [
    {'name': 'SAMU (Urgences Médicales)', 'number': '192', 'desc': 'Urgences vitales et transport médicalisé'},
    {'name': 'Sapeurs-Pompiers', 'number': '118', 'desc': 'Incendies, accidents et secours'},
    {'name': 'Police Secours', 'number': '117', 'desc': 'Insécurité et urgences policières'},
    {'name': 'Gendarmerie Nationale', 'number': '166', 'desc': 'Assistance en zone rurale'},
    {'name': 'Ligne Verte COVID-19', 'number': '136', 'desc': 'Informations et assistance santé'},
  ];

  Future<void> _makeCall(String number) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: number,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Numéros d\'Urgence', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: emergencies.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = emergencies[index];
          return Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              leading: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.phone_in_talk, color: AppColors.error),
              ),
              title: Text(
                item['name']!,
                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(
                item['desc']!,
                style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textSecondary),
              ),
              trailing: IconButton.filled(
                onPressed: () => _makeCall(item['number']!),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.primary,
                ),
                icon: const Icon(Icons.call, color: Colors.white),
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Text(
          'En cas d\'urgence extrême, restez calme et décrivez précisément votre situation au répartiteur.',
          textAlign: TextAlign.center,
          style: GoogleFonts.poppins(
            fontSize: 12,
            fontStyle: FontStyle.italic,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
