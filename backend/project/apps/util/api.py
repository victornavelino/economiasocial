from rest_framework import viewsets, filters
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.pagination import PageNumberPagination

from util.models import Ubicacion
from util.serializers import UbicacionSerializer


class UbicacionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UbicacionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UbicacionSerializer
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]
    pagination_class = UbicacionPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']

    def get_queryset(self):
        qs = Ubicacion.objects.select_related('parent').all()
        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo=tipo)
        return qs.order_by('nombre')
