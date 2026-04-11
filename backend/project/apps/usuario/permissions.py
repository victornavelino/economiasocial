from rest_framework import permissions

class IsAdminOrOwner(permissions.BasePermission):
    """
    Permite acceso total a administradores.
    Permite acceso a ciudadanos solo si son dueños del registro (vía Persona).
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        
        # Caso Emprendedor
        if hasattr(obj, 'persona'):
            return obj.persona == request.user.persona
            
        # Caso Emprendimiento
        if hasattr(obj, 'emprendedor') and obj.emprendedor and hasattr(obj.emprendedor, 'persona'):
            return obj.emprendedor.persona == request.user.persona
            
        return False

class IsAdminUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios staff/admin.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)
