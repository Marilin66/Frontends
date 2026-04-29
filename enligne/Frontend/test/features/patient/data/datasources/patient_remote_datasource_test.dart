import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:esante_app/core/network/dio_client.dart';
import 'package:esante_app/core/constants/api_constants.dart';
import 'package:esante_app/features/patient/data/datasources/patient_remote_datasource.dart';
import 'package:esante_app/features/patient/data/models/rendezvous_model.dart';
import 'package:esante_app/features/patient/data/models/resultat_model.dart';

class MockDioClient extends Mock implements DioClient {}

void main() {
  late MockDioClient mockDioClient;
  late PatientRemoteDatasource datasource;

  setUp(() {
    mockDioClient = MockDioClient();
    datasource = PatientRemoteDatasource(mockDioClient);
    registerFallbackValue(Uri.parse('http://localhost'));
  });

  group('PatientRemoteDatasource', () {
    test('getRendezvous retourne une liste de RendezVousModel', () async {
      when(
        () => mockDioClient.get(
          ApiConstants.rendezvous,
          queryParameters: any(named: 'queryParameters'),
        ),
      ).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: ApiConstants.rendezvous),
          statusCode: 200,
          data: {
            'results': [
              {
                'id': 1,
                'patient': 1,
                'medecin': 2,
                'date_heure': '2023-10-10T10:00:00Z',
                'statut': 'confirme',
                'motif': 'Consultation generale',
                'medecin_nom_complet': 'Dr. Dupont',
              },
            ],
          },
        ),
      );

      final result = await datasource.getRendezvous();

      expect(result, isA<List<RendezVousModel>>());
      expect(result.length, 1);
      expect(result.first.id, 1);
      expect(result.first.medecinNom, '');
      verify(
        () => mockDioClient.get(ApiConstants.rendezvous, queryParameters: null),
      ).called(1);
    });

    test('getResultats retourne une liste de ResultatModel', () async {
      when(() => mockDioClient.get(ApiConstants.resultats)).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: ApiConstants.resultats),
          statusCode: 200,
          data: {
            'results': [
              {
                'id': 1,
                'patient': 1,
                'medecin': 2,
                'titre': 'Radiographie',
                'description': 'RAS',
                'fichier': 'http://fichier.pdf',
                'date_creation': '2023-10-10T11:00:00Z',
                'medecin_nom_complet': 'Dr. Dupont',
              },
            ],
          },
        ),
      );

      final result = await datasource.getResultats();

      expect(result, isA<List<ResultatModel>>());
      expect(result.length, 1);
      expect(result.first.titre, 'Radiographie');
      verify(() => mockDioClient.get(ApiConstants.resultats)).called(1);
    });
  });
}
