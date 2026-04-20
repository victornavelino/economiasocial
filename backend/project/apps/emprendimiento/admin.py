from django.contrib import admin

from emprendimiento.models import Emprendimiento, Rubro, Servicio, Documento, ModalidadDeTrabajo

# Register your models here.
@admin.register(Emprendimiento)
class EmprendimientoAdmin(admin.ModelAdmin):
    list_display = ("nombre_marca", "rubro", "tipo_produccion")
    
@admin.register(Rubro)
class RubroAdmin(admin.ModelAdmin):
    list_display = ("tipo", "nombre", "parent")
    
@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("tipo", "nombre", "parent")


@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "emprendimiento")

@admin.register(ModalidadDeTrabajo)
class ModalidadDeTrabajoAdmin(admin.ModelAdmin):
    list_display = ("emprendimiento", "cantidad_personas", "tipo_modalidad_trabajo")