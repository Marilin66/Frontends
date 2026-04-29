# 📋 Point Complet des Fonctionnalités — Frontend Mobile & Web
> **Application** : eSanté App — Plateforme de Santé Multi-Rôles  
> **Framework** : Flutter (Dart) — Compatible Mobile & Web  
> **Architecture** : Feature-first, Riverpod (état), GoRouter (navigation)  
> **Date de l'audit** : Avril 2026

---

## Structure Globale des Rôles

| Rôle | Shell / Navigation | Couleur Thème |
|---|---|---|
| **Patient** | `patient_shell.dart` | `AppColors.primary` (Bleu) |
| **Médecin** | `medecin_shell.dart` | `AppColors.medecin` |
| **Laborantin** | `laborantin_shell.dart` | `AppColors.primary` |
| **Admin Hôpital** | `admin_hopital_shell.dart` | `AppColors.adminHopital` |
| **Super Admin** | `super_admin_shell.dart` | `AppColors.superAdmin` |

---

## 1. 🔐 Authentification (`features/auth`)

### Écrans (5 fichiers)
| Fichier | Fonctionnalité |
|---|---|
| `splash_screen.dart` | Écran de démarrage — vérifie la session |
| `login_screen.dart` | Formulaire de connexion + redirection automatique selon le rôle |
| `register_screen.dart` | Inscription multi-rôles avec validation |
| `request_password_reset_screen.dart` | Demande de réinitialisation par email |
| `reset_password_confirm_screen.dart` | Saisie du nouveau mot de passe via token |

### Fonctionnalités Clés
- Connexion JWT + stockage sécurisé du token
- Redirection intelligente : après login, l'utilisateur est envoyé sur son dashboard selon son rôle
- Formulaires avec validation côté client

---

## 2. 🤕 Espace Patient (`features/patient`)

### Écrans (17 fichiers)
| Fichier | Fonctionnalité |
|---|---|
| `patient_shell.dart` | Navigation principale (5 onglets : Accueil, Recherche, RDV, Messages, Profil) |
| `patient_home_screen.dart` | Dashboard : accès rapides, section "Hôpitaux proches", guide "Comment ça marche", accès Chatbot IA |
| `patient_search_screen.dart` | Recherche de médecins, hôpitaux, services avec filtres |
| `patient_nearby_hospitals_screen.dart` | Carte et liste des hôpitaux à proximité (géolocalisation) |
| `hopital_detail_screen.dart` | Détail d'un hôpital : infos, services associés |
| `patient_hospital_details_screen.dart` | Vue détaillée avancée d'un hôpital depuis la liste |
| `service_detail_screen.dart` | Détail d'un service médical : liste des médecins du service |
| `rendezvous_booking_screen.dart` | **Prise de RDV** : sélection créneau + formulaire de confirmation |
| `patient_appointments_screen.dart` | Liste de MES rendez-vous (à venir / passés), possibilité d'annulation |
| `patient_result_code_screen.dart` | Saisie du code secret reçu pour consulter un résultat |
| `patient_results_screen.dart` | Visualisation complète des résultats d'analyses médicales |
| `patient_messages_screen.dart` | Accès à la messagerie patient |
| `patient_profile_screen.dart` | Profil complet + accès aux sous-paramètres |
| `patient_change_password_screen.dart` | Changement de mot de passe sécurisé |
| `patient_language_screen.dart` | Sélection de la langue de l'application |
| `patient_notification_settings_screen.dart` | Gestion des préférences de notifications |
| `patient_about_screen.dart` | À propos de l'application : version, mentions légales, contact |

### Workflow Prise de RDV (Flux Hiérarchique)
```
Accueil / Recherche
    └── Liste Hôpitaux (patient_nearby_hospitals_screen)
            └── Détail Hôpital (hopital_detail_screen)
                    └── Détail Service (service_detail_screen)
                            └── Réservation RDV (rendezvous_booking_screen)
```

---

## 3. 👨‍⚕️ Espace Médecin (`features/medecin`)

### Écrans (9 fichiers)
| Fichier | Fonctionnalité |
|---|---|
| `medecin_shell.dart` | Navigation (5 onglets : Accueil, Agenda, Patients, Messages, Paramètres) |
| `medecin_home_screen.dart` | Dashboard : RDV du jour, statistiques rapides, raccourcis |
| `medecin_agenda_screen.dart` | **Agenda complet** : calendrier hebdomadaire, gestion des créneaux, consultation des détails RDV |
| `medecin_patients_screen.dart` | Liste des patients suivis avec accès aux dossiers |
| `medecin_resultat_patient_screen.dart` | Vue d'un résultat pour un patient spécifique |
| `medecin_messages_screen.dart` | Messagerie professionnelle |
| `medecin_profile_screen.dart` | Profil pro : spécialité, biographie, photo |
| `medecin_change_password_screen.dart` | Changement de mot de passe |
| `medecin_about_screen.dart` | À propos |

---

## 4. 🔬 Espace Laborantin (`features/laborantin`)

### Écrans (7 fichiers)
| Fichier | Fonctionnalité |
|---|---|
| `laborantin_shell.dart` | Navigation (4 onglets : Dashboard, En cours, Clôturées, Profil) |
| `laborantin_dashboard_screen.dart` | KPI : analyses en cours, clôturées, délai moyen |
| `laborantin_pending_analyses_screen.dart` | Liste des demandes d'analyses **à traiter** |
| `laborantin_finished_analyses_screen.dart` | Historique des analyses **terminées** |
| `laborantin_profile_screen.dart` | Profil : laboratoire assigné, informations personnelles |
| `laborantin_change_password_screen.dart` | Changement de mot de passe |
| `laborantin_about_screen.dart` | À propos |

### Widgets Spécialisés (`features/laborantin/presentation/widgets`)
| Fichier | Contenu |
|---|---|
| `laborantin_forms.dart` | Formulaire de saisie de résultats (champs types, valeurs, unités) + envoi de code patient |
| `laborantin_analysis_widgets.dart` | Cartes et composants d'affichage pour les analyses |

---

## 5. 🏥 Espace Admin Hôpital (`features/admin_hopital`)

### Écrans (9 fichiers)
| Fichier | Fonctionnalité |
|---|---|
| `admin_hopital_shell.dart` | Navigation (6 onglets : Accueil, Médecins, Laborantins, Services, Messages, Paramètres) |
| `admin_hopital_home_screen.dart` | Dashboard de l'établissement : stats, alertes |
| `admin_hopital_medecins_screen.dart` | CRUD **Médecins** : liste, ajout, modification, suspension |
| `admin_hopital_laborantins_screen.dart` | CRUD **Laborantins** : liste, ajout, modification, suspension |
| `admin_hopital_services_screen.dart` | CRUD **Services médicaux** : création/édition des services de l'hôpital |
| `admin_hopital_messages_screen.dart` | Messagerie interne de l'établissement |
| `admin_hopital_settings_screen.dart` | Paramètres de l'hôpital (infos, horaires, etc.) |
| `admin_hopital_change_password_screen.dart` | Changement de mot de passe |
| `admin_hopital_about_screen.dart` | À propos |

---

## 6. 👑 Espace Super Admin (`features/super_admin`)

### Écrans (9 fichiers)
| Fichier | Fonctionnalité |
|---|---|
| `super_admin_shell.dart` | Navigation (5 onglets : Accueil, Hôpitaux, Utilisateurs, Statistiques, Paramètres) |
| `super_admin_home_screen.dart` | Dashboard global : KPIs plateformes, dernières activités |
| `super_admin_hopitaux_screen.dart` | CRUD **Hôpitaux** : liste complète, ajout, suspension |
| `super_admin_hopital_detail_screen.dart` | Vue détaillée d'un hôpital + stats, adminstrateurs |
| `super_admin_users_screen.dart` | Vue globale de **tous les utilisateurs** (filtres par rôle, recherche) |
| `super_admin_stats_screen.dart` | **Statistiques & Analytics** : graphiques, RDV, résultats, activité |
| `super_admin_settings_screen.dart` | Paramètres système globaux |
| `super_admin_change_password_screen.dart` | Changement de mot de passe |
| `super_admin_about_screen.dart` | À propos |

---

## 7. 💬 Messagerie & Chat (`features/messagerie`, `features/chat`)

| Module | Fichiers | Fonctionnalité |
|---|---|---|
| **Messagerie** | `conversation_list_screen.dart` | Liste des conversations actives avec aperçu |
| **Messagerie** | `chat_screen.dart` *(stub)* | Écran de chat (à développer) |
| **Chat Temps Réel** | `chat_screen.dart` | Interface de messages en temps réel |

---

## 8. 🤖 Chatbot IA (`features/chatbot`)

| Fichier | Fonctionnalité |
|---|---|
| `patient_chatbot_screen.dart` | Assistant IA : triage des symptômes, orientation vers le bon service, FAQ santé |

---

## 9. 🔔 Notifications (`features/notifications`)

| Fichier | Fonctionnalité |
|---|---|
| `notification_screen.dart` | Centre de notifications : rappels de RDV, résultats disponibles, annonces |

---

## 10. 🌐 Écrans Transversaux (`features/core`)

| Fichier | Fonctionnalité |
|---|---|
| `onboarding_screen.dart` | Guide "Comment ça marche" pour les nouveaux patients |
| `edit_profile_screen.dart` | Modification du profil **multi-rôle** (Stepper 2-3 étapes selon rôle : Infos Perso, Médicales, Urgence) |
| `emergency_numbers_screen.dart` | Numéros d'urgence nationaux |
| `health_tips_screen.dart` | Conseils santé et prévention |
| `public_hospital_search_screen.dart` | Recherche publique d'hôpitaux (sans connexion) |
| `legal/legal_mentions_screen.dart` | Mentions légales |
| `legal/privacy_policy_screen.dart` | Politique de confidentialité |
| `legal/terms_of_use_screen.dart` | Conditions générales d'utilisation |

---

## 11. 🎨 Design System & Widgets Core (`core/widgets`)

| Widget | Rôle |
|---|---|
| `AnimatedTap` | Effet de pression (scale) sur les éléments interactifs |
| `FluidCard` | Carte avec glassmorphism, ombre douce, et tap animé |
| `ResponsiveShellLayout` | Layout adaptatif : `NavigationBar` (mobile) / `NavigationRail` (tablette) / Menu Top (web) |
| `ResponsiveAuthLayout` | Mise en page split pour les écrans auth sur web |
| `UniversalBackButton` | Bouton retour intelligent (pop ou go selon le contexte) |
| `PremiumLoadingView` | Vue de chargement avec shimmer animé |
| `PremiumErrorView` | Vue d'erreur avec action de retry |
| `ShimmerLoading` | Squelettes de chargement pour les listes |
| `SafePopScope` | Confirmation avant de quitter si des données sont modifiées |
| `GlobalAiBubble` | Bulle flottante d'accès rapide au Chatbot IA |
| `BrandLogo` | Logo de l'application réutilisable |

---

## 12. ⚠️ État Actuel & Points d'Attention

> [!IMPORTANT]
> Les corrections suivantes ont été appliquées lors de cette session :
> - **`withValues(alpha: x)` → `withOpacity(x)`** : Migration complète sur **40+ fichiers** (compatibilité SDK Flutter actuel).
> - **`const UniversalBackButton()`** : Suppression du `const` invalide dans tous les écrans.
> - **Switch sans `break`** : Correction des méthodes `_onTap()` dans tous les shells de navigation.

> [!WARNING]
> **Fonctionnalités partiellement implémentées ou stubs :**
> - `messagerie/chat_screen.dart` : Fichier stub (270 octets) — interface de chat non encore développée.
> - `medecin_messages_screen.dart` : Messagerie médecin basique (2 Ko).
> - `patient_messages_screen.dart` : Stub de la messagerie patient (2 Ko).

> [!NOTE]
> **Fonctionnalités à valider avec le backend :**
> - Prise de RDV : vérifier les endpoints `POST /rendezvous/`.
> - Résultats patient : vérifier la validation du code secret.
> - Chatbot IA : vérifier l'intégration API (clé, modèle utilisé).
> - Notifications push : vérifier la configuration FCM/APNs.
