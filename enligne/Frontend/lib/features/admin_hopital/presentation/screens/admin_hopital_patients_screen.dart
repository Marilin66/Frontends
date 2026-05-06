import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/admin_hopital_provider.dart';
import '../../../auth/data/models/user_model.dart';

// ── Provider patients de l'hôpital ──────────────────────────────────────────

final adminHopitalPatientsProvider =
    AsyncNotifierProvider<AdminHopitalPatientsNotifier, List<UserModel>>(
  AdminHopitalPatientsNotifier.new,
);

class AdminHopitalPatientsNotifier extends AsyncNotifier<List<UserModel>> {
  @override
  Future<List<UserModel>> build() async {
    final ds = ref.read(adminHopitalDatasourceProvider);
    return await ds.getPatients();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
        () => ref.read(adminHopitalDatasourceProvider).getPatients());
  }

  Future<void> search(String query) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
        () => ref.read(adminHopitalDatasourceProvider).getPatients(search: query));
  }
}

// ── Screen ───────────────────────────────────────────────────────────────────

class AdminHopitalPatientsContent extends ConsumerStatefulWidget {
  const AdminHopitalPatientsContent({super.key});

  @override
  ConsumerState<AdminHopitalPatientsContent> createState() =>
      _AdminHopitalPatientsContentState();
}

class _AdminHopitalPatientsContentState
    extends ConsumerState<AdminHopitalPatientsContent> {
  final _searchCtrl = TextEditingController();
  bool _showSearch = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final patientsAsync = ref.watch(adminHopitalPatientsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: _showSearch
            ? TextField(
                controller: _searchCtrl,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Rechercher un patient…',
                  hintStyle:
                      GoogleFonts.poppins(color: AppColors.textHint),
                  border: InputBorder.none,
                ),
                style: GoogleFonts.poppins(),
                onChanged: (v) {
                  if (v.length >= 2 || v.isEmpty) {
                    ref
                        .read(adminHopitalPatientsProvider.notifier)
                        .search(v);
                  }
                },
              )
            : Text('Patients',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: !_showSearch,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: Icon(_showSearch ? Icons.close : Icons.search),
            onPressed: () {
              setState(() => _showSearch = !_showSearch);
              if (!_showSearch) {
                _searchCtrl.clear();
                ref.read(adminHopitalPatientsProvider.notifier).refresh();
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(adminHopitalPatientsProvider.notifier).refresh(),
          ),
        ],
      ),
      body: patientsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.adminHopital)),
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
                    ref.read(adminHopitalPatientsProvider.notifier).refresh(),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (patients) {
          if (patients.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.people_outline,
                      size: 64,
                      color: AppColors.textHint.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('Aucun patient',
                      style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  Text(
                    'Les patients ayant eu un rendez-vous\ndans votre hôpital apparaîtront ici.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(color: AppColors.textHint),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Compteur
              Container(
                color: AppColors.surface,
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    Icon(Icons.people,
                        size: 18,
                        color: AppColors.adminHopital.withValues(alpha: 0.7)),
                    const SizedBox(width: 8),
                    Text(
                      '${patients.length} patient${patients.length > 1 ? 's' : ''}',
                      style: GoogleFonts.poppins(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: patients.length,
                  itemBuilder: (_, i) => _PatientCard(patient: patients[i]),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _PatientCard extends StatelessWidget {
  final UserModel patient;
  const _PatientCard({required this.patient});

  @override
  Widget build(BuildContext context) {
    final initials = '${patient.firstName.isNotEmpty ? patient.firstName[0] : ''}${patient.lastName.isNotEmpty ? patient.lastName[0] : ''}'
        .toUpperCase();

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
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.adminHopital.withValues(alpha: 0.15),
            child: Text(initials,
                style: GoogleFonts.poppins(
                    fontWeight: FontWeight.bold,
                    color: AppColors.adminHopital,
                    fontSize: 16)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(patient.fullName,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: 2),
                Text(patient.email,
                    style: GoogleFonts.poppins(
                        fontSize: 13, color: AppColors.textSecondary)),
                if (patient.telephone.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.phone,
                          size: 13, color: AppColors.textHint),
                      const SizedBox(width: 4),
                      Text(patient.telephone,
                          style: GoogleFonts.poppins(
                              fontSize: 12, color: AppColors.textHint)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: patient.isActive
                  ? Colors.green.withValues(alpha: 0.1)
                  : AppColors.error.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              patient.isActive ? 'Actif' : 'Inactif',
              style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: patient.isActive ? Colors.green : AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}
