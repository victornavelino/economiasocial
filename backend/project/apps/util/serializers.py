from rest_framework import serializers

from util.models import Telefono, Ubicacion


class TelefonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telefono
        fields = ('tipo', 'numero')


class UbicacionSerializer(serializers.ModelSerializer):
    parent_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Ubicacion
        fields = ['id', 'nombre', 'tipo', 'parent_nombre']

    def get_parent_nombre(self, obj):
        if obj.parent_id:
            return obj.parent.nombre
        return None
