from rest_framework import serializers
from persona.models import Persona
from .models import Emprendedor, SituacionFiscal, MedioDePago

class EmprendedorSerializer(serializers.ModelSerializer):

    emprendedor_id=serializers.IntegerField(source='pk')
    nombre= serializers.CharField(source='persona.nombre',)
    apellido= serializers.CharField(source='persona.apellido')
    documento_identidad= serializers.CharField(source='persona.documento_identidad')
    fecha_nacimiento = serializers.DateField(source='persona.fecha_nacimiento')
    fecha_alta=serializers.DateField()
    nacionalidad = serializers.CharField(source='persona.nacionalidad')
    domicilio = serializers.CharField(source='persona.domicilio')
    localidad= serializers.CharField(source='persona.localidad')
    sexo= serializers.CharField(source='persona.sexo')
    email= serializers.EmailField()
    cuit= serializers.CharField(source='persona.cuit')

    medio_de_pago_id = serializers.IntegerField(source='medio_de_pago.pk')
    medio_de_pago_nombre= serializers.CharField(source='medio_de_pago.nombre')

    situacion_fiscal_id = serializers.IntegerField(source='situacion_fiscal.pk')
    situacion_fiscal_nombre=serializers.CharField(source='situacion_fiscal.nombre')

    class Meta:
        model = Emprendedor
        fields = ['emprendedor_id','nombre','apellido','documento_identidad',
                  'fecha_nacimiento','fecha_alta','nacionalidad','domicilio',
                  'localidad','sexo','email','cuit','medio_de_pago_id','medio_de_pago_nombre',
                  'situacion_fiscal_id','situacion_fiscal_nombre']

class SituacionFiscalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SituacionFiscal
        fields = ['id', 'nombre']

class MedioDePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedioDePago
        fields = ['id', 'nombre']