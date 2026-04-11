from rest_framework import viewsets, permissions
from usuario.permissions import IsAdminOrOwner, IsAdminUser

from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from .models import Emprendimiento, Rubro, Servicio
from .serializers import EmprendimientoSerializer, RubroSerializer, ServicioSerializer

class EmprendimientoViewSet(viewsets.ModelViewSet):
    queryset = Emprendimiento.objects.all()
    serializer_class = EmprendimientoSerializer
    permission_classes = [IsAdminOrOwner]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user and not self.request.user.is_staff:
            return qs.filter(emprendedor__persona=self.request.user.persona)
        return qs




class RubroViewSet(viewsets.ModelViewSet):
    queryset = Rubro.objects.all()
    serializer_class = RubroSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]