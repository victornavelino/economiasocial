from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework_json_api.renderers import JSONRenderer as JSONAPIRenderer
from .models import Emprendedor, SituacionFiscal, MedioDePago
from .serializers import (
    EmprendedorSerializer,
    EmprendedorCreateSerializer,
    SituacionFiscalSerializer,
    MedioDePagoSerializer,
)


class EmprendedorViewSet(viewsets.ModelViewSet):
    queryset = Emprendedor.objects.select_related(
        'persona', 'medio_de_pago', 'situacion_fiscal'
    ).all()
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return EmprendedorCreateSerializer
        return EmprendedorSerializer

    def create(self, request, *args, **kwargs):
        serializer = EmprendedorCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        emprendedor = serializer.save()
        output = EmprendedorSerializer(emprendedor)
        return Response(output.data, status=status.HTTP_201_CREATED)


class SituacionFiscalViewSet(viewsets.ModelViewSet):
    queryset = SituacionFiscal.objects.all()
    serializer_class = SituacionFiscalSerializer
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]


class MedioDePagoViewSet(viewsets.ModelViewSet):
    queryset = MedioDePago.objects.all()
    serializer_class = MedioDePagoSerializer
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]