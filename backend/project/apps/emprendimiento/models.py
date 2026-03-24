from django.db import models
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel
from emprendedor.models import Emprendedor

# Create your models here.
class Emprendimiento(models.Model):
   
    class Meta:
        verbose_name = ("Emprendimiento")
        verbose_name_plural = ("Emprendimientos")
    
    #TIPO_DE_PRODUCCION    
    ARTESANAL = "artesanal"
    SEMI_INDUSTRIAL = "semi_industrial"
    SERVICIO = "servicio"
    
    TIPOS_PRODUCCION = (
        (ARTESANAL, "Artesanal"),
        (SEMI_INDUSTRIAL, "Semi Industrial"),
        (SERVICIO, "Servicio"),
    )
    
    #NIVEL_ACTUAL_EMPRENDIMIENTO    
    IDEA_INICIAL = "idea_inicial"
    PRODUCCION_PEQUENA_ESCALA = "produccion_pequena_escala"
    PRODUCCION_HABILITADA = "produccion_habilitada"
    ESCALAMIENTO_PRODUCTIVO = "escalamiento_productivo"
    COMERCIALIZACION_EXPORTACION = "comercializacion_exportacion"
    
    NIVEL_EMPRENDIMIENTO = (
        (IDEA_INICIAL, "Idea Inicial"),
        (PRODUCCION_PEQUENA_ESCALA, "Produccion Pequeña Escala"),
        (PRODUCCION_HABILITADA, "Produccion Habilitada/Formalizada"),
        (ESCALAMIENTO_PRODUCTIVO, "Escalamiento Productivo"),
        (COMERCIALIZACION_EXPORTACION, "Comercializacion en Gondolas / Exportacion"),
    )
    
    
        
    nombre_marca = models.CharField(max_length=150, verbose_name="Nombre Marca")
    rubro = models.ForeignKey(
        "Rubro",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="rubros_emprendimiento",
    )
    tipo_produccion = models.CharField(max_length=25, choices=TIPOS_PRODUCCION, verbose_name="Tipo de Produccion")
    emprendedor = models.ForeignKey(Emprendedor, on_delete=models.CASCADE, blank=True, null=True, related_name="emprendimientos")
    servicio = models.ForeignKey(
        "Servicio",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="servicios_personas",
    )
    nivel_emprendimiento = models.CharField(max_length=50, choices=NIVEL_EMPRENDIMIENTO, default=IDEA_INICIAL, verbose_name="Nivel Actual del Emprendimiento")
    
    def __str__(self):
        return self.nombre_marca

class ModalidadDeTrabajo(models.Model):

    class Meta:
        verbose_name = ("Modalidad De Trabajo")
        verbose_name_plural = ("Modalidades De Trabajo")
        
    #TIPO_MODALIDAD_DE_TRABAJO   
    INDIVIDUAL = "individual"
    FAMILIAR = "familiar"
    ASOCIATIVO_COOPERATIVO = "asociativo_cooperativo"
    
    TIPOS_MODALIDAD_TRABAJO = (
        (INDIVIDUAL, "Individual"),
        (FAMILIAR, "Familiar"),
        (ASOCIATIVO_COOPERATIVO, "Asociativo / Cooperativo"),
    )
    
    emprendimiento = models.ForeignKey(Emprendimiento, on_delete=models.CASCADE, related_name="modalidad_trabajo")
    cantidad_personas = models.PositiveIntegerField(default=0, verbose_name="Cantidad de Personas Involucradas")
    tipo_modalidad_trabajo = models.CharField(max_length=50, choices=TIPOS_MODALIDAD_TRABAJO, verbose_name="Tipo")
    

class Rubro(MPTTModel, models.Model):
    class Meta:
        verbose_name = "Rubro"
        verbose_name_plural = "Rubros"
        constraints = [models.UniqueConstraint(fields=["nombre", "parent"], name="unique_rubro")]
        
    RUBRO = "rubro"
    SUBRUBRO = "subrubro"
        
    TIPOS_RUBROS = (
        (RUBRO, "Rubro"),
        (SUBRUBRO, "Subrubro"),
    )
    
    tipo = models.CharField(max_length=8, choices=TIPOS_RUBROS, default=SUBRUBRO)
    nombre = models.CharField(max_length=100, verbose_name="Nombre", help_text="Ejemplo: Gastronomia")
    parent = TreeForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        db_index=True,
        verbose_name="Rubro Padre",
        help_text="Ejemplo: Gastronomia",
    )
    def __str__(self):
        nombre = f"{self.nombre}"
        if self.parent_id:
            nombre = f"{self.nombre} -> {self.parent.nombre}"

        return nombre

    def save(self, *args, **kwargs):
        self.nombre = self.nombre.upper()
        super(Rubro, self).save(*args, **kwargs)
        

class Servicio(MPTTModel, models.Model):
    class Meta:
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        constraints = [models.UniqueConstraint(fields=["nombre", "parent"], name="unique_servicio")]
        
    SERVICIO = "servicio"
    SUBSERVICIO = "subservicio"
        
    TIPOS_SERVICIOS = (
        (SERVICIO, "Servicio"),
        (SUBSERVICIO, "Subservicio"),
    )
    
    tipo = models.CharField(max_length=11, choices=TIPOS_SERVICIOS, default=SUBSERVICIO)
    nombre = models.CharField(max_length=100, verbose_name="Nombre", help_text="Ejemplo: Gastronomia")
    parent = TreeForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        db_index=True,
        verbose_name="Servicio Padre",
        help_text="Ejemplo: Gastronomia",
    )
    def __str__(self):
        nombre = f"{self.nombre}"
        if self.parent_id:
            nombre = f"{self.nombre} -> {self.parent.nombre}"

        return nombre

    def save(self, *args, **kwargs):
        self.nombre = self.nombre.upper()
        super(Servicio, self).save(*args, **kwargs)