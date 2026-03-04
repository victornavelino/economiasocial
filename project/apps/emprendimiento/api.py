from rest_framework import viewsets
from .models import Emprendimiento
from .serializers import EmprendimientoSerializer

class EmprendimientoViewSet(viewsets.ModelViewSet):
    queryset = Emprendimiento.objects.all()
    serializer_class = EmprendimientoSerializer