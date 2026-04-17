from django.contrib import admin

from emprendedor.models import Emprendedor, MedioDePago, SituacionFiscal

# Register your models here.
@admin.register(Emprendedor)
class EmprendedorAdmin(admin.ModelAdmin):
    list_display = ("fecha_alta", "situacion_fiscal", "medio_de_pago")
    
@admin.register(MedioDePago)
class MedioDePagoAdmin(admin.ModelAdmin):
    list_display = ("nombre",)

@admin.register(SituacionFiscal)
class SituacionFiscalAdmin(admin.ModelAdmin):
    list_display = ("nombre",)