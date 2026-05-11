import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tuple/tuple.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../admin_hopital/data/models/hopital_service_model.dart';
import '../../data/models/hopital_search_model.dart' hide HopitalServiceModel;
import '../../data/models/medecin_search_model.dart';
import '../providers/patient_provider.dart';
import '../../../../core/widgets/universal_back_button.dart';

class ServiceDetailScreen extends ConsumerWidget {
  final HopitalServiceModel service;
  final HopitalSearchModel hopital;

  const ServiceDetailScreen({
    super.key,
    required this.service,
    required this.hopital,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medecinsAsync = ref.watch(serviceMedecinsProvider(Tuple2(hopital.id, service.service)));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // En-tête avec Hero Image
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.primary,
            iconTheme: const IconThemeData(color: Colors.white),
            leading: UniversalBackButton(),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                service.serviceNom,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  shadows: [Shadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 4)],
                ),
              ),
              background: service.serviceImage != null && service.serviceImage!.isNotEmpty
                  ? Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(service.serviceImage!, fit: BoxFit.cover),
                        Container(
                          decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Colors.transparent, Colors.black.withValues(alpha: 0.8)],
                              ),
                            ),
                          ),
                      ],
                    )
                  : Container(
                      color: AppColors.primary.withValues(alpha: 0.8),
                      child: const Center(
                        child: Icon(Icons.medical_services, size: 80, color: Colors.white24),
                      ),
                    ),
            ),
          ),

          // Contenu principal
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hôpital badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on, size: 18, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            hopital.nom,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Description
                  Text(
                    'À propos du service',
                    style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    service.serviceDescription.isNotEmpty 
                        ? service.serviceDescription 
                        : "Les informations détaillées globales de ce service ne sont pas encore renseignées.",
                    style: GoogleFonts.poppins(fontSize: 15, color: Colors.grey[700], height: 1.6),
                  ),

                  // Description locale Hôpital
                  if (service.descriptionLocale != null && service.descriptionLocale!.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 10, offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.info_outline, color: AppColors.primary),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Spécificités à ${hopital.nom}",
                                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: Colors.black87),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  service.descriptionLocale!,
                                  style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey[700], height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 32),
                  const Divider(),
                  const SizedBox(height: 16),

                  // Liste des médecins
                  Row(
                    children: [
                      const Icon(Icons.people_alt_outlined, color: AppColors.primary, size: 28),
                      const SizedBox(width: 10),
                      Text(
                        'Médecins associés',
                        style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  medecinsAsync.when(
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40.0),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                    error: (err, _) => Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text('Erreur: $err', style: TextStyle(color: Colors.red.shade900)),
                    ),
                    data: (medecins) {
                      if (medecins.isEmpty) {
                        return Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(30),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Column(
                            children: [
                              Icon(Icons.person_off_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text(
                                "Aucun médecin actuellement rattaché à ce service dans cet hôpital.",
                                textAlign: TextAlign.center,
                                style: GoogleFonts.poppins(color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        );
                      }

                      return ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: medecins.length,
                        separatorBuilder: (context, i) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final medecin = medecins[index];
                          return _buildMedecinCard(context, medecin);
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMedecinCard(BuildContext context, MedecinSearchModel medecin) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            // Navigation vers l'écran de prise de RDV
            context.push('/patient/medecin/${medecin.id}/rendezvous', extra: medecin);
          },
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                // Avatar
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2), width: 2),
                  ),
                  child: Center(
                    child: Text(
                      '${medecin.firstName.isNotEmpty ? medecin.firstName[0] : ''}${medecin.lastName.isNotEmpty ? medecin.lastName[0] : ''}'.toUpperCase(),
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                
                // Infos
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dr. ${medecin.fullName}',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.green.shade200),
                        ),
                        child: Text(
                          medecin.medecinProfile.statut.toUpperCase(),
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Bouton Prendre RDV
                Container(
                  width: 45,
                  height: 45,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 18),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
