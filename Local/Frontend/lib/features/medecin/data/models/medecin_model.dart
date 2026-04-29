class MedecinModel {
  final int userId;
  final String email;
  final String firstName;
  final String lastName;
  final String telephone;
  final String sexe;
  final int? hopital;
  final String? hopitalNom;
  final String? photo;
  final String numeroOrdre;
  final String biographie;
  final String statut;
  final bool isActive;

  MedecinModel({
    required this.userId,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.telephone,
    required this.sexe,
    this.hopital,
    this.hopitalNom,
    this.photo,
    required this.numeroOrdre,
    required this.biographie,
    required this.statut,
    required this.isActive,
  });

  String get fullName => '$firstName $lastName';

  factory MedecinModel.fromJson(Map<String, dynamic> json) {
    return MedecinModel(
      userId: json['user_id'] as int,
      email: json['email'] as String? ?? '',
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      telephone: json['telephone'] as String? ?? '',
      sexe: json['sexe'] as String? ?? '',
      hopital: json['hopital'] as int?,
      hopitalNom: json['hopital_nom'] as String?,
      photo: json['photo'] as String?,
      numeroOrdre: json['numero_ordre'] as String? ?? '',
      biographie: json['biographie'] as String? ?? '',
      statut: json['statut'] as String? ?? 'actif',
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'telephone': telephone,
      'sexe': sexe,
      'hopital': hopital,
      'hopital_nom': hopitalNom,
      'photo': photo,
      'numero_ordre': numeroOrdre,
      'biographie': biographie,
      'statut': statut,
      'is_active': isActive,
    };
  }

  MedecinModel copyWith({
    int? userId,
    String? email,
    String? firstName,
    String? lastName,
    String? telephone,
    String? sexe,
    int? hopital,
    String? hopitalNom,
    String? photo,
    String? numeroOrdre,
    String? biographie,
    String? statut,
    bool? isActive,
  }) {
    return MedecinModel(
      userId: userId ?? this.userId,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      telephone: telephone ?? this.telephone,
      sexe: sexe ?? this.sexe,
      hopital: hopital ?? this.hopital,
      hopitalNom: hopitalNom ?? this.hopitalNom,
      photo: photo ?? this.photo,
      numeroOrdre: numeroOrdre ?? this.numeroOrdre,
      biographie: biographie ?? this.biographie,
      statut: statut ?? this.statut,
      isActive: isActive ?? this.isActive,
    );
  }
}
