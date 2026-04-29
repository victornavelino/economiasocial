from rest_framework import serializers
from emprendimiento.serializers import EmprendimientoCreateSerializer, EmprendimientoNestedSerializer
from persona.models import Persona
from emprendimiento.models import Emprendimiento, Documento
from .models import Emprendedor, SituacionFiscal, MedioDePago, ManipulaAlimentos, Documento as DocumentoEmprendedor


class DocumentoEmprendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoEmprendedor
        fields = ['id', 'nombre', 'archivo']


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
    documentos = DocumentoEmprendedorSerializer(many=True, read_only=True)
    # Campos nuevos
    participa_mercado_itinerante = serializers.BooleanField(read_only=True)
    participa_ferias = serializers.BooleanField(read_only=True)
    manipula_alimentos_id = serializers.IntegerField(source='manipula_alimentos.pk', read_only=True, allow_null=True)
    numero_carnet = serializers.CharField(source='manipula_alimentos.numero_carnet', read_only=True, allow_null=True)
    vencimiento_carnet = serializers.DateField(source='manipula_alimentos.vencimiento_carnet', read_only=True, allow_null=True)
    numero_habilitacion_bromatologica = serializers.CharField(source='manipula_alimentos.numero_habilitacion_bromatologica', read_only=True, allow_null=True)
    vencimiento_habilitacion_bromatologica = serializers.DateField(source='manipula_alimentos.vencimiento_habilitacion_bromatologica', read_only=True, allow_null=True)

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
            'documentos',
            'participa_mercado_itinerante', 'participa_ferias',
            'manipula_alimentos_id', 'numero_carnet', 'vencimiento_carnet',
            'numero_habilitacion_bromatologica', 'vencimiento_habilitacion_bromatologica',
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
    participa_mercado_itinerante = serializers.BooleanField(required=False, default=False)
    participa_ferias = serializers.BooleanField(required=False, default=False)

    # Datos de ManipulaAlimentos (todos opcionales)
    numero_carnet = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    vencimiento_carnet = serializers.DateField(required=False, allow_null=True)
    numero_habilitacion_bromatologica = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    vencimiento_habilitacion_bromatologica = serializers.DateField(required=False, allow_null=True)

    # Documentos del emprendedor (opcional)
    documentos = serializers.ListField(
        child=serializers.DictField(), required=False, default=list
    )

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
        documentos_emprendedor_data = validated_data.pop('documentos', [])

        # Extraer datos de ManipulaAlimentos
        manipula_data = {
            'numero_carnet': validated_data.pop('numero_carnet', None),
            'vencimiento_carnet': validated_data.pop('vencimiento_carnet', None),
            'numero_habilitacion_bromatologica': validated_data.pop('numero_habilitacion_bromatologica', None),
            'vencimiento_habilitacion_bromatologica': validated_data.pop('vencimiento_habilitacion_bromatologica', None),
        }
        manipula_alimentos = ManipulaAlimentos.objects.create(**manipula_data)

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
                'participa_mercado_itinerante': validated_data.get('participa_mercado_itinerante', False),
                'participa_ferias': validated_data.get('participa_ferias', False),
                'manipula_alimentos': manipula_alimentos,
            }
        )

        # Si ya existía el emprendedor, actualizamos sus datos maestros
        if not emp_created:
            emprendedor.email = validated_data['email']
            emprendedor.medio_de_pago_id = validated_data['medio_de_pago_id']
            emprendedor.situacion_fiscal_id = validated_data['situacion_fiscal_id']
            emprendedor.participa_mercado_itinerante = validated_data.get('participa_mercado_itinerante', False)
            emprendedor.participa_ferias = validated_data.get('participa_ferias', False)
            # Actualizar datos de manipula_alimentos del emprendedor existente
            existing_ma = emprendedor.manipula_alimentos
            for attr, val in manipula_data.items():
                setattr(existing_ma, attr, val)
            existing_ma.save()
            # Eliminar el nuevo ManipulaAlimentos que creamos (ya no lo necesitamos)
            manipula_alimentos.delete()
            emprendedor.save()

        # Crear documentos del emprendedor
        for doc_data in documentos_emprendedor_data:
            doc_data.pop('id', None)
            archivo = doc_data.pop('archivo', None)
            doc = DocumentoEmprendedor.objects.create(emprendedor=emprendedor, **doc_data)
            if archivo:
                doc.archivo = archivo
                doc.save()

        for emp_data in emprendimientos_data:
            documentos_data = emp_data.pop('documentos', [])
            # Usamos update_or_create por nombre_marca para evitar duplicados si se re-envía el mismo formulario,
            # permitiendo a la vez actualizar los detalles de un emprendimiento si ya existía.
            emprendimiento, _ = Emprendimiento.objects.update_or_create(
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
            for doc_data in documentos_data:
                doc_data.pop('id', None)
                Documento.objects.create(emprendimiento=emprendimiento, **doc_data)

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
    participa_mercado_itinerante = serializers.BooleanField(required=False)
    participa_ferias = serializers.BooleanField(required=False)

    # Datos de ManipulaAlimentos (todos opcionales)
    numero_carnet = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    vencimiento_carnet = serializers.DateField(required=False, allow_null=True)
    numero_habilitacion_bromatologica = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    vencimiento_habilitacion_bromatologica = serializers.DateField(required=False, allow_null=True)

    # Documentos del emprendedor (opcional)
    documentos = serializers.ListField(
        child=serializers.DictField(), required=False
    )

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

        # Extraer y actualizar ManipulaAlimentos si se proveen campos
        manipula_fields = ['numero_carnet', 'vencimiento_carnet', 'numero_habilitacion_bromatologica', 'vencimiento_habilitacion_bromatologica']
        manipula_updates = {}
        for field in manipula_fields:
            if field in validated_data:
                manipula_updates[field] = validated_data.pop(field)
        if manipula_updates:
            ma = instance.manipula_alimentos
            if ma is None:
                # El emprendedor no tenía ManipulaAlimentos — lo creamos
                ma = ManipulaAlimentos.objects.create(**manipula_updates)
                instance.manipula_alimentos = ma
            else:
                for attr, val in manipula_updates.items():
                    setattr(ma, attr, val)
                ma.save()

        # Actualizar emprendedor
        skip_fields = {'emprendimientos'} | set(manipula_fields)
        for attr, value in validated_data.items():
            if attr not in skip_fields and value is not None:
                setattr(instance, attr, value)
        # Booleanos: actualizar aunque sean False
        for bool_field in ['participa_mercado_itinerante', 'participa_ferias']:
            if bool_field in validated_data:
                setattr(instance, bool_field, validated_data[bool_field])
        instance.save()

        # Sincronizar documentos del emprendedor
        if 'documentos' in validated_data:
            documentos_data = validated_data.pop('documentos')
            incoming_doc_ids = [d['id'] for d in documentos_data if d.get('id')]
            instance.documentos.exclude(id__in=incoming_doc_ids).delete()
            for doc_data in documentos_data:
                doc_id = doc_data.pop('id', None)
                archivo = doc_data.pop('archivo', None)
                if doc_id:
                    DocumentoEmprendedor.objects.filter(id=doc_id).update(nombre=doc_data.get('nombre', ''))
                else:
                    doc = DocumentoEmprendedor.objects.create(emprendedor=instance, **doc_data)
                    if archivo:
                        doc.archivo = archivo
                        doc.save()

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
                    documentos_data = emp_data.pop('documentos', [])
                    Emprendimiento.objects.filter(id=emp_id).update(
                        nombre_marca=emp_data['nombre_marca'],
                        descripcion=emp_data['descripcion'],
                        tipo_produccion=emp_data['tipo_produccion'],
                        nivel_emprendimiento=emp_data.get('nivel_emprendimiento', 'idea_inicial'),
                        rubro_id=emp_data.get('rubro_id'),
                        servicio_id=emp_data.get('servicio_id'),
                    )
                    emprendimiento = Emprendimiento.objects.get(id=emp_id)
                    
                    # Sincronizar documentos
                    incoming_doc_ids = [d['id'] for d in documentos_data if d.get('id')]
                    emprendimiento.documentos.exclude(id__in=incoming_doc_ids).delete()
                    
                    for doc_data in documentos_data:
                        doc_id = doc_data.pop('id', None)
                        if doc_id:
                            Documento.objects.filter(id=doc_id).update(nombre=doc_data['nombre'])
                        else:
                            Documento.objects.create(emprendimiento=emprendimiento, **doc_data)
                else:
                    # Crear nuevo
                    documentos_data = emp_data.pop('documentos', [])
                    emprendimiento = Emprendimiento.objects.create(
                        emprendedor=instance,
                        nombre_marca=emp_data['nombre_marca'],
                        descripcion=emp_data['descripcion'],
                        tipo_produccion=emp_data['tipo_produccion'],
                        nivel_emprendimiento=emp_data.get('nivel_emprendimiento', 'idea_inicial'),
                        rubro_id=emp_data.get('rubro_id'),
                        servicio_id=emp_data.get('servicio_id'),
                    )
                    for doc_data in documentos_data:
                        doc_data.pop('id', None)
                        Documento.objects.create(emprendimiento=emprendimiento, **doc_data)

        return instance

class SituacionFiscalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SituacionFiscal
        fields = ['id', 'nombre']


class MedioDePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedioDePago
        fields = ['id', 'nombre']