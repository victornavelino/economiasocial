from rest_framework import viewsets, permissions
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from .models import Emprendimiento, Rubro, Servicio
from .serializers import EmprendimientoSerializer, RubroSerializer, ServicioSerializer

class EmprendimientoViewSet(viewsets.ModelViewSet):
    queryset = Emprendimiento.objects.all()
    serializer_class = EmprendimientoSerializer
    permission_classes = [permissions.IsAuthenticated]



class RubroViewSet(viewsets.ModelViewSet):
    queryset = Rubro.objects.all()
    serializer_class = RubroSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]