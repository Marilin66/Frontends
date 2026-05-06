# E-Santé Bénin — Backend

## Administration Initiale

Une fois la base de données initialisée, vous pouvez vous connecter avec le compte administrateur général par défaut.

**Identifiants par défaut :**

| Champ | Valeur |
|-------|--------|
| **Email** | `admin@esante-benin.com` |
| **Mot de passe** | `Esante2025!` |

> [!IMPORTANT]
> Il est fortement recommandé de changer ce mot de passe dès la première connexion via l'interface d'administration ou le profil.

## Initialisation des données (Seed)

Le script de seed permet d'initialiser rapidement l'environnement.

```bash
# 1. Pour une installation PROPRE (Super Admin + Services de base)
python manage.py seed --clean

# 2. Pour une DÉMONSTRATION COMPLÈTE (Hôpitaux, Médecins, Patients, RDV, Analyses, Messages)
python manage.py seed_demo --clean
```

## Comptes de Démonstration 

Dans la configuration avec le script `seed_complet.py`, voici les identifiants générés par défaut :

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| **Admin Général** | `admin@esante.com` | `admin123` | Dashboard global et supervision |
| **Admin Hôpital** | `cnhu@esante.com` | `admin123` | Gestion de l'hôpital CNHU-HKM |
| **Médecin (Cardio)** | `dossou@esante.com` | `medecin123` | Dr. Jean Dossou (Rendez-vous pré-configurés) |
| **Médecin (Pédia)** | `tossou@esante.com` | `medecin123` | Dr. Marie Tossou |
| **Laborantin** | `lab.dossou@esante.com` | `lab123` | Paul Dossou-Labo (Laboratoire CNHU) |
| **Patient 1** | `sidicke@esante.com` | `patient123` | Patient principal (A un historique d'Intake Patient) |
| **Patient 2** | `tossou-patient@esante.com` | `patient123` | Second patient de test |

> [!TIP]
> Connectez-vous d'abord en tant que patient (`sidicke@esante.com`) pour voir le rendez-vous. Connectez-vous ensuite avec le Dr. Dossou (`dossou@esante.com`) pour apercevoir la liste des RDV et l'Intake patient rempli !

## Structure du projet

- `accounts/` : Gestion des utilisateurs (Admins, Médecins, Patients, Laborantins).
- `hopitaux/` : Gestion des établissements et des services.
- `rendezvous/` : Agenda, réservations et consultations.
- `messagerie/` : Système de discussion instantanée.
- `resultats/` : Gestion BioTrack des analyses médicales.
- `notifications/` : Système d'alertes en temps réel.
- `Chatbot/` : Assistant IA pour les patients.

## Configuration du Chatbot (IA) en Production

Le chatbot est compatible avec toutes les APIs de type OpenAI (Groq, OpenAI, OpenRouter, xAI). Pour le faire fonctionner sur Render (ou en local), configurez les variables suivantes :

| Variable | Valeur Recommandée (Groq/Llama-3) | Description |
|----------|-----------------------------------|-------------|
| `GROQ_API_KEY` | `votre_cle_groq` | Clé API de Groq (Gratuit, très rapide) |
| `CHATBOT_API_URL` | `https://api.groq.com/openai/v1/chat/completions` | Point d'entrée de l'API |
| `CHATBOT_MODEL` | `llama-3.3-70b-versatile` | Modèle de langage à utiliser |

> [!TIP]
> **Pour utiliser OpenAI** : Réglez `CHATBOT_API_URL` sur `https://api.openai.com/v1/chat/completions`, `CHATBOT_API_KEY` sur votre clé OpenAI, et `CHATBOT_MODEL` sur `gpt-4o`.

