from rest_framework import viewsets
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from .models import Emprendimiento, Rubro, Servicio
from .serializers import EmprendimientoSerializer, RubroSerializer, ServicioSerializer

class EmprendimientoViewSet(viewsets.ModelViewSet):
    queryset = Emprendimiento.objects.all()
    serializer_class = EmprendimientoSerializer



class RubroViewSet(viewsets.ModelViewSet):
    queryset = Rubro.objects.all()
    serializer_class = RubroSerializer
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]