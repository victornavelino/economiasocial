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

    def __str__(self):
        return self.persona.obtener_nombre_completo()

    
    

    
    