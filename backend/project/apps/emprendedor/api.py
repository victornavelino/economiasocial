from rest_framework import viewsets
from .models import Emprendedor, SituacionFiscal, MedioDePago
from .serializers import EmprendedorSerializer, SituacionFiscalSerializer, MedioDePagoSerializer

class EmprendedorViewSet(viewsets.ModelViewSet):
    queryset = Emprendedor.objects.all()
    serializer_class = EmprendedorSerializer

class SituacionFiscalViewSet(viewsets.ModelViewSet):
    queryset = SituacionFiscal.objects.all()
    serializer_class = SituacionFiscalSerializer

class MedioDePagoViewSet(viewsets.ModelViewSet):
    queryset = MedioDePago.objects.all()
    serializer_class = MedioDePagoSerializer