from rest_framework import viewsets, status, permissions
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework_json_api.renderers import JSONRenderer as JSONAPIRenderer
from .models import Emprendedor, SituacionFiscal, MedioDePago
from .serializers import (
    EmprendedorSerializer,
    EmprendedorCreateSerializer,
    EmprendedorUpdateSerializer,
    SituacionFiscalSerializer,
    MedioDePagoSerializer,
)


class EmprendedorViewSet(viewsets.ModelViewSet):
    queryset = Emprendedor.objects.select_related(
        'persona', 'medio_de_pago', 'situacion_fiscal'
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def get_serializer_class(self):
        if self.action == 'create':
            return EmprendedorCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return EmprendedorUpdateSerializer
        return EmprendedorSerializer

    def create(self, request, *args, **kwargs):
        serializer = EmprendedorCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        emprendedor = serializer.save()
        output = EmprendedorSerializer(emprendedor)
        return Response(output.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = EmprendedorUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        emprendedor = serializer.save()
        output = EmprendedorSerializer(emprendedor)
        return Response(output.data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class SituacionFiscalViewSet(viewsets.ModelViewSet):
    queryset = SituacionFiscal.objects.all()
    serializer_class = SituacionFiscalSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]


class MedioDePagoViewSet(viewsets.ModelViewSet):
    queryset = MedioDePago.objects.all()
    serializer_class = MedioDePagoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]