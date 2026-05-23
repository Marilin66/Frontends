import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/super_admin_provider.dart';
import '../../data/models/service_model.dart';

class SuperAdminServicesContent extends ConsumerStatefulWidget {
  const SuperAdminServicesContent({super.key});

  @override
  ConsumerState<SuperAdminServicesContent> createState() =>
      _SuperAdminServicesContentState();
}

class _SuperAdminServicesContentState
    extends ConsumerState<SuperAdminServicesContent> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final servicesAsync = ref.watch(servicesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Services Globaux',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(servicesProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.superAdmin,
        onPressed: () => _showCreateServiceDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Column(
        children: [
          // ── Barre de recherche ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Rechercher un service…',
                hintStyle: GoogleFonts.poppins(color: AppColors.textHint),
                prefixIcon:
                    const Icon(Icons.search, color: AppColors.textHint),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            ),
          ),

          // ── Liste ──────────────────────────────────────────────────
          Expanded(
            child: servicesAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(
                      color: AppColors.superAdmin)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 48, color: AppColors.error),
                    const SizedBox(height: 16),
                    Text('Erreur: $e',
                        style: GoogleFonts.poppins(
                            color: AppColors.textSecondary),
                        textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () =>
                          ref.read(servicesProvider.notifier).refresh(),
                      child: const Text('Réessayer'),
                    ),
                  ],
                ),
              ),
              data: (services) {
                final filtered = _searchQuery.isEmpty
                    ? services
                    : services
                        .where((s) =>
                            s.nom.toLowerCase().contains(_searchQuery) ||
                            s.description
                                .toLowerCase()
                                .contains(_searchQuery))
                        .toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.medical_services_outlined,
                            size: 64,
                            color:
                                AppColors.textHint.withValues(alpha: 0.3)),
                        const SizedBox(height: 16),
                        Text(
                          _searchQuery.isEmpty
                              ? 'Aucun service'
                              : 'Aucun résultat pour "$_searchQuery"',
                          style: GoogleFonts.poppins(
                              fontSize: 16,
                              color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  itemCount: filtered.length,
                  itemBuilder: (_, i) => _ServiceCard(
                    service: filtered[i],
                    onEdit: () =>
                        _showEditServiceDialog(context, ref, filtered[i]),
                    onDelete: () =>
                        _confirmDelete(context, ref, filtered[i]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showCreateServiceDialog(BuildContext context, WidgetRef ref) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController();
    final descCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Nouveau Service',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: nomCtrl,
                decoration: const InputDecoration(labelText: 'Nom du service'),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: descCtrl,
                decoration:
                    const InputDecoration(labelText: 'Description (optionnel)'),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.superAdmin,
                foregroundColor: Colors.white),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(ctx);
              final ok = await ref.read(servicesProvider.notifier).createService({
                'nom': nomCtrl.text.trim(),
                'description': descCtrl.text.trim(),
              });
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  ok ? 'Service créé avec succès' : 'Erreur lors de la création',
                  isError: !ok,
                );
              }
            },
            child: const Text('Créer'),
          ),
        ],
      ),
    );
  }

  void _showEditServiceDialog(
      BuildContext context, WidgetRef ref, ServiceModel service) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController(text: service.nom);
    final descCtrl = TextEditingController(text: service.description);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Modifier Service',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: nomCtrl,
                decoration: const InputDecoration(labelText: 'Nom du service'),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: descCtrl,
                decoration: const InputDecoration(labelText: 'Description'),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.superAdmin,
                foregroundColor: Colors.white),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(ctx);
              // updateService via datasource directement
              try {
                final ds = ref.read(superAdminDatasourceProvider);
                await ds.updateService(service.id, {
                  'nom': nomCtrl.text.trim(),
                  'description': descCtrl.text.trim(),
                });
                ref.read(servicesProvider.notifier).refresh();
                if (context.mounted) {
                  Helpers.showSnackBar(context, 'Service modifié avec succès');
                }
              } catch (_) {
                if (context.mounted) {
                  Helpers.showSnackBar(context, 'Erreur lors de la modification',
                      isError: true);
                }
              }
            },
            child: const Text('Modifier'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(
      BuildContext context, WidgetRef ref, ServiceModel service) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Supprimer le service',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Text(
            'Voulez-vous supprimer le service "${service.nom}" ? Cette action est irréversible.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler')),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await ref
                  .read(servicesProvider.notifier)
                  .deleteService(service.id);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  ok
                      ? 'Service supprimé'
                      : 'Erreur lors de la suppression',
                  isError: !ok,
                );
              }
            },
            child: const Text('Supprimer',
                style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final ServiceModel service;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ServiceCard({
    required this.service,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
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
              color: AppColors.superAdmin.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.medical_services,
                color: AppColors.superAdmin, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(service.nom,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                if (service.description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(service.description,
                      style: GoogleFonts.poppins(
                          fontSize: 12, color: AppColors.textSecondary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                ],
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.edit,
                    color: AppColors.primary, size: 20),
                tooltip: 'Modifier',
                onPressed: onEdit,
              ),
              IconButton(
                icon: const Icon(Icons.delete,
                    color: AppColors.error, size: 20),
                tooltip: 'Supprimer',
                onPressed: onDelete,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
