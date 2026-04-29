import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../../data/models/hopital_search_model.dart';
import '../providers/patient_provider.dart';

class HopitalDetailScreen extends ConsumerWidget {
  final HopitalSearchModel? hopital;
  final int? hopitalId;

  const HopitalDetailScreen({
    super.key, 
    this.hopital,
    this.hopitalId,
  }) : assert(hopital != null || hopitalId != null);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (hopital != null) {
      return _buildContent(context, ref, hopital!);
    }

    final hopitalAsync = ref.watch(hopitalDetailProvider(hopitalId!));

    return hopitalAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Erreur: $e'))),
      data: (h) => _buildContent(context, ref, h),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, HopitalSearchModel hopital) {
    final servicesAsync = ref.watch(hopitalServicesProvider(hopital.id));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            leading: const UniversalBackButton(color: Colors.white),
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.business, color: Colors.white, size: 64),
                      const SizedBox(height: 12),
                      Text(
                        hopital.nom,
                        style: GoogleFonts.poppins(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildListDelegate([
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoCard(context, hopital),
                    const SizedBox(height: 32),
                    Text(
                      'Services disponibles',
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    servicesAsync.when(
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (e, _) => Center(child: Text('Erreur: $e')),
                      data: (services) => services.isEmpty
                          ? _buildEmptyState('Aucun service disponible')
                          : Column(
                              children: services
                                  .map((s) => _buildServiceTile(context, hopital, s))
                                  .toList(),
                            ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, HopitalSearchModel hopital) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow(Icons.location_on, '${hopital.adresse}, ${hopital.ville}'),
          if (hopital.telephone.isNotEmpty) ...[
            const SizedBox(height: 12),
            _buildInfoRow(Icons.phone, hopital.telephone),
          ],
          if (hopital.email.isNotEmpty) ...[
            const SizedBox(height: 12),
            _buildInfoRow(Icons.email, hopital.email),
          ],
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                if (hopital.latitude != null && hopital.longitude != null) {
                  Helpers.launchMaps(hopital.latitude!, hopital.longitude!, hopital.nom);
                } else {
                  Helpers.showSnackBar(context, 'Coordonnées non disponibles pour cet hôpital', isError: true);
                }
              },
              icon: const Icon(Icons.directions_outlined),
              label: const Text('Voir l\'itinéraire'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textPrimary),
          ),
        ),
      ],
    );
  }

  Widget _buildServiceTile(BuildContext context, HopitalSearchModel hopital, dynamic s) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.textHint.withOpacity(0.1)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.info.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.medical_services_outlined, color: AppColors.info),
        ),
        title: Text(
          s.serviceNom,
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
        onTap: () {
          context.push(
            '/patient/service',
            extra: {
              'service': s,
              'hopital': hopital,
            },
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            Icon(Icons.layers_clear_outlined, size: 48, color: AppColors.textHint.withOpacity(0.5)),
            const SizedBox(height: 16),
            Text(
              message,
              style: GoogleFonts.poppins(color: AppColors.textHint),
            ),
          ],
        ),
      ),
    );
  }
}
