import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';

class HealthTipsScreen extends StatelessWidget {
  const HealthTipsScreen({super.key});

  final List<Map<String, dynamic>> tips = const [
    {
      'title': 'Prévention du Paludisme',
      'icon': Icons.bug_report,
      'color': Colors.red,
      'items': [
        'Dormez sous une moustiquaire imprégnée d\'insecticide.',
        'Utilisez des répulsifs corporels le soir.',
        'Évitez de laisser de l\'eau stagnante près de chez vous.'
      ]
    },
    {
      'title': 'Gestes de Premiers Secours',
      'icon': Icons.medical_services,
      'color': Colors.blue,
      'items': [
        'En cas de brûlure : passez de l\'eau tiède pendant 10 minutes.',
        'Position Latérale de Sécurité (PLS) si inconscient.',
        'Vérifiez toujours la respiration avant toute action.'
      ]
    },
    {
      'title': 'Alimentation & Nutrition',
      'icon': Icons.apple,
      'color': Colors.green,
      'items': [
        'Consommez au moins 5 fruits et légumes par jour.',
        'Hydratez-vous régulièrement (2L d\'eau par jour).',
        'Réduisez votre consommation de sel et de sucre.'
      ]
    },
    {
      'title': 'Activité Physique',
      'icon': Icons.fitness_center,
      'color': Colors.orange,
      'items': [
        'Pratiquez 30 minutes de marche rapide quotidienne.',
        'Prenez les escaliers au lieu de l\'ascenseur.',
        'Échauffez-vous avant toute séance de sport.'
      ]
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Conseils Santé', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gestes du quotidien',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            ...tips.map((tip) => Card(
              elevation: 4,
              shadowColor: Colors.black12,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              margin: const EdgeInsets.only(bottom: 20),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(tip['icon'], color: tip['color'], size: 28),
                        const SizedBox(width: 12),
                        Text(
                          tip['title'],
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ],
                    ),
                    const Divider(height: 32),
                    ...tip['items'].map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Expanded(
                            child: Text(
                              item,
                              style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textPrimary),
                            ),
                          ),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}
