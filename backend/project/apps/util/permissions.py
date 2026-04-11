from rest_framework import permissions
from django.conf import settings

class HasApiKey(permissions.BasePermission):
    """
    Permiso para validar que la petición contenga una API Key válida en los encabezados.
    """
    def has_permission(self, request, view):
        api_key = request.META.get('HTTP_X_API_KEY')
        return api_key == getattr(settings, 'API_KEY', None)
