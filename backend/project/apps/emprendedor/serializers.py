from rest_framework import serializers
from persona.models import Persona
from .models import Emprendedor, SituacionFiscal, MedioDePago

class EmprendedorSerializer(serializers.ModelSerializer):

    emprendedor_id=serializers.IntegerField(source='pk', read_only=True)
    nombre= serializers.CharField(source='persona.nombre', read_only=True)
    apellido= serializers.CharField(source='persona.apellido', read_only=True)
    documento_identidad= serializers.CharField(source='persona.documento_identidad', read_only=True)
    fecha_nacimiento = serializers.DateField(source='persona.fecha_nacimiento', read_only=True)
    fecha_alta=serializers.DateField(source='emprendedor.fecha_alta', read_only=True)
    nacionalidad = serializers.CharField(source='persona.nacionalidad', read_only=True)
    domicilio = serializers.CharField(source='persona.domicilio', read_only=True)
    localidad= serializers.CharField(source='persona.localidad', read_only=True)
    sexo= serializers.CharField(source='persona.sexo', read_only=True)

    medio_de_pago_id = serializers.IntegerField(source='medio_de_pago.pk', read_only=True)
    medio_de_pago_nombre= serializers.CharField(source='medio_de_pago.nombre', read_only=True)

    situacion_fiscal_id = serializers.IntegerField(source='situacion_fiscal.pk', read_only=True)
    situacion_fiscal_nombre=serializers.CharField(source='situacion_fiscal.nombre', read_only=True)

    class Meta:
        model = Emprendedor
        fields = ['emprendedor_id','nombre','apellido','documento_identidad',
                  'fecha_nacimiento','fecha_alta','nacionalidad','domicilio',
                  'localidad','sexo','medio_de_pago_id','medio_de_pago_nombre',
                  'situacion_fiscal_id','situacion_fiscal_nombre']