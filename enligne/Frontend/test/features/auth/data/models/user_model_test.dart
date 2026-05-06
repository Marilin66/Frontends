import 'package:flutter_test/flutter_test.dart';
import 'package:hopitel_app/features/auth/data/models/user_model.dart';

void main() {
  group('UserModel', () {
    final validJson = {
      'id': 1,
      'email': 'test@example.com',
      'first_name': 'Jean',
      'last_name': 'Dupont',
      'telephone': '+22990000000',
      'date_naissance': '1990-01-01',
      'sexe': 'M',
      'role': 'patient',
      'adresse': 'Cotonou',
      'photo': null,
      'is_active': true,
      'is_email_verified': true,
      'date_joined': '2023-01-01T10:00:00Z',
      'last_login': '2023-01-05T10:00:00Z',
      'hopital': null,
      'hopital_nom': null,
      'patient_profile': {'groupe_sanguin': 'O+'},
      'medecin_profile': null,
      'laborantin_profile': null,
    };

    test('fromJson doit parser correctement un objet JSON valide', () {
      final user = UserModel.fromJson(validJson);

      expect(user.id, 1);
      expect(user.email, 'test@example.com');
      expect(user.firstName, 'Jean');
      expect(user.lastName, 'Dupont');
      expect(user.fullName, 'Jean Dupont');
      expect(user.role, 'patient');
      expect(user.patientProfile?['groupe_sanguin'], 'O+');
    });

    test(
      'toJson doit retourner un Map correspondant aux attributs du modèle',
      () {
        final user = UserModel(
          id: 2,
          email: 'medecin@example.com',
          firstName: 'Paul',
          lastName: 'Martin',
          telephone: '+22991111111',
          sexe: 'M',
          role: 'medecin',
          dateJoined: '2023-02-01T10:00:00Z',
          isActive: true,
        );

        final jsonMap = user.toJson();

        expect(jsonMap['id'], 2);
        expect(jsonMap['email'], 'medecin@example.com');
        expect(jsonMap['first_name'], 'Paul');
        expect(jsonMap['role'], 'medecin');
        expect(jsonMap['is_active'], true);
      },
    );
  });
}
