from rest_framework import serializers
from .models import Emprendimiento, Rubro, Servicio

class EmprendimientoSerializer(serializers.ModelSerializer):
    rubro_nombre = serializers.CharField(source='rubro.nombre', read_only=True)
    emprendedor_nombre = serializers.SerializerMethodField()

    def get_emprendedor_nombre(self, obj):
        if obj.emprendedor and obj.emprendedor.persona:
            return f"{obj.emprendedor.persona.nombre} {obj.emprendedor.persona.apellido}"
        return None

    class Meta:
        model = Emprendimiento
        fields = '__all__'


class EmprendimientoCreateSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    nombre_marca = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(max_length=500, required=False, allow_null=True)
    tipo_produccion = serializers.ChoiceField(choices=[
        ('artesanal', 'Artesanal'),
        ('semi_industrial', 'Semi Industrial'),
        ('servicio', 'Servicio'),
    ])
    nivel_emprendimiento = serializers.ChoiceField(
        choices=[
            ('idea_inicial', 'Idea Inicial'),
            ('produccion_pequena_escala', 'Produccion Pequeña Escala'),
            ('produccion_habilitada', 'Produccion Habilitada/Formalizada'),
            ('escalamiento_productivo', 'Escalamiento Productivo'),
            ('comercializacion_exportacion', 'Comercializacion en Gondolas / Exportacion'),
        ],
        default='idea_inicial',
    )
    rubro_id = serializers.IntegerField(required=False, allow_null=True)
    servicio_id = serializers.IntegerField(required=False, allow_null=True)


class EmprendimientoNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprendimiento
        fields = ['id', 'nombre_marca', 'tipo_produccion', 'nivel_emprendimiento', 'descripcion']


class RubroSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(queryset=Rubro.objects.all(), allow_null=True, required=False)
    class Meta:
        model = Rubro
        fields = ['id', 'nombre', 'tipo', 'parent']

class ServicioSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), allow_null=True, required=False)
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'tipo', 'parent']