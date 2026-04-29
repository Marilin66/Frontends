# E-Santé Bénin — Application Mobile (Flutter)

Application mobile multi-plateforme destinée aux patients, médecins, laborantins et administrateurs d'hôpitaux.

## Fonctionnalités Principales

- **Patients** : Recherche de médecins, prise de rendez-vous, messagerie et consultation de résultats d'analyses (BioTrack).
- **Médecins** : Gestion d'agenda, consultations numériques et suivi patient via chat.
- **Laborantins** : Enregistrement et dépôt sécurisé de résultats d'examens.
- **Administrateurs** : Gestion des agents (Médecins/Laborantins) et des services de l'établissement.

## Installation & Lancement

### Pré-requis
- Flutter SDK (dernière version stable recommandée)
- Un émulateur Android/iOS ou un appareil physique.

### Configuration
1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   flutter pub get
   ```
3. Configurez l'adresse de l'API dans `lib/core/constants/api_constants.dart` (si nécessaire).

### Exécution
```bash
flutter run
```

## Architecture

Le projet suit une architecture propre (Clean Architecture) découpée en fonctionnalités :
- `core/` : Thèmes, constantes, routage et utilitaires globaux.
- `features/` : Modules métier (auth, patient, medecin, admin_hopital, etc.) comprenant chacun leurs couches `data`, `domain` (si complexe) et `presentation`.

## État actuel

La plateforme est prête pour la démonstration finale.

### Comptes de Test (Mot de passe : `Esante2025!`)

| Rôle | Email |
|------|-------|
| **Super Admin** | `admin@esante-benin.com` |
| **Médecin** | `dr.kokou@esante-benin.com` |
| **Laborantin** | `lab.dossou@esante-benin.com` |
| **Patient** | `patient1@test.com` |

> [!TIP]
> Pour réinitialiser ou peupler la base de données avec ces comptes, utilisez la commande suivante dans le dossier `Backend` :
> ```bash
> python manage.py seed_demo --clean
> ```
