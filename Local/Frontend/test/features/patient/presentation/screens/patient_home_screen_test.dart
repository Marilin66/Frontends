import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hopitel_app/features/patient/presentation/screens/patient_home_screen.dart';
import 'package:hopitel_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:hopitel_app/features/auth/data/models/user_model.dart';


void main() {
  Widget createWidgetUnderTest({required ProviderContainer container}) {
    return UncontrolledProviderScope(
      container: container,
      child: const MaterialApp(home: PatientHomeContent()),
    );
  }

  group('PatientHomeScreen Widget Tests', () {
    testWidgets('Affiche les états de chargement', (tester) async {
      final mockUser = UserModel(
        id: 1,
        email: 'test@example.com',
        firstName: 'Alice',
        lastName: 'Doe',
        telephone: '123',
        sexe: 'F',
        role: 'patient',
        dateJoined: '2023-01-01',
      );

      final container = ProviderContainer(
        overrides: [
          authProvider.overrideWith(
            () => _MockAuthNotifier(
              AuthState(status: AuthStatus.authenticated, user: mockUser),
            ),
          ),
        ],
      );

      await tester.pumpWidget(createWidgetUnderTest(container: container));

      // Verifie l'entete
      expect(find.text('Accueil'), findsOneWidget);
    });

    testWidgets('Affiche la liste des rendez-vous', (tester) async {
      final mockUser = UserModel(
        id: 1,
        email: 'test@example.com',
        firstName: 'Alice',
        lastName: 'Doe',
        telephone: '123',
        sexe: 'F',
        role: 'patient',
        dateJoined: '2023-01-01',
      );

      final container = ProviderContainer(
        overrides: [
          authProvider.overrideWith(
            () => _MockAuthNotifier(
              AuthState(status: AuthStatus.authenticated, user: mockUser),
            ),
          ),
        ],
      );

      await tester.pumpWidget(createWidgetUnderTest(container: container));
      await tester.pumpAndSettle();
    });
  });
}

class _MockAuthNotifier extends AuthNotifier {
  final AuthState _initialState;

  _MockAuthNotifier(this._initialState);

  @override
  AuthState build() => _initialState;
}
