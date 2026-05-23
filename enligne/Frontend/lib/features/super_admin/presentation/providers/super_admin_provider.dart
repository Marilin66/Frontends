import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/super_admin_remote_datasource.dart';
import '../../data/models/dashboard_stats_model.dart';
import '../../data/models/hopital_model.dart' hide HopitalServiceModel;
import '../../data/models/service_model.dart';
import '../../data/models/demande_model.dart';
import 'package:hopitel_app/features/admin_hopital/data/models/hopital_service_model.dart';

// Datasource provider
final superAdminDatasourceProvider = Provider<SuperAdminRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return SuperAdminRemoteDatasource(client);
});

// ─── Dashboard Stats ────────────────────────────────────────────────────────

final dashboardStatsProvider =
    AsyncNotifierProvider<DashboardStatsNotifier, DashboardStatsModel>(
  DashboardStatsNotifier.new,
);

// ─── Stats Provider ────────────────────────────────────────────────────────────

final statsProvider = AsyncNotifierProvider<StatsNotifier, Map<String, dynamic>>(
  StatsNotifier.new,
);

class DashboardStatsNotifier extends AsyncNotifier<DashboardStatsModel> {
  @override
  Future<DashboardStatsModel> build() async {
    final datasource = ref.read(superAdminDatasourceProvider);
    return await datasource.getDashboardStats();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(superAdminDatasourceProvider);
      return await datasource.getDashboardStats();
    });
  }
}

// ─── Hôpitaux ───────────────────────────────────────────────────────────────

final hopitauxProvider =
    AsyncNotifierProvider<HopitauxNotifier, List<HopitalModel>>(
  HopitauxNotifier.new,
);

class HopitauxNotifier extends AsyncNotifier<List<HopitalModel>> {
  @override
  Future<List<HopitalModel>> build() async {
    final datasource = ref.read(superAdminDatasourceProvider);
    return await datasource.getHopitaux();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(superAdminDatasourceProvider);
      return await datasource.getHopitaux();
    });
  }

  Future<void> search(String query) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(superAdminDatasourceProvider);
      return await datasource.getHopitaux(search: query);
    });
  }

  Future<bool> createHopital(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.createHopital(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateHopital(int id, Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.updateHopital(id, data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> toggleStatus(int id, bool isActive) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.toggleHopitalStatus(id, isActive);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Services ───────────────────────────────────────────────────────────────

final servicesProvider =
    AsyncNotifierProvider<ServicesNotifier, List<ServiceModel>>(
  ServicesNotifier.new,
);

class ServicesNotifier extends AsyncNotifier<List<ServiceModel>> {
  @override
  Future<List<ServiceModel>> build() async {
    final datasource = ref.read(superAdminDatasourceProvider);
    return await datasource.getServices();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(superAdminDatasourceProvider);
      return await datasource.getServices();
    });
  }

  Future<bool> createService(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.createService(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteService(int id) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.deleteService(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final superAdminHopitalServicesProvider = FutureProvider.family<List<HopitalServiceModel>, int>((ref, hopitalId) async {
  final datasource = ref.read(superAdminDatasourceProvider);
  return await datasource.getHopitalServices(hopitalId);
});

final superAdminHopitalLaborantinsProvider = FutureProvider.family<List<Map<String, dynamic>>, int>((ref, hopitalId) async {
  final datasource = ref.read(superAdminDatasourceProvider);
  return await datasource.getLaborantins(hopitalId: hopitalId);
});

// ─── Admin Hôpitaux ─────────────────────────────────────────────────────────

final adminHopitauxProvider =
    AsyncNotifierProvider<AdminHopitauxNotifier, List<Map<String, dynamic>>>(
  AdminHopitauxNotifier.new,
);

class AdminHopitauxNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  Future<List<Map<String, dynamic>>> build() async {
    final datasource = ref.read(superAdminDatasourceProvider);
    return await datasource.getAdminHopitaux();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(superAdminDatasourceProvider);
      return await datasource.getAdminHopitaux();
    });
  }

  Future<bool> createAdminHopital(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.createAdminHopital(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateAdminHopital(int id, Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.updateAdminHopital(id, data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteAdminHopital(int id) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.deleteAdminHopital(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Demandes ───────────────────────────────────────────────────────────────

final demandesProvider =
    AsyncNotifierProvider<DemandesNotifier, List<DemandeModel>>(
  DemandesNotifier.new,
);

class DemandesNotifier extends AsyncNotifier<List<DemandeModel>> {
  @override
  Future<List<DemandeModel>> build() async {
    final datasource = ref.read(superAdminDatasourceProvider);
    return await datasource.getDemandes();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(superAdminDatasourceProvider);
      return await datasource.getDemandes();
    });
  }

  Future<bool> validerDemande(int id) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.validerDemande(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> refuserDemande(int id, String commentaire) async {
    try {
      final datasource = ref.read(superAdminDatasourceProvider);
      await datasource.refuserDemande(id, commentaire);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Stats Notifier ─────────────────────────────────────────────────────────────

class StatsNotifier extends AsyncNotifier<Map<String, dynamic>> {
  @override
  Future<Map<String, dynamic>> build() async {
    final datasource = ref.read(superAdminDatasourceProvider);
    final data = await datasource.getGlobalStats();
    
    // On mappe les clés du backend vers celles attendues par le UI si nécessaire
    return {
      ...data,
      'activeUsers': data['active_users'] ?? 0,
      'dailyLogins': data['daily_logins'] ?? [],
      'recentActivity': data['recent_activity'] ?? [],
      'systemPerformance': data['system_performance'] ?? {
        'cpu': 0.0, 'memory': 0.0, 'storage': 0.0, 'network': 0.0
      },
    };
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return await build();
    });
  }
}
