import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/admin_hopital/data/models/hopital_service_model.dart'
    as admin_models;
import '../../data/models/hopital_model.dart';
import '../providers/super_admin_provider.dart';
import '../../../patient/presentation/providers/patient_provider.dart';
import '../../../patient/data/models/medecin_search_model.dart';

class SuperAdminHopitalDetailScreen extends ConsumerStatefulWidget {
  final HopitalModel hopital;

  const SuperAdminHopitalDetailScreen({super.key, required this.hopital});

  @override
  ConsumerState<SuperAdminHopitalDetailScreen> createState() =>
      _SuperAdminHopitalDetailScreenState();
}

class _SuperAdminHopitalDetailScreenState
    extends ConsumerState<SuperAdminHopitalDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const UniversalBackButton(),
        title: Text(
          widget.hopital.nom,
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.superAdmin,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.superAdmin,
          indicatorWeight: 2,
          labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
          tabs: const [
            Tab(text: 'Personnel'),
            Tab(text: 'Services'),
            Tab(text: 'Demandes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPersonnelTab(),
          _buildServicesTab(),
          _buildDemandesTab(),
        ],
      ),
    );
  }

  // ── Onglet Personnel ──────────────────────────────────────────────────────

  Widget _buildPersonnelTab() {
    final adminsAsync = ref.watch(adminHopitauxProvider);
    final medecinsAsync = ref.watch(hopitalMedecinsProvider(widget.hopital.id));
    final laborantinsAsync =
        ref.watch(superAdminHopitalLaborantinsProvider(widget.hopital.id));

    return adminsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Erreur: $e')),
      data: (admins) {
        final localAdmins = admins
            .where((a) => a['hopital'] == widget.hopital.id)
            .toList();

        return medecinsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Erreur médecins: $e')),
          data: (medecins) {
            return laborantinsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) {
                // Fallback sans laborantins
                return _buildPersonnelList(localAdmins, medecins, []);
              },
              data: (laborantins) =>
                  _buildPersonnelList(localAdmins, medecins, laborantins),
            );
          },
        );
      },
    );
  }

  Widget _buildPersonnelList(
    List<dynamic> admins,
    List<MedecinSearchModel> medecins,
    List<dynamic> laborantins,
  ) {
    if (admins.isEmpty && medecins.isEmpty && laborantins.isEmpty) {
      return _buildEmpty(Icons.people_outline, 'Aucun personnel associé');
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (admins.isNotEmpty) ...[
          _sectionTitle('Administrateurs', admins.length),
          ...admins.map((a) => _PersonnelCard(
                icon: Icons.admin_panel_settings,
                color: AppColors.superAdmin,
                nom: '${a['first_name'] ?? ''} ${a['last_name'] ?? ''}'.trim(),
                role: 'Admin Hôpital',
                subtitle: a['email'] ?? '',
              )),
          const SizedBox(height: 16),
        ],
        if (medecins.isNotEmpty) ...[
          _sectionTitle('Médecins', medecins.length),
          ...medecins.map((m) => _PersonnelCard(
                icon: Icons.medical_services,
                color: AppColors.medecin,
                nom: 'Dr. ${m.fullName}',
                role: 'Médecin',
                subtitle: m.services.isNotEmpty
                    ? m.services.first.serviceNom
                    : 'Médecin généraliste',
              )),
          const SizedBox(height: 16),
        ],
        if (laborantins.isNotEmpty) ...[
          _sectionTitle('Laborantins', laborantins.length),
          ...laborantins.map((l) => _PersonnelCard(
                icon: Icons.science,
                color: Colors.teal,
                nom: '${l['first_name'] ?? ''} ${l['last_name'] ?? ''}'.trim(),
                role: 'Laborantin',
                subtitle: l['email'] ?? '',
              )),
        ],
      ],
    );
  }

  // ── Onglet Services ───────────────────────────────────────────────────────

  Widget _buildServicesTab() {
    final servicesAsync =
        ref.watch(superAdminHopitalServicesProvider(widget.hopital.id));

    return servicesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Erreur: $e')),
      data: (List<admin_models.HopitalServiceModel> services) {
        if (services.isEmpty) {
          return _buildEmpty(
              Icons.medical_services_outlined, 'Aucun service actif');
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: services.length,
          itemBuilder: (context, i) {
            final s = services[i];
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 6,
                      offset: const Offset(0, 2))
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.medical_services,
                        color: AppColors.secondary, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.serviceNom,
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        if ((s.descriptionLocale ?? s.serviceDescription)
                            .isNotEmpty)
                          Text(
                            s.descriptionLocale ?? s.serviceDescription,
                            style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: AppColors.textSecondary),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ── Onglet Demandes ───────────────────────────────────────────────────────

  Widget _buildDemandesTab() {
    final demandesAsync = ref.watch(demandesProvider);

    return demandesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Erreur: $e')),
      data: (demandes) {
        final local = demandes
            .where((d) => d.hopital == widget.hopital.id)
            .toList();

        if (local.isEmpty) {
          return _buildEmpty(Icons.inbox_outlined, 'Aucune demande');
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: local.length,
          itemBuilder: (context, i) {
            final d = local[i];
            final enAttente = d.statut == 'en_attente';
            final statusColor = enAttente
                ? Colors.orange
                : (d.statut == 'valide' ? Colors.green : AppColors.error);
            final statusLabel = enAttente
                ? 'En attente'
                : (d.statut == 'valide' ? 'Validée' : 'Refusée');

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: statusColor.withValues(alpha: 0.2)),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 6,
                      offset: const Offset(0, 2))
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          d.serviceAffiche,
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w600, fontSize: 15),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          statusLabel,
                          style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: statusColor),
                        ),
                      ),
                    ],
                  ),
                  if (d.descriptionAffiche.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      d.descriptionAffiche,
                      style: GoogleFonts.poppins(
                          fontSize: 13, color: AppColors.textSecondary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (enAttente) ...[
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _refuserDemande(d.id),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.error,
                              side: const BorderSide(
                                  color: AppColors.error),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                            ),
                            child: Text('Refuser',
                                style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.w600)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _validerDemande(d.id),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                            ),
                            child: Text('Valider',
                                style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.w600)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  Widget _sectionTitle(String title, int count) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Text(
            title,
            style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary),
          ),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.superAdmin.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$count',
              style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.superAdmin),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(IconData icon, String message) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 56, color: AppColors.textHint.withValues(alpha: 0.3)),
          const SizedBox(height: 16),
          Text(
            message,
            style: GoogleFonts.poppins(
                fontSize: 15, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  void _validerDemande(int id) async {
    final ok = await ref.read(demandesProvider.notifier).validerDemande(id);
    if (!mounted) return;
    Helpers.showSnackBar(
        context, ok ? 'Demande validée' : 'Erreur réseau',
        isError: !ok);
    if (ok) {
      ref.invalidate(superAdminHopitalServicesProvider(widget.hopital.id));
    }
  }

  void _refuserDemande(int id) async {
    final ok = await ref
        .read(demandesProvider.notifier)
        .refuserDemande(id, 'Refusé');
    if (!mounted) return;
    Helpers.showSnackBar(
        context, ok ? 'Demande refusée' : 'Erreur réseau',
        isError: !ok);
  }
}

// ── Widget carte personnel ────────────────────────────────────────────────────

class _PersonnelCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String nom;
  final String role;
  final String subtitle;

  const _PersonnelCard({
    required this.icon,
    required this.color,
    required this.nom,
    required this.role,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 4,
              offset: const Offset(0, 1))
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: color.withValues(alpha: 0.12),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  nom.isEmpty ? 'Inconnu' : nom,
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600, fontSize: 14),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: AppColors.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              role,
              style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: color),
            ),
          ),
        ],
      ),
    );
  }
}
