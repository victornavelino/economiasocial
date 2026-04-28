from django.db import models

from persona.models import Persona

# Create your models here.

class SituacionFiscal(models.Model):
    class Meta:
        verbose_name = 'Situacion Fiscal'
        verbose_name_plural = 'Situaciones Fiscales'
        ordering = ['-id']
    
    nombre = models.CharField(max_length=50, verbose_name="Nombre", null=False, help_text="Monotributista")
    
    def __str__(self):
        return self.nombre
    
class MedioDePago(models.Model):
    class Meta:
        verbose_name = 'Medio de Pago'
        verbose_name_plural = 'Medios de Pago'
        ordering = ['-id']
    
    nombre = models.CharField(max_length=50, verbose_name="Nombre", null=False, help_text="Efectivo")
    
    def __str__(self):
        return self.nombre

class ManipulaAlimentos(models.Model):
    
    class Meta:
        verbose_name = 'Manipula Alimentos'
        verbose_name_plural = 'Manipulan Alimentos'
        ordering = ['-id']
    
    numero_carnet = models.CharField(max_length=20, verbose_name="Numero Carnet", null=True)
    vencimiento_carnet = models.DateField(verbose_name="Vencimiento Carnet", null=True)
    numero_habilitacion_bromatologica = models.CharField(max_length=20, verbose_name="Numero Habilitacion Bromatologica", null=True)
    vencimiento_habilitacion_bromatologica = models.DateField(verbose_name="Vencimiento Habilitacion Bromatologica", null=True)

    def __str__(self):
        return self.numero_carnet
    
class Emprendedor(models.Model):
    
    class Meta:
        verbose_name = 'Emprendedor'
        verbose_name_plural = 'Emprendedores'
        ordering = ['-id']
    
        
    fecha_alta = models.DateField(auto_now_add=True)
    situacion_fiscal = models.ForeignKey(SituacionFiscal, on_delete=models.CASCADE, related_name="emprendedor_situacion_fiscal")     
    medio_de_pago = models.ForeignKey(MedioDePago, on_delete=models.CASCADE, related_name="emprendedor_medio_de_pago") 
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE, related_name='emprendedor_persona')
    email = models.EmailField(unique=True,null=True, verbose_name='Correo Electronico')
    participa_mercado_itinerante= models.BooleanField(default=False, verbose_name="Participa en Mercado Itinerante")
    participa_ferias= models.BooleanField(default=False, verbose_name="Participa en Ferias")
    manipula_alimentos=models.ForeignKey(ManipulaAlimentos, on_delete=models.CASCADE, null=True, blank=True, related_name="emprendedor_manipula_alimentos")

    def __str__(self):
        return self.persona.obtener_nombre_completo()

    
    

    
    