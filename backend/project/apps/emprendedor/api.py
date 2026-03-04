from rest_framework import viewsets
from .models import Emprendedor
from .serializers import EmprendedorSerializer

class EmprendedorViewSet(viewsets.ModelViewSet):
    queryset = Emprendedor.objects.all()
    serializer_class = EmprendedorSerializer