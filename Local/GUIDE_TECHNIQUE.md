# 📋 Hopitel — Guide Technique Complet

Plateforme de santé intelligente — Gestion hospitalière, messagerie et IA.
Frontend Flutter + Backend Django REST Framework, connectés via API REST et WebSocket temps réel.

---

## 1. Stack Technique

### Backend
| Élément | Technologie |
|---------|-------------|
| Langage | Python 3 |
| Framework | Django 4.2 + Django REST Framework 3.15 |
| Auth | JWT (SimpleJWT) — Access 2h, Refresh 7j, rotation + blacklist |
| WebSocket | Django Channels 4.1 + Daphne 4.1 |
| Base de données | PostgreSQL (hopitel_db) |
| CORS | django-cors-headers |
| Timezone | Africa/Porto-Novo |

### Frontend
| Élément | Technologie |
|---------|-------------|
| Langage | Dart |
| Framework | Flutter SDK ^3.11.1 |
| State | Riverpod (Notifier pattern) |
| HTTP | Dio (timeout 15s, interceptor JWT auto-refresh) |
| WebSocket | web_socket_channel 3.0 |
| Routing | GoRouter (ShellRoute + redirection par rôle) |
| Stockage | FlutterSecureStorage |

---

## 2. Architecture

### Backend — Modules Hopitel

| App | Rôle | Endpoints |
|-----|------|-----------|
| accounts | Utilisateurs, profils Patient/Médecin/Laborantin | /api/accounts/ |
| hopitaux | Hôpitaux, services, demandes, statistiques | /api/hopitaux/, /api/services/ |
| rendezvous | Disponibilités, RDV, consultations | /api/rendezvous/, /api/disponibilites/ |
| resultats | Résultats d'analyses médicales | /api/resultats/ |
| messagerie | Conversations et messages (REST + WebSocket) | /api/conversations/, /api/messages/, ws/chat/ |
| notifications | Notifications utilisateur | /api/notifications/ |
| Chatbot | Assistant IA (RAG & Proxy OpenAI/Groq) | /api/chatbot/ask/ |

### Frontend — Structure Shell (Navigaton Persistante)

| Shell Route | Rôle | Routes Intégrées |
|---------|------|--------|
| PatientShell | Patient | Accueil, Recherche, RDV, Résultats, Messagerie, Profil |
| MedecinShell | Médecin | Accueil, Agenda, Patients, Messagerie, Profil |
| AdminHopitalShell | Admin Hôpital | Accueil, Médecins, Services, Messagerie, Paramètres |
| SuperAdminShell | Admin Général | Accueil, Hôpitaux, Utilisateurs, Messagerie, Stats |
| LaborantinShell | Laborantin | Accueil, En cours, Clôturées, Messagerie, Profil |

### Structure des dossiers

```
Application/
├── Backend/
│   └── Projet_soutenance/
│       ├── accounts/          # Gestion utilisateurs
│       ├── hopitaux/          # Hôpitaux et services
│       ├── rendezvous/        # RDV et consultations
│       ├── resultats/         # Résultats médicaux
│       ├── messagerie/        # Messages + WebSocket
│       ├── notifications/     # Notifications
│       ├── Chatbot/           # Chatbot IA
│       ├── backend_soutenance/# Config Django (settings, urls, asgi)
│       ├── manage.py
│       └── requirements.txt
│
└── Frontend/
    └── Frontend/
        ├── lib/
        │   ├── core/
        │   │   ├── constants/     # ApiConstants, AppConstants
        │   │   ├── network/       # DioClient, WebSocketService, ApiException
        │   │   ├── routing/       # GoRouter
        │   │   ├── theme/         # AppColors, AppTheme
        │   │   ├── utils/         # Helpers, Validators
        │   │   └── widgets/       # ResponsiveAuthLayout, ResponsiveShellLayout
        │   ├── features/
        │   │   ├── auth/
        │   │   ├── patient/
        │   │   ├── medecin/
        │   │   ├── admin_hopital/
        │   │   ├── super_admin/
        │   │   ├── messagerie/
        │   │   ├── chat/
        │   │   └── notifications/
        │   └── main.dart
        ├── test/               # Tests unitaires
        └── pubspec.yaml
```

---

## 3. Rôles Utilisateur

| Rôle | Code | Accès |
|------|------|-------|
| Patient | patient | RDV, résultats, messagerie, chatbot |
| Médecin | medecin | Agenda, patients, consultations, messagerie |
| Admin Hôpital | admin_hopital | Médecins, services, stats de l'hôpital |
| Admin Général | admin_general | Tous les hôpitaux, utilisateurs, services |
| Laborantin | laborantin | Résultats d'analyses (backend seulement) |

---

## 4. Authentification JWT

### Flux de connexion

```
1. POST /api/token/ {email, password}
2. → Retour: {access, refresh}
3. Stockage dans FlutterSecureStorage
4. GET /api/accounts/users/me/ (Header: Bearer <access>)
5. → Profil complet → Redirection selon le rôle
```

### Refresh automatique

```
1. Requête retourne 401 (token expiré)
2. Interceptor Dio envoie POST /api/token/refresh/ {refresh}
3. Nouveaux tokens stockés
4. Requête originale rejouée automatiquement
```

---

## 5. Messagerie Temps Réel (WebSocket)

### Architecture

```
Flutter (ChatScreen)
    │
    ├── REST (Dio) : chargement initial des messages
    │   GET /api/messages/?consultation=<id>
    │
    └── WebSocket : messages en temps réel
        ws://host:8000/ws/chat/<consultation_id>/?token=<jwt>
```

### Flux WebSocket

```
1. Flutter se connecte à ws://host:8000/ws/chat/{id}/?token=JWT
2. Le JWTAuthMiddleware valide le token
3. Le ChatConsumer vérifie que l'utilisateur est participant
4. Envoi : {"contenu": "Bonjour docteur"}
5. Le consumer sauvegarde en BDD + broadcast au groupe
6. Tous les participants reçoivent le message en temps réel
7. Fallback REST si le WebSocket est indisponible
```

---

## 6. Configuration Réseau

### URLs selon la plateforme

| Plateforme | REST Base URL | WebSocket URL |
|------------|---------------|---------------|
| Flutter Web | http://localhost:8000/api | ws://localhost:8000/ws |
| Android Emulator | http://10.0.2.2:8000/api | ws://10.0.2.2:8000/ws |
| Appareil physique | http://IP_DU_PC:8000/api | ws://IP_DU_PC:8000/ws |

---

## 7. Installation et Lancement

### Prérequis

- Python 3.10+
- PostgreSQL 14+
- Flutter SDK 3.11+
- Un émulateur Android ou Chrome (pour Flutter Web)

### Backend

```powershell
cd Backend/Projet_soutenance

# Créer et activer l'environnement virtuel
python -m venv env
.\env\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer la base de données
# (créer la BDD "esante_benin" dans PostgreSQL)
# (configurer le .env avec DB_NAME, DB_USER, DB_PASSWORD)

# Appliquer les migrations
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser

# Lancer le serveur (Daphne pour HTTP + WebSocket)
daphne -b 0.0.0.0 -p 8000 backend_soutenance.asgi:application

# OU pour le dev simple (sans WebSocket)
python manage.py runserver 0.0.0.0:8000
```

### Frontend 

```powershell
cd Frontend/Frontend

# Installer les dépendances
flutter pub get

# Lancer sur Chrome (Web)
flutter run -d chrome --web-port=8080

# Lancer sur l'émulateur Android
flutter run -d emulator

# Lancer sur un appareil physique
# (modifier baseUrl dans api_constants.dart avec l'IP du PC)
flutter run -d <device_id>
```

---

## 8. Tester la Connexion

### Étape 1 — Vérifier que le backend répond

```powershell
# Le serveur tourne ?
curl http://localhost:8000/api/hopitaux/

# Login JWT
curl -X POST http://localhost:8000/api/token/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"votre@email.com\", \"password\": \"motdepasse\"}"

# Résultat attendu : {"access": "eyJ...", "refresh": "eyJ..."}

# Profil utilisateur
curl http://localhost:8000/api/accounts/users/me/ ^
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

### Étape 2 — Tester dans l'app Flutter

1. Ouvrir l'app → SplashScreen → LoginScreen
2. Se connecter avec le superuser
3. Vérifier dans le terminal backend :
   - `POST /api/token/ → 200`
   - `GET /api/accounts/users/me/ → 200`
4. Redirection vers le dashboard du rôle

### Étape 3 — Tester le WebSocket

1. Créer un RDV entre un patient et un médecin
2. Confirmer + terminer le RDV (crée une consultation)
3. Ouvrir la messagerie → ouvrir la conversation
4. Les messages s'envoient en temps réel via WebSocket

---

## 9. Résolution des Problèmes

| Problème | Cause | Solution |
|----------|-------|----------|
| Connection refused | Backend pas démarré | `daphne -b 0.0.0.0 -p 8000 backend_soutenance.asgi:application` |
| CORS error (web) | Origin non autorisé | Vérifié : localhost:8080 est dans CORS_ALLOWED_ORIGINS |
| 401 sur login | Credentials incorrects ou user inactif | Vérifier email/password, vérifier is_active=True |
| 401 sur /users/me/ | Token expiré | Le DioClient refresh automatiquement |
| Timeout sur émulateur | Mauvaise IP | Vérifier que 10.0.2.2 est utilisé |
| Timeout sur appareil réel | IP incorrecte ou pare-feu | Utiliser l'IP LAN, désactiver le pare-feu Windows |
| WebSocket ne connecte pas | Daphne pas utilisé | Utiliser `daphne` au lieu de `runserver` |
| flutter pub get échoue | SDK pas à jour | `flutter upgrade` |
| Migration error | PostgreSQL pas démarré | Démarrer le service PostgreSQL |

---

## 10. Endpoints API Complets

### Authentification
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/token/ | Login (email + password → tokens) |
| POST | /api/token/refresh/ | Refresh token |

### Comptes
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/accounts/register/ | Inscription patient |
| GET | /api/accounts/verify-email/{token}/ | Vérification email |
| GET/PATCH | /api/accounts/users/me/ | Profil connecté |
| GET/POST | /api/accounts/medecins/ | Liste/création médecins |
| GET/PUT/DELETE | /api/accounts/medecins/{id}/ | Détail médecin |
| POST | /api/accounts/medecins/{id}/desactiver/ | Désactiver médecin |
| POST | /api/accounts/medecins/import/ | Import CSV médecins |
| GET | /api/accounts/medecins/import-template/ | Template CSV |
| GET/POST | /api/accounts/laborantins/ | Liste/création laborantins |
| GET | /api/accounts/patients/ | Liste patients |
| GET/POST | /api/accounts/admin-hopitaux/ | Liste/création admins hôpitaux |

### Hôpitaux
| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | /api/hopitaux/ | Liste/création hôpitaux |
| GET/PUT/DELETE | /api/hopitaux/{id}/ | Détail hôpital |
| GET | /api/hopitaux/mes-services/ | Services de mon hôpital |
| GET | /api/hopitaux/statistiques/ | Stats de mon hôpital |
| GET/POST | /api/services/ | Services globaux |
| GET | /api/hopitaux/{id}/services/ | Services d'un hôpital |
| GET | /api/demandes/ | Liste demandes de service |
| POST | /api/hopitaux/{id}/demandes/ | Créer une demande |
| POST | /api/demandes/{id}/valider/ | Valider une demande |
| POST | /api/demandes/{id}/refuser/ | Refuser une demande |

### Rendez-vous
| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | /api/disponibilites/ | Disponibilités |
| GET | /api/medecins/{id}/creneaux/ | Créneaux libres |
| GET/POST | /api/rendezvous/ | Liste/création RDV |
| POST | /api/rendezvous/{id}/confirmer/ | Confirmer RDV |
| POST | /api/rendezvous/{id}/refuser/ | Refuser RDV |
| POST | /api/rendezvous/{id}/annuler/ | Annuler RDV |
| POST | /api/rendezvous/{id}/terminer/ | Terminer RDV |
| GET | /api/consultations/ | Liste consultations |
| GET/PATCH | /api/consultations/{id}/ | Détail consultation |

### Messagerie
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/conversations/ | Liste conversations |
| GET/POST | /api/messages/ | Messages (filtrer par ?consultation=) |
| POST | /api/messages/{id}/mark-read/ | Marquer lu |
| WebSocket | ws://host:8000/ws/chat/{consultation_id}/?token=JWT | Chat temps réel |

### Résultats
| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | /api/resultats/ | Liste/création résultats |
| GET | /api/resultats/{id}/telecharger/ | Télécharger fichier |
| POST | /api/resultats/{id}/partager/ | Partager avec médecin |

### Notifications
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/notifications/ | Liste notifications |
| POST | /api/notifications/{id}/mark-read/ | Marquer lue |
| POST | /api/notifications/mark-all-read/ | Tout marquer lu |

### Chatbot
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/chatbot/ask/ | Poser une question au chatbot |

---

## 11. Notes de Sécurité (Production)

- Changer `SECRET_KEY` dans le .env
- Mettre `DEBUG = False`
- Restreindre `ALLOWED_HOSTS` (retirer `*`)
- Mettre `CORS_ALLOW_ALL_ORIGINS = False`
- Configurer un vrai serveur email SMTP
- Utiliser Redis pour `CHANNEL_LAYERS` au lieu de InMemoryChannelLayer
- Configurer HTTPS (SSL/TLS)
- Ne jamais exposer le .env
