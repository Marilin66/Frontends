import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:hopitel_app/core/network/dio_client.dart';
import 'package:hopitel_app/core/constants/app_constants.dart';
import 'package:hopitel_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:hopitel_app/features/auth/data/models/user_model.dart';

class MockDioClient extends Mock implements DioClient {}

void main() {
  late MockDioClient mockDioClient;

  setUp(() {
    mockDioClient = MockDioClient();
    // Setup in-memory mock storage for FlutterSecureStorage
    FlutterSecureStorage.setMockInitialValues({});
  });

  ProviderContainer makeProviderContainer() {
    final container = ProviderContainer(
      overrides: [dioClientProvider.overrideWithValue(mockDioClient)],
    );
    addTearDown(container.dispose);
    return container;
  }

  group('AuthNotifier', () {
    test(
      'L\'état initial doit être unauthenticated lorsque aucun token n\'est stocké',
      () async {
        final container = makeProviderContainer();

        // Au montage, `build()` lance checkAuth().
        // L'état initial synchrone devrait être loading ou initial selon le tick.
        // Mais attendons que checkAuth finisse.
        await container.read(authProvider.notifier).checkAuth();

        final finalState = container.read(authProvider);
        expect(finalState.status, AuthStatus.unauthenticated);
        expect(finalState.user, isNull);
      },
    );

    test(
      'login() met à jour le state à authenticated et stocke les tokens en cas de succès',
      () async {
        final container = makeProviderContainer();

        // Simuler les réponses réseau
        // 1. Appel login (POST /api/accounts/login/)
        when(
          () => mockDioClient.post(any(), data: any(named: 'data')),
        ).thenAnswer(
          (_) async => Response(
            requestOptions: RequestOptions(path: ''),
            statusCode: 200,
            data: {'access': 'fake_access', 'refresh': 'fake_refresh'},
          ),
        );

        // 2. Appel profil (GET /api/accounts/users/me/)
        when(() => mockDioClient.get(any())).thenAnswer(
          (_) async => Response(
            requestOptions: RequestOptions(path: ''),
            statusCode: 200,
            data: {
              'id': 1,
              'email': 'test@test.com',
              'first_name': 'Test',
              'last_name': 'User',
              'telephone': '0000',
              'sexe': 'M',
              'role': 'patient',
              'date_joined': '2023-01-01T00:00:00Z',
              'is_active': true,
            },
          ),
        );

        await container
            .read(authProvider.notifier)
            .login('test@test.com', 'password');

        final finalState = container.read(authProvider);

        expect(finalState.status, AuthStatus.authenticated);
        expect(finalState.user, isA<UserModel>());
        expect(finalState.user?.email, 'test@test.com');

        // Vérifier le stockage
        const storage = FlutterSecureStorage();
        final savedToken = await storage.read(
          key: AppConstants.accessTokenKey,
        );
        expect(savedToken, 'fake_access');
      },
    );

    test(
      'logout() supprime les tokens et met l\'état à unauthenticated',
      () async {
        const storage = FlutterSecureStorage();
        FlutterSecureStorage.setMockInitialValues({
          AppConstants.accessTokenKey: 'old_token',
        });

        final container = makeProviderContainer();

        // Forcer l'état initial à authenticated manuellement
        // En appelant checkAuth mocké ou juste en appelant logout
        await container.read(authProvider.notifier).logout();

        final finalState = container.read(authProvider);
        expect(finalState.status, AuthStatus.unauthenticated);

        final tokenAfterLogout = await storage.read(
          key: AppConstants.accessTokenKey,
        );
        expect(tokenAfterLogout, isNull);
      },
    );
  });
}
