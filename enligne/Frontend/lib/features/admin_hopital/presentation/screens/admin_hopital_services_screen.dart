import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/premium_error_view.dart';
import '../../../../core/widgets/premium_loading_view.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalServicesContent extends ConsumerWidget {
  const AdminHopitalServicesContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final servicesAsync = ref.watch(adminHopitalHopitalServicesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Mes Services', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(adminHopitalHopitalServicesProvider.notifier).refresh(),
          ),
        ],
      ),
      body: servicesAsync.when(
        loading: () => const PremiumLoadingView(message: 'Chargement de vos services...'),
        error: (e, _) => PremiumErrorView(
          message: 'Erreur: $e',
          onRetry: () => ref.read(adminHopitalHopitalServicesProvider.notifier).refresh(),
        ),
        data: (services) {
          if (services.isEmpty) {
            return const Center(child: Text('Aucun service'));
          }
          return Column(
            children: [
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.info.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.info.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.info),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Vous pouvez personnaliser la description locale de vos services pour aider les patients.',
                        style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: services.length,
                  itemBuilder: (context, index) {
                    final s = services[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: const Icon(Icons.medical_services, color: AppColors.primary),
                        title: Text(s.serviceNom, style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                        subtitle: Text(s.descriptionLocale?.isNotEmpty == true ? s.descriptionLocale! : s.serviceDescription),
                        trailing: IconButton(
                          icon: const Icon(Icons.edit, color: AppColors.primary),
                          onPressed: () => _editDescription(context, ref, s.id, s.descriptionLocale ?? s.serviceDescription),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddServiceDialog(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Demander un service'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
    );
  }

  void _editDescription(BuildContext context, WidgetRef ref, int id, String currentDesc) {
    final ctrl = TextEditingController(text: currentDesc);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Modifier description'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Description locale'),
          maxLines: 4,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              final newDesc = ctrl.text.trim();
              final success = await ref.read(adminHopitalHopitalServicesProvider.notifier).updateServiceDescription(id, newDesc);
              if (ctx.mounted) {
                Navigator.pop(ctx);
                Helpers.showSnackBar(ctx, success ? 'Mise à jour réussie' : 'Erreur réseau', isError: !success);
              }
            },
            child: const Text('Sauvegarder'),
          ),
        ],
      )
    );
  }

  void _showAddServiceDialog(BuildContext context, WidgetRef ref) {
    final nomCtrl = TextEditingController();
    final descCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Nouvelle demande de service', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nomCtrl,
              decoration: const InputDecoration(labelText: 'Nom du service'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
               final data = {
                 'nom_nouveau_service': nomCtrl.text.trim(),
                 'description_nouveau_service': descCtrl.text.trim()
               };
               final success = await ref.read(adminHopitalHopitalServicesProvider.notifier).requestNewService(data);
               if (ctx.mounted) {
                 Navigator.pop(ctx);
                 ScaffoldMessenger.of(ctx).showSnackBar(
                   SnackBar(content: Text(success ? 'Demande envoyée' : 'Erreur lors de la demande')),
                 );
               }
            },
            child: const Text('Envoyer demande'),
          ),
        ],
      )
    );
  }
}
