import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import 'package:hopitel_app/features/medecin/data/models/rendezvous_medecin_model.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/premium_error_view.dart';
import 'package:hopitel_app/core/widgets/premium_loading_view.dart';
import 'package:hopitel_app/features/medecin/presentation/providers/medecin_provider.dart';

class MedecinPatientsContent extends ConsumerWidget {
  const MedecinPatientsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rdvAsync = ref.watch(medecinRendezvousProvider);

    final isDesktop = MediaQuery.of(context).size.width >= 1100;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: isDesktop
          ? null
          : AppBar(
              title: Text('Mes Patients', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              centerTitle: true,
              backgroundColor: AppColors.surface,
              surfaceTintColor: Colors.transparent,
            ),
      body: rdvAsync.when(
        loading: () => const PremiumLoadingView(message: 'Chargement de vos patients...'),
        error: (e, _) => PremiumErrorView(
          message: 'Erreur: $e',
          onRetry: () => ref.read(medecinRendezvousProvider.notifier).refresh(),
        ),
        data: (rdvs) {
          // Grouper les rendez-vous par patient
          final patientsMap = <String, List<RendezVousMedecinModel>>{};
          for (var r in rdvs) {
            patientsMap.putIfAbsent(r.patientNom, () => []).add(r);
          }

          final patientNames = patientsMap.keys.toList()..sort();

          if (patientNames.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.people_outlined, size: 64, color: AppColors.textHint.withOpacity(0.3)),
                  const SizedBox(height: 16),
                  Text('Aucun patient trouvé', style: GoogleFonts.poppins(color: AppColors.textSecondary)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: patientNames.length,
            itemBuilder: (context, index) {
              final name = patientNames[index];
              final patientRdvs = patientsMap[name]!;
              final sortedRdvs = List<RendezVousMedecinModel>.from(patientRdvs)
                ..sort((a, b) => b.dateHeure.compareTo(a.dateHeure));
              final lastRdv = sortedRdvs.first;
              
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.medecin.withOpacity(0.1),
                    child: Text(
                      name.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase(),
                      style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: AppColors.medecin),
                    ),
                  ),
                  title: Text(name, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 15)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(
                        'Dernier RDV : ${DateFormat('dd/MM/yyyy', 'fr_FR').format(lastRdv.dateHeure)}',
                        style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.event_available, size: 12, color: AppColors.textHint),
                          const SizedBox(width: 4),
                          Text('${patientRdvs.length} rendez-vous au total', style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textHint)),
                        ],
                      ),
                    ],
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.chevron_right, color: AppColors.textHint),
                    onPressed: () {
                      // TODO: Navigate to patient clinical file snippet
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
