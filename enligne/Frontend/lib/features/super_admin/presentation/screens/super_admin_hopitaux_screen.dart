import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import 'package:go_router/go_router.dart';
import '../providers/super_admin_provider.dart';

class SuperAdminHopitauxContent extends ConsumerStatefulWidget {
  const SuperAdminHopitauxContent({super.key});

  @override
  ConsumerState<SuperAdminHopitauxContent> createState() =>
      _SuperAdminHopitauxContentState();
}

class _SuperAdminHopitauxContentState
    extends ConsumerState<SuperAdminHopitauxContent> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';
  int? _togglingId;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hopitauxAsync = ref.watch(hopitauxProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Hôpitaux', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(hopitauxProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => _showCreateHopitalDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: hopitauxAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (hopitaux) {
          final filtered = _searchQuery.isEmpty
              ? hopitaux
              : hopitaux
                  .where((h) =>
                      h.nom.toLowerCase().contains(_searchQuery) ||
                      h.adresse.toLowerCase().contains(_searchQuery))
                  .toList();

          final actifs = hopitaux.where((h) => h.isActive).length;
          final inactifs = hopitaux.where((h) => !h.isActive).length;

          return Column(
            children: [
              // ── KPIs ──────────────────────────────────────────────
              Container(
                color: AppColors.surface,
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    _KpiCard(label: 'Total', value: hopitaux.length, color: AppColors.primary),
                    const SizedBox(width: 8),
                    _KpiCard(label: 'Actifs', value: actifs, color: Colors.green),
                    const SizedBox(width: 8),
                    _KpiCard(label: 'Inactifs', value: inactifs, color: AppColors.textSecondary),
                  ],
                ),
              ),
              const Divider(height: 1),
              // ── Barre de recherche ─────────────────────────────────
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: 'Rechercher par nom, adresse…',
                    hintStyle: GoogleFonts.poppins(color: AppColors.textHint),
                    prefixIcon: const Icon(Icons.search, color: AppColors.textHint),
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
              // ── Liste ──────────────────────────────────────────────
              Expanded(
                child: filtered.isEmpty
                    ? Center(
                        child: Text(
                          _searchQuery.isEmpty ? 'Aucun hôpital' : 'Aucun résultat',
                          style: GoogleFonts.poppins(color: AppColors.textSecondary),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final h = filtered[index];
                          return _HopitalCard(
                            hopital: h,
                            isToggling: _togglingId == h.id,
                            onTap: () => context.push('/super-admin/hopitaux/${h.id}', extra: h),
                            onEdit: () => _showEditHopitalDialog(context, ref, h),
                            onToggle: () async {
                              setState(() => _togglingId = h.id);
                              final success = await ref
                                  .read(hopitauxProvider.notifier)
                                  .toggleStatus(h.id, !h.isActive);
                              setState(() => _togglingId = null);
                              if (context.mounted) {
                                Helpers.showSnackBar(
                                  context,
                                  success
                                      ? (h.isActive ? 'Hôpital désactivé' : 'Hôpital activé')
                                      : 'Erreur lors du changement de statut',
                                  isError: !success,
                                );
                              }
                            },
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showEditHopitalDialog(BuildContext context, WidgetRef ref, dynamic hopital) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController(text: hopital.nom);
    final adresseCtrl = TextEditingController(text: hopital.adresse);
    final villeCtrl = TextEditingController(text: hopital.ville);
    final telephoneCtrl = TextEditingController(text: hopital.telephone);
    final emailCtrl = TextEditingController(text: hopital.email);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Modifier Hôpital', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nomCtrl,
                    decoration: const InputDecoration(labelText: 'Nom'),
                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: adresseCtrl,
                    decoration: const InputDecoration(labelText: 'Adresse'),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: villeCtrl,
                    decoration: const InputDecoration(labelText: 'Ville'),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: telephoneCtrl,
                    decoration: const InputDecoration(labelText: 'Téléphone'),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                  ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(ctx);
              final data = {
                'nom': nomCtrl.text.trim(),
                'adresse': adresseCtrl.text.trim(),
                'ville': villeCtrl.text.trim(),
                'telephone': telephoneCtrl.text.trim(),
                'email': emailCtrl.text.trim(),
              };
              final success = await ref.read(hopitauxProvider.notifier).updateHopital(hopital.id, data);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Hôpital modifié avec succès' : 'Erreur lors de la modification',
                  isError: !success,
                );
              }
            },
            child: const Text('Modifier', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showCreateHopitalDialog(BuildContext context, WidgetRef ref) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController();
    final adresseCtrl = TextEditingController();
    final villeCtrl = TextEditingController();
    final telephoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final adminEmailCtrl = TextEditingController();
    final adminFirstNameCtrl = TextEditingController();
    final adminLastNameCtrl = TextEditingController();
    final adminTelephoneCtrl = TextEditingController();
    final adminDateNaissanceCtrl = TextEditingController();
    String adminSexe = 'M';
    final List<int> selectedServices = [];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: Text('Nouvel Hôpital', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Informations de l\'hôpital',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: nomCtrl,
                      decoration: const InputDecoration(labelText: 'Nom'),
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adresseCtrl,
                      decoration: const InputDecoration(labelText: 'Adresse'),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: villeCtrl,
                      decoration: const InputDecoration(labelText: 'Ville'),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: telephoneCtrl,
                      decoration: const InputDecoration(labelText: 'Téléphone'),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: emailCtrl,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    Text('Administrateur de l\'hôpital',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminEmailCtrl,
                      decoration: const InputDecoration(labelText: 'Email admin'),
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminFirstNameCtrl,
                      decoration: const InputDecoration(labelText: 'Prénom admin'),
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminLastNameCtrl,
                      decoration: const InputDecoration(labelText: 'Nom admin'),
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminTelephoneCtrl,
                      decoration: const InputDecoration(labelText: 'Téléphone admin'),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminDateNaissanceCtrl,
                      decoration: const InputDecoration(labelText: 'Date de naissance admin', hintText: 'AAAA-MM-JJ'),
                      readOnly: true,
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: ctx,
                          initialDate: DateTime(1990),
                          firstDate: DateTime(1920),
                          lastDate: DateTime.now(),
                        );
                        if (picked != null) {
                          adminDateNaissanceCtrl.text =
                              '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                        }
                      },
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: adminSexe,
                      decoration: const InputDecoration(labelText: 'Sexe admin'),
                      items: const [
                        DropdownMenuItem(value: 'M', child: Text('Masculin')),
                        DropdownMenuItem(value: 'F', child: Text('Féminin')),
                      ],
                      onChanged: (v) => setState(() => adminSexe = v ?? 'M'),
                    ),
                    const SizedBox(height: 16),
                    Text('Services initiaux :',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    ref.watch(servicesProvider).when(
                          loading: () => const Center(child: CircularProgressIndicator()),
                          error: (e, _) => Text('Erreur services: $e'),
                          data: (services) => Column(
                            children: services.map((s) {
                              return CheckboxListTile(
                                title: Text(s.nom),
                                value: selectedServices.contains(s.id),
                                onChanged: (val) {
                                  setState(() {
                                    if (val == true) {
                                      selectedServices.add(s.id);
                                    } else {
                                      selectedServices.remove(s.id);
                                    }
                                  });
                                },
                              );
                            }).toList(),
                          ),
                        ),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                Navigator.pop(ctx);
                final data = {
                  'nom': nomCtrl.text.trim(),
                  'adresse': adresseCtrl.text.trim(),
                  'ville': villeCtrl.text.trim(),
                  'telephone': telephoneCtrl.text.trim(),
                  'email': emailCtrl.text.trim(),
                  'admin_email': adminEmailCtrl.text.trim(),
                  'admin_first_name': adminFirstNameCtrl.text.trim(),
                  'admin_last_name': adminLastNameCtrl.text.trim(),
                  'admin_telephone': adminTelephoneCtrl.text.trim(),
                  'admin_date_naissance': adminDateNaissanceCtrl.text.trim(),
                  'admin_sexe': adminSexe,
                  'services_initiaux': selectedServices,
                };
                final success = await ref.read(hopitauxProvider.notifier).createHopital(data);
                if (context.mounted) {
                  Helpers.showSnackBar(
                    context,
                    success ? 'Hôpital créé avec succès' : 'Erreur lors de la création',
                    isError: !success,
                  );
                }
              },
              child: const Text('Créer', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Widgets ───────────────────────────────────────────────────────────────────

class _KpiCard extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _KpiCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(
              '$value',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HopitalCard extends StatelessWidget {
  final dynamic hopital;
  final bool isToggling;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onToggle;

  const _HopitalCard({
    required this.hopital,
    required this.isToggling,
    required this.onTap,
    required this.onEdit,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = hopital.isActive as bool;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? AppColors.primary.withValues(alpha: 0.15)
              : AppColors.textHint.withValues(alpha: 0.15),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── Infos ──────────────────────────────────────────────────
          InkWell(
            onTap: onTap,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.local_hospital, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          hopital.nom as String,
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          hopital.adresse as String,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isActive
                          ? Colors.green.withValues(alpha: 0.1)
                          : AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      isActive ? 'Actif' : 'Inactif',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isActive ? Colors.green : AppColors.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // ── Actions ────────────────────────────────────────────────
          Container(
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
              border: Border(
                top: BorderSide(color: AppColors.textHint.withValues(alpha: 0.1)),
              ),
            ),
            child: Row(
              children: [
                // Toggle actif/inactif
                Expanded(
                  child: TextButton.icon(
                    onPressed: isToggling ? null : onToggle,
                    icon: isToggling
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(
                            isActive ? Icons.toggle_on : Icons.toggle_off,
                            size: 18,
                            color: isActive ? Colors.green : AppColors.textHint,
                          ),
                    label: Text(
                      isActive ? 'Désactiver' : 'Activer',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: isActive ? Colors.green : AppColors.textHint,
                      ),
                    ),
                  ),
                ),
                Container(width: 1, height: 32, color: AppColors.textHint.withValues(alpha: 0.1)),
                // Modifier
                Expanded(
                  child: TextButton.icon(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit, size: 16, color: AppColors.primary),
                    label: Text(
                      'Modifier',
                      style: GoogleFonts.poppins(fontSize: 12, color: AppColors.primary),
                    ),
                  ),
                ),
                Container(width: 1, height: 32, color: AppColors.textHint.withValues(alpha: 0.1)),
                // Gérer
                Expanded(
                  child: TextButton.icon(
                    onPressed: onTap,
                    icon: const Icon(Icons.arrow_forward, size: 16, color: AppColors.superAdmin),
                    label: Text(
                      'Gérer',
                      style: GoogleFonts.poppins(fontSize: 12, color: AppColors.superAdmin),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
