

---

# ANALYSE COMPLÈTE — FRONTEND REACT HOPITEL
## Document de référence pour reconstruction mobile Flutter

---

## 1. INFORMATIONS GÉNÉRALES

**Application** : Hopitel — Plateforme de santé numérique (Bénin)  
**Backend** : `https://backend-soutenance-1et0.onrender.com/api`  
**Auth** : JWT (Bearer token) — SimpleJWT Django  
**Stack** : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router v6  
**Stockage local** : `localStorage` → clés `auth_token`, `refresh_token`, `user`

---

## 2. AUTHENTIFICATION

### Flux de connexion
```
POST /token/
Body: { email, password }
Response: { access: string, refresh: string }

→ Stocker access dans auth_token
→ Stocker refresh dans refresh_token
→ GET /accounts/users/me/  (avec Bearer access)
→ Stocker user dans localStorage
```

### Flux d'inscription (patients uniquement)
```
POST /accounts/register/
Body: {
  email, password, password_confirm,
  first_name, last_name, telephone,
  sexe: "M" | "F" | "Autre",
  role: "patient",  ← hardcodé
  date_naissance?,  ← optionnel
  adresse?          ← optionnel
}
Response: User object ou erreurs de validation
```

### Refresh token automatique
```
Sur toute réponse 401 :
POST /token/refresh/
Body: { refresh: refresh_token }
Response: { access: string }
→ Mettre à jour auth_token
→ Relancer la requête originale
→ Si échec : vider localStorage + redirect /login
```

### Réinitialisation mot de passe
```
POST /accounts/request-password-reset/
Body: { email }

POST /accounts/reset-password-confirm/
Body: { token, new_password }
```

### Changement mot de passe (connecté)
```
POST /accounts/users/me/change-password/
Body: { old_password, new_password, new_password_confirm }
```

---

## 3. MODÈLE UTILISATEUR

```typescript
interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  telephone: string
  date_naissance?: string | null   // "YYYY-MM-DD"
  sexe: "M" | "F" | "Autre"
  role: "patient" | "medecin" | "admin_hopital" | "admin_general" | "laborantin"
  adresse?: string
  photo?: string | null            // URL relative ou absolue
  is_active: boolean
  is_email_verified: boolean
  date_joined: string
  last_login?: string | null
  hopital?: number | null          // ID hôpital de rattachement
  hopital_nom?: string
  patient_profile?: {
    contact_urgence_nom?: string
    contact_urgence_tel?: string
    groupe_sanguin?: string
    allergies?: string
    numero_secu?: string
  }
  medecin_profile?: {
    numero_ordre: string
    biographie?: string
    statut: "actif" | "inactif"
    duree_rdv_default: number      // minutes
  }
  laborantin_profile?: {
    laboratoire?: string
  }
}
```

---

## 4. TOUS LES ENDPOINTS API

### AUTH
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/token/` | Login → `{access, refresh}` |
| POST | `/token/refresh/` | Refresh → `{access}` |
| POST | `/accounts/register/` | Inscription patient |
| GET | `/accounts/users/me/` | Profil utilisateur connecté |
| PUT/PATCH | `/accounts/users/me/` | Modifier profil |
| POST | `/accounts/users/me/change-password/` | Changer mot de passe |
| POST | `/accounts/request-password-reset/` | Demander reset |
| POST | `/accounts/reset-password-confirm/` | Confirmer reset |

### UTILISATEURS & STAFF
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/accounts/medecins/` | Liste médecins (filtrable: `?hopital=ID&service=ID`) |
| GET | `/accounts/medecins/{id}/` | Détail médecin |
| POST | `/accounts/medecins/` | Créer médecin (admin) |
| PATCH | `/accounts/medecins/{id}/` | Modifier médecin |
| DELETE | `/accounts/medecins/{id}/` | Supprimer médecin |
| POST | `/accounts/medecins/import/` | Import CSV médecins (FormData) |
| GET | `/accounts/medecins/import-template/` | Télécharger template CSV |
| GET | `/accounts/laborantins/` | Liste laborantins |
| GET | `/accounts/laborantins/{id}/` | Détail laborantin |
| POST | `/accounts/laborantins/` | Créer laborantin |
| DELETE | `/accounts/laborantins/{id}/` | Supprimer laborantin |
| GET | `/accounts/patients/` | Liste patients |
| GET | `/accounts/patients/{id}/` | Détail patient |
| GET | `/accounts/admin-hopitaux/` | Liste admins hôpitaux |
| POST | `/accounts/admin-hopitaux/` | Créer admin hôpital |
| PATCH | `/accounts/admin-hopitaux/{id}/` | Modifier admin |
| DELETE | `/accounts/admin-hopitaux/{id}/` | Supprimer admin |
| GET | `/accounts/users/` | Liste tous les utilisateurs (super admin) |

### HÔPITAUX & SERVICES
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/hopitaux/` | Liste hôpitaux |
| POST | `/hopitaux/` | Créer hôpital (super admin) |
| GET | `/hopitaux/{id}/` | Détail hôpital |
| PATCH | `/hopitaux/{id}/` | Modifier hôpital |
| GET | `/hopitaux/nearby/` | Hôpitaux proches (`?lat=&lng=&radius=20`) |
| GET | `/hopitaux/{id}/services/` | Services d'un hôpital |
| GET | `/hopitaux/mes-services/` | Services de mon hôpital (admin) |
| GET | `/services/` | Catalogue global des services |
| POST | `/services/` | Créer service global (super admin) |
| PATCH | `/services/{id}/` | Modifier service |
| DELETE | `/services/{id}/` | Supprimer service |
| GET | `/demandes/` | Liste demandes de service |
| POST | `/hopitaux/{id}/demandes/` | Soumettre demande de service |
| POST | `/demandes/{id}/valider/` | Valider demande (super admin) |
| POST | `/demandes/{id}/refuser/` | Refuser demande (`{commentaire}`) |

### SUPERVISION HÔPITAL (admin_hopital)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/hopitaux/supervision/dashboard/` | Stats globales hôpital |
| GET | `/hopitaux/supervision/rendezvous/` | Supervision RDV |
| GET | `/hopitaux/supervision/consultations/` | Supervision consultations |
| GET | `/hopitaux/supervision/laboratoire/` | Supervision labo |
| GET | `/hopitaux/supervision/patient/{id}/parcours/` | Parcours patient |
| GET | `/hopitaux/laborantin/patients/` | Patients du labo |

### RENDEZ-VOUS
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/rendezvous/` | Liste RDV (filtrés par rôle côté backend) |
| POST | `/rendezvous/` | Créer RDV |
| GET | `/rendezvous/{id}/` | Détail RDV |
| POST | `/rendezvous/{id}/confirmer/` | Confirmer (médecin) |
| POST | `/rendezvous/{id}/refuser/` | Refuser (`{commentaire}`) (médecin) |
| POST | `/rendezvous/{id}/annuler/` | Annuler (patient) |
| POST | `/rendezvous/{id}/terminer/` | Terminer (médecin) |
| GET | `/rendezvous/{id}/preenregistrement/` | Formulaire pré-consultation |
| POST | `/rendezvous/{id}/preenregistrement/` | Soumettre formulaire |
| PUT | `/rendezvous/{id}/preenregistrement/` | Modifier formulaire |

### DISPONIBILITÉS & CRÉNEAUX
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/disponibilites/` | Mes disponibilités (médecin) |
| POST | `/disponibilites/` | Créer disponibilité |
| PATCH | `/disponibilites/{id}/` | Modifier disponibilité |
| DELETE | `/disponibilites/{id}/` | Supprimer disponibilité |
| GET | `/medecins/{id}/disponibilites/` | Disponibilités d'un médecin |
| GET | `/medecins/{id}/creneaux/` | Créneaux disponibles d'un médecin |

### CONSULTATIONS
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/consultations/` | Liste consultations |
| GET | `/consultations/{id}/` | Détail consultation |
| POST | `/consultations/{id}/cloturer/` | Clôturer consultation |

### RÉSULTATS & ANALYSES
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/resultats/` | Liste résultats |
| GET | `/resultats/{id}/` | Détail résultat |
| GET | `/resultats/acces/{code}/` | Accès par code (public) |
| POST | `/resultats/{id}/partager/` | Partager résultat |
| GET | `/analyses/` | Liste analyses labo |
| POST | `/analyses/` | Créer analyse |
| POST | `/analyses/{id}/cloturer/` | Clôturer analyse |
| GET | `/laborantins/patients/` | Patients du laborantin |

### MESSAGERIE
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/conversations/` | Liste conversations |
| GET | `/messages/` | Liste messages (params: `?destinataire=ID`) |
| POST | `/messages/` | Envoyer message |

### NOTIFICATIONS
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/notifications/` | Liste notifications |
| POST | `/notifications/mark-all-read/` | Tout marquer lu |

### CHATBOT IA
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/chatbot/message/` | Envoyer message (`{message, session_id?}`) |
| GET | `/chatbot/sessions/` | Liste sessions |
| POST | `/chatbot/sessions/` | Créer session |
| GET | `/chatbot/history/` | Dernière session |
| GET | `/chatbot/history/{id}/` | Session spécifique |

---

## 5. MODÈLES DE DONNÉES

### RendezVous
```typescript
{
  id: number
  patient: number
  patient_nom?: string
  medecin: number
  medecin_nom?: string
  date_heure: string              // ISO 8601
  duree: number                   // minutes
  motif?: string
  statut: "en_attente" | "confirme" | "annule" | "refuse" | "termine"
  statut_display?: string
  commentaire_annulation?: string
  cree_le: string
  modifie_le: string
  has_consultation?: boolean
  consultation_id?: number | null
  pre_enregistrement?: {
    symptomes_principaux: string
    debut_symptomes?: string | null
    traitements_en_cours?: string
    observations?: string
    soumis_le?: string
    mis_a_jour_le?: string
  }
}
```

### Hopital
```typescript
{
  id: number
  nom: string
  code_court?: string
  adresse: string
  ville: string
  telephone: string
  email: string
  site_web?: string
  description?: string
  logo?: string | null
  latitude?: number | null
  longitude?: number | null
  is_active: boolean
  date_creation: string
  nombre_services?: number        // calculé
  nombre_medecins?: number        // calculé
}
```

### Medecin
```typescript
{
  id: number
  first_name: string
  last_name: string
  email: string
  telephone: string
  photo?: string | null
  sexe?: string
  date_naissance?: string | null
  numero_ordre: string
  biographie?: string
  statut: "actif" | "inactif"
  duree_rdv_default: number
  hopital?: number | null
  hopital_nom?: string
  services?: string[]
}
```

### Consultation
```typescript
{
  rendez_vous: number             // PK = ID du RDV
  compte_rendu?: string
  diagnostic?: string
  prescription?: string
  date_consultation: string
  est_cloture: boolean
  date_cloture?: string | null
}
```

### Resultat
```typescript
{
  id: number
  patient?: number | null
  patient_nom?: string
  laborantin?: number | null
  hopital?: number | null
  hopital_nom?: string
  consultation?: number | null
  titre: string
  fichier?: string                // URL du fichier
  date_analyse: string
  date_depot: string
  code_acces: string              // code pour accès public
  patient_nom_externe?: string
  patient_email_externe?: string
  laboratoire?: string
  partages?: number[]             // IDs des partages
}
```

### DemandeAnalyse
```typescript
{
  id: number
  hopital: number
  hopital_nom?: string
  laborantin?: number | null
  patient?: number | null
  patient_nom: string
  patient_prenom: string
  patient_email: string
  patient_telephone?: string
  patient_ddn?: string | null
  type_analyse: string
  statut: "en_cours" | "cloture"
  date_inscription: string
  date_cloture?: string | null
  resultat?: number | null
}
```

### Message
```typescript
{
  id: number
  consultation?: number | null
  expediteur: number
  expediteur_nom?: string
  expediteur_photo?: string | null
  destinataire: number
  destinataire_nom?: string
  contenu: string
  type_message: "texte" | "vocal" | "fichier"
  audio?: string | null
  piece_jointe?: string | null
  date_envoi: string
  lu: boolean
}
```

### Notification
```typescript
{
  id: number
  utilisateur: number
  message: string
  type: "rdv_confirme" | "rdv_refuse" | "rdv_annule" | "resultat" | "message" | "alerte" | "systeme"
  est_lu: boolean
  lien?: string
  cree_le: string
}
```

---

## 6. ROUTES FRONTEND PAR RÔLE

### PUBLIC (sans connexion)
| Route | Page | Description |
|-------|------|-------------|
| `/` | PublicHomePage | Page d'accueil |
| `/hospitals` | PublicHospitalsPage | Liste hôpitaux publique |
| `/nearby` | PublicHospitalsPage | Alias de /hospitals |
| `/chatbot` | PublicChatbotPage | Assistant IA public |
| `/track-results` | TrackResultsPage | Accès résultat par code |
| `/hopital/:id` | HospitalDetailPage | Détail hôpital public |
| `/emergency` | EmergencyNumbersPage | Numéros d'urgence |
| `/tips` | HealthTipsPage | Conseils santé |
| `/terms` | TermsPage | CGU |
| `/faq` | FAQPage | FAQ |
| `/guide` | GuidePage | Guide utilisateur |
| `/legal` | LegalPage | Mentions légales |
| `/onboarding` | OnboardingPage | Onboarding |
| `/login` | LoginPage | Connexion |
| `/register` | RegisterPage | Inscription |
| `/forgot-password` | ForgotPasswordPage | Mot de passe oublié |

### PATIENT (`/patient/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/patient` | PatientDashboard | Tableau de bord |
| `/patient/search` | SearchPage | Recherche médecins/hôpitaux |
| `/patient/appointments` | AppointmentsPage | Mes rendez-vous |
| `/patient/messagerie` | MessagesPage | Messagerie |
| `/patient/hopital/:id` | HospitalDetailPage | Détail hôpital |
| `/patient/hopital/:hospitalId/rendezvous` | AppointmentBookingPage | Prendre RDV (hôpital) |
| `/patient/hopital/:hospitalId/service/:serviceId` | AppointmentBookingPage | Prendre RDV (service) |
| `/patient/medecin/:doctorId/rendezvous` | AppointmentBookingPage | Prendre RDV (médecin) |
| `/patient/rdv/:rdvId/intake` | PatientIntakePage | Formulaire pré-consultation |
| `/patient/rdv/:rdvId/intake/:medecinNom` | PatientIntakePage | Formulaire pré-consultation |
| `/patient/nearby` | NearbyHospitalsPage | Hôpitaux proches (carte) |
| `/patient/ai-agent` | AIAgentPage | Assistant IA (connecté) |
| `/patient/results` | ResultsPage | Mes résultats |
| `/patient/results/:id/share` | ResultSharePage | Partager résultat |
| `/patient/consultation/:id` | ConsultationDetailPage | Détail consultation |
| `/patient/result-code` | TrackResultsPage | Accès par code |
| `/patient/profile` | ProfilePage | Mon profil |
| `/patient/profile/edit` | EditProfilePage | Modifier profil |
| `/patient/settings` | SettingsPage | Paramètres |
| `/patient/settings/change-password` | ChangePasswordPage | Changer mot de passe |

### MÉDECIN (`/medecin/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/medecin` | DoctorDashboard | Tableau de bord |
| `/medecin/agenda` | DoctorAgendaPage | Agenda / disponibilités |
| `/medecin/patients` | PatientsPage | Mes patients |
| `/medecin/consultations` | ConsultationsPage | Mes consultations |
| `/medecin/consultations/:id` | ConsultationDetailPage | Détail consultation |
| `/medecin/messagerie` | MessagesPage | Messagerie |
| `/medecin/results` | ResultsPage | Résultats |
| `/medecin/profile` | ProfilePage | Mon profil |
| `/medecin/settings` | SettingsPage | Paramètres |
| `/medecin/settings/change-password` | ChangePasswordPage | Changer mot de passe |

### ADMIN HÔPITAL (`/admin-hopital/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/admin-hopital` | AdminDashboard | Tableau de bord supervision |
| `/admin-hopital/medecins` | AdminDoctorsPage | Gestion médecins |
| `/admin-hopital/laborantins` | AdminStaffPage | Gestion laborantins |
| `/admin-hopital/services` | AdminServicesPage | Services hôpital |
| `/admin-hopital/demandes` | AdminDemandesPage | Demandes de service |
| `/admin-hopital/patients` | AdminPatientsPage | Patients |
| `/admin-hopital/rendez-vous` | AdminAppointmentsPage | Supervision RDV |
| `/admin-hopital/consultations` | AdminConsultationsPage | Supervision consultations |
| `/admin-hopital/laboratoire` | AdminLaboratoryPage | Supervision labo |
| `/admin-hopital/post-suivi` | AdminPostCarePage | Post-soins |
| `/admin-hopital/patient/:patientId/journey` | AdminPatientJourneyPage | Parcours patient |
| `/admin-hopital/stats` | AdminStatsPage | Statistiques |
| `/admin-hopital/messagerie` | MessagesPage | Messagerie |
| `/admin-hopital/profile` | ProfilePage | Profil |
| `/admin-hopital/settings` | SettingsPage | Paramètres |
| `/admin-hopital/settings/change-password` | ChangePasswordPage | Changer mot de passe |

### SUPER ADMIN (`/super-admin/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/super-admin` | SuperAdminDashboard | Tableau de bord global |
| `/super-admin/hopitaux` | EntitiesPage | Liste hôpitaux |
| `/super-admin/hopitaux/nouveau` | CreateHospitalPage | Créer hôpital |
| `/super-admin/hopitaux/:id` | EntityDetailPage | Détail hôpital |
| `/super-admin/users` | UsersPage | Gestion utilisateurs |
| `/super-admin/stats` | SuperAdminStatsPage | Statistiques globales |
| `/super-admin/services` | SuperAdminServicesPage | Services globaux |
| `/super-admin/demandes` | SuperAdminDemandesPage | Demandes de service |
| `/super-admin/messagerie` | MessagesPage | Messagerie |
| `/super-admin/profile` | ProfilePage | Profil |
| `/super-admin/settings` | SettingsPage | Paramètres |
| `/super-admin/settings/change-password` | ChangePasswordPage | Changer mot de passe |

### LABORANTIN (`/laborantin/*`)
| Route | Page | Description |
|-------|------|-------------|
| `/laborantin` | LaborantinDashboard | Tableau de bord |
| `/laborantin/pending` | LaborantinPendingPage | Analyses en cours |
| `/laborantin/finished` | LaborantinFinishedPage | Analyses terminées |
| `/laborantin/messagerie` | MessagesPage | Messagerie |
| `/laborantin/profile` | ProfilePage | Profil |
| `/laborantin/settings` | SettingsPage | Paramètres |
| `/laborantin/settings/change-password` | ChangePasswordPage | Changer mot de passe |

### COMMUNES (tous rôles connectés)
| Route | Page |
|-------|------|
| `/notifications` | NotificationsPage |
| `/results` | ResultsPage |
| `/dashboard` | DashboardRedirect (→ rôle) |

---

## 7. MATRICE DES PERMISSIONS

```
Action                  | patient | medecin | admin_hopital | admin_general | laborantin
------------------------|---------|---------|---------------|---------------|----------
Créer médecin           |    ✗    |    ✗    |       ✓       |       ✓       |     ✗
Supprimer médecin       |    ✗    |    ✗    |       ✓       |       ✓       |     ✗
Importer médecins CSV   |    ✗    |    ✗    |       ✓       |       ✓       |     ✗
Créer laborantin        |    ✗    |    ✗    |       ✓       |       ✓       |     ✗
Supprimer laborantin    |    ✗    |    ✗    |       ✓       |       ✓       |     ✗
Créer hôpital           |    ✗    |    ✗    |       ✗       |       ✓       |     ✗
Modifier hôpital        |    ✗    |    ✗    |       ✗       |       ✓       |     ✗
Activer/désactiver hop. |    ✗    |    ✗    |       ✗       |       ✓       |     ✗
Créer admin hôpital     |    ✗    |    ✗    |       ✗       |       ✓       |     ✗
Créer service global    |    ✗    |    ✗    |       ✗       |       ✓       |     ✗
Valider demande service |    ✗    |    ✗    |       ✗       |       ✓       |     ✗
Soumettre demande serv. |    ✗    |    ✗    |       ✓       |       ✗       |     ✗
Inscrire analyse labo   |    ✗    |    ✗    |       ✗       |       ✗       |     ✓
Clôturer analyse labo   |    ✗    |    ✗    |       ✗       |       ✗       |     ✓
Annuler RDV             |    ✓    |    ✗    |       ✗       |       ✗       |     ✗
Confirmer RDV           |    ✗    |    ✓    |       ✗       |       ✗       |     ✗
Refuser RDV             |    ✗    |    ✓    |       ✗       |       ✗       |     ✗
Terminer RDV            |    ✗    |    ✓    |       ✗       |       ✗       |     ✗
Partager résultat       |    ✓    |    ✗    |       ✗       |       ✗       |     ✗
Télécharger résultat    |    ✓    |    ✓    |       ✓       |       ✓       |     ✓
Utiliser AI Agent       |    ✓    |    ✗    |       ✗       |       ✗       |     ✗
```

---

## 8. FLUX MÉTIER DÉTAILLÉS

### Flux Prise de RDV (patient)
```
1. Patient choisit un hôpital
   GET /hopitaux/{id}/

2. Charge les services de l'hôpital
   GET /hopitaux/{id}/services/
   → Response: [{ id, service, service_nom, service_description }]

3. Patient choisit un service → charge les médecins
   GET /accounts/medecins/?hopital={id}&service={serviceId}
   → Response: [{ id, first_name, last_name, photo, services[] }]

4. Patient choisit un médecin → charge les créneaux
   GET /medecins/{id}/creneaux/
   → Response: [{ date, heure_debut, heure_fin, disponible }]

5. Patient choisit un créneau + saisit motif
   POST /rendezvous/
   Body: {
     medecin: number,
     date_heure: "YYYY-MM-DDTHH:MM:SS",
     motif: string
   }
   → Response: RendezVous object

6. Confirmation affichée → redirect /patient/appointments
```

### Flux Consultation (médecin)
```
1. Médecin voit ses RDV
   GET /rendezvous/
   → Filtrés côté backend par médecin connecté

2. Confirme ou refuse
   POST /rendezvous/{id}/confirmer/
   POST /rendezvous/{id}/refuser/  Body: { commentaire }

3. Patient remplit formulaire pré-consultation
   POST /rendezvous/{rdvId}/preenregistrement/
   Body: {
     symptomes_principaux: string,
     debut_symptomes?: string,
     traitements_en_cours?: string,
     observations?: string
   }

4. Médecin consulte le formulaire + rédige consultation
   GET /consultations/{id}/
   POST /consultations/{id}/cloturer/
   Body: {
     compte_rendu: string,
     diagnostic: string,
     prescription: string
   }
```

### Flux Analyse Labo
```
1. Médecin demande analyse
   POST /analyses/
   Body: {
     patient_nom, patient_prenom, patient_email,
     patient_telephone?, patient_ddn?,
     type_analyse: string
   }

2. Laborantin voit les analyses en cours
   GET /analyses/?statut=en_cours

3. Laborantin clôture avec résultat
   POST /analyses/{id}/cloturer/
   → Crée automatiquement un Resultat

4. Patient accède au résultat
   GET /resultats/
   ou GET /resultats/acces/{code}/  (accès public par code)
```

### Flux Messagerie
```
1. Charger conversations
   GET /conversations/
   → [{ consultation_id, destinataire_id, titre, dernier_message, non_lus, type }]

2. Charger messages d'une conversation
   GET /messages/?destinataire={id}

3. Envoyer message
   POST /messages/
   Body: {
     destinataire: number,
     contenu: string,
     type_message: "texte" | "vocal" | "fichier",
     consultation?: number,
     audio?: File,
     piece_jointe?: File
   }

4. Auto-refresh toutes les 5 secondes
   (pas de WebSocket côté frontend)
```

### Flux Chatbot IA
```
Utilisateur non connecté:
POST /chatbot/message/
Body: { message: string }
→ Réponse sans tools RAG (questions générales seulement)

Utilisateur connecté (patient):
POST /chatbot/message/
Body: { message: string, session_id?: number }
→ Réponse avec tools RAG (recherche médecins/hôpitaux en base)
→ Response: {
    session_id: number,
    message: { id, role, content, timestamp },
    actions: [{ type, label, url?, payload? }]
  }

Actions possibles:
- type "redirect" + url → navigate(sanitizeAIRoute(url))
- type "route" + payload → navigate(payload)
- type "message" + payload → sendMessage(payload)
```

---

## 9. COMPOSANTS UI RÉUTILISABLES

### Button
```
Variants: primary | secondary | outline | ghost | danger | success
Sizes: xs (h-8) | sm (h-9) | md (h-11) | lg (h-12)
Props: isLoading,