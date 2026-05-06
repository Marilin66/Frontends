import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/medecin_remote_datasource.dart';
import '../../data/models/consultation_model.dart';
import '../../data/models/disponibilite_model.dart';
import '../../data/models/rendezvous_medecin_model.dart';
import '../../../auth/data/models/user_model.dart';

final medecinDatasourceProvider = Provider<MedecinRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return MedecinRemoteDatasource(client);
});

final medecinRendezvousProvider =
    AsyncNotifierProvider<MedecinRendezvousNotifier, List<RendezVousMedecinModel>>(
  MedecinRendezvousNotifier.new,
);

class MedecinRendezvousNotifier extends AsyncNotifier<List<RendezVousMedecinModel>> {
  @override
  Future<List<RendezVousMedecinModel>> build() async {
    final datasource = ref.read(medecinDatasourceProvider);
    return await datasource.getRendezvous();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(medecinDatasourceProvider);
      return await datasource.getRendezvous();
    });
  }

  Future<void> filterByStatut(String? statut) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(medecinDatasourceProvider);
      return await datasource.getRendezvous(statut: statut);
    });
  }

  Future<bool> confirmerRendezvous(int id) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.confirmerRendezvous(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> refuserRendezvous(int id, String commentaire) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.refuserRendezvous(id, commentaire);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<int?> terminerRendezvous(int id) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      final consultationId = await datasource.terminerRendezvous(id);
      await refresh();
      return consultationId;
    } catch (_) {
      return null;
    }
  }
}

final medecinConsultationProvider =
    FutureProvider.family<ConsultationModel, int>((ref, rendezVousId) async {
  final datasource = ref.read(medecinDatasourceProvider);
  return await datasource.getConsultation(rendezVousId);
});

final medecinDisponibilitesProvider =
    AsyncNotifierProvider<MedecinDisponibilitesNotifier, List<DisponibiliteModel>>(
  MedecinDisponibilitesNotifier.new,
);

class MedecinDisponibilitesNotifier extends AsyncNotifier<List<DisponibiliteModel>> {
  @override
  Future<List<DisponibiliteModel>> build() async {
    final datasource = ref.read(medecinDatasourceProvider);
    return await datasource.getDisponibilites();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(medecinDatasourceProvider);
      return await datasource.getDisponibilites();
    });
  }

  Future<bool> createDisponibilite(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.createDisponibilite(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteDisponibilite(int id) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.deleteDisponibilite(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final medecinProfileProvider =
    AsyncNotifierProvider<MedecinProfileNotifier, UserModel?>(
  MedecinProfileNotifier.new,
);

class MedecinProfileNotifier extends AsyncNotifier<UserModel?> {
  @override
  Future<UserModel?> build() async {
    final datasource = ref.read(medecinDatasourceProvider);
    return await datasource.getProfile();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(medecinDatasourceProvider);
      return await datasource.getProfile();
    });
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.updateProfile(data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Consultations List ──────────────────────────────────────────────────────

final medecinConsultationsListProvider =
    AsyncNotifierProvider<MedecinConsultationsListNotifier, List<ConsultationModel>>(
  MedecinConsultationsListNotifier.new,
);

class MedecinConsultationsListNotifier
    extends AsyncNotifier<List<ConsultationModel>> {
  @override
  Future<List<ConsultationModel>> build() async {
    final datasource = ref.read(medecinDatasourceProvider);
    return await datasource.getConsultations();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(medecinDatasourceProvider);
      return await datasource.getConsultations();
    });
  }

  Future<bool> updateConsultation(int id, Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.updateConsultation(id, data);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> cloturerConsultation(int id) async {
    try {
      final datasource = ref.read(medecinDatasourceProvider);
      await datasource.cloturerConsultation(id);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}
