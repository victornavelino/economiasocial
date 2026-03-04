from django.contrib import admin

from emprendimiento.models import Emprendimiento, Rubro, Servicio

# Register your models here.
# Register your models here.
@admin.register(Emprendimiento)
class EmprendimientoAdmin(admin.ModelAdmin):
    list_display = ("nombre_marca", "rubro", "tipo_produccion")
    
# Register your models here.
@admin.register(Rubro)
class RubroAdmin(admin.ModelAdmin):
    list_display = ("tipo", "nombre", "parent")
    
@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("tipo", "nombre", "parent")