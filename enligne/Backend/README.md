# E-Santé Bénin — Backend (HOPITEL)

## Administration Initiale

Une fois la base de données initialisée, vous pouvez vous connecter avec le compte administrateur général.

**Identifiants par défaut :**

| Champ | Valeur |
|-------|--------|
| **Email** | `admin@hopitel.com` |
| **Mot de passe** | `HopitelAdmin2025*` |

> [!IMPORTANT]
> En mode Soutenance, toutes les notifications sont redirigées vers l'auteur.

## Initialisation des données (Seed Final)

Pour une démonstration complète et réaliste (Mémoire), utilisez le script suivant :

```bash
python seed_memoire_final.py
```

## Comptes de Démonstration (Soutenance)

Voici les identifiants générés par le script final :

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| **Admin Général** | `admin@hopitel.com` | `HopitelAdmin2025*` | Dashboard global |
| **Médecin (Cardio)** | `dr.dossou@hopitel.com` | `MedecinDossou123!` | Dr. Jean DOSSOU |
| **Médecin (Pédia)** | `dr.tossou@hopitel.com` | `TossouPedia!99` | Dr. Marie TOSSOU |
| **Laborantin** | `labo.agbo@hopitel.com` | `AgboLabo229#` | Marc AGBO |
| **Patient 1** | `sidicke@hopitel.com` | `PatientSidicke01` | Sidicke TRAORÉ (NPI: `1029384756`) |
| **Patient 2** | `koffi@hopitel.com` | `KoffiMensah_2025` | Koffi MENSAH (NPI: `2938475610`) |

## Mode Soutenance (Redirection)

Pour faciliter les tests, toutes les communications sont centralisées :
- **Emails** : Redirigés vers `sidickelpc123@gmail.com`.
- **WhatsApp** : Redirigés vers `0168765927` (`2290168765927`).
- **NPI** : Requis pour toute prise de rendez-vous (Identification Unique Bénin).

> [!TIP]
> Connectez-vous en tant que patient pour prendre RDV. Si le NPI manque, le système vous bloquera avec une alerte explicative.


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

