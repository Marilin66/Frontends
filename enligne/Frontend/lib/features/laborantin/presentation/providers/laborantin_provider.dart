import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:hopitel_app/core/network/dio_client.dart';
import 'package:hopitel_app/features/laborantin/data/datasources/laborantin_remote_datasource.dart';
import 'package:hopitel_app/features/laborantin/data/models/demande_analyse_model.dart';
// import 'package:hopitel_app/features/patient/data/models/resultat_model.dart';
import 'package:hopitel_app/features/auth/data/models/user_model.dart';

/// Provider de la datasource laborantin
final laborantinDatasourceProvider = Provider<LaborantinRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return LaborantinRemoteDatasource(client);
});

// --- BioTrack Providers ---

/// Analyses en cours (pas encore de résultats)
final laborantinPendingAnalysesProvider = AsyncNotifierProvider<LaborantinPendingAnalysesNotifier, List<DemandeAnalyseModel>>(
  LaborantinPendingAnalysesNotifier.new,
);

class LaborantinPendingAnalysesNotifier extends AsyncNotifier<List<DemandeAnalyseModel>> {
  @override
  Future<List<DemandeAnalyseModel>> build() async {
    final datasource = ref.read(laborantinDatasourceProvider);
    return await datasource.getAnalyses(statut: 'en_cours');
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => build());
  }

  Future<DemandeAnalyseModel?> creerDemande(Map<String, dynamic> data) async {
    final datasource = ref.read(laborantinDatasourceProvider);
    final newDemande = await datasource.creerDemande(data);
    await refresh();
    return newDemande;
  }

  Future<Map<String, dynamic>?> cloturerAnalyse(int id, FormData formData) async {
    final datasource = ref.read(laborantinDatasourceProvider);
    final result = await datasource.cloturerAnalyse(id, formData);
    await refresh();
    ref.read(laborantinFinishedAnalysesProvider.notifier).refresh();
    return result;
  }
}

/// Analyses clôturées (historique)
final laborantinFinishedAnalysesProvider = AsyncNotifierProvider<LaborantinFinishedAnalysesNotifier, List<DemandeAnalyseModel>>(
  LaborantinFinishedAnalysesNotifier.new,
);

class LaborantinFinishedAnalysesNotifier extends AsyncNotifier<List<DemandeAnalyseModel>> {
  @override
  Future<List<DemandeAnalyseModel>> build() async {
    final datasource = ref.read(laborantinDatasourceProvider);
    return await datasource.getAnalyses(statut: 'cloture');
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => build());
  }
}

// --- Recherche ---

/// Provider pour la recherche de patients par le laborantin
final patientSearchProvider = AsyncNotifierProvider<PatientSearchNotifier, List<UserModel>>(
  PatientSearchNotifier.new,
);

class PatientSearchNotifier extends AsyncNotifier<List<UserModel>> {
  @override
  Future<List<UserModel>> build() async => [];

  Future<void> search(String query) async {
    if (query.isEmpty) {
      state = const AsyncValue.data([]);
      return;
    }
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(laborantinDatasourceProvider);
      return await datasource.searchPatients(query);
    });
  }
}

/// Provider pour récupérer les patients suivis ou inscrits par le laborantin
final laborantinMyPatientsProvider = FutureProvider<List<UserModel>>((ref) async {
  final datasource = ref.read(laborantinDatasourceProvider);
  return await datasource.getMyPatients();
});
