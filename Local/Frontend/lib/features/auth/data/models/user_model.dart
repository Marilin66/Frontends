class UserModel {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String telephone;
  final String? dateNaissance;
  final String sexe;
  final String role;
  final String adresse;
  final String? photo;
  final bool isActive;
  final bool isEmailVerified;
  final String dateJoined;
  final String? lastLogin;
  final int? hopital;
  final String? hopitalNom;
  final Map<String, dynamic>? patientProfile;
  final Map<String, dynamic>? medecinProfile;
  final Map<String, dynamic>? laborantinProfile;
  final List<int>? serviceIds;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.telephone,
    this.dateNaissance,
    required this.sexe,
    required this.role,
    this.adresse = '',
    this.photo,
    this.isActive = true,
    this.isEmailVerified = false,
    required this.dateJoined,
    this.lastLogin,
    this.hopital,
    this.hopitalNom,
    this.patientProfile,
    this.medecinProfile,
    this.laborantinProfile,
    this.serviceIds,
  });

  String get fullName => '$firstName $lastName';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] as int : int.tryParse(json['id'].toString()) ?? 0,
      email: json['email']?.toString() ?? '',
      firstName: json['first_name']?.toString() ?? '',
      lastName: json['last_name']?.toString() ?? '',
      telephone: json['telephone']?.toString() ?? '',
      dateNaissance: json['date_naissance']?.toString(),
      sexe: json['sexe']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      adresse: json['adresse']?.toString() ?? '',
      photo: json['photo']?.toString(),
      isActive: json['is_active'] as bool? ?? true,
      isEmailVerified: json['is_email_verified'] as bool? ?? false,
      dateJoined: json['date_joined']?.toString() ?? '',
      lastLogin: json['last_login']?.toString(),
      hopital: json['hopital'] is int ? json['hopital'] as int : int.tryParse(json['hopital']?.toString() ?? ''),
      hopitalNom: json['hopital_nom']?.toString(),
      patientProfile: json['patient_profile'] as Map<String, dynamic>?,
      medecinProfile: (json['numero_ordre'] != null || json['biographie'] != null)
          ? {
              'numero_ordre': json['numero_ordre'],
              'biographie': json['biographie'],
              'statut': json['statut'],
            }
          : json['medecin_profile'] as Map<String, dynamic>?,
      laborantinProfile: json['laboratoire'] != null ? {'laboratoire': json['laboratoire']} : json['laborantin_profile'] as Map<String, dynamic>?,
      serviceIds: (json['service_ids'] as List<dynamic>?)?.map((e) => e as int).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'telephone': telephone,
      'date_naissance': dateNaissance,
      'sexe': sexe,
      'role': role,
      'adresse': adresse,
      'photo': photo,
      'is_active': isActive,
      'is_email_verified': isEmailVerified,
      'date_joined': dateJoined,
      'last_login': lastLogin,
      'hopital': hopital,
      'hopital_nom': hopitalNom,
      'patient_profile': patientProfile,
      'medecin_profile': medecinProfile,
      'laborantin_profile': laborantinProfile,
      'service_ids': serviceIds,
    };
  }
}
