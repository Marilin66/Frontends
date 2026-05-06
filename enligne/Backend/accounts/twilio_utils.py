import re
import logging
from django.conf import settings
from twilio.rest import Client

logger = logging.getLogger(__name__)

def validate_and_format_benin_phone(phone_number):
    """
    Valide que le numéro fait 10 chiffres et commence par '01'.
    Retourne le format international +229XXXXXXXXXX ou None si invalide.
    """
    if not phone_number:
        return None
        
    # Nettoyer le numéro (garder uniquement les chiffres)
    clean_number = re.sub(r'\D', '', phone_number)
    
    # Vérifier le format : 10 chiffres commençant par 01
    if len(clean_number) == 10 and clean_number.startswith('01'):
        return f"+229{clean_number}"
    
    # Cas où l'utilisateur saisit déjà le format international par erreur
    if (len(clean_number) == 13 and clean_number.startswith('22901')):
        return f"+{clean_number}"
        
    return None

def send_twilio_sms(to_number, body):
    """Envoie un SMS via Twilio."""
    formatted_number = validate_and_format_benin_phone(to_number)
    if not formatted_number:
        logger.error(f"Numéro invalide pour Twilio : {to_number}")
        return False
        
    try:
        # Vérifier que Twilio est configuré
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning(f"Twilio non configuré, SMS non envoyé à {formatted_number}")
            return False

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=formatted_number
        )
        logger.info(f"SMS envoyé avec succès à {formatted_number} (SID: {message.sid})")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du SMS Twilio à {formatted_number}: {str(e)}")
        return False
