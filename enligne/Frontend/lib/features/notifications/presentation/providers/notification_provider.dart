import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/notification_remote_datasource.dart';
import '../../data/models/notification_model.dart';

// Provider de la datasource notification
final notificationDatasourceProvider =
    Provider<NotificationRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return NotificationRemoteDatasource(client);
});

// ─── Notifications ──────────────────────────────────────────────────────────

/// Gestion des notifications de l'utilisateur connecté
final notificationProvider =
    AsyncNotifierProvider<NotificationNotifier, List<NotificationModel>>(
  NotificationNotifier.new,
);

class NotificationNotifier extends AsyncNotifier<List<NotificationModel>> {
  @override
  Future<List<NotificationModel>> build() async {
    final datasource = ref.read(notificationDatasourceProvider);
    return await datasource.getNotifications();
  }

  /// Rafraîchir la liste des notifications
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(notificationDatasourceProvider);
      return await datasource.getNotifications();
    });
  }

  /// Marquer une notification comme lue
  Future<bool> markAsRead(int id) async {
    try {
      final datasource = ref.read(notificationDatasourceProvider);
      await datasource.markAsRead(id);
      // Mettre à jour localement
      final current = state.value ?? [];
      state = AsyncValue.data(
        current.map((n) => n.id == id ? n.copyWith(lu: true) : n).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Marquer toutes les notifications comme lues
  Future<bool> markAllAsRead() async {
    try {
      final datasource = ref.read(notificationDatasourceProvider);
      await datasource.markAllAsRead();
      // Mettre à jour localement
      final current = state.value ?? [];
      state = AsyncValue.data(
        current.map((n) => n.copyWith(lu: true)).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }
}

/// Types de filtres applicables aux notifications
enum NotificationFilter {
  all('Toutes'),
  unread('Non lues'),
  appointments('Rendez-vous'),
  results('Résultats'),
  messages('Messages');

  final String label;
  const NotificationFilter(this.label);
}

/// Provider de l'état du filtre actif
class NotificationFilterNotifier extends Notifier<NotificationFilter> {
  @override
  NotificationFilter build() => NotificationFilter.all;

  void setFilter(NotificationFilter filter) {
    state = filter;
  }
}

final notificationFilterProvider = NotifierProvider<NotificationFilterNotifier, NotificationFilter>(
  NotificationFilterNotifier.new,
);

/// Provider qui retourne le nombre de notifications non lues
final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifs = ref.watch(notificationProvider);
  return notifs.value?.where((n) => !n.lu).length ?? 0;
});

/// Provider qui retourne la liste des notifications filtrées
final filteredNotificationProvider = Provider<AsyncValue<List<NotificationModel>>>((ref) {
  final notifsAsync = ref.watch(notificationProvider);
  final filter = ref.watch(notificationFilterProvider);

  return notifsAsync.whenData((notifs) {
    switch (filter) {
      case NotificationFilter.all:
        return notifs;
      case NotificationFilter.unread:
        return notifs.where((n) => !n.lu).toList();
      case NotificationFilter.appointments:
        return notifs.where((n) => n.type.toLowerCase().contains('rendezvous') || n.type.toLowerCase().contains('rdv')).toList();
      case NotificationFilter.results:
        return notifs.where((n) => n.type.toLowerCase().contains('resultat')).toList();
      case NotificationFilter.messages:
        return notifs.where((n) => n.type.toLowerCase().contains('message')).toList();
    }
  });
});
