import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/admin_hopital_remote_datasource.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/hopital_service_model.dart';
import '../../../super_admin/data/models/service_model.dart';

final adminHopitalDatasourceProvider = Provider<AdminHopitalRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return AdminHopitalRemoteDatasource(client);
});

final adminHopitalProfileProvider =
    AsyncNotifierProvider<AdminHopitalProfileNotifier, UserModel?>(
  AdminHopitalProfileNotifier.new,
);

class AdminHopitalProfileNotifier extends AsyncNotifier<UserModel?> {
  @override
  Future<UserModel?> build() async {
    final datasource = ref.read(adminHopitalDatasourceProvider);
    return await datasource.getProfile();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      return await datasource.getProfile();
    });
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.updateProfile(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final adminHopitalMedecinsProvider =
    AsyncNotifierProvider<AdminHopitalMedecinsNotifier, List<UserModel>>(
  AdminHopitalMedecinsNotifier.new,
);

class AdminHopitalMedecinsNotifier extends AsyncNotifier<List<UserModel>> {
  @override
  Future<List<UserModel>> build() async {
    final datasource = ref.read(adminHopitalDatasourceProvider);
    return await datasource.getMedecins();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      return await datasource.getMedecins();
    });
  }

  Future<bool> createMedecin(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.createMedecin(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deactivateMedecin(int id) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.deactivateMedecin(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateMedecin(int id, Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.updateMedecin(id, data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final adminHopitalLaborantinsProvider =
    AsyncNotifierProvider<AdminHopitalLaborantinsNotifier, List<UserModel>>(
  AdminHopitalLaborantinsNotifier.new,
);

class AdminHopitalLaborantinsNotifier extends AsyncNotifier<List<UserModel>> {
  @override
  Future<List<UserModel>> build() async {
    final datasource = ref.read(adminHopitalDatasourceProvider);
    return await datasource.getLaborantins();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      return await datasource.getLaborantins();
    });
  }

  Future<bool> createLaborantin(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.createLaborantin(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deactivateLaborantin(int id) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.deactivateLaborantin(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateLaborantin(int id, Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.updateLaborantin(id, data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final adminHopitalServicesProvider =
    AsyncNotifierProvider<AdminHopitalServicesNotifier, List<ServiceModel>>(
  AdminHopitalServicesNotifier.new,
);

class AdminHopitalServicesNotifier extends AsyncNotifier<List<ServiceModel>> {
  @override
  Future<List<ServiceModel>> build() async {
    final datasource = ref.read(adminHopitalDatasourceProvider);
    return await datasource.getServices();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      return await datasource.getServices();
    });
  }
}

final adminHopitalHopitalServicesProvider =
    AsyncNotifierProvider<AdminHopitalHopitalServicesNotifier, List<HopitalServiceModel>>(
  AdminHopitalHopitalServicesNotifier.new,
);

class AdminHopitalHopitalServicesNotifier extends AsyncNotifier<List<HopitalServiceModel>> {
  @override
  Future<List<HopitalServiceModel>> build() async {
    final datasource = ref.read(adminHopitalDatasourceProvider);
    return await datasource.getHopitalServices();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      return await datasource.getHopitalServices();
    });
  }

  Future<bool> requestNewService(Map<String, dynamic> data) async {
    try {
      final profile = ref.read(adminHopitalProfileProvider).value;
      if (profile == null || profile.hopital == null) return false;
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.requestNewService(profile.hopital!, data);
      await refresh();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateServiceDescription(int id, String descriptionLocale) async {
    try {
      final datasource = ref.read(adminHopitalDatasourceProvider);
      await datasource.updateHopitalServiceDescription(id, descriptionLocale);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final adminHopitalDashboardStatsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final datasource = ref.read(adminHopitalDatasourceProvider);
  return await datasource.getDashboardStats();
});

// ── Supervision providers ─────────────────────────────────────────────────

final adminSupervisionDashboardProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final datasource = ref.read(adminHopitalDatasourceProvider);
  return await datasource.getSupervisionDashboard();
});

final adminSupervisionRendezvousProvider =
    FutureProvider.family<List<dynamic>, String?>((ref, statut) async {
  final datasource = ref.read(adminHopitalDatasourceProvider);
  return await datasource.getSupervisionRendezvous(statut: statut);
});

final adminSupervisionConsultationsProvider =
    FutureProvider<List<dynamic>>((ref) async {
  final datasource = ref.read(adminHopitalDatasourceProvider);
  return await datasource.getSupervisionConsultations();
});

final adminSupervisionLaboratoireProvider =
    FutureProvider<List<dynamic>>((ref) async {
  final datasource = ref.read(adminHopitalDatasourceProvider);
  return await datasource.getSupervisionLaboratoire();
});

final adminPatientParcoursProvider =
    FutureProvider.family<Map<String, dynamic>, int>((ref, patientId) async {
  final datasource = ref.read(adminHopitalDatasourceProvider);
  return await datasource.getPatientParcours(patientId);
});
