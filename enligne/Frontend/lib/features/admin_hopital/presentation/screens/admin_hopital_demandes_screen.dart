import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/admin_hopital_provider.dart';
import '../../../super_admin/data/models/demande_model.dart';
import '../../../super_admin/data/models/service_model.dart';

// ── Provider demandes admin hôpital ─────────────────────────────────────────

final adminHopitalDemandesProvider =
    AsyncNotifierProvider<AdminHopitalDemandesNotifier, List<DemandeModel>>(
  AdminHopitalDemandesNotifier.new,
);

class AdminHopitalDemandesNotifier extends AsyncNotifier<List<DemandeModel>> {
  @override
  Future<List<DemandeModel>> build() async {
    final ds = ref.read(adminHopitalDatasourceProvider);
    final raw = await ds.getDemandes();
    return raw
        .map((e) => DemandeModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final raw =
          await ref.read(adminHopitalDatasourceProvider).getDemandes();
      return raw
          .map((e) => DemandeModel.fromJson(e as Map<String, dynamic>))
          .toList();
    });
  }

  Future<bool> createDemande(Map<String, dynamic> data) async {
    try {
      final profile = ref.read(adminHopitalProfileProvider).value;
      if (profile?.hopital == null) return false;
      await ref
          .read(adminHopitalDatasourceProvider)
          .requestNewService(profile!.hopital!, data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ── Screen ───────────────────────────────────────────────────────────────────

class AdminHopitalDemandesContent extends ConsumerWidget {
  const AdminHopitalDemandesContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final demandesAsync = ref.watch(adminHopitalDemandesProvider);

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
            onPressed: () =>
                ref.read(adminHopitalDemandesProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.adminHopital,
        onPressed: () {
          final services = ref.read(adminHopitalServicesProvider).value ?? [];
          _showCreateDemandeSheet(context, ref, services);
        },
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Nouvelle demande',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: demandesAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.adminHopital)),
        error: (e, _) => _ErrorView(
          message: e.toString(),
          onRetry: () =>
              ref.read(adminHopitalDemandesProvider.notifier).refresh(),
        ),
        data: (demandes) {
          if (demandes.isEmpty) {
            return _EmptyView(
              icon: Icons.inbox_outlined,
              title: 'Aucune demande',
              subtitle:
                  'Créez une demande pour ajouter\nun service à votre hôpital.',
              onAction: () {
                final services =
                    ref.read(adminHopitalServicesProvider).value ?? [];
                _showCreateDemandeSheet(context, ref, services);
              },
              actionLabel: 'Créer une demande',
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            itemCount: demandes.length,
            itemBuilder: (_, i) => _DemandeCard(demande: demandes[i]),
          );
        },
      ),
    );
  }

  void _showCreateDemandeSheet(
      BuildContext context, WidgetRef ref, List<ServiceModel> services) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    int? selectedServiceId;
    bool isNewService = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setS) => Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.textHint.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text('Nouvelle demande de service',
                      style: GoogleFonts.poppins(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  // Toggle nouveau / existant
                  Row(
                    children: [
                      _ToggleBtn(
                        label: 'Nouveau service',
                        active: isNewService,
                        color: AppColors.adminHopital,
                        onTap: () => setS(() => isNewService = true),
                      ),
                      const SizedBox(width: 8),
                      _ToggleBtn(
                        label: 'Service existant',
                        active: !isNewService,
                        color: AppColors.adminHopital,
                        onTap: () => setS(() => isNewService = false),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (isNewService) ...[
                    TextFormField(
                      controller: nomCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Nom du service',
                          hintText: 'Ex: Cardiologie, Radiologie…'),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: descCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Description (optionnel)'),
                      maxLines: 3,
                    ),
                  ] else ...[
                    if (services.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text('Aucun service global disponible.',
                            style: GoogleFonts.poppins(
                                color: AppColors.textSecondary)),
                      )
                    else
                      DropdownButtonFormField<int>(
                        decoration: const InputDecoration(
                            labelText: 'Choisir un service existant'),
                        items: services
                            .map((s) => DropdownMenuItem(
                                value: s.id, child: Text(s.nom)))
                            .toList(),
                        onChanged: (v) => setS(() => selectedServiceId = v),
                        validator: (v) => v == null ? 'Requis' : null,
                      ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (!formKey.currentState!.validate()) return;
                        final data = isNewService
                            ? {
                                'nom_nouveau_service': nomCtrl.text.trim(),
                                'description_nouveau_service':
                                    descCtrl.text.trim(),
                              }
                            : {'service_existant': selectedServiceId};
                        Navigator.pop(ctx);
                        final ok = await ref
                            .read(adminHopitalDemandesProvider.notifier)
                            .createDemande(data);
                        if (context.mounted) {
                          Helpers.showSnackBar(
                            context,
                            ok
                                ? 'Demande envoyée avec succès'
                                : 'Erreur lors de l\'envoi',
                            isError: !ok,
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.adminHopital,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text('Envoyer la demande',
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Widgets internes ─────────────────────────────────────────────────────────

class _DemandeCard extends StatelessWidget {
  final DemandeModel demande;
  const _DemandeCard({required this.demande});

  Color get _color {
    switch (demande.statut) {
      case 'valide':
        return Colors.green;
      case 'refuse':
        return AppColors.error;
      default:
        return Colors.orange;
    }
  }

  String get _label {
    switch (demande.statut) {
      case 'valide':
        return 'Validée';
      case 'refuse':
        return 'Refusée';
      default:
        return 'En attente';
    }
  }

  IconData get _icon {
    switch (demande.statut) {
      case 'valide':
        return Icons.check_circle_outline;
      case 'refuse':
        return Icons.cancel_outlined;
      default:
        return Icons.hourglass_empty;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _color.withValues(alpha: 0.2)),
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
          Row(
            children: [
              Expanded(
                child: Text(demande.serviceAffiche,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 15)),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_icon, size: 14, color: _color),
                    const SizedBox(width: 4),
                    Text(_label,
                        style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _color)),
                  ],
                ),
              ),
            ],
          ),
          if (demande.descriptionAffiche.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(demande.descriptionAffiche,
                style: GoogleFonts.poppins(
                    fontSize: 13, color: AppColors.textSecondary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
          const SizedBox(height: 8),
          Text('Demandé le ${demande.dateDemande.split('T').first}',
              style: GoogleFonts.poppins(
                  fontSize: 12, color: AppColors.textHint)),
        ],
      ),
    );
  }
}

class _ToggleBtn extends StatelessWidget {
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;
  const _ToggleBtn(
      {required this.label,
      required this.active,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? color : AppColors.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Center(
            child: Text(label,
                style: GoogleFonts.poppins(
                    color: active ? Colors.white : AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13)),
          ),
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onAction;
  final String? actionLabel;
  const _EmptyView(
      {required this.icon,
      required this.title,
      required this.subtitle,
      this.onAction,
      this.actionLabel});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: AppColors.textHint.withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            Text(title,
                style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            Text(subtitle,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(color: AppColors.textHint)),
            if (onAction != null && actionLabel != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.adminHopital,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                child: Text(actionLabel!,
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: AppColors.error),
          const SizedBox(height: 16),
          Text('Erreur: $message',
              style: GoogleFonts.poppins(color: AppColors.textSecondary),
              textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(
              onPressed: onRetry, child: const Text('Réessayer')),
        ],
      ),
    );
  }
}
