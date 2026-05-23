import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/hopital_search_model.dart';
import '../models/medecin_search_model.dart';

class PatientLocalDatasource {
  static const String _kHopitauxCache = 'hopitaux_cache';
  static const String _kMedecinsCache = 'medecins_cache';

  Future<void> cacheHopitaux(List<HopitalSearchModel> hopitaux) async {
    final prefs = await SharedPreferences.getInstance();
    final data = hopitaux.map((e) => e.toJson()).toList();
    await prefs.setString(_kHopitauxCache, jsonEncode(data));
  }

  Future<List<HopitalSearchModel>> getCachedHopitaux() async {
    final prefs = await SharedPreferences.getInstance();
    final dataString = prefs.getString(_kHopitauxCache);
    if (dataString == null) {
      // Default offline fallback data for demo
      return [
        HopitalSearchModel(
          id: 1,
          nom: 'CNHU-HKM Cotonou',
          adresse: 'Quartier Haie Vive, Cotonou',
          ville: 'Cotonou',
          telephone: '+229 21 30 17 19',
          email: 'contact@cnhu.bj',
          latitude: 6.3667,
          longitude: 2.4333,
          dateCreation: '2026-01-01T00:00:00Z',
          services: [],
        ),
        HopitalSearchModel(
          id: 2,
          nom: 'Hôpital Mère-Enfant Lagune',
          adresse: 'Boulevard Saint-Michel, Cotonou',
          ville: 'Cotonou',
          telephone: '+229 21 32 15 55',
          email: 'homel@sante.bj',
          latitude: 6.3715,
          longitude: 2.4210,
          dateCreation: '2026-01-01T00:00:00Z',
          services: [],
        ),
      ];
    }
    
    final List<dynamic> data = jsonDecode(dataString);
    return data.map((e) => HopitalSearchModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> cacheMedecins(List<MedecinSearchModel> medecins) async {
    final prefs = await SharedPreferences.getInstance();
    final data = medecins.map((e) => e.toJson()).toList();
    await prefs.setString(_kMedecinsCache, jsonEncode(data));
  }

  Future<List<MedecinSearchModel>> getCachedMedecins() async {
    final prefs = await SharedPreferences.getInstance();
    final dataString = prefs.getString(_kMedecinsCache);
    if (dataString == null) {
      // Default offline fallback data for demo
      return [
        MedecinSearchModel(
          id: 1,
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'j.dupont@cnhu.bj',
          telephone: '+229 97 00 00 01',
          hopital: 1,
          hopitalNom: 'CNHU-HKM Cotonou',
          medecinProfile: MedecinProfileModel(biographie: 'Cardiologue expérimenté', numeroOrdre: '12345'),
          services: [],
        ),
        MedecinSearchModel(
          id: 2,
          firstName: 'Marie',
          lastName: 'Mensah',
          email: 'm.mensah@homel.bj',
          telephone: '+229 97 00 00 02',
          hopital: 2,
          hopitalNom: 'Hôpital Mère-Enfant Lagune',
          medecinProfile: MedecinProfileModel(biographie: 'Pédiatre', numeroOrdre: '54321'),
          services: [],
        ),
      ];
    }
    
    final List<dynamic> data = jsonDecode(dataString);
    return data.map((e) => MedecinSearchModel.fromJson(e as Map<String, dynamic>)).toList();
  }
}
