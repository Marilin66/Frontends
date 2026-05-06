import 'package:flutter_test/flutter_test.dart';
import 'package:hopitel_app/core/network/dio_client.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  group('DioClient', () {
    test('peut être instancié sans erreur', () {
      final client = DioClient();
      expect(client, isNotNull);
    });

    // Remarque: les tests plus avancés du DioClient nécessitent un serveur mock
    // (par ex: avec http_mock_adapter) pour intercepter le traffic réel Dio.
    // L'instanciation de base confirme que l'injection et les dépendances (FlutterSecureStorage)
    // sont correctement résolues.
  });
}
