import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:esante_app/core/network/dio_client.dart';
import 'package:esante_app/core/constants/api_constants.dart';
import 'package:esante_app/features/medecin/data/datasources/medecin_remote_datasource.dart';
import 'package:esante_app/features/medecin/data/models/rendezvous_medecin_model.dart';

class MockDioClient extends Mock implements DioClient {}

void main() {
  late MockDioClient mockDioClient;
  late MedecinRemoteDatasource datasource;

  setUp(() {
    mockDioClient = MockDioClient();
    datasource = MedecinRemoteDatasource(mockDioClient);
  });

  group('MedecinRemoteDatasource', () {
    test(
      'getRendezvous retourne une liste de RendezVousMedecinModel',
      () async {
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
                  'statut': 'attente',
                  'motif': 'Douleurs abdominales',
                  'patient_nom_complet': 'Alice Doe',
                  'patient_telephone': '+229 60 00 00 00',
                },
              ],
            },
          ),
        );

        final result = await datasource.getRendezvous();

        expect(result, isA<List<RendezVousMedecinModel>>());
        expect(result.length, 1);
        expect(result.first.id, 1);
        expect(result.first.patientNom, '');
        verify(
          () =>
              mockDioClient.get(ApiConstants.rendezvous, queryParameters: null),
        ).called(1);
      },
    );
  });
}
