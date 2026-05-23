class NotificationModel {
  final int id;
  final String type;
  final String typeDisplay;
  final String message;
  final bool lu;
  final String dateEnvoi;
  final String lien;

  NotificationModel({
    required this.id,
    required this.type,
    this.typeDisplay = '',
    required this.message,
    this.lu = false,
    this.dateEnvoi = '',
    this.lien = '',
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as int? ?? 0,
      type: json['type'] as String? ?? '',
      typeDisplay: json['type_display'] as String? ?? '',
      message: json['message'] as String? ?? '',
      lu: json['lu'] as bool? ?? false,
      dateEnvoi: json['date_envoi'] as String? ?? '',
      lien: json['lien'] as String? ?? '',
    );
  }

  NotificationModel copyWith({bool? lu}) {
    return NotificationModel(
      id: id,
      type: type,
      typeDisplay: typeDisplay,
      message: message,
      lu: lu ?? this.lu,
      dateEnvoi: dateEnvoi,
      lien: lien,
    );
  }
}
