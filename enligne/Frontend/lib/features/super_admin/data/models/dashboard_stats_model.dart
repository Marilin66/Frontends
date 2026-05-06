class DashboardStatsModel {
  final int totalHopitaux;
  final int totalMedecins;
  final int totalPatients;
  final int totalRendezvous;
  final int rdvAujourdhui;
  final int rdvSemaine;

  DashboardStatsModel({
    required this.totalHopitaux,
    required this.totalMedecins,
    required this.totalPatients,
    required this.totalRendezvous,
    required this.rdvAujourdhui,
    required this.rdvSemaine,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      totalHopitaux:  json['total_hopitaux']  as int? ?? 0,
      totalMedecins:  json['total_medecins']  as int? ?? 0,
      totalPatients:  json['total_patients']  as int? ?? 0,
      // Le backend envoie 'total_rdv', pas 'total_rendezvous'
      totalRendezvous: (json['total_rdv'] ?? json['total_rendezvous']) as int? ?? 0,
      rdvAujourdhui:  json['rdv_aujourdhui']  as int? ?? 0,
      rdvSemaine:     json['rdv_semaine']     as int? ?? 0,
    );
  }
}
