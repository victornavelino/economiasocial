from rest_framework import serializers
from .models import Emprendimiento

class EmprendimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprendimiento
        fields = '__all__'


class EmprendimientoCreateSerializer(serializers.Serializer):
    nombre_marca = serializers.CharField(max_length=150)
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
        fields = ['id', 'nombre_marca', 'tipo_produccion', 'nivel_emprendimiento']