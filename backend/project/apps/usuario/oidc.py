from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from django.conf import settings
from persona.models import Persona
import logging

logger = logging.getLogger(__name__)

class CustomOIDCAuthenticationBackend(OIDCAuthenticationBackend):
    def update_user(self, user, claims):
        """
        Sincroniza los datos del usuario y la persona con los claims de OIDC.
        """
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.email = claims.get('email', user.email)
        user.save()

        # Extraer datos para Persona
        documento = claims.get('documento_identidad')
        cuil = claims.get('cuil')
        
        if documento:
            persona, created = Persona.objects.get_or_create(
                documento_identidad=documento,
                defaults={
                    'nombre': user.first_name,
                    'apellido': user.last_name,
                    'cuit': cuil or '',
                    'sexo': claims.get('gender', 'o')[:1].lower() if claims.get('gender') else 'o'
                }
            )
            
            # Actualizar campos si ya existía pero vienen nuevos datos
            if not created:
                persona.nombre = user.first_name
                persona.apellido = user.last_name
                if cuil:
                    persona.cuit = cuil
                persona.save()

            # Vincular persona al usuario si no la tiene
            if not user.persona or user.persona != persona:
                user.persona = persona
                user.save()

        return user

    def create_user(self, claims):
        """
        Crea el usuario y lo inicializa con los datos de OIDC.
        """
        user = super(CustomOIDCAuthenticationBackend, self).create_user(claims)
        return self.update_user(user, claims)
