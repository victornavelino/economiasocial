from rest_framework import viewsets, status, permissions
from usuario.permissions import IsAdminOrOwner, IsAdminUser, IsAdminUserOrReadOnly

from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
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
import json

class EmprendedorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrOwner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        qs = Emprendedor.objects.select_related(
            'persona', 'medio_de_pago', 'situacion_fiscal'
        ).all()
        if self.request.user and self.request.user.is_authenticated and not self.request.user.is_staff:
            return qs.filter(persona=self.request.user.persona)
        return qs


    def get_serializer_class(self):
        if self.action == 'create':
            return EmprendedorCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return EmprendedorUpdateSerializer
        return EmprendedorSerializer

    def _get_data_with_files(self, request):
        if 'data' in request.data:
            try:
                data = json.loads(request.data['data'])
                # Match files to the data structure
                for key, file in request.FILES.items():
                    if key.startswith('file_'):
                        parts = key.split('_')
                        if len(parts) == 3:
                            emp_idx = int(parts[1])
                            doc_idx = int(parts[2])
                            if 'emprendimientos' in data and emp_idx < len(data['emprendimientos']):
                                emp = data['emprendimientos'][emp_idx]
                                if 'documentos' in emp and doc_idx < len(emp['documentos']):
                                    emp['documentos'][doc_idx]['archivo'] = file
                return data
            except (json.JSONDecodeError, ValueError, KeyError):
                return request.data
        return request.data

    def create(self, request, *args, **kwargs):
        data = self._get_data_with_files(request)
        serializer = EmprendedorCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        emprendedor = serializer.save()
        output = EmprendedorSerializer(emprendedor)
        return Response(output.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = self._get_data_with_files(request)
        serializer = EmprendedorUpdateSerializer(instance, data=data, partial=partial)
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
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]


class MedioDePagoViewSet(viewsets.ModelViewSet):
    queryset = MedioDePago.objects.all()
    serializer_class = MedioDePagoSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]