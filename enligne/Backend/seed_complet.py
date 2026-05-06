import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_soutenance.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Patient, Medecin, Laborantin
from hopitaux.models import Hopital, Service, HopitalService, MedecinService
from rendezvous.models import RendezVous, Disponibilite, PreEnregistrement, Consultation
from resultats.models import DemandeAnalyse
from messagerie.models import Message

User = get_user_model()

def run():
    print("[START] Début du Seed Complet pour E-Santé Bénin (Basé sur l'analyse stricte des modèles)")
    
    # ─────────────────────────────────────────────────────────
    # 1. Hôpitaux et Services
    # ─────────────────────────────────────────────────────────
    h_cnhu, _ = Hopital.objects.get_or_create(
        nom="CNHU-HKM Cotonou",
        defaults={"adresse": "Quartier Haie Vive, Cotonou", "ville": "Cotonou", "latitude": 6.3667, "longitude": 2.4000, "telephone": "+229 21 30 01 02", "email": "contact@cnhu.bj"}
    )
    
    h_pnovo, _ = Hopital.objects.get_or_create(
        nom="CHUD Ouémé Plateau (Porto-Novo)",
        defaults={"adresse": "Ouando, Porto-Novo", "ville": "Porto-Novo", "latitude": 6.4967, "longitude": 2.6288, "telephone": "+229 20 21 21 21", "email": "contact@chud-op.bj"}
    )

    s_cardio, _ = Service.objects.get_or_create(nom="Cardiologie", defaults={"description": "Maladies du cœur et des vaisseaux."})
    s_pedia, _ = Service.objects.get_or_create(nom="Pédiatrie", defaults={"description": "Médecine des enfants et adolescents."})

    HopitalService.objects.get_or_create(hopital=h_cnhu, service=s_cardio)
    HopitalService.objects.get_or_create(hopital=h_cnhu, service=s_pedia)
    HopitalService.objects.get_or_create(hopital=h_pnovo, service=s_pedia)

    # ─────────────────────────────────────────────────────────
    # 2. Utilisateurs et Profils (Tous ont "telephone" et "sexe" requis selon le modèle User)
    # ─────────────────────────────────────────────────────────
    admin_gen, _ = User.objects.get_or_create(email="admin@esante-benin.com", defaults={"role": "admin_general", "first_name": "Admin", "last_name": "Général", "telephone": "22900000000", "sexe": "M"})
    if not admin_gen.check_password("Esante2025!"): admin_gen.set_password("Esante2025!"); admin_gen.save()

    # Note: "AdminHopital" n'est pas un profil spécifique (contrairement à Medecin/Patient), juste un User rattaché à un hôpital.
    admin_hop, _ = User.objects.get_or_create(email="admin.cnhu@esante-benin.com", defaults={"role": "admin_hopital", "first_name": "Directeur", "last_name": "CNHU", "hopital": h_cnhu, "telephone": "22911111111", "sexe": "M"})
    if not admin_hop.check_password("Esante2025!"): admin_hop.set_password("Esante2025!"); admin_hop.save()

    # >>> MEDICINS
    u_med1, _ = User.objects.get_or_create(email="dossou@esante.com", defaults={"role": "medecin", "first_name": "Jean", "last_name": "Dossou", "hopital": h_cnhu, "telephone": "22922222222", "sexe": "M"})
    if not u_med1.check_password("Esante2025!"): u_med1.set_password("Esante2025!"); u_med1.save()
    med1, _ = Medecin.objects.get_or_create(user=u_med1, defaults={"numero_ordre": "MED-FINAL-001"})
    MedecinService.objects.get_or_create(medecin=med1, service=s_cardio)

    u_med2, _ = User.objects.get_or_create(email="tossou@esante.com", defaults={"role": "medecin", "first_name": "Marie", "last_name": "Tossou", "hopital": h_cnhu, "telephone": "22933333333", "sexe": "F"})
    if not u_med2.check_password("Esante2025!"): u_med2.set_password("Esante2025!"); u_med2.save()
    med2, _ = Medecin.objects.get_or_create(user=u_med2, defaults={"numero_ordre": "MED-FINAL-002", "duree_rdv_default": 45})
    MedecinService.objects.get_or_create(medecin=med2, service=s_pedia)

    # >>> PATIENTS
    u_pat1, _ = User.objects.get_or_create(email="sidicke@esante.com", defaults={"role": "patient", "first_name": "Sidicke", "last_name": "Traoré", "telephone": "22944444444", "sexe": "M"})
    if not u_pat1.check_password("Esante2025!"): u_pat1.set_password("Esante2025!"); u_pat1.save()
    pat1, _ = Patient.objects.get_or_create(user=u_pat1, defaults={"groupe_sanguin": "O+", "contact_urgence_nom": "KONE Ali", "contact_urgence_tel": "22955555555"})

    # >>> LABORANTINS
    u_lab1, _ = User.objects.get_or_create(email="lab.dossou@esante.com", defaults={"role": "laborantin", "first_name": "Paul", "last_name": "Dossou-Labo", "hopital": h_cnhu, "telephone": "22966666666", "sexe": "M"})
    if not u_lab1.check_password("Esante2025!"): u_lab1.set_password("Esante2025!"); u_lab1.save()
    lab1, _ = Laborantin.objects.get_or_create(user=u_lab1, defaults={"laboratoire": "Biologie Médicale CNHU"})

    # ─────────────────────────────────────────────────────────
    # 3. Disponibilités & Rendez-vous
    # ─────────────────────────────────────────────────────────
    Disponibilite.objects.get_or_create(medecin=med1, jour_semaine=2, defaults={"heure_debut": "09:00", "heure_fin": "12:00", "type": "recurrent"})
    Disponibilite.objects.get_or_create(medecin=med1, jour_semaine=4, defaults={"heure_debut": "14:00", "heure_fin": "17:00", "type": "recurrent"})
    Disponibilite.objects.get_or_create(medecin=med2, jour_semaine=1, defaults={"heure_debut": "08:00", "heure_fin": "13:00", "type": "recurrent"})

    demain = timezone.now() + timedelta(days=1)
    
    rdv1, _ = RendezVous.objects.get_or_create(
        patient=pat1, medecin=med1, statut='en_attente',
        defaults={"date_heure": demain.replace(hour=10, minute=0, second=0), "duree": 30, "motif": "Douleurs thoraciques fréquentes."}
    )

    rdv_termine, _ = RendezVous.objects.get_or_create(
        patient=pat1, medecin=med1, statut='termine',
        defaults={"date_heure": (timezone.now() - timedelta(days=5)).replace(hour=9, minute=0, second=0), "duree": 30, "motif": "Visite de contrôle générale."}
    )

    # ─────────────────────────────────────────────────────────
    # 4. Intake (Préenregistrement)
    # ─────────────────────────────────────────────────────────
    PreEnregistrement.objects.get_or_create(
        rendez_vous=rdv1,
        defaults={"symptomes_principaux": "Essoufflement rapide au moindre effort", "debut_symptomes": (timezone.now() - timedelta(days=7)).date()}
    )

    # ─────────────────────────────────────────────────────────
    # 5. Consultation & Résultats d'Analyse (Laboratoire)
    # ─────────────────────────────────────────────────────────
    consult, _ = Consultation.objects.get_or_create(
        rendez_vous=rdv_termine,
        defaults={"compte_rendu": "Le patient est stable mais nécessite une analyse sanguine.", "prescription": "Prise de sang complète (NFS)", "est_cloture": True}
    )

    DemandeAnalyse.objects.get_or_create(
        hopital=h_cnhu, laborantin=u_lab1, patient=pat1, statut='en_cours',
        defaults={"patient_nom": pat1.user.last_name, "patient_prenom": pat1.user.first_name, "patient_email": pat1.user.email, "type_analyse": "NFS"}
    )

    # ─────────────────────────────────────────────────────────
    # 6. Messagerie asynchrone (Chat Patient/Médecin)
    # ─────────────────────────────────────────────────────────
    Message.objects.get_or_create(expediteur=u_pat1, destinataire=u_med1, defaults={"contenu": "Bonjour Docteur, j'ai eu mes résultats d'analyse au laboratoire, dois-je venir demain à jeun ?", "consultation": consult})
    Message.objects.get_or_create(expediteur=u_med1, destinataire=u_pat1, defaults={"contenu": "Bonjour Sidicke, non ce n'est pas la peine. Apportez simplement les résultats. À demain.", "consultation": consult})

    print("[SUCCESS] Seed E-Santé Benin exécuté avec ZERO ERREUR structurale. Modèles respectés à 100%.")

if __name__ == '__main__':
    run()
