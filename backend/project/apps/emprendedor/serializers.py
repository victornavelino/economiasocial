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

    def validate_email(self, value):
        if Emprendedor.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un emprendedor registrado con ese email.")
        return value

    def validate_medio_de_pago_id(self, value):
        if not value or value == 0:
            raise serializers.ValidationError("Debés seleccionar un medio de pago.")
        if not MedioDePago.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Medio de pago no encontrado.")
        return value

    def validate_situacion_fiscal_id(self, value):
        if not value or value == 0:
            raise serializers.ValidationError("Debés seleccionar una situación fiscal.")
        if not SituacionFiscal.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Situación fiscal no encontrada.")
        return value

    def validate(self, data):
        documento = data.get('documento_identidad')
        cuit = data.get('cuit')

        persona_por_dni = Persona.objects.filter(documento_identidad=documento).first()
        persona_por_cuit = Persona.objects.filter(cuit=cuit).first()

        if persona_por_cuit:
            # El CUIT ya existe — solo es válido si pertenece a la misma persona que el DNI
            if persona_por_dni is None or persona_por_cuit.pk != persona_por_dni.pk:
                raise serializers.ValidationError(
                    {"cuit": "Ya existe una persona registrada con ese CUIT."}
                )

        return data

    def create(self, validated_data):
        emprendimientos_data = validated_data.pop('emprendimientos', [])

        # Usamos get_or_create para no fallar si la Persona ya existe (ej: creada por login OIDC)
        # Solo actualizamos los campos que vienen en el formulario
        persona_defaults = {
            'nombre': validated_data['nombre'],
            'apellido': validated_data['apellido'],
            'cuit': validated_data['cuit'],
        }
        if validated_data.get('fecha_nacimiento'):
            persona_defaults['fecha_nacimiento'] = validated_data['fecha_nacimiento']
        if validated_data.get('sexo'):
            persona_defaults['sexo'] = validated_data['sexo']
        if validated_data.get('domicilio'):
            persona_defaults['domicilio'] = validated_data['domicilio']
        if validated_data.get('localidad'):
            persona_defaults['localidad_id'] = validated_data['localidad']
        if validated_data.get('nacionalidad'):
            persona_defaults['nacionalidad_id'] = validated_data['nacionalidad']

        persona, created = Persona.objects.get_or_create(
            documento_identidad=validated_data['documento_identidad'],
            defaults=persona_defaults,
        )

        # Si la persona ya existía, actualizamos sus datos con los del formulario
        if not created:
            for attr, val in persona_defaults.items():
                setattr(persona, attr, val)
            persona.save()

        # En lugar de lanzar error si ya existe el Emprendedor, lo obtenemos o lo creamos
        # Esto permite añadir nuevos emprendimientos a un emprendedor existente desde este formulario.
        emprendedor, emp_created = Emprendedor.objects.get_or_create(
            persona=persona,
            defaults={
                'email': validated_data['email'],
                'medio_de_pago_id': validated_data['medio_de_pago_id'],
                'situacion_fiscal_id': validated_data['situacion_fiscal_id'],
            }
        )

        # Si ya existía el emprendedor, actualizamos sus datos maestros
        if not emp_created:
            emprendedor.email = validated_data['email']
            emprendedor.medio_de_pago_id = validated_data['medio_de_pago_id']
            emprendedor.situacion_fiscal_id = validated_data['situacion_fiscal_id']
            emprendedor.save()

        for emp_data in emprendimientos_data:
            # Usamos update_or_create por nombre_marca para evitar duplicados si se re-envía el mismo formulario,
            # permitiendo a la vez actualizar los detalles de un emprendimiento si ya existía.
            Emprendimiento.objects.update_or_create(
                emprendedor=emprendedor,
                nombre_marca=emp_data['nombre_marca'],
                defaults={
                    'descripcion': emp_data.get('descripcion', ''),
                    'tipo_produccion': emp_data['tipo_produccion'],
                    'nivel_emprendimiento': emp_data.get('nivel_emprendimiento', 'idea_inicial'),
                    'rubro_id': emp_data.get('rubro_id'),
                    'servicio_id': emp_data.get('servicio_id'),
                }
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
    emprendimientos = EmprendimientoCreateSerializer(many=True, required=False)

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
            if attr != 'emprendimientos' and value is not None:
                setattr(instance, attr, value)
        instance.save()

        # Actualizar emprendimientos anidados
        if 'emprendimientos' in validated_data:
            emprendimientos_data = validated_data['emprendimientos']
            existing_ids = [e.id for e in instance.emprendimientos.all()]
            incoming_ids = [e['id'] for e in emprendimientos_data if e.get('id')]

            # 1. Eliminar los que no están en la lista recibida
            for old_id in existing_ids:
                if old_id not in incoming_ids:
                    Emprendimiento.objects.filter(id=old_id).delete()

            # 2. Crear o actualizar
            for emp_data in emprendimientos_data:
                emp_id = emp_data.get('id')
                if emp_id and emp_id in existing_ids:
                    # Actualizar existente
                    Emprendimiento.objects.filter(id=emp_id).update(
                        nombre_marca=emp_data['nombre_marca'],
                        descripcion=emp_data['descripcion'],
                        tipo_produccion=emp_data['tipo_produccion'],
                        nivel_emprendimiento=emp_data.get('nivel_emprendimiento', 'idea_inicial'),
                        rubro_id=emp_data.get('rubro_id'),
                        servicio_id=emp_data.get('servicio_id'),
                    )
                else:
                    # Crear nuevo
                    Emprendimiento.objects.create(
                        emprendedor=instance,
                        nombre_marca=emp_data['nombre_marca'],
                        descripcion=emp_data['descripcion'],
                        tipo_produccion=emp_data['tipo_produccion'],
                        nivel_emprendimiento=emp_data.get('nivel_emprendimiento', 'idea_inicial'),
                        rubro_id=emp_data.get('rubro_id'),
                        servicio_id=emp_data.get('servicio_id'),
                    )

        return instance

class SituacionFiscalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SituacionFiscal
        fields = ['id', 'nombre']


class MedioDePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedioDePago
        fields = ['id', 'nombre']