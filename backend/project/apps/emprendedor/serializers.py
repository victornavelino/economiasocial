from rest_framework import serializers
from emprendimiento.serializers import EmprendimientoCreateSerializer, EmprendimientoNestedSerializer
from persona.models import Persona
from emprendimiento.models import Emprendimiento
from .models import Emprendedor, SituacionFiscal, MedioDePago


class EmprendedorSerializer(serializers.ModelSerializer):
    emprendedor_id = serializers.IntegerField(source='pk', read_only=True)
    nombre = serializers.CharField(source='persona.nombre', read_only=True)
    apellido = serializers.CharField(source='persona.apellido', read_only=True)
    documento_identidad = serializers.CharField(source='persona.documento_identidad', read_only=True)
    fecha_nacimiento = serializers.DateField(source='persona.fecha_nacimiento', read_only=True)
    fecha_alta = serializers.DateField(read_only=True)
    nacionalidad = serializers.CharField(source='persona.nacionalidad', read_only=True)
    domicilio = serializers.CharField(source='persona.domicilio', read_only=True)
    localidad = serializers.CharField(source='persona.localidad', read_only=True)
    localidad_id = serializers.IntegerField(source='persona.localidad_id', read_only=True, allow_null=True)
    localidad_nombre = serializers.SerializerMethodField()
    sexo = serializers.CharField(source='persona.sexo', read_only=True)
    email = serializers.EmailField(read_only=True)
    cuit = serializers.CharField(source='persona.cuit', read_only=True)
    medio_de_pago_id = serializers.IntegerField(source='medio_de_pago.pk', read_only=True)
    medio_de_pago_nombre = serializers.CharField(source='medio_de_pago.nombre', read_only=True)
    situacion_fiscal_id = serializers.IntegerField(source='situacion_fiscal.pk', read_only=True)
    situacion_fiscal_nombre = serializers.CharField(source='situacion_fiscal.nombre', read_only=True)
    emprendimientos = EmprendimientoNestedSerializer(many=True, read_only=True)

    def get_localidad_nombre(self, obj):
        if obj.persona.localidad:
            return obj.persona.localidad.nombre
        return None

    class Meta:
        model = Emprendedor
        fields = [
            'emprendedor_id', 'nombre', 'apellido', 'documento_identidad',
            'fecha_nacimiento', 'fecha_alta', 'nacionalidad', 'domicilio',
            'localidad', 'localidad_id', 'localidad_nombre',
            'sexo', 'email', 'cuit', 'medio_de_pago_id',
            'medio_de_pago_nombre', 'situacion_fiscal_id', 'situacion_fiscal_nombre',
            'emprendimientos',
        ]


class EmprendedorCreateSerializer(serializers.Serializer):
    # Datos de Persona
    nombre = serializers.CharField(max_length=30)
    apellido = serializers.CharField(max_length=30)
    documento_identidad = serializers.CharField(max_length=12)
    cuit = serializers.CharField(max_length=15)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.ChoiceField(
        choices=[('m', 'Masculino'), ('f', 'Femenino'), ('o', 'Otro')],
        required=False, allow_null=True,
    )
    domicilio = serializers.CharField(max_length=100, required=False, allow_blank=True)
    localidad = serializers.IntegerField(required=False, allow_null=True)
    nacionalidad = serializers.IntegerField(required=False, allow_null=True)

    # Datos de Emprendedor
    email = serializers.EmailField()
    medio_de_pago_id = serializers.IntegerField()
    situacion_fiscal_id = serializers.IntegerField()

    # Emprendimientos anidados (opcional, puede ser lista vacía)
    emprendimientos = EmprendimientoCreateSerializer(many=True, required=False, default=list)

    def validate_documento_identidad(self, value):
        if Persona.objects.filter(documento_identidad=value).exists():
            raise serializers.ValidationError("Ya existe una persona con ese documento.")
        return value

    def validate_cuit(self, value):
        if Persona.objects.filter(cuit=value).exists():
            raise serializers.ValidationError("Ya existe una persona con ese CUIT.")
        return value

    def validate_email(self, value):
        if Emprendedor.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un emprendedor con ese email.")
        return value

    def validate_medio_de_pago_id(self, value):
        if not MedioDePago.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Medio de pago no encontrado.")
        return value

    def validate_situacion_fiscal_id(self, value):
        if not SituacionFiscal.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Situación fiscal no encontrada.")
        return value

    def create(self, validated_data):
        emprendimientos_data = validated_data.pop('emprendimientos', [])

        persona_data = {
            'nombre': validated_data['nombre'],
            'apellido': validated_data['apellido'],
            'documento_identidad': validated_data['documento_identidad'],
            'cuit': validated_data['cuit'],
            'fecha_nacimiento': validated_data.get('fecha_nacimiento'),
            'sexo': validated_data.get('sexo'),
            'domicilio': validated_data.get('domicilio', ''),
        }
        if validated_data.get('localidad'):
            persona_data['localidad_id'] = validated_data['localidad']
        if validated_data.get('nacionalidad'):
            persona_data['nacionalidad_id'] = validated_data['nacionalidad']

        persona = Persona.objects.create(**persona_data)
        emprendedor = Emprendedor.objects.create(
            persona=persona,
            email=validated_data['email'],
            medio_de_pago_id=validated_data['medio_de_pago_id'],
            situacion_fiscal_id=validated_data['situacion_fiscal_id'],
        )

        for emp_data in emprendimientos_data:
            Emprendimiento.objects.create(
                emprendedor=emprendedor,
                nombre_marca=emp_data['nombre_marca'],
                tipo_produccion=emp_data['tipo_produccion'],
                nivel_emprendimiento=emp_data.get('nivel_emprendimiento', 'idea_inicial'),
                rubro_id=emp_data.get('rubro_id'),
                servicio_id=emp_data.get('servicio_id'),
            )

        return emprendedor


class EmprendedorUpdateSerializer(serializers.Serializer):
    """Serializer para actualización parcial de emprendedor."""

    # Datos de Persona (todos opcionales)
    nombre = serializers.CharField(max_length=30, required=False)
    apellido = serializers.CharField(max_length=30, required=False)
    documento_identidad = serializers.CharField(max_length=12, required=False)
    cuit = serializers.CharField(max_length=15, required=False)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.ChoiceField(
        choices=[('m', 'Masculino'), ('f', 'Femenino'), ('o', 'Otro')],
        required=False, allow_null=True,
    )
    domicilio = serializers.CharField(max_length=100, required=False, allow_blank=True)
    localidad = serializers.IntegerField(required=False, allow_null=True)
    nacionalidad = serializers.IntegerField(required=False, allow_null=True)

    # Datos de Emprendedor (opcionales)
    email = serializers.EmailField(required=False)
    medio_de_pago_id = serializers.IntegerField(required=False)
    situacion_fiscal_id = serializers.IntegerField(required=False)

    def validate_documento_identidad(self, value):
        if self.instance and self.instance.persona.documento_identidad == value:
            return value
        if Persona.objects.filter(documento_identidad=value).exists():
            raise serializers.ValidationError("Ya existe una persona con ese documento.")
        return value

    def validate_cuit(self, value):
        if self.instance and self.instance.persona.cuit == value:
            return value
        if Persona.objects.filter(cuit=value).exists():
            raise serializers.ValidationError("Ya existe una persona con ese CUIT.")
        return value

    def validate_email(self, value):
        if self.instance and self.instance.email == value:
            return value
        if Emprendedor.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un emprendedor con ese email.")
        return value

    def validate_medio_de_pago_id(self, value):
        if not MedioDePago.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Medio de pago no encontrado.")
        return value

    def validate_situacion_fiscal_id(self, value):
        if not SituacionFiscal.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Situación fiscal no encontrada.")
        return value

    def update(self, instance, validated_data):
        # Extraer datos de persona
        persona_data = {
            'nombre': validated_data.pop('nombre', None),
            'apellido': validated_data.pop('apellido', None),
            'documento_identidad': validated_data.pop('documento_identidad', None),
            'cuit': validated_data.pop('cuit', None),
            'fecha_nacimiento': validated_data.pop('fecha_nacimiento', None),
            'sexo': validated_data.pop('sexo', None),
            'domicilio': validated_data.pop('domicilio', None),
            'localidad_id': validated_data.pop('localidad', None),
            'nacionalidad_id': validated_data.pop('nacionalidad', None),
        }
        # Actualizar persona solo con los campos presentes
        persona = instance.persona
        for attr, value in persona_data.items():
            if value is not None:
                setattr(persona, attr, value)
        persona.save()

        # Actualizar emprendedor
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)
        instance.save()

        return instance

class SituacionFiscalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SituacionFiscal
        fields = ['id', 'nombre']


class MedioDePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedioDePago
        fields = ['id', 'nombre']