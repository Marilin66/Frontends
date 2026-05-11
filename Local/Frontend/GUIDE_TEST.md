# 📋 Guide de Test — E-Santé Bénin (Flutter)

> **Backend** : https://backend-production-fc8f.up.railway.app/api  
> **Note** : Le premier appel peut prendre ~30s (cold start Render).

---

## 1. 🔐 Authentification

| Action | Comment tester |
|--------|---------------|
| **Inscription** | Écran `/register` → Remplir email, mot de passe, rôle → Vérifier la redirection vers le dashboard du rôle |
| **Connexion** | Écran `/login` → Saisir identifiants → Vérifier la redirection automatique vers le bon dashboard (Patient/Médecin/Admin/Laborantin) |
| **Déconnexion** | Depuis n'importe quel profil/settings → Bouton "Déconnexion" → Dialog de confirmation → Retour à l'écran de connexion |
| **Session persistante** | Fermer et rouvrir l'app → L'utilisateur doit rester connecté (token stocké via FlutterSecureStorage) |
| **Token refresh** | Attendre l'expiration du token d'accès → L'app doit rafraîchir automatiquement via `/token/refresh/` |

---

## 2. 👤 Patient

| Fonctionnalité | Comment tester |
|----------------|---------------|
| **Dashboard** | Se connecter en tant que Patient → Vérifier l'affichage des statistiques et raccourcis |
| **Recherche médecins/hôpitaux** | Onglet Recherche → Vérifier la liste des hôpitaux et praticiens chargée depuis le backend |
| **Prise de RDV** | Rechercher un médecin → Voir les créneaux disponibles → Réserver un créneau |
| **Mes rendez-vous** | Onglet RDV → Vérifier la liste des rendez-vous passés et à venir |
| **Mes résultats** | Onglet Résultats → Vérifier la liste des résultats d'analyses |
| **Accès par code** | Bouton "Accéder via un code de laboratoire" → Saisir un code de référence → Vérifier l'affichage du résultat |
| **Chatbot IA** | Depuis le dashboard → Icône Chatbot → Poser une question santé → Vérifier la réponse de l'IA |
| **Messagerie** | Onglet Messages → Ouvrir une conversation → Envoyer un message |
| **Profil** | Onglet Profil → Vérifier les informations personnelles, email, rôle |
| **Logout** | Profil → Déconnexion → Confirmer → Retour login |

---

## 3. 🩺 Médecin

| Fonctionnalité | Comment tester |
|----------------|---------------|
| **Dashboard** | Se connecter en tant que Médecin → Statistiques (patients, RDV du jour) |
| **Agenda** | Onglet Agenda → Voir les rendez-vous planifiés |
| **Liste patients** | Onglet Patients → Vérifier la liste des patients |
| **Résultats patient** | Menu → "Résultats patient" → Voir les résultats partagés |
| **Messagerie** | Onglet Messages → Conversations avec patients |
| **Profil & Settings** | Onglet Profil → Infos, spécialité, hôpital |
| **Logout** | Profil → Déconnexion |

---

## 4. 🧪 Laborantin

| Fonctionnalité | Comment tester |
|----------------|---------------|
| **Dashboard** | Se connecter en tant que Laborantin → Statistiques (total dépôts, dépôts du jour, activités récentes) |
| **Ajouter un résultat** | Bouton "+" ou menu → Formulaire d'ajout (patient, type d'analyse, fichier) → Soumettre |
| **Liste des résultats** | Onglet Résultats → Voir tous les résultats déposés |
| **Profil** | Onglet Profil → Vérifier nom, hôpital, rôle, email |
| **Logout** | Profil → Déconnexion |

---

## 5. 🏥 Admin Hôpital

| Fonctionnalité | Comment tester |
|----------------|---------------|
| **Dashboard** | Se connecter en tant qu'Admin Hôpital → Stats de l'hôpital |
| **Gestion médecins** | Onglet Médecins → Liste des médecins affiliés → Import CSV possible |
| **Gestion services** | Onglet Services → Créer/modifier les services de l'hôpital |
| **Settings** | Onglet Settings → Modifier profil, notifications, déconnexion |
| **Logout** | Settings → Déconnexion avec confirmation |

---

## 6. 👑 Super Admin

| Fonctionnalité | Comment tester |
|----------------|---------------|
| **Dashboard** | Se connecter en tant que Super Admin → Stats globales (hôpitaux, patients, médecins, RDV) |
| **Gestion hôpitaux** | Onglet Hôpitaux → CRUD complet |
| **Gestion utilisateurs** | Onglet Users → Voir tous les utilisateurs par rôle |
| **Settings** | Onglet Settings → Préférences |
| **Logout** | Settings → Déconnexion |

---

## 7. 🌐 Pages Publiques (sans connexion)

| Page | Route | Comment tester |
|------|-------|---------------|
| **Onboarding** | `/onboarding` | Lancer l'app sans être connecté → Vérifier les 3 slides + animations |
| **Répertoire Santé** | `/hospitals` | Accessible depuis l'onboarding → Liste des hôpitaux et médecins |
| **Numéros d'urgence** | `/emergency` | Liste des numéros d'urgence au Bénin |
| **Conseils santé** | `/tips` | Articles de conseils santé |

---

## 8. 🔄 Tests de robustesse

| Scénario | Attendu |
|----------|---------|
| **Pas de réseau** | Message d'erreur clair, pas de crash |
| **Backend en cold start** | Spinner de chargement (timeout 30s), pas de timeout prématuré |
| **Réponse paginée vs liste** | Les données s'affichent correctement (parsing `results` ou liste directe) |
| **Token expiré** | Refresh automatique transparent pour l'utilisateur |
| **Pull-to-refresh** | Tirer vers le bas sur les listes → Recharge les données |

---

## 9. ✅ Checklist finale

- [ ] Toutes les connexions par rôle fonctionnent
- [ ] Le bouton Logout est présent pour tous les rôles
- [ ] Le chatbot répond aux questions
- [ ] L'accès par code fonctionne
- [ ] Le dashboard Laborantin affiche les bonnes stats
- [ ] Les données backend se chargent sans erreur
- [ ] `flutter analyze` → 0 issues
- [ ] Test sur appareil réel : ergonomie, transitions, réactivité
