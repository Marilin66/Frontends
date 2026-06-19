import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tuple/tuple.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/patient_remote_datasource.dart';
import '../../data/models/creneau_model.dart';
import '../../data/models/rendezvous_model.dart';
import '../../data/models/resultat_model.dart';
import '../../data/models/hopital_search_model.dart';
import '../../data/models/medecin_search_model.dart';
import 'package:hopitel_app/features/admin_hopital/data/models/hopital_service_model.dart' as admin_models;
import 'package:hopitel_app/features/super_admin/data/models/service_model.dart';


import '../../data/datasources/patient_local_datasource.dart';


// Provider de la datasource patient
final patientDatasourceProvider = Provider<PatientRemoteDatasource>((ref) {
  final client = ref.watch(dioClientProvider);
  return PatientRemoteDatasource(client);
});

// Provider de la datasource locale pour le cache
final patientLocalDatasourceProvider = Provider<PatientLocalDatasource>((ref) {
  return PatientLocalDatasource();
});

// ─── Rendez-vous du patient ─────────────────────────────────────────────────

/// Gestion des rendez-vous du patient connecté
final patientRendezvousProvider =
    AsyncNotifierProvider<PatientRendezvousNotifier, List<RendezVousModel>>(
  PatientRendezvousNotifier.new,
);

class PatientRendezvousNotifier extends AsyncNotifier<List<RendezVousModel>> {
  @override
  Future<List<RendezVousModel>> build() async {
    final datasource = ref.read(patientDatasourceProvider);
    return await datasource.getRendezvous();
  }

  /// Rafraîchir la liste des rendez-vous
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(patientDatasourceProvider);
      return await datasource.getRendezvous();
    });
  }

  /// Filtrer les rendez-vous par statut et service
  Future<void> filter({String? statut, int? serviceId}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(patientDatasourceProvider);
      return await datasource.getRendezvous(statut: statut, serviceId: serviceId);
    });
  }

  /// Filtrer par statut (wrapper)
  Future<void> filterByStatut(String? statut) => filter(statut: statut);
  
  /// Filtrer par service (wrapper)
  Future<void> filterByService(int? serviceId) => filter(serviceId: serviceId);

  /// Créer un nouveau rendez-vous et rafraîchir la liste
  Future<bool> createRendezvous(Map<String, dynamic> data) async {
    try {
      final datasource = ref.read(patientDatasourceProvider);
      await datasource.createRendezvous(data);
      await refresh();
      return true;
    } on Exception {
      // Propager l'erreur pour que l'UI puisse afficher un message précis
      rethrow;
    } catch (_) {
      return false;
    }
  }

  /// Annuler un rendez-vous existant et rafraîchir la liste
  Future<bool> annulerRendezvous(int id, String commentaire) async {
    try {
      final datasource = ref.read(patientDatasourceProvider);
      await datasource.annulerRendezvous(id, commentaire);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Résultats médicaux ─────────────────────────────────────────────────────

/// Gestion des résultats médicaux du patient connecté
final patientResultatsProvider =
    AsyncNotifierProvider<PatientResultatsNotifier, List<ResultatModel>>(
  PatientResultatsNotifier.new,
);

class PatientResultatsNotifier extends AsyncNotifier<List<ResultatModel>> {
  @override
  Future<List<ResultatModel>> build() async {
    final datasource = ref.read(patientDatasourceProvider);
    return await datasource.getResultats();
  }

  /// Rafraîchir la liste des résultats médicaux
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(patientDatasourceProvider);
      return await datasource.getResultats();
    });
  }

  /// Partager un résultat avec un médecin
  Future<bool> shareResultat(int resultatId, int medecinId) async {
    try {
      final datasource = ref.read(patientDatasourceProvider);
      await datasource.shareResultat(resultatId, medecinId);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Recherche d'hôpitaux ───────────────────────────────────────────────────

/// Service actuellement sélectionné pour le filtrage (null si aucun)
final selectedServiceFilterProvider = NotifierProvider<SelectedServiceFilterNotifier, ServiceModel?>(
  SelectedServiceFilterNotifier.new,
);

class SelectedServiceFilterNotifier extends Notifier<ServiceModel?> {
  @override
  ServiceModel? build() => null;

  void set(ServiceModel? service) {
    state = service;
  }
}

/// Recherche et liste des hôpitaux disponibles
final hopitauxSearchProvider =
    AsyncNotifierProvider<HopitauxSearchNotifier, List<HopitalSearchModel>>(
  HopitauxSearchNotifier.new,
);

class HopitauxSearchNotifier extends AsyncNotifier<List<HopitalSearchModel>> {
  @override
  Future<List<HopitalSearchModel>> build() async {
    final remote = ref.read(patientDatasourceProvider);
    final local = ref.read(patientLocalDatasourceProvider);

    try {
      final hopitaux = await remote.searchHopitaux();
      await local.cacheHopitaux(hopitaux);
      return hopitaux;
    } catch (_) {
      // En cas d'erreur (réseau), tenter de récupérer du cache
      return await local.getCachedHopitaux();
    }
  }

  /// Rafraîchir la liste des hôpitaux
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final remote = ref.read(patientDatasourceProvider);
      final local = ref.read(patientLocalDatasourceProvider);
      final hopitaux = await remote.searchHopitaux();
      await local.cacheHopitaux(hopitaux);
      return hopitaux;
    });
  }

  /// Rechercher des hôpitaux par nom, ville et service
  Future<void> search({String? query, String? ville, int? serviceId}) async {
    // Si un serviceId est fourni, on met à jour le provider d'état
    if (serviceId != null) {
       final servicesAsync = ref.read(allServicesProvider);
       servicesAsync.whenData((services) {
          final service = services.cast<ServiceModel?>().firstWhere(
            (s) => s?.id == serviceId,
            orElse: () => null,
          );
          if (service != null) {
            ref.read(selectedServiceFilterProvider.notifier).set(service);
          }
       });
    } else if (query != null || ville != null) {
       // Si on fait une recherche textuelle sans serviceId, on garde ou on reset ?
       // Gérons le reset explicitement via une méthode clearFilters
    }

    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final remote = ref.read(patientDatasourceProvider);
      return await remote.searchHopitaux(query: query, ville: ville, serviceId: serviceId);
    });
  }

  /// Réinitialiser tous les filtres
  Future<void> clearFilters() async {
    ref.read(selectedServiceFilterProvider.notifier).set(null);
    await refresh();
  }
}

final hopitalServicesProvider = FutureProvider.family<List<admin_models.HopitalServiceModel>, int>((ref, hopitalId) async {
  final remote = ref.read(patientDatasourceProvider);
  return await remote.getHopitalServices(hopitalId);
});

final allServicesProvider = FutureProvider<List<ServiceModel>>((ref) async {
  final remote = ref.read(patientDatasourceProvider);
  return await remote.getAllServices();
});

final medecinDetailProvider = FutureProvider.family<MedecinSearchModel, int>((ref, medecinId) async {
  final medecins = await ref.read(patientDatasourceProvider).searchMedecins(query: '', hopitalId: null);
  return medecins.firstWhere((m) => m.id == medecinId);
});

final hopitalDetailProvider = FutureProvider.family<HopitalSearchModel, int>((ref, hopitalId) async {
  final hopitaux = await ref.read(patientDatasourceProvider).searchHopitaux();
  return hopitaux.firstWhere((h) => h.id == hopitalId);
});

// Provider des médecins d'un hôpital (utilisé dans super admin et hopital detail)
final hopitalMedecinsProvider = FutureProvider.family<List<MedecinSearchModel>, int>((ref, hopitalId) async {
  final remote = ref.read(patientDatasourceProvider);
  return await remote.searchMedecins(hopitalId: hopitalId);
});

// Provider des médecins filtrés par hôpital et par service
final serviceMedecinsProvider = FutureProvider.family<List<MedecinSearchModel>, Tuple2<int, int>>((ref, ids) async {
  final hopitalId = ids.item1;
  final serviceId = ids.item2;
  return ref.read(patientDatasourceProvider).searchMedecins(
    hopitalId: hopitalId,
    serviceId: serviceId,
  );
});

final medecinCreneauxProvider = FutureProvider.family<List<CreneauModel>, Tuple3<int, String, String>>((ref, params) async {
  final remote = ref.read(patientDatasourceProvider);
  return await remote.getCreneaux(params.item1, params.item2, params.item3);
});

// ─── Recherche d'hôpitaux par proximité ─────────────────────────────────────

/// Provider pour la recherche d'hôpitaux par proximité géographique
final nearbyHopitauxProvider = AsyncNotifierProvider<NearbyHopitauxNotifier, List<HopitalSearchModel>>(
  NearbyHopitauxNotifier.new,
);

class NearbyHopitauxNotifier extends AsyncNotifier<List<HopitalSearchModel>> {
  @override
  Future<List<HopitalSearchModel>> build() async {
    return [];
  }

  /// Charger les hôpitaux à proximité d'une position
  Future<void> loadNearbyHospitals({
    required double latitude,
    required double longitude,
    int radius = 10,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(patientDatasourceProvider);
      final local = ref.read(patientLocalDatasourceProvider);
      try {
        final hopitaux = await datasource.getNearbyHospitals(
          latitude: latitude,
          longitude: longitude,
          radius: radius,
        );
        return hopitaux;
      } catch (_) {
        // En cas d'erreur (réseau ou authentification), utiliser la fallback locale
        final tousHopitaux = await local.getCachedHopitaux();
        return tousHopitaux; // Pas de filtre géographique poussé en mode hors-ligne
      }
    });
  }

  /// Rafraîchir la liste des hôpitaux proches
  Future<void> refresh({
    required double latitude,
    required double longitude,
    int radius = 10,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(patientDatasourceProvider);
      final local = ref.read(patientLocalDatasourceProvider);
      try {
        final hopitaux = await datasource.getNearbyHospitals(
          latitude: latitude,
          longitude: longitude,
          radius: radius,
        );
        return hopitaux;
      } catch (_) {
        // En cas d'erreur (réseau ou authentification), utiliser la fallback locale
        final tousHopitaux = await local.getCachedHopitaux();
        return tousHopitaux;
      }
    });
  }
}

// ─── Recherche de médecins ──────────────────────────────────────────────────

/// Recherche et liste des médecins disponibles
final medecinsSearchProvider =
    AsyncNotifierProvider<MedecinsSearchNotifier, List<MedecinSearchModel>>(
  MedecinsSearchNotifier.new,
);

class MedecinsSearchNotifier extends AsyncNotifier<List<MedecinSearchModel>> {
  @override
  Future<List<MedecinSearchModel>> build() async {
    final remote = ref.read(patientDatasourceProvider);
    final local = ref.read(patientLocalDatasourceProvider);

    try {
      final medecins = await remote.searchMedecins();
      await local.cacheMedecins(medecins);
      return medecins;
    } catch (_) {
      return await local.getCachedMedecins();
    }
  }

  /// Rafraîchir la liste des médecins
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final remote = ref.read(patientDatasourceProvider);
      final local = ref.read(patientLocalDatasourceProvider);
      final medecins = await remote.searchMedecins();
      await local.cacheMedecins(medecins);
      return medecins;
    });
  }

  /// Rechercher des médecins par nom et/ou par hôpital
  Future<void> search({String? query, int? hopitalId}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final remote = ref.read(patientDatasourceProvider);
      return await remote.searchMedecins(
        query: query,
        hopitalId: hopitalId,
      );
    });
  }
}
