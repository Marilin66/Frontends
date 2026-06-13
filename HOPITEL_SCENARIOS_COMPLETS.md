# 🏥 Hopitel - Scénarios Complets d'Utilisation

## Vue d'ensemble: De l'enregistrement à la consultation

Hopitel est une **plateforme de santé digitale** qui permet aux patients de prendre des rendez-vous, consulter des médecins, recevoir des résultats, et bien plus - tout depuis un seul endroit.

---

# 📋 SCÉNARIO 1: Patient Prenant Son Premier Rendez-Vous

## Les Acteurs:
- **Moussa Diop** - Patient (27 ans, à Ouagadougou)
- **Dr. Keita** - Médecin généraliste
- **Hôpital Universitaire** - Établissement partenaire

## ⏱️ Chronologie Complète:

### **Étape 1: Inscription du Patient (09:00)**

**Moussa arrive sur le site public Hopitel:**

```
URL: www.hopitel.bj
Landing Page → Boutton "S'inscrire" 
```

Moussa voit:
- ✅ 6 services clés: Rendez-vous, Résultats, Assistant IA, Hôpitaux proches, Données protégées, Suivi continu
- ✅ Statistiques: "50+ Hôpitaux", "500+ Médecins", "10k+ Patients actifs"
- ✅ Bouton "S'inscrire" ou "Se connecter"

**Il clique sur "S'inscrire":**

```
Form Registration:
- Email: moussa.diop@gmail.com
- Mot de passe: Secure123!
- Nom: Diop
- Prénom: Moussa
- Téléphone: +226 7X XX XX XX
- Date de naissance: 1996-03-15
- Sexe: M
→ Bouton "Créer mon compte"
```

**Email de vérification reçu:**

```
Sujet: Vérifiez votre email Hopitel
Contenu:
"Bonjour Moussa,
Voici votre code de vérification: 123456

Valide pendant 10 minutes."
```

**Moussa entre le code:**

```
Écran Vérification:
Code: 123456
→ Compte créé! Bienvenue Moussa ✅
```

---

### **Étape 2: Navigation & Découverte (09:15)**

**Moussa se connecte et arrive au Dashboard Patient:**

```
Dashboard:
┌─────────────────────────────────────────┐
│ 👋 Bienvenue, Moussa!                   │
│                                         │
│ 📊 Vue rapide:                          │
│  • 0 rendez-vous à venir                │
│  • 0 consultations récentes             │
│  • 0 résultats en attente               │
│                                         │
│ 🎯 Actions rapides:                     │
│  [Prendre un RDV]  [Voir résultats]    │
│  [Chat IA]         [Mes messages]      │
│                                         │
│ 📍 Hôpitaux proches (GPS activé)        │
│  • Hôpital Universitaire - 2.3 km      │
│  • Clinique Maladies - 5.1 km          │
│  • Centre Médical - 7.8 km             │
└─────────────────────────────────────────┘
```

**Moussa clique sur "Prendre un RDV":**

```
Menu Recherche:
┌────────────────────────────────────┐
│ Que cherchez-vous?                 │
│                                    │
│ 🔍 Chercher par:                  │
│ □ Spécialité (ex: Cardiologie)    │
│ □ Médecin (ex: Dr. Keita)         │
│ □ Hôpital (ex: Hôp. Univ.)        │
│                                    │
│ 📍 Distance max: 15 km            │
│                                    │
│ [Rechercher]                       │
└────────────────────────────────────┘
```

---

### **Étape 3: Recherche & Sélection du Médecin (09:20)**

**Moussa cherche un "Médecin généraliste":**

```
Résultats:
┌─────────────────────────────────────────┐
│ Médecins Généralists trouvés (5)        │
│                                         │
│ 🏥 Dr. Keita                            │
│ ⭐ 4.8/5 (234 avis)                     │
│ 📍 Hôpital Universitaire (2.3 km)       │
│ 💰 Consultation: 15,000 FCFA           │
│ ✅ Disponible aujourd'hui               │
│ [Voir disponibilités]                   │
│                                         │
│ 🏥 Dr. Sow                              │
│ ⭐ 4.5/5 (156 avis)                     │
│ 📍 Clinique Maladies (5.1 km)           │
│ 💰 Consultation: 12,000 FCFA           │
│ ✅ Disponible le 4 juin                 │
│ [Voir disponibilités]                   │
└─────────────────────────────────────────┘
```

**Moussa choisit "Dr. Keita" et clique "Voir disponibilités":**

```
Calendrier Dr. Keita:
┌──────────────────────────────────┐
│ Juin 2026 - Dr. Keita            │
│                                  │
│ Aujourd'hui (4 juin) - 6 slots:  │
│  □ 09:00 - 09:30                │
│  ✓ 10:00 - 10:30  ← LIBRE       │
│  □ 11:00 - 11:30                │
│  ✓ 14:00 - 14:30  ← LIBRE       │
│  □ 15:00 - 15:30                │
│  ✓ 16:00 - 16:30  ← LIBRE       │
│                                  │
│ Demain (5 juin) - 8 slots...    │
│                                  │
│ [Conseil: Créneaux le matin     │
│  généralement moins chargés]     │
└──────────────────────────────────┘
```

**Moussa sélectionne 10:00 aujourd'hui:**

```
Confirmation RDV:
┌──────────────────────────────────────┐
│ 📋 Résumé de votre rendez-vous       │
│                                      │
│ 📅 Aujourd'hui 4 juin 2026           │
│ ⏰ 10:00 - 10:30                     │
│ 👨‍⚕️ Dr. Keita                          │
│ 🏥 Hôpital Universitaire             │
│ 💰 15,000 FCFA                       │
│                                      │
│ ℹ️ Note: Vous devez remplir votre   │
│    fiche pré-consultation avant      │
│    la consultation                   │
│                                      │
│ [Confirmer RDV]  [Annuler]          │
└──────────────────────────────────────┘
```

---

### **Étape 4: Remplissage Fiche Pré-Consultation (09:25)**

**Après confirmation, Hopitel propose la fiche pré-consultation:**

```
Fiche Pré-Consultation:
┌─────────────────────────────────────────┐
│ Avant votre consultation avec Dr. Keita │
│                                         │
│ 1️⃣ SYMPTÔMES ACTUELS:                  │
│   □ Fièvre
│   ☑ Mal de tête
│   □ Toux
│   ☑ Fatigue
│   
│   Durée: [5 jours ▼]
│   Intensité: [Modéré ▼]
│                                         │
│ 2️⃣ ANTÉCÉDENTS MÉDICAUX:               │
│   ☑ Asthme
│   □ Diabète
│   □ Hypertension
│   
│ 3️⃣ TRAITEMENTS EN COURS:              │
│   Ventoline (inhaler) - 2x par jour    │
│                                         │
│ 4️⃣ ALLERGIES:                         │
│   ☑ Pénicilline (légère)              │
│                                         │
│ 5️⃣ QUESTIONS POUR LE MÉDECIN:        │
│   "Pourquoi j'ai souvent des maux    │
│    de tête avec ma fatigue?"          │
│                                         │
│ [Soumettre fiche]  [Enregistrer brouillon]
└─────────────────────────────────────────┘
```

**Fiche soumise:**

```
✅ Fiche reçue par Dr. Keita
📬 Notification Dr. Keita:
   "Moussa Diop a rempli sa fiche
    pour sa consultation de 10:00"
```

---

### **Étape 5: La Consultation (10:00)**

**Dr. Keita peut désormais voir:**

```
Interface Dr. Keita (10:00):
┌─────────────────────────────────────────┐
│ 👨 Moussa Diop                          │
│ 📋 RDV: Aujourd'hui 10:00 - 10:30      │
│                                         │
│ 📄 FICHE PRÉ-CONSULTATION:             │
│ • Symptômes: Mal de tête (5j), Fatigue│
│ • Antécédents: Asthme                 │
│ • Allergies: Pénicilline              │
│ • Questions: "Pourquoi les maux..."   │
│                                         │
│ 🔧 Actions:                           │
│ [Démarrer consultation]                │
│ [Voir historique]                      │
│ [Accès dossier]                        │
└─────────────────────────────────────────┘
```

**Pendant la consultation vidéo:**

```
Écran Consultation Hopitel:
┌──────────────────────────────────┐
│ 📹 Moussa (vidéo en direct)      │
│                                  │
│ 💬 Chat de consultation          │
│ Moussa: "Dr, j'ai mal à la tête"│
│ Dr: "Depuis quand exactement?"   │
│ Moussa: "5 jours"                │
│                                  │
│ 📎 Dr peut ajouter:              │
│ • Fichiers/Images               │
│ • Observations                   │
│ • Diagnostic                     │
│ • Ordonnance                     │
│                                  │
│ ⏱️ 10:15 - 15 min restantes      │
└──────────────────────────────────┘
```

**Dr. Keita enregistre les résultats:**

```
Enregistrement Consultation:
┌──────────────────────────────────────────┐
│ Diagnostic: Migraine + Fatigue légère   │
│                                          │
│ Observations:                            │
│ "Patient décrit mal de tête depuis 5j.  │
│  Aggravé le matin. Asthme bien          │
│  contrôlé."                              │
│                                          │
│ ORDONNANCE:                              │
│ • Paracétamol 500mg - 3x par jour       │
│ • Repos suffisant recommandé            │
│ • Revenir si symptômes persistent      │
│   après 3 jours                         │
│                                          │
│ Suivi: [Pas de suivi / 1 sem / 1 mois] │
│         ✓ 1 semaine sélectionné         │
│                                          │
│ [Enregistrer] [Brouillon]                │
└──────────────────────────────────────────┘
```

---

### **Étape 6: Suivi Post-Consultation (après 10:30)**

**Notification reçue par Moussa:**

```
📬 Hopitel - Consultation terminée

Bonjour Moussa,

Votre consultation avec Dr. Keita est terminée.

📋 RÉSUMÉ:
Diagnostic: Migraine + Fatigue légère

💊 ORDONNANCE:
• Paracétamol 500mg - 3x par jour
• Repos suffisant recommandé

📅 SUIVI: Dr. Keita vous aura proposé un
   suivi dans 1 semaine

🔗 [Voir détails] [Télécharger ordonnance PDF]
```

**Dans son dashboard, Moussa voit:**

```
Consultations Récentes:
┌──────────────────────────────────────┐
│ ✅ Dr. Keita - Aujourd'hui 10:00     │
│                                      │
│ Diagnostic: Migraine + Fatigue légère│
│ État: Consultation terminée          │
│ Ordonnance: Disponible               │
│ Suivi: Prévu pour le 11 juin         │
│                                      │
│ [Voir rapport]                       │
│ [Télécharger ordonnance]             │
│ [Programmer suivi]                   │
└──────────────────────────────────────┘
```

---

---

# 📋 SCÉNARIO 2: Patient Recevant des Résultats d'Analyses

## Les Acteurs:
- **Aminata Touré** - Patiente (35 ans)
- **Laboratoire Biosciences** - Prestataire
- **Adam Cisse** - Laborantin (Préparateur)
- **Dr. Sow** - Médecin demandeur

---

### **Étape 1: Prescription d'Analyses (Jour 1 - 14:00)**

**Pendant une consultation, Dr. Sow prescrit des analyses:**

```
Interface Dr. Sow:
┌──────────────────────────────────┐
│ Prescription Analyses pour:      │
│ 👩 Aminata Touré                 │
│                                  │
│ 🧪 ANALYSES PRESCRITES:          │
│ ☑ Bilan sanguin complet          │
│   • Hémoglobine                  │
│   • Glukose                      │
│   • Créatinine                   │
│   • TSH                          │
│                                  │
│ ☑ Sérologie VIH                 │
│ ☑ Sérologie Hépatite B          │
│                                  │
│ 🏥 Laboratoire: [Biosciences ▼]  │
│ 📝 Note: "Bilan complet santé"   │
│                                  │
│ [Envoyer prescription]            │
└──────────────────────────────────┘
```

**Notification Aminata:**

```
📬 Vous avez une nouvelle prescription

Bonjour Aminata,

Dr. Sow vous a prescrit des analyses:

🧪 ANALYSES:
• Bilan sanguin complet
• Sérologie VIH
• Sérologie Hépatite B

🏥 LABORATOIRE: Biosciences
📍 Adresse: Rue XX, Ouagadougou

Vous pouvez vous présenter au laboratoire
dès demain avec votre pièce d'identité.

[Voir plus de détails]
```

---

### **Étape 2: Prélèvement au Laboratoire (Jour 2 - 09:00)**

**Aminata arrive au laboratoire:**

```
Accueil Laboratoire:
- Infirmière scanne QR code Hopitel d'Aminata
- Données sync: Prescriptions visibles
- Infirmière: "Bonjour Aminata, bilan complet c'est bien?"
- Prélèvement sanguin effectué
- Tubes étiquetés automatiquement via Hopitel
```

**Dans le système Hopitel du labo:**

```
Adam (Laborantin) reçoit:
┌─────────────────────────────────────┐
│ 📥 Nouveau prélèvement               │
│                                     │
│ Patient: Aminata Touré              │
│ ID: #AM2026060401                   │
│ Date/Heure: 4 juin 09:15            │
│                                     │
│ ANALYSES À FAIRE:                  │
│ ☑ Bilan sanguin complet             │
│ ☑ Sérologie VIH                    │
│ ☑ Sérologie Hépatite B             │
│                                     │
│ Médecin prescripteur: Dr. Sow       │
│                                     │
│ [Marquer comme reçu]                │
│ [Commencer analyses]                │
└─────────────────────────────────────┘
```

---

### **Étape 3: Traitement des Analyses (Jour 2-3)**

**Adam traite les prélèvements:**

```
Interface Laborantin Adam:
┌───────────────────────────────────┐
│ 📊 Résultats à saisir             │
│                                   │
│ Patient: Aminata Touré            │
│ Date analyse: 4 juin 2026         │
│                                   │
│ BILAN SANGUIN:                    │
│ • Hémoglobine: 13.5 g/dL         │
│ • Glukose: 95 mg/dL              │
│ • Créatinine: 0.8 mg/dL          │
│ • TSH: 2.1 mIU/L                 │
│ • Globules blancs: 7.2 K/uL      │
│                                   │
│ SÉROLOGIE:                        │
│ • VIH: Négatif                   │
│ • Hépatite B: Négatif            │
│                                   │
│ ✓ Tous les tests validés         │
│ [Soumettre résultats]            │
└───────────────────────────────────┘
```

---

### **Étape 4: Validation Médicale (Jour 3 - 11:00)**

**Un médecin valide les résultats:**

```
Interface Dr. Validateur:
┌──────────────────────────────────────┐
│ ✓ Résultats à valider                │
│                                      │
│ Aminata Touré - Bilan 4 juin         │
│ Laborantin: Adam Cisse               │
│                                      │
│ RÉSULTATS REÇUS:                    │
│ ✓ Hémoglobine: 13.5 (Normal)        │
│ ✓ Glukose: 95 (Normal)              │
│ ✓ Créatinine: 0.8 (Normal)          │
│ ✓ TSH: 2.1 (Normal)                 │
│ ✓ VIH: Négatif                      │
│ ✓ Hépatite B: Négatif               │
│                                      │
│ ✅ TOUS LES RÉSULTATS NORMAUX       │
│                                      │
│ Commentaire: "Bilan de santé OK"    │
│                                      │
│ [Valider] [Rejeter] [Demander précision]
└──────────────────────────────────────┘
```

---

### **Étape 5: Résultats Disponibles pour Aminata (Jour 3 - 15:00)**

**Aminata reçoit une notification:**

```
📬 Vos résultats sont disponibles!

Bonjour Aminata,

Vos analyses effectuées le 4 juin sont 
maintenant disponibles.

🧪 RÉSUMÉ:
✓ Bilan sanguin: Tous les paramètres normaux
✓ Sérologie VIH: Négatif ✓
✓ Sérologie Hépatite B: Négatif ✓

📊 Tout va bien! ✅

Vous pouvez consulter le rapport détaillé
et le télécharger en PDF.

🔗 [Voir résultats]
```

**Aminata se connecte et voit:**

```
Dashboard Aminata:
┌──────────────────────────────────────┐
│ 📊 Vos Résultats                     │
│                                      │
│ 🟢 BILAN COMPLET - 4 juin 2026      │
│ Status: ✅ VALIDÉ                   │
│ Médecin: Dr. Sow (prescripteur)      │
│                                      │
│ RÉSULTATS CLÉS:                     │
│ • Hémoglobine: 13.5 g/dL (Normal) ✓│
│ • Glukose: 95 mg/dL (Normal) ✓     │
│ • VIH: Négatif ✓                   │
│ • Hépatite B: Négatif ✓            │
│                                      │
│ Conclusion: "Tous les résultats     │
│  dans la norme. Pas d'intervention  │
│  nécessaire."                        │
│                                      │
│ [Voir rapport complet]              │
│ [Télécharger PDF]                   │
│ [Partager avec un médecin]          │
└──────────────────────────────────────┘
```

---

### **Étape 6: Code Sécurisé pour Partage (Optionnel)**

**Aminata veut partager ses résultats avec un autre médecin:**

```
Générer Code de Partage:
┌────────────────────────────────┐
│ Partager vos résultats         │
│                                │
│ 🔐 Code sécurisé généré:      │
│    BIO-2026-0601-5847          │
│                                │
│ ⏰ Valide jusqu'au: 01-07-2026 │
│    (30 jours)                  │
│                                │
│ 📋 Les résultats inclus:       │
│ ☑ Bilan sanguin complet        │
│ ☑ Sérologie VIH               │
│ ☑ Sérologie Hépatite B        │
│                                │
│ 🔓 Accès:                      │
│ □ Lecture seule                │
│ ☑ Avec possibilité télécharge  │
│                                │
│ [Copier code] [Partager SMS]   │
└────────────────────────────────┘
```

**Elle partage le code avec Dr. Keita:**

```
Aminata envoie SMS:
"Dr. Keita, mes résultats d'analyses
sur Hopitel: BIO-2026-0601-5847"

Dr. Keita reçoit et utilise le code:
→ Entre le code dans Hopitel
→ Accès instantané aux résultats
→ Peut télécharger pour son dossier
```

---

---

# 📋 SCÉNARIO 3: Docteur Gérant Son Agenda et Consultations

## Les Acteurs:
- **Dr. Keita** - Médecin généraliste
- **Patients multiples** - 12 RDV par jour
- **Admin Hopital** - Gère la plateforme

---

### **Étape 1: Matinée du Médecin (08:00)**

**Dr. Keita ouvre son app Hopitel:**

```
Dashboard Dr. Keita:
┌─────────────────────────────────────────┐
│ 👨‍⚕️ Dr. Keita - 4 juin 2026              │
│                                         │
│ 📊 VUE RAPIDE DU JOUR:                 │
│ • 12 rendez-vous prévus               │
│ • 3 consultations déjà effectuées      │
│ • 8 messages non lus                  │
│ • 5 fiche pré-consultations reçues     │
│                                         │
│ ⏰ PROCHAINS RDV:                      │
│ 10:00 - Moussa Diop (30 min)          │
│        Status: Fiche reçue ✓          │
│ 10:30 - Fatima Cisse (30 min)         │
│        Status: En attente fiche       │
│ 11:00 - Mamadou Sow (45 min)          │
│        Status: Fiche reçue ✓          │
│                                         │
│ [Mon Agenda] [Mes Patients]            │
│ [Messages] [Ordonnances]               │
└─────────────────────────────────────────┘
```

---

### **Étape 2: Avant la 1ère Consultation (09:50)**

**Dr. Keita clique sur Moussa Diop:**

```
Fiche Patient Moussa:
┌─────────────────────────────────────────┐
│ 👨 Moussa Diop - 27 ans - M            │
│                                         │
│ 📋 CONSULTATION: Aujourd'hui 10:00      │
│                                         │
│ 📄 FICHE PRÉ-CONSULTATION:             │
│ Remplie: Oui ✓ (09:25)                │
│                                         │
│ Symptômes actuels:                     │
│ • Mal de tête (5 jours)               │
│ • Fatigue                             │
│ Intensité: Modérée                    │
│                                         │
│ Antécédents:                           │
│ • Asthme                              │
│                                         │
│ Allergies:                             │
│ • Pénicilline (légère)                │
│                                         │
│ Questions du patient:                  │
│ "Pourquoi j'ai souvent des maux      │
│  de tête avec ma fatigue?"            │
│                                         │
│ 📊 Historique:                         │
│ • Dernière consultation: 1 mois      │
│ • Tension: 120/80                    │
│ • IMC: 22 (Normal)                   │
│                                         │
│ [Démarrer consultation]                │
└─────────────────────────────────────────┘
```

---

### **Étape 3: Consultation en Direct (10:00)**

**Dr. Keita lance la consultation vidéo:**

```
Interface Consultation Live:
┌──────────────────────────────────┐
│ 📹 Moussa (Vidéo en direct)      │
│ 🔊 Son activé  📷 Caméra activée │
│                                  │
│ ⏱️ Consultation: 10:00-10:30     │
│                                  │
│ 💬 CHAT TEXTUEL:                 │
│ Moussa: "Dr, j'ai très mal..."   │
│ Dr: "Depuis quand?"              │
│ Moussa: "Depuis 5 jours"         │
│ Dr: "Avez-vous de la fièvre?"    │
│ Moussa: "Non, juste des maux"    │
│                                  │
│ 📎 Dr. peut:                     │
│ • Prendre notes               │
│ • Ajouter observations         │
│ • Partager documents/images   │
│ • Voir tension si tensiomètre  │
│                                  │
│ 🔧 Actions:                      │
│ [📋 Diagnostic]                  │
│ [💊 Ordonnance]                  │
│ [🔗 Suivi]                       │
│ [📞 Terminer]                    │
└──────────────────────────────────┘
```

---

### **Étape 4: Enregistrement Diagnostic (10:25)**

**Dr. Keita remplit les résultats:**

```
Formulaire Diagnostic:
┌────────────────────────────────────┐
│ 📋 RÉSUMÉ CONSULTATION             │
│                                    │
│ MOTIF: Maux de tête + Fatigue      │
│                                    │
│ EXAMEN CLINIQUE:                  │
│ • Tension: 118/78 (Normal)         │
│ • Fréquence cardiaque: 72 bpm      │
│ • Température: 36.8°C (Normal)     │
│ • Respiration: Normale             │
│                                    │
│ OBSERVATIONS:                      │
│ "Patient décrit mal de tête depuis │
│  5j, aggravé le matin. Asthme bien│
│  contrôlé. À l'écoute stéth:      │
│  poumons clairs."                  │
│                                    │
│ DIAGNOSTIC: Migraine + Fatigue    │
│            (probablement stress)   │
│                                    │
│ PLAN DE TRAITEMENT:               │
│ □ Revoir dans 1 semaine           │
│ ✓ Ordonnance                      │
│ ✓ Repos                           │
│ □ Analyses complémentaires        │
│                                    │
│ [Valider] [Brouillon]             │
└────────────────────────────────────┘
```

**Dr. remplit l'ordonnance:**

```
ORDONNANCE:
┌──────────────────────────────────┐
│ Dr. Keita                         │
│                                  │
│ Pour: Moussa Diop                │
│ Date: 4 juin 2026                │
│                                  │
│ MÉDICAMENTS:                     │
│                                  │
│ 1) Paracétamol 500mg            │
│    Posologie: 1 comprimé         │
│    Fréquence: 3x par jour        │
│    Durée: 7 jours               │
│    Avec/sans repas: Après repas │
│                                  │
│ 2) Repos complet                │
│    Recommandation: 2-3 jours    │
│    Éviter stress/écrans         │
│                                  │
│ SUIVI:                           │
│ RDV de suivi: 11 juin (1 semaine)│
│ Revenir si: Symptômes persistent│
│            après 3 jours        │
│                                  │
│ [Enregistrer]                    │
└──────────────────────────────────┘
```

---

### **Étape 5: Fin Consultation & Notifications (10:30)**

**Ordonnance envoyée automatiquement à Moussa:**

```
📬 HOPITEL - Ordonnance disponible

Bonjour Moussa,

Votre consultation avec Dr. Keita est terminée.

💊 ORDONNANCE:
• Paracétamol 500mg - 3x par jour pendant 7j
• Repos 2-3 jours recommandé

📋 Diagnostic: Migraine + Fatigue

👨‍⚕️ Conseil: "Revenez dans 1 semaine pour 
un suivi."

🔗 [Voir ordonnance complète]
[Télécharger PDF]
[Programmer suivi]
```

**Dr. Keita enchaîne avec patient suivant (10:35):**

```
Notification Fatima Cisse:
┌──────────────────────────────────┐
│ Fatima Cisse - 10:30             │
│                                  │
│ Fiche pré-consultation: ❌ Pas   │
│ reçue                            │
│                                  │
│ 💭 Dr Keita clique:              │
│ "Envoyer rappel à Fatima"        │
│                                  │
│ → SMS envoyé à Fatima:           │
│ "Bonjour, votre consultation est │
│  dans 10 min. Remplissez votre   │
│  fiche SVP:"                     │
│ [Lien vers fiche]                │
└──────────────────────────────────┘
```

---

### **Étape 6: Fin Journée - Rapport (17:00)**

**Dr. Keita fait le bilan de sa journée:**

```
Rapport Journée Dr. Keita:
┌──────────────────────────────────────┐
│ 📊 RÉSUMÉ - 4 juin 2026              │
│                                      │
│ CONSULTATIONS:                       │
│ • Total du jour: 12                  │
│ • Effectuées: 11 ✓                   │
│ • Annulées: 1 (Patient malade)       │
│                                      │
│ DIAGNOSTICS FRÉQUENTS:               │
│ • Migraine/Céphalée: 4              │
│ • Infection ORL: 3                   │
│ • Hypertension: 2                    │
│ • Consultation générale: 2           │
│                                      │
│ ORDONNANCES CRÉÉES: 11              │
│ SUIVIS PROGRAMMÉS: 7                │
│ ANALYSES PRESCRITES: 5              │
│                                      │
│ MESSAGES:                            │
│ • Reçus: 8                           │
│ • Répondus: 8 ✓                      │
│                                      │
│ 📈 STATISTIQUES MENSUELLES:         │
│ • Consultations ce mois: 228         │
│ • Satisfaction patients: 4.7/5 ⭐    │
│ • Temps moyen consultation: 24 min   │
│                                      │
│ [Exporter rapport] [Voir détails]   │
└──────────────────────────────────────┘
```

---

---

# 📋 SCÉNARIO 4: Admin Hopital Gérant Son Établissement

## Les Acteurs:
- **Boumédienne Fall** - Admin Hôpital Universitaire
- **12 Médecins** - Équipe de l'hôpital
- **5 Laborantins** - Service de biologie
- **300+ Patients** - Patients enregistrés

---

### **Étape 1: Ouverture Dashboard (08:00)**

**Boumédienne arrive au travail et ouvre Hopitel:**

```
Dashboard Admin Hôpital:
┌─────────────────────────────────────────────┐
│ 🏥 HÔPITAL UNIVERSITAIRE - 4 juin 2026      │
│ Admin: Boumédienne Fall                      │
│                                             │
│ 📊 VUE D'ENSEMBLE:                          │
│ • Patients actifs ce mois: 287             │
│ • Consultations aujourd'hui: 48            │
│ • Rendez-vous à venir: 127                 │
│ • Analyses en cours: 34                    │
│ • Médecins actifs: 12                      │
│ • Satisfaction patients: 4.6/5 ⭐         │
│                                             │
│ 🚨 ALERTES IMPORTANTES:                    │
│ ⚠️ 1 laborantin absent aujourd'hui          │
│ ⚠️ 3 analyses retard de 2 jours            │
│ ⚠️ 15 fiche pré-consult. non remplies      │
│                                             │
│ 🎯 ACTIONS RAPIDES:                        │
│ [Médecins] [Laborantins] [Services]         │
│ [Patients] [Rendez-vous] [Analyses]         │
└─────────────────────────────────────────────┘
```

---

### **Étape 2: Gestion des Médecins (08:30)**

**Boumédienne clique sur "Médecins":**

```
Liste Médecins:
┌────────────────────────────────────────────┐
│ 👨‍⚕️ ÉQUIPE MÉDICALE - 12 médecins          │
│                                            │
│ 1. Dr. Keita                               │
│    Spécialité: Médecine Générale           │
│    Status: 🟢 ACTIF (Connecté)             │
│    Consultations aujourd'hui: 12/12 ✓      │
│    Évaluation: 4.8/5 ⭐                    │
│    [Voir agenda] [Voir stats]              │
│                                            │
│ 2. Dr. Sow                                 │
│    Spécialité: Gynécologie                 │
│    Status: 🟢 ACTIF (Connecté)             │
│    Consultations aujourd'hui: 8/10         │
│    Évaluation: 4.7/5 ⭐                    │
│    [Voir agenda] [Voir stats]              │
│                                            │
│ 3. Dr. Ben                                 │
│    Spécialité: Cardiologie                 │
│    Status: 🟡 OFFLINE                      │
│    Consultations aujourd'hui: 0/6          │
│    ⚠️ Pas connecté depuis 08:00             │
│    [Notifier] [Voir stats]                 │
│                                            │
│ 4-12. ...                                  │
│                                            │
│ [Ajouter médecin] [Importer CSV]           │
└────────────────────────────────────────────┘
```

**Boumédienne envoie rappel à Dr. Ben:**

```
Notification Dr. Ben:
📬 Alerte: Vous êtes hors ligne

Bonjour Dr. Ben,

Vous n'êtes pas connecté à Hopitel.
Vous avez 6 consultations prévues aujourd'hui.

Vos patients:
10:00 - Ibrahim Cisse
10:45 - Aïssatou Kante
11:30 - ...

Veuillez vous connecter dans les 30 minutes.

[Se connecter] [Contacter support]
```

---

### **Étape 3: Gestion des Rendez-vous (09:00)**

**Boumédienne clique sur "Rendez-vous":**

```
Tableau Rendez-vous:
┌────────────────────────────────────────────────┐
│ 📅 RENDEZ-VOUS - 4 juin 2026                  │
│                                               │
│ FILTRE: [Aujourd'hui] Tous | Par médecin ▼   │
│         [Affichage: Chronologique]            │
│                                               │
│ ⏰ 08:00 - 09:00 - Dr. Keita - 3 consultations│
│   ✓ Patients: Moussa, Fatima, Mamadou        │
│   Status: Consultations effectuées           │
│                                               │
│ ⏰ 10:00 - 11:00 - Dr. Sow - 2 consultations │
│   ✓ Patients: Aïssatou, Boubou               │
│   Status: En cours                           │
│                                               │
│ ⏰ 11:00 - 12:00 - Dr. Ben - 1 consultation  │
│   ⚠️ Patient: Ibrahim                        │
│   Status: EN ATTENTE - Dr. Ben offline!      │
│   [Notifier patient] [Rediriger vers autre]  │
│                                               │
│ 💡 SUGGESTION SYSTÈME:                       │
│ "Proposer à Ibrahim une consultation         │
│  avec Dr. Keita à 13:30 (créneau libre)     │
│ [Proposer] [Ignorer]                        │
│                                               │
│ STATISTIQUES:                                │
│ • Total RDV d'aujourd'hui: 48               │
│ • Confirmés: 42 (87%)                       │
│ • Annulés: 3 (6%)                           │
│ • En attente: 3 (7%)                        │
└────────────────────────────────────────────────┘
```

---

### **Étape 4: Suivi des Analyses (09:30)**

**Boumédienne clique sur "Analyses":**

```
Tableau Analyses:
┌──────────────────────────────────────────────┐
│ 🧪 ANALYSES - Statut en temps réel           │
│                                              │
│ EN ATTENTE DE PRÉLÈVEMENT: 12               │
│ • Amara Toure - Prescription 03/06 ⚠️ +1j   │
│ • Sekou Diallo - Prescription 04/06         │
│ • ... 10 autres                             │
│                                              │
│ EN COURS DE TRAITEMENT: 18                  │
│ • Hamma Cisse - Depuis 2h ✓                │
│ • Fatoumata Traore - Depuis 4h ✓           │
│ • Adam Sow - Depuis 6h ⚠️ Retard           │
│ • ... 15 autres                            │
│                                              │
│ ANALYSES TERMINÉES: 34                      │
│ ✓ En attente de validation: 8              │
│ ✓ Validées & livrées: 26                   │
│ ⚠️ Rejetées (à refaire): 2                 │
│                                              │
│ 🎯 ACTION NÉCESSAIRE:                       │
│ • Accélérer 3 analyses retard (Adam Sow et 2 autres)
│ • Valider 8 analyses en attente             │
│ • Relancer patient Amara pour prélèvement   │
│                                              │
│ [Voir détails] [Créer rapport retards]      │
└──────────────────────────────────────────────┘
```

**Boumédienne clique sur "Voir détails" - Analyses retard:**

```
Détail Analyse Retard:
┌──────────────────────────────────────────┐
│ ⚠️ ANALYSE RETARD                        │
│                                          │
│ Patient: Adam Sow                        │
│ Prescription: 02 juin 2026 (2 jours)    │
│ Status: EN COURS DEPUIS 6 HEURES        │
│ Analyses: Bilan complet + sérologie     │
│                                          │
│ Laborantin assigné: Hassan Sylla        │
│ Statut: 🟢 Actif sur ce dossier         │
│                                          │
│ 📝 Notes:                                │
│ "Complexité: Analyses multiples"        │
│ "Standard: 2-3 heures"                  │
│ "Retard estimé: 3-4 heures"             │
│                                          │
│ ACTIONS:                                 │
│ [Contacter Hassan] [Prioriser]           │
│ [Statut patient]                         │
└──────────────────────────────────────────┘
```

---

### **Étape 5: Génération de Rapports (10:00)**

**Boumédienne va dans "Rapports":**

```
Menu Rapports Disponibles:
┌────────────────────────────────────────┐
│ 📊 RAPPORTS ADMIN                      │
│                                        │
│ 📈 PERFORMANCE:                        │
│ □ Rapport Activité Mensuelle           │
│ □ KPIs Médecins                        │
│ □ Taux Satisfaction Patients           │
│ □ Temps moyen consultation             │
│                                        │
│ 🏥 OPÉRATIONNEL:                       │
│ □ Rendez-vous & Consultations         │
│ □ Analyses & Résultats                 │
│ □ Ordonnances émises                   │
│ □ Suivis programmés                    │
│                                        │
│ 💼 FINANCIER:                          │
│ □ Revenus par spécialité               │
│ □ Revenus par médecin                  │
│ □ Coûts analyses                       │
│ □ Bilan du mois                        │
│                                        │
│ [Générer Rapport] [Exporter]           │
└────────────────────────────────────────┘
```

**Boumédienne génère "Rapport Activité Mensuelle":**

```
RAPPORT - JUIN 2026 (Partiel: 1-4 juin)
┌─────────────────────────────────────────────┐
│ 📊 HÔPITAL UNIVERSITAIRE                   │
│ Période: 1-4 juin 2026                     │
│                                            │
│ 👥 PATIENTS:                               │
│ • Nouveaux patients: 34                    │
│ • Patients actifs ce mois: 287             │
│ • Patients retournants: 253 (88%)           │
│                                            │
│ 📅 CONSULTATIONS:                          │
│ • Total consultations: 189                 │
│ • Moyenne par jour: 47.25                  │
│ • Taux complétion: 94% (189/201 planifiées)
│                                            │
│ 👨‍⚕️ MÉDECINS:                              │
│ • Actifs ce mois: 12                       │
│ • Consultations moyenne/médecin: 15.75    │
│ • Meilleur rating: Dr. Keita (4.8/5)      │
│                                            │
│ 🧪 ANALYSES:                               │
│ • Total prescrites: 156                    │
│ • Complétées: 142 (91%)                    │
│ • Temps moyen: 32h (acceptable)            │
│ • Retards (>48h): 14 (9%)                  │
│                                            │
│ 💰 REVENUS:                                │
│ • Consultations: 2,835,000 FCFA            │
│ • Analyses: 1,210,000 FCFA                │
│ • Total: 4,045,000 FCFA                   │
│                                            │
│ ⭐ SATISFACTION:                           │
│ • Moyenne patients: 4.6/5 ⭐              │
│ • Recommandation hôpital: 92%              │
│                                            │
│ [Exporter PDF] [Envoyer direction]        │
└─────────────────────────────────────────────┘
```

---

---

# 📋 SCÉNARIO 5: Patient Utilisant l'Assistant IA Hopitel

## Les Acteurs:
- **Sekou Diallo** - Patient (45 ans)
- **Hopitel Chatbot** - Assistant IA
- **Dr. Keita** - Médecin de suivi

---

### **Étape 1: Accès au Chatbot (19:00)**

**Sekou a des questions avant d'aller chez le médecin:**

```
Dashboard Patient:
┌────────────────────────────────┐
│ Accueil Sekou Diallo           │
│                                │
│ 🤖 ASSISTANT SANTÉ IA           │
│ "Bonjour Sekou, comment puis-je│
│  vous aider?"                   │
│                                │
│ Suggestions rapides:           │
│ • "J'ai de la fièvre"         │
│ • "Mal de gorge depuis 3j"    │
│ • "Problème de sommeil"        │
│ • "Conseil nutrition"          │
│ • "Médecin à proximité"        │
│                                │
│ 💬 Ou tapez votre question...  │
│ [Champ texte libre]            │
│                                │
│ ℹ️ "L'IA n'est pas un diagnostic│
│    médical. Consultez un       │
│    médecin pour confirmation"  │
└────────────────────────────────┘
```

---

### **Étape 2: Conversation avec l'IA (19:05)**

**Sekou tape sa question:**

```
Sekou: "Depuis une semaine, j'ai mal 
       à la gorge et toux, que je fasse?"

🤖 IA Hopitel: "Bonjour Sekou, mal de gorge 
et toux pendant une semaine peuvent indiquer 
plusieurs conditions.

Pouvez-vous me donner plus d'informations?

1) Avez-vous de la fièvre?
2) La toux est-elle productive (avec crachat)?
3) Avez-vous mal en avalant?
4) Avez-vous des antécédents de rhinite?"

Sekou: "Oui, j'ai 38.5°C de fièvre, 
       la toux a du crachat, et mal 
       en avalant oui"

🤖 IA: "Merci pour ces informations.
Vos symptômes suggèrent une angine ou une 
infection virale des voies respiratoires.

✅ CE QUE JE RECOMMANDE:

1) SOINS À DOMICILE:
   • Repos complet
   • Boire beaucoup (thé chaud, eau)
   • Gargarisme avec eau salée
   • Paracétamol/Ibuprofène pour fièvre

2) ⚠️ QUAND CONSULTER UN MÉDECIN:
   • Immédiatement si difficulté à respirer
   • Si fièvre > 39°C
   • Si mal s'aggrave après 3-4 jours
   • Si apparition de taches rouges

3) 📅 RECOMMANDATION:
   Je vous conseille une consultation 
   avec un ORL dans les 2-3 jours.

Voulez-vous que je vous aide à prendre 
un rendez-vous?"

Sekou: "Oui, aidez-moi à trouver un ORL"

🤖 IA: "Parfait! Je vois que vous êtes 
à Ouagadougou.

MÉDECINS ORL À PROXIMITÉ:

1) Dr. Amadou Fall
   🏥 Hôpital Universitaire (2.3 km)
   Rating: 4.7/5 ⭐
   Disponibilités: Demain 14:00, 
                  Jeudi 10:00
   💰 Consultation: 20,000 FCFA

2) Dr. Kone Yaya
   🏥 Clinique Maladies (4.1 km)
   Rating: 4.5/5 ⭐
   Disponibilités: Jeudi 15:00
   💰 Consultation: 18,000 FCFA

Lequel préférez-vous?"

Sekou: "Dr. Fall, demain 14:00"

🤖 IA: "✅ Je vous propose maintenant de:

1) Prendre rendez-vous chez Dr. Fall 
   (demain 14:00)
2) Remplir votre fiche pré-consultation
3) Télé-consulter un médecin généraliste 
   ce soir si urgent

Quelle action souhaitez-vous?"

Sekou: "Prendre RDV"

🤖 IA: "✅ Rendez-vous confirmé!

📅 Dr. Amadou Fall
   Demain (5 juin) à 14:00
   ORL - Hôpital Universitaire
   💰 20,000 FCFA

📋 Vous devez remplir votre fiche 
   pré-consultation avant demain 13:00.

🔔 Rappel SMS envoié:
   "+226 XX XX XX XX"

📍 Adresse hôpital:
   "Rue XX, Ouagadougou"

Des questions?"

Sekou: "Non, merci beaucoup"

🤖 IA: "De rien Sekou! 😊

💡 CONSEILS POUR DEMAIN:
   • Apportez votre pièce d'identité
   • Arrivez 15 min avant
   • Apportez tout document médical 
     antérieur
   • Notez vos questions

Bon rétablissement!"
```

---

### **Étape 3: Suivi - Notification Fiche Pré-Consult (20:00)**

**Sekou reçoit une notification:**

```
📬 Fiche pré-consultation à remplir

Bonjour Sekou,

Votre consultation avec Dr. Fall 
est demain à 14:00.

🔗 Veuillez remplir votre fiche 
pré-consultation:

[Remplir fiche]

Délai: Avant demain 13:00
```

**Sekou remplit la fiche:**

```
Fiche Pré-Consultation - Dr. Fall (ORL):
┌───────────────────────────────────┐
│ SYMPTÔMES ACTUELS:               │
│ ☑ Mal de gorge (depuis 7 jours)  │
│ ☑ Toux productive                │
│ ☑ Fièvre (38.5°C)                │
│ □ Perte audition                 │
│ □ Vertiges                       │
│                                  │
│ ANTÉCÉDENTS ORL:                 │
│ ☑ Sinusite (2 ans)              │
│ □ Otites régulières              │
│ □ Polypes                        │
│                                  │
│ TRAITEMENTS EN COURS:            │
│ Paracétamol (selon besoins)      │
│                                  │
│ QUESTIONS:                       │
│ "Est-ce une angine? Besoin      │
│  d'antibiotiques?"               │
│                                  │
│ [Soumettre fiche]                │
└───────────────────────────────────┘
```

---

### **Étape 4: Consultation Prévue + Suivi**

**Sekou va consulter Dr. Fall le lendemain (05/06 à 14:00):**

```
Dr. Fall examine Sekou et diagnostique:
→ Angine virale (pas bactérienne)
→ Pas d'antibiotiques nécessaires
→ Repos + gargara...
```

---

---

# 🎯 RÉSUMÉ DES FONCTIONNALITÉS PAR RÔLE

## 👤 PATIENT - 18+ Fonctionnalités

✅ **Gestion Rendez-vous:**
- Recherche médecins/hôpitaux/spécialités
- Voir disponibilités en temps réel
- Prendre/modifier/annuler RDV
- Notifications rappel 24h avant

✅ **Consultations:**
- Consultation vidéo en direct
- Chat textuel pendant consultation
- Partage fichiers/images
- Accès fiche pré-consultation

✅ **Résultats Médicaux:**
- Voir résultats analyses
- Télécharger en PDF
- Code sécurisé de partage (30 jours)
- Historique complet

✅ **Communication:**
- Messages directs médecins
- Chat général
- Notifications
- Support multicanal (SMS, app)

✅ **Assistant IA:**
- Questions santé 24/7
- Orientation médicale
- Conseils hygiène
- Aide prise RDV

✅ **Profil & Données:**
- Profil complet
- Antécédents médicaux
- Allergies documentées
- Historique consultations

✅ **Géolocalisation:**
- Hôpitaux proches
- Navigation GPS
- Heures d'ouverture
- Services disponibles

✅ **Suivi Personnel:**
- Ordonnances
- Médicaments en cours
- Suivi calendrier
- Alertes santé

---

## 👨‍⚕️ MÉDECIN - 15+ Fonctionnalités

✅ **Agenda & Consultations:**
- Fixer ses disponibilités
- Gérer agenda journalier
- Consultations vidéo
- Fiche pré-consultations

✅ **Dossier Patient:**
- Voir historique complet
- Antécédents
- Traitements antérieurs
- Allergies

✅ **Diagnostic & Traitement:**
- Enregistrer diagnostic
- Prescrire ordonnances
- Prescrire analyses
- Enregistrer observations

✅ **Suivi Patient:**
- Programmer suivi
- Voir respect traitements
- Résultats analyses
- Historique patient

✅ **Communications:**
- Messagerie patients
- Notifications automatiques
- Alertes analyses
- Ordonnances digitales

✅ **Téléexpertise:**
- Consultation autres médecins
- Partage dossiers
- Avis spécialistes
- Collaboration

✅ **Rapports:**
- Activité quotidienne
- KPIs patients
- Statistiques consultation
- Taux satisfaction

---

## 🧬 LABORANTIN - 10+ Fonctionnalités

✅ **Réception Prélèvements:**
- Voir prescriptions
- Scanner code QR patient
- Enregistrer prélèvement
- Stocker dans coolbox

✅ **Traitement Analyses:**
- Lister analyses à faire
- Enregistrer résultats
- Valider tests
- Marquer terminer

✅ **Gestion Qualité:**
- Valider/rejeter résultats
- Demander répétition
- Documenter anomalies
- Contrôle qualité

✅ **Communications:**
- Voir prescripteur
- Notifications médecin
- Messages urgences
- Alertes résultats

✅ **Rapports Activité:**
- Analyses du jour
- Résultats en retard
- Temps moyen traitement
- Taux erreur

---

## 🏥 ADMIN HÔPITAL - 20+ Fonctionnalités

✅ **Gestion Médecins:**
- Ajouter/modifier médecins
- Assigner horaires
- Voir disponibilités
- Gérer droits d'accès

✅ **Gestion Laborantins:**
- Ajouter/modifier staff
- Assigner analyses
- Gérer planning
- Notification absences

✅ **Gestion Services:**
- Créer services
- Assigner médecins
- Gérer tarifs
- Voir historique

✅ **Rendez-vous:**
- Voir tous RDV hôpital
- Alertes annulations
- Redirection patients
- Gestion no-shows

✅ **Analyses:**
- Voir toutes analyses
- Alerter retards
- Suivre traitement
- Valider résultats

✅ **Rapports:**
- Activité hôpital
- Financier mensuel
- KPIs médecins
- Satisfaction patients

✅ **Paramètres:**
- Info hôpital
- Horaires d'ouverture
- Tarifs services
- Politiques

---

## 🔐 SUPER ADMIN - 25+ Fonctionnalités

✅ **Gestion Hôpitaux:**
- Créer/modifier hôpitaux
- Voir statistiques
- Alertes problèmes
- Suspension compte

✅ **Gestion Utilisateurs:**
- Tous les rôles
- Bulkk import CSV
- Suspendre/activer
- Audit actions

✅ **Gestion Services:**
- Tous les services platform
- Tarification nationale
- Spécialités
- Hiérarchie

✅ **Demandes:**
- Voir demandes services
- Approuver/rejeter
- Gestion workflows
- Notifications

✅ **Statistiques Globales:**
- Patients total
- Consultations total
- Revenus total
- KPIs platform

✅ **Sécurité:**
- Logs accès
- Audit trail
- Backup données
- Gestion données sensibles

---

**Hopitel est une plateforme complète de telemedicine avec 100+ fonctionnalités, supportant 5 rôles, 100+ endpoints API, et feature parity complète entre web et mobile!** 🚀

