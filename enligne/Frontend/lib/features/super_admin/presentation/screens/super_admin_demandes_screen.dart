import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/super_admin_provider.dart';
import '../../data/models/demande_model.dart';

class SuperAdminDemandesContent extends ConsumerStatefulWidget {
  const SuperAdminDemandesContent({super.key});

  @override
  ConsumerState<SuperAdminDemandesContent> createState() =>
      _SuperAdminDemandesContentState();
}

class _SuperAdminDemandesContentState
    extends ConsumerState<SuperAdminDemandesContent>
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
    final demandesAsync = ref.watch(demandesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Demandes de Service',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(demandesProvider.notifier).refresh(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.superAdmin,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.superAdmin,
          tabs: const [
            Tab(text: 'En attente'),
            Tab(text: 'Validées'),
            Tab(text: 'Refusées'),
          ],
        ),
      ),
      body: demandesAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.superAdmin)),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Erreur: $e',
                  style:
                      GoogleFonts.poppins(color: AppColors.textSecondary),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () =>
                    ref.read(demandesProvider.notifier).refresh(),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (demandes) {
          final enAttente =
              demandes.where((d) => d.statut == 'en_attente').toList();
          final validees =
              demandes.where((d) => d.statut == 'valide').toList();
          final refusees =
              demandes.where((d) => d.statut == 'refuse').toList();

          return TabBarView(
            controller: _tabController,
            children: [
              _DemandesList(
                demandes: enAttente,
                emptyMessage: 'Aucune demande en attente',
                showActions: true,
                onValider: (id) => _validerDemande(context, ref, id),
                onRefuser: (id) => _showRefuserDialog(context, ref, id),
              ),
              _DemandesList(
                demandes: validees,
                emptyMessage: 'Aucune demande validée',
                showActions: false,
              ),
              _DemandesList(
                demandes: refusees,
                emptyMessage: 'Aucune demande refusée',
                showActions: false,
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _validerDemande(
      BuildContext context, WidgetRef ref, int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Valider la demande',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: const Text(
            'Voulez-vous valider cette demande ? Le service sera ajouté à l\'hôpital.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Valider'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    final ok = await ref.read(demandesProvider.notifier).validerDemande(id);
    if (context.mounted) {
      Helpers.showSnackBar(
        context,
        ok ? 'Demande validée avec succès' : 'Erreur lors de la validation',
        isError: !ok,
      );
    }
  }

  void _showRefuserDialog(BuildContext context, WidgetRef ref, int id) {
    final commentaireCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Refuser la demande',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Veuillez indiquer le motif du refus :'),
            const SizedBox(height: 12),
            TextField(
              controller: commentaireCtrl,
              decoration: const InputDecoration(
                  labelText: 'Motif du refus',
                  hintText: 'Ex: Service déjà disponible…'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await ref
                  .read(demandesProvider.notifier)
                  .refuserDemande(id, commentaireCtrl.text.trim());
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  ok ? 'Demande refusée' : 'Erreur lors du refus',
                  isError: !ok,
                );
              }
            },
            child: const Text('Refuser'),
          ),
        ],
      ),
    );
  }
}

// ── Liste de demandes ────────────────────────────────────────────────────────

class _DemandesList extends StatelessWidget {
  final List<DemandeModel> demandes;
  final String emptyMessage;
  final bool showActions;
  final void Function(int id)? onValider;
  final void Function(int id)? onRefuser;

  const _DemandesList({
    required this.demandes,
    required this.emptyMessage,
    required this.showActions,
    this.onValider,
    this.onRefuser,
  });

  @override
  Widget build(BuildContext context) {
    if (demandes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined,
                size: 64,
                color: AppColors.textHint.withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            Text(emptyMessage,
                style: GoogleFonts.poppins(
                    fontSize: 16, color: AppColors.textSecondary)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: demandes.length,
      itemBuilder: (_, i) => _DemandeCard(
        demande: demandes[i],
        showActions: showActions,
        onValider: onValider,
        onRefuser: onRefuser,
      ),
    );
  }
}

// ── Carte demande ────────────────────────────────────────────────────────────

class _DemandeCard extends StatelessWidget {
  final DemandeModel demande;
  final bool showActions;
  final void Function(int id)? onValider;
  final void Function(int id)? onRefuser;

  const _DemandeCard({
    required this.demande,
    required this.showActions,
    this.onValider,
    this.onRefuser,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── En-tête ──────────────────────────────────────────────
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.superAdmin.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.medical_services,
                    color: AppColors.superAdmin, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(demande.serviceAffiche,
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600, fontSize: 15)),
                    Text(demande.hopitalNom,
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // ── Description ──────────────────────────────────────────
          if (demande.descriptionAffiche.isNotEmpty) ...[
            Text(demande.descriptionAffiche,
                style: GoogleFonts.poppins(
                    fontSize: 13, color: AppColors.textSecondary),
                maxLines: 3,
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 10),
          ],

          // ── Méta ─────────────────────────────────────────────────
          Row(
            children: [
              const Icon(Icons.person_outline,
                  size: 14, color: AppColors.textHint),
              const SizedBox(width: 4),
              Text('Par ${demande.demandeParNom}',
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: AppColors.textHint)),
              const Spacer(),
              const Icon(Icons.calendar_today,
                  size: 14, color: AppColors.textHint),
              const SizedBox(width: 4),
              Text(demande.dateDemande.split('T').first,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: AppColors.textHint)),
            ],
          ),

          // ── Boutons d'action ─────────────────────────────────────
          if (showActions) ...[
            const SizedBox(height: 14),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => onRefuser?.call(demande.id),
                    icon: const Icon(Icons.close,
                        size: 16, color: AppColors.error),
                    label: Text('Refuser',
                        style: GoogleFonts.poppins(
                            color: AppColors.error,
                            fontWeight: FontWeight.w600)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.error),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => onValider?.call(demande.id),
                    icon: const Icon(Icons.check, size: 16),
                    label: Text('Valider',
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
