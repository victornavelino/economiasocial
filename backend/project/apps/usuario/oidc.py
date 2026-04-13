from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from persona.models import Persona
import logging

logger = logging.getLogger(__name__)

Usuario = None  # se carga lazy para evitar import circular


def _get_user_model():
    global Usuario
    if Usuario is None:
        from django.contrib.auth import get_user_model
        Usuario = get_user_model()
    return Usuario


class CustomOIDCAuthenticationBackend(OIDCAuthenticationBackend):

    def filter_users_by_claims(self, claims):
        """
        Busca un usuario existente por:
        1. documento_identidad extraído del claim (CUIL) — vincula al admin local
        2. email del claim
        3. sub (username generado por OIDC)
        Esto evita que se cree un usuario duplicado cuando el admin local
        ya existe con otro email pero la misma persona.
        """
        User = _get_user_model()

        # 1. Buscar por documento_identidad a través de la Persona vinculada
        documento = claims.get('documento_identidad')
        if documento:
            qs = User.objects.filter(persona__documento_identidad=documento)
            if qs.exists():
                # Si hay varios (ej: usuario manual + usuario OIDC), priorizar el staff
                staff_qs = qs.filter(is_staff=True)
                result = staff_qs if staff_qs.exists() else qs
                logger.info(
                    "OIDC: usuario encontrado por documento_identidad=%s → %s (is_staff=%s)",
                    documento, result.first().username, result.first().is_staff
                )
                return result

        # 2. Buscar por email
        email = claims.get('email')
        if email:
            qs = User.objects.filter(email__iexact=email)
            if qs.exists():
                return qs

        # 3. Fallback al comportamiento por defecto (por sub / username)
        return super().filter_users_by_claims(claims)

    def update_user(self, user, claims):
        """
        Sincroniza los datos del usuario y la persona con los claims de OIDC.
        """
        user.first_name = claims.get('given_name', '') or user.first_name
        user.last_name = claims.get('family_name', '') or user.last_name
        # Solo actualizamos el email si el usuario no tiene uno propio ya establecido
        if not user.email:
            user.email = claims.get('email', '')
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

            if not created:
                persona.nombre = user.first_name or persona.nombre
                persona.apellido = user.last_name or persona.apellido
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
        user = super().create_user(claims)
        return self.update_user(user, claims)

