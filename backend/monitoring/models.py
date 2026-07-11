"""
Modelo de dominio — Plataforma de Datos IIoT, caso de uso "Salud de Máquinas".

Jerarquía de activos (del análisis real de planillas del cliente):
    Boquilla → Gabinete (equipo) → Zona de aplicación / Punto de proceso → Área/Sector → Planta

Convención REAL vs. SIMULADO:
    Las entidades/campos que hoy NO se capturan en terreno (PM10, presión, caudal,
    ΔP filtros, camiones/día, condiciones ambientales, impacto de mitigación) llevan
    `simulated = True`. Disponibilidad, utilización, sistemas operativos, semáforo y
    motivos de detención son REALES / DERIVABLES de las planillas.
"""
from django.db import models


class StopReason(models.TextChoices):
    """Motivos de detención — lista cerrada real."""
    PROGRAMADA = 'programada', 'Detención programada por proyecto'
    FALLA = 'falla', 'Falla / rotura de cañería'
    FUERA_PROCESO = 'fuera_proceso', 'Fuera de proceso (cliente)'
    AREA_RESTRINGIDA = 'area_restringida', 'Área restringida por terceros'
    SOLICITUD_CLIENTE = 'solicitud_cliente', 'Solicitud del cliente'


class Plant(models.Model):
    name = models.CharField(max_length=120)
    client = models.CharField(max_length=120, default='BHP · Faena Spence')
    general_status = models.CharField(max_length=60, default='Operación normal')
    general_status_detail = models.CharField(max_length=120, default='Sin alertas críticas')
    is_default = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name


class Area(models.Model):
    """Áreas reales: Chancado Primario/Secundario/Terciario, Torre de Transferencia, Feeders-Harneros."""
    plant = models.ForeignKey(Plant, related_name='areas', on_delete=models.CASCADE)
    name = models.CharField(max_length=120)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.plant.name} / {self.name}'


class ProcessPoint(models.Model):
    """Zona de aplicación / punto de proceso (no máquina individual)."""
    area = models.ForeignKey(Area, related_name='process_points', on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    order = models.PositiveSmallIntegerField(default=0)
    icon = models.CharField(max_length=40, default='factory')
    has_sensor = models.BooleanField(default=True)
    pm10 = models.FloatField(null=True, blank=True, help_text='µg/m³N — SIMULADO (hoy no se captura)')
    simulated_pm10 = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class System(models.Model):
    """Sistema de supresión / humectación / colección instalado y mantenido por Experticia."""

    class Kind(models.TextChoices):
        SUPRESOR = 'supresor', 'Supresor de polvo'
        HUMECTADOR = 'humectador', 'Humectador'
        FILTRO = 'filtro', 'Filtro de mangas / Colector de polvo'

    area = models.ForeignKey(Area, related_name='systems', on_delete=models.CASCADE)
    process_point = models.ForeignKey(
        ProcessPoint, related_name='systems', on_delete=models.SET_NULL, null=True, blank=True
    )
    name = models.CharField(max_length=120)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.SUPRESOR)
    tag = models.CharField(max_length=40, blank=True, help_text='Patrones reales: DPSVxxxx, MSCPxxxx, EX-HUxx, SP-xx')
    order = models.PositiveSmallIntegerField(default=0)
    indicator_label = models.CharField(max_length=40, default='Estado Operativo',
                                       help_text='"Estado Operativo" o "Eficiencia" según tarjeta')
    nozzles_installed = models.PositiveIntegerField(default=0)
    nozzles_operative = models.PositiveIntegerField(default=0)
    nozzles_running = models.PositiveIntegerField(default=0)
    stop_reason = models.CharField(max_length=30, choices=StopReason.choices, null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.name} ({self.tag})'

    # --- KPIs reales (definiciones del dominio) ---
    @property
    def disponibilidad(self) -> int:
        """Boquillas OPERATIVAS / INSTALADAS → ¿el sistema puede operar?"""
        if not self.nozzles_installed:
            return 0
        return round(100 * self.nozzles_operative / self.nozzles_installed)

    @property
    def utilizacion(self) -> int:
        """Boquillas EN FUNCIONAMIENTO / INSTALADAS → ¿está operando?"""
        if not self.nozzles_installed:
            return 0
        return round(100 * self.nozzles_running / self.nozzles_installed)

    @property
    def estado_semaforo(self) -> str:
        """Regla real: verde=100%, ámbar=1–99%, rojo=0%.
        Ajuste demo para variedad visual (coherente con el mockup, donde 88% es
        verde y 82% ámbar): verde ≥ 85, ámbar 1–84, rojo 0."""
        pct = self.disponibilidad
        if pct == 0:
            return 'rojo'
        if pct >= 85:
            return 'verde'
        return 'ambar'


class SystemMetric(models.Model):
    """Métrica de tarjeta (presión bar / caudal l/min / ΔP kPa) con sparkline — SIMULADO."""
    system = models.ForeignKey(System, related_name='metrics', on_delete=models.CASCADE)
    label = models.CharField(max_length=40)
    value = models.CharField(max_length=20)
    unit = models.CharField(max_length=20, blank=True)
    sparkline = models.JSONField(default=list, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    simulated = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.system.name} · {self.label}'


class Pm10Series(models.Model):
    """Serie de emisión PM10 de la planta por rango (hoy / 7d / 30d) — SIMULADO."""

    class Range(models.TextChoices):
        HOY = 'hoy', 'Hoy'
        D7 = '7d', '7 días'
        D30 = '30d', '30 días'

    plant = models.ForeignKey(Plant, related_name='pm10_series', on_delete=models.CASCADE)
    range = models.CharField(max_length=5, choices=Range.choices)
    labels = models.JSONField(default=list, help_text='Etiquetas eje X')
    current = models.JSONField(default=list, help_text='Serie "Promedio planta"')
    previous = models.JSONField(default=list, help_text='Serie comparativa "Ayer" / periodo anterior')
    simulated = models.BooleanField(default=True)

    class Meta:
        unique_together = [('plant', 'range')]
        verbose_name_plural = 'PM10 series'

    def __str__(self):
        return f'{self.plant.name} · PM10 {self.range}'


class Kpi(models.Model):
    """Tarjeta KPI de la fila superior."""
    plant = models.ForeignKey(Plant, related_name='kpis', on_delete=models.CASCADE)
    key = models.CharField(max_length=40)
    label = models.CharField(max_length=80)
    value = models.CharField(max_length=40)
    unit = models.CharField(max_length=20, blank=True)
    delta = models.CharField(max_length=20, blank=True)
    direction = models.CharField(max_length=10, blank=True, choices=[('up', 'up'), ('down', 'down')])
    delta_positive = models.BooleanField(default=True, help_text='¿El delta es una buena noticia? (color verde)')
    comparison = models.CharField(max_length=60, blank=True)
    icon = models.CharField(max_length=40, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    simulated = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.plant.name} · {self.label}'


class Alert(models.Model):
    class Severity(models.TextChoices):
        CRITICA = 'critica', 'Crítica'
        MAYOR = 'mayor', 'Mayor'
        MENOR = 'menor', 'Menor'

    plant = models.ForeignKey(Plant, related_name='alerts', on_delete=models.CASCADE)
    severity = models.CharField(max_length=10, choices=Severity.choices)
    message = models.CharField(max_length=200)
    system = models.ForeignKey(System, related_name='alerts', on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'[{self.severity}] {self.message}'


class EnvironmentReading(models.Model):
    """Condiciones ambientales — SIMULADO."""
    plant = models.OneToOneField(Plant, related_name='environment', on_delete=models.CASCADE)
    temperature_c = models.FloatField()
    humidity_pct = models.FloatField()
    wind_direction = models.CharField(max_length=10)
    wind_speed_kmh = models.FloatField()
    simulated = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.plant.name} · ambiente'


class MitigationImpact(models.Model):
    """Impacto estimado de la mitigación vs. escenario base — SIMULADO."""
    plant = models.OneToOneField(Plant, related_name='mitigation', on_delete=models.CASCADE)
    reduction_pct = models.FloatField(help_text='Disminución estimada, p. ej. -24')
    without_mitigation = models.FloatField(help_text='µg/m³N sin mitigación')
    with_mitigation = models.FloatField(help_text='µg/m³N con mitigación actual')
    simulated = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.plant.name} · mitigación {self.reduction_pct}%'
