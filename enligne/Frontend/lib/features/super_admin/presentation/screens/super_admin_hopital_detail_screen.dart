import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/fluid_card.dart';
import '../../../../core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/admin_hopital/data/models/hopital_service_model.dart' as admin_models;
import '../../data/models/hopital_model.dart';
import '../providers/super_admin_provider.dart';
import '../../../patient/presentation/providers/patient_provider.dart';
import '../../../patient/data/models/medecin_search_model.dart';

class SuperAdminHopitalDetailScreen extends ConsumerStatefulWidget {
  final HopitalModel hopital;

  const SuperAdminHopitalDetailScreen({super.key, required this.hopital});

  @override
  ConsumerState<SuperAdminHopitalDetailScreen> createState() => _SuperAdminHopitalDetailScreenState();
}

class _SuperAdminHopitalDetailScreenState extends ConsumerState<SuperAdminHopitalDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text(widget.hopital.nom, style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Agents'),
            Tab(text: 'Services (Actifs)'),
            Tab(text: 'Demandes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAgentsTab(),
          _buildServicesTab(),
          _buildDemandesTab(),
        ],
      ),
    );
  }

  Widget _buildAgentsTab() {
    final adminsAsync = ref.watch(adminHopitauxProvider);
    final medecinsAsync = ref.watch(hopitalMedecinsProvider(widget.hopital.id));
    final laborantinsAsync = ref.watch(superAdminHopitalLaborantinsProvider(widget.hopital.id));

    return adminsAsync.when(
      loading: () => Center(
        child: Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.surface.withOpacity(0.5),
          child: Container(
            width: 200,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ),
      error: (err, stack) => Center(child: Text('Erreur admin: $err')),
      data: (admins) {
        final localAdmins = admins.where((a) => a['hopital'] == widget.hopital.id).toList();
        
        return medecinsAsync.when(
          loading: () => Center(
        child: Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.surface.withOpacity(0.5),
          child: Container(
            width: 200,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ),
          error: (err, stack) => Center(child: Text('Erreur médecins: $err')),
          data: (medecins) {
            
            return laborantinsAsync.when(
              loading: () => Center(
        child: Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.surface.withOpacity(0.5),
          child: Container(
            width: 200,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ),
              error: (err, stack) {
                // FALLBACK: If laborantins fail to load, just show localAdmins and medecins
                final allAgents = [...localAdmins, ...medecins];
                if (allAgents.isEmpty) return const Center(child: Text('Aucun agent associé.'));
                return _buildListView(allAgents);
              },
              data: (laborantins) {
                final allAgents = [...localAdmins, ...medecins, ...laborantins];
                
                if (allAgents.isEmpty) return const Center(child: Text('Aucun agent associé.'));
                
                return _buildListView(allAgents);
              }
            );
          },
        );
      },
    );
  }

  Widget _buildListView(List<dynamic> allAgents) {
    return AnimationLimiter(
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: allAgents.length,
        itemBuilder: (context, index) {
          final agent = allAgents[index];
          
          return AnimationConfiguration.staggeredList(
            position: index,
            duration: const Duration(milliseconds: 375),
            child: SlideAnimation(
              verticalOffset: 50.0,
              child: FadeInAnimation(
                child: Builder(
                  builder: (context) {
                    if (agent is MedecinSearchModel) {
                      final spec = agent.services.isNotEmpty ? agent.services.first.serviceNom : 'Médecin généraliste';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const Icon(Icons.person, color: AppColors.medecin),
                          title: Text('Dr. ${agent.fullName}', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                          subtitle: Text(spec),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: AppColors.medecin.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                            child: const Text('Médecin', style: TextStyle(color: AppColors.medecin, fontSize: 12)),
                          ),
                        ),
                      );
                    } else if (agent['role'] == 'ROLE_LABORANTIN') {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const Icon(Icons.science, color: AppColors.laborantin),
                          title: Text('${agent['first_name'] ?? ''} ${agent['last_name'] ?? ''}'.trim().isEmpty ? (agent['fullName'] ?? 'Laborantin') : '${agent['first_name'] ?? ''} ${agent['last_name'] ?? ''}', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                          subtitle: const Text('Laborantin'),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: AppColors.laborantin.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                            child: const Text('Labo', style: TextStyle(color: AppColors.laborantin, fontSize: 12)),
                          ),
                        ),
                      );
                    } else {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const Icon(Icons.admin_panel_settings, color: AppColors.superAdmin),
                          title: Text('${agent['first_name'] ?? ''} ${agent['last_name'] ?? ''}'.trim().isEmpty ? (agent['fullName'] ?? 'Administrateur') : '${agent['first_name'] ?? ''} ${agent['last_name'] ?? ''}', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                          subtitle: Text(agent['email'] ?? ''),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.chat, color: AppColors.primary),
                                tooltip: 'Chatter avec l\'admin',
                                onPressed: () {
                                  // Action de chat à implémenter
                                },
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                                child: const Text('Admin', style: TextStyle(color: AppColors.primary, fontSize: 12)),
                              ),
                            ],
                          ),
                        ),
                      );
                    }
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildServicesTab() {
    final servicesAsync = ref.watch(superAdminHopitalServicesProvider(widget.hopital.id));

    return servicesAsync.when(
      loading: () => Center(
        child: Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.surface.withOpacity(0.5),
          child: Container(
            width: 200,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ),
      error: (err, stack) => Center(child: Text('Erreur: $err')),
      data: (List<admin_models.HopitalServiceModel> services) {
        if (services.isEmpty) return const Center(child: Text('Aucun service actif pour cet hôpital.'));
        
        return ListView.builder(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          itemCount: services.length,
          itemBuilder: (context, index) {
            final s = services[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const Icon(Icons.medical_services, color: AppColors.secondary),
                title: Text(s.serviceNom ?? 'Service', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                subtitle: Text(s.descriptionLocale ?? s.serviceDescription ?? ''),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDemandesTab() {
    final demandesAsync = ref.watch(demandesProvider);

    return demandesAsync.when(
      loading: () => Center(
        child: Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.surface.withOpacity(0.5),
          child: Container(
            width: 200,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ),
      error: (err, stack) => Center(child: Text('Erreur: $err')),
      data: (demandes) {
        final localDemandes = demandes.where((d) => d.hopital == widget.hopital.id).toList();
        if (localDemandes.isEmpty) return const Center(child: Text('Aucune demande.'));
        
        return ListView.builder(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          itemCount: localDemandes.length,
          itemBuilder: (context, index) {
            final d = localDemandes[index];
            final estEnAttente = d.statut == 'en_attente';

            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text(d.serviceAffiche, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16))),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: estEnAttente ? AppColors.warning.withOpacity(0.1) : (d.statut == 'validee' ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(d.statut, style: TextStyle(color: estEnAttente ? AppColors.warning : (d.statut == 'validee' ? AppColors.success : AppColors.error))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(d.descriptionAffiche),
                    const SizedBox(height: 8),
                    if (estEnAttente) Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => _refuserDemande(d.id),
                          child: const Text('Refuser', style: TextStyle(color: AppColors.error)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () => _validerDemande(d.id),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white),
                          child: const Text('Valider'),
                        )
                      ],
                    )
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _validerDemande(int id) async {
    final success = await ref.read(demandesProvider.notifier).validerDemande(id);
    if (!mounted) return;
    Helpers.showSnackBar(context, success ? 'Demande validée' : 'Erreur réseau', isError: !success);
    if (success) {
      ref.invalidate(superAdminHopitalServicesProvider(widget.hopital.id));
    }
  }

  void _refuserDemande(int id) async {
    final success = await ref.read(demandesProvider.notifier).refuserDemande(id, 'Refusé');
    if (!mounted) return;
    Helpers.showSnackBar(context, success ? 'Demande refusée' : 'Erreur réseau', isError: !success);
  }
}
