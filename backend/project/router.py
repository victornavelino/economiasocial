from rest_framework.routers import DefaultRouter

from persona import api as api_persona
from usuario import api as api_usuario
from emprendimiento import api as api_emprendimiento
from emprendedor import api as api_emprendedor


router = DefaultRouter()

router.register('persona', api_persona.PersonaViewSet, basename='persona')
router.register('usuario', api_usuario.UsuarioViewSet, basename='usuario')
router.register('emprendimiento', api_emprendimiento.EmprendimientoViewSet, basename='emprendimiento')
router.register('emprendedor', api_emprendedor.EmprendedorViewSet, basename='emprendedor')
router.register('situacion-fiscal', api_emprendedor.SituacionFiscalViewSet, basename='situacion-fiscal')
router.register('medio-de-pago', api_emprendedor.MedioDePagoViewSet, basename='medio-de-pago')
router.register('rubro', api_emprendimiento.RubroViewSet, basename='rubro')
router.register('servicio', api_emprendimiento.ServicioViewSet, basename='servicio')

