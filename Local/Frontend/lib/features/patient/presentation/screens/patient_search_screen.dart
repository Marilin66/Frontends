import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/fluid_card.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/shimmer_loading.dart';
import '../../../../core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/super_admin/data/models/service_model.dart';
import '../../data/models/hopital_search_model.dart';
import '../providers/patient_provider.dart';

class PatientSearchContent extends ConsumerStatefulWidget {
  const PatientSearchContent({super.key});

  @override
  ConsumerState<PatientSearchContent> createState() => _PatientSearchContentState();
}

class _PatientSearchContentState extends ConsumerState<PatientSearchContent> {
  final _searchCtrl = TextEditingController();

  void _onSearch() {
    ref.read(hopitauxSearchProvider.notifier).search(
      query: _searchCtrl.text.trim(),
    );
  }

  void _onClearFilters() {
    _searchCtrl.clear();
    ref.read(hopitauxSearchProvider.notifier).clearFilters();
  }

  @override
  Widget build(BuildContext context) {
    final hopitauxAsync = ref.watch(hopitauxSearchProvider);
    final servicesAsync = ref.watch(allServicesProvider);
    final selectedService = ref.watch(selectedServiceFilterProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ── Header Premium ────────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 180,
            floating: false,
            pinned: true,
            elevation: 0,
            leading: UniversalBackButton(color: Colors.white),
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Rechercher',
                        style: GoogleFonts.poppins(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Un établissement, une spécialité...',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ── Barre de recherche (en float ou simple sliver) ─────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Hero(
                tag: 'search_bar',
                child: Container(
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    onSubmitted: (_) => _onSearch(),
                    decoration: InputDecoration(
                      hintText: 'Hôpital, clinique...',
                      hintStyle: GoogleFonts.outfit(color: Colors.grey, fontSize: 15),
                      prefixIcon: const Icon(Icons.search, color: AppColors.primary, size: 22),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close, size: 20),
                              onPressed: _onClearFilters,
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Filtres Actifs ────────────────────────────────────────────────
          if (selectedService != null || _searchCtrl.text.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Wrap(
                  spacing: 8,
                  children: [
                    if (selectedService != null)
                      Chip(
                        label: Text(selectedService.nom),
                        avatar: Icon(Helpers.getServiceIcon(selectedService.icone), size: 16),
                        onDeleted: () => ref.read(hopitauxSearchProvider.notifier).clearFilters(),
                        deleteIconColor: AppColors.error,
                        backgroundColor: AppColors.primary.withOpacity(0.1),
                        side: BorderSide.none,
                        labelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    if (_searchCtrl.text.isNotEmpty)
                      Chip(
                        label: Text('"${_searchCtrl.text}"'),
                        onDeleted: () {
                          _searchCtrl.clear();
                          _onSearch();
                        },
                        backgroundColor: AppColors.secondary.withOpacity(0.1),
                        side: BorderSide.none,
                        labelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                  ],
                ),
              ),
            ),

          // ── Section : Spécialités ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Spécialités Populaires',
                    style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 100,
                    child: servicesAsync.when(
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (err, _) => const SizedBox.shrink(),
                      data: (services) {
                        return ListView.separated(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: services.length,
                          separatorBuilder: (context, index) => const SizedBox(width: 12),
                          itemBuilder: (context, index) => _buildServiceCard(services[index]),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Liste des Hôpitaux ────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            sliver: SliverToBoxAdapter(
              child: Text(
                'Hôpitaux à proximité',
                style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
            ),
          ),

          hopitauxAsync.when(
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (err, _) => SliverFillRemaining(
              child: _buildErrorState(err.toString()),
            ),
            data: (hopitaux) {
              if (hopitaux.isEmpty) {
                return SliverFillRemaining(
                  hasScrollBody: false,
                  child: _buildEmptyState(),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildHopitalCard(hopitaux[index]),
                    childCount: hopitaux.length,
                  ),
                ),
              );
            },
          ),
          
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }

  Widget _buildServiceCard(ServiceModel service) {
    final isSelected = ref.watch(selectedServiceFilterProvider)?.id == service.id;
    return AnimatedTap(
      onTap: () => ref.read(hopitauxSearchProvider.notifier).search(serviceId: service.id),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: (isSelected ? AppColors.primary : Colors.black).withOpacity(0.05),
                  blurRadius: 8, offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              Helpers.getServiceIcon(service.icone),
              color: isSelected ? Colors.white : AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            service.nom,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHopitalCard(HopitalSearchModel hopital) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: FluidCard(
        onTap: () => context.push('/patient/hopital/${hopital.id}', extra: hopital),
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Logo Placeholder
            Container(
              width: 85, height: 85,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.03),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Center(
                child: Icon(Icons.business_rounded, color: AppColors.primary.withOpacity(0.3), size: 36),
              ),
            ),
            const SizedBox(width: 16),
            // Infos
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hopital.nom,
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${hopital.ville} • ${hopital.adresse}',
                          style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Tags de services
                  if (hopital.services.isNotEmpty)
                    Wrap(
                      spacing: 6, runSpacing: 6,
                      children: hopital.services.take(2).map((s) => _buildSimpleTag(s.nom)).toList(),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimpleTag(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded, size: 80, color: Colors.grey.shade200),
          const SizedBox(height: 16),
          Text(
            'Aucun établissement trouvé',
            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
          ),
          TextButton(
            onPressed: _onClearFilters,
            child: Text('Réinitialiser les filtres', style: GoogleFonts.poppins(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 60, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              'Oups ! Une erreur est survenue',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => ref.read(hopitauxSearchProvider.notifier).refresh(),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }
}
