"""
Seed de la demo — carga idempotente (borra y recarga) de todos los datos
que alimenta la pantalla "Resumen".

Los valores de la planta por defecto ("Planta Chancado Primario") replican
exactamente la especificación de la demo. Las otras dos plantas del selector
se generan con variaciones coherentes. Todo lo marcado `simulated=True`
corresponde a variables que hoy NO se capturan en terreno.

Uso:  python manage.py seed_demo
"""
import random
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from monitoring import models


def smooth_series(base, points, jitter=0.08, seed=0, trend=0.0):
    """Serie con variación suave alrededor de `base` (para sparklines y curvas)."""
    rnd = random.Random(seed)
    values = []
    value = base * (1 - trend / 2)
    for i in range(points):
        value += base * trend / points
        wobble = base * jitter * (rnd.random() * 2 - 1)
        values.append(round(max(0.0, value + wobble), 1))
    return values


class Command(BaseCommand):
    help = 'Carga (idempotente) los datos de la demo del Panel Operativo IIoT.'

    def handle(self, *args, **options):
        self.stdout.write('Borrando datos previos…')
        models.Plant.objects.all().delete()

        client = settings.DEMO_CLIENT_NAME

        self.stdout.write('Creando "Planta Chancado Primario" (valores de la spec)…')
        self._build_primary_plant(client)

        self.stdout.write('Creando plantas secundarias para el selector…')
        self._build_variant_plant(
            client, name='Planta Chancado Secundario', seed=201,
            pm10_scale=0.82, trucks='138', trucks_delta='5%', efficiency='89%',
            operative='8 / 8', operative_detail='100% del total',
            status='Operación normal', status_detail='Sin alertas críticas',
            alert_counts=(0, 3, 4),
        )
        self._build_variant_plant(
            client, name='Torre de Transferencia', seed=301,
            pm10_scale=0.55, trucks='96', trucks_delta='3%', efficiency='81%',
            operative='5 / 6', operative_detail='83% del total',
            status='Operación con alertas', status_detail='1 sistema fuera de servicio',
            alert_counts=(1, 4, 3), degraded=True,
        )

        self.stdout.write(self.style.SUCCESS(
            f'Seed completo: {models.Plant.objects.count()} plantas, '
            f'{models.System.objects.count()} sistemas, '
            f'{models.Alert.objects.count()} alertas.'
        ))

    # ------------------------------------------------------------------ #
    #  Planta principal — valores exactos de la especificación            #
    # ------------------------------------------------------------------ #
    def _build_primary_plant(self, client):
        plant = models.Plant.objects.create(
            name='Planta Chancado Primario', client=client,
            general_status='Operación normal',
            general_status_detail='Sin alertas críticas',
            is_default=True,
        )

        area_chancado = models.Area.objects.create(plant=plant, name='Chancado Primario')
        area_torre = models.Area.objects.create(plant=plant, name='Torre de Transferencia')
        area_feeders = models.Area.objects.create(plant=plant, name='Feeders-Harneros')

        # --- KPIs (fila superior) ---
        kpis = [
            dict(key='pm10_total', label='Emisión Total (PM10)', value='1,126', unit='µg/m³N',
                 delta='18%', direction='down', delta_positive=True,
                 comparison='vs. ayer, misma hora', icon='wind', simulated=True),
            dict(key='eficiencia_global', label='Eficiencia Global de Supresión', value='87', unit='%',
                 delta='6%', direction='up', delta_positive=True,
                 comparison='vs. ayer, misma hora', icon='gauge', simulated=False),
            dict(key='sistemas_operativos', label='Sistemas Operativos', value='7 / 8', unit='',
                 delta='', direction='', comparison='88% del total', icon='settings', simulated=False),
            dict(key='camiones', label='Camiones Hoy', value='152', unit='',
                 delta='12%', direction='up', delta_positive=True,
                 comparison='vs. ayer', icon='truck', simulated=True),
            dict(key='estado_general', label='Estado General', value='Operación normal', unit='',
                 delta='', direction='', comparison='Sin alertas críticas',
                 icon='check-circle', simulated=False),
        ]
        for i, kpi in enumerate(kpis):
            models.Kpi.objects.create(plant=plant, order=i, **kpi)

        # --- 7 puntos de proceso (flujo, con PM10 SIMULADO) ---
        points_spec = [
            ('Descarga de Camiones', 'truck', 246, area_chancado),
            ('Tolva Gruesos', 'funnel', 198, area_chancado),
            ('Alimentador', 'feeder', 156, area_chancado),
            ('Chancador Primario', 'crusher', 312, area_chancado),
            ('Correa Transportadora', 'conveyor', 134, area_chancado),
            ('Chute de Transferencia', 'chute', 104, area_torre),
            ('Correa Overland Chancado', 'conveyor', 98, area_torre),
        ]
        points = []
        for i, (name, icon, pm10, area) in enumerate(points_spec, start=1):
            points.append(models.ProcessPoint.objects.create(
                area=area, name=name, order=i, icon=icon, has_sensor=True,
                pm10=pm10, simulated_pm10=True,
            ))

        # --- 8 sistemas de supresión y colección (tabla 6.6) ---
        # (nombre, tipo, tag, indicador, %, boquillas instaladas, métricas, área, punto, motivo)
        systems_spec = [
            ('Tolva Gruesos', 'supresor', 'DPSV0102', 'Estado Operativo', 92, 25,
             [('Presión', '8,2', 'bar', 8.2), ('Caudal', '45', 'l/min', 45)], area_chancado, points[1], None),
            ('Alimentador', 'supresor', 'DPSV0203', 'Eficiencia', 92, 25,
             [('Presión', '7,5', 'bar', 7.5), ('Caudal', '42', 'l/min', 42)], area_chancado, points[2], None),
            ('Chancador Primario', 'supresor', 'MSCP0104', 'Eficiencia', 88, 24,
             [('Presión', '9,1', 'bar', 9.1), ('Caudal', '48', 'l/min', 48)], area_chancado, points[3], None),
            ('Correa Transportadora', 'humectador', 'EX-HU05', 'Eficiencia', 82, 22,
             [('Presión', '6,8', 'bar', 6.8), ('Caudal', '38', 'l/min', 38)], area_chancado, points[4],
             models.StopReason.FALLA),
            ('Chute Transferencia', 'supresor', 'SP-06', 'Estado Operativo', 90, 20,
             [('Presión', '8,0', 'bar', 8.0), ('Caudal', '38', 'l/min', 38)], area_torre, points[5], None),
            ('Correa Overland', 'humectador', 'EX-HU07', 'Estado Operativo', 91, 22,
             [('Presión', '8,3', 'bar', 8.3), ('Caudal', '46', 'l/min', 46)], area_torre, points[6], None),
            ('Filtros de mangas', 'filtro', '2110-DN001-DI0007-C01', 'Eficiencia', 91, 32,
             [('ΔP', '1,2', 'kPa', 1.2), ('Estado', 'Operativo', '', None)], area_feeders, None, None),
            ('Colector Polvo', 'filtro', '2110-DN001-DI0008-C01', 'Eficiencia', 94, 32,
             [('ΔP', '1,5', 'kPa', 1.5), ('Estado', 'Operativo', '', None)], area_feeders, None, None),
        ]
        self._create_systems(systems_spec, seed_base=10)

        # --- Series PM10 por rango (SIMULADO) ---
        self._create_pm10_series(plant, avg_today=1126, avg_prev=1373, seed=11)

        # --- Alertas: 2 críticas, 5 mayores, 5 menores ---
        self._create_alerts(plant, counts=(2, 5, 5), seed=12)

        # --- Ambientales y mitigación (SIMULADO) ---
        models.EnvironmentReading.objects.create(
            plant=plant, temperature_c=12.6, humidity_pct=38,
            wind_direction='WNW', wind_speed_kmh=12,
        )
        models.MitigationImpact.objects.create(
            plant=plant, reduction_pct=-24,
            without_mitigation=1483, with_mitigation=1126,
        )

        # --- Órdenes de trabajo del día ---
        self._create_work_orders(plant, count=9, seed=13)

    # ------------------------------------------------------------------ #
    #  Plantas secundarias — variaciones coherentes                       #
    # ------------------------------------------------------------------ #
    def _build_variant_plant(self, client, name, seed, pm10_scale, trucks, trucks_delta,
                             efficiency, operative, operative_detail, status, status_detail,
                             alert_counts, degraded=False):
        rnd = random.Random(seed)
        plant = models.Plant.objects.create(
            name=name, client=client,
            general_status=status, general_status_detail=status_detail,
        )
        area_a = models.Area.objects.create(plant=plant, name='Chancado Secundario')
        area_b = models.Area.objects.create(plant=plant, name='Torre de Transferencia')

        avg_today = round(1126 * pm10_scale)
        avg_prev = round(avg_today * (1.12 + rnd.random() * 0.1))
        delta_pct = round(100 * (avg_prev - avg_today) / avg_prev)

        kpis = [
            dict(key='pm10_total', label='Emisión Total (PM10)', value=f'{avg_today:,}', unit='µg/m³N',
                 delta=f'{delta_pct}%', direction='down', delta_positive=True,
                 comparison='vs. ayer, misma hora', icon='wind', simulated=True),
            dict(key='eficiencia_global', label='Eficiencia Global de Supresión',
                 value=efficiency.rstrip('%'), unit='%',
                 delta='2%', direction='up' if not degraded else 'down', delta_positive=not degraded,
                 comparison='vs. ayer, misma hora', icon='gauge', simulated=False),
            dict(key='sistemas_operativos', label='Sistemas Operativos', value=operative, unit='',
                 comparison=operative_detail, icon='settings', simulated=False),
            dict(key='camiones', label='Camiones Hoy', value=trucks, unit='',
                 delta=trucks_delta, direction='up', delta_positive=True,
                 comparison='vs. ayer', icon='truck', simulated=True),
            dict(key='estado_general', label='Estado General', value=status, unit='',
                 comparison=status_detail, icon='check-circle' if not degraded else 'alert-circle',
                 simulated=False),
        ]
        for i, kpi in enumerate(kpis):
            models.Kpi.objects.create(plant=plant, order=i, **kpi)

        point_names = [
            ('Descarga de Camiones', 'truck'), ('Tolva Gruesos', 'funnel'),
            ('Alimentador', 'feeder'), ('Chancador Secundario', 'crusher'),
            ('Correa Transportadora', 'conveyor'), ('Chute de Transferencia', 'chute'),
            ('Correa Overland', 'conveyor'),
        ]
        points = []
        for i, (pname, icon) in enumerate(point_names, start=1):
            area = area_a if i <= 5 else area_b
            points.append(models.ProcessPoint.objects.create(
                area=area, name=pname, order=i, icon=icon, has_sensor=True,
                pm10=round((80 + rnd.random() * 240) * pm10_scale + 40), simulated_pm10=True,
            ))

        pcts = [93, 91, 87, 84, 92, 90, 91, 95]
        if degraded:
            pcts = [91, 88, 72, 0, 90, 86, 89, 93]
        systems_spec = []
        sys_names = ['Tolva Gruesos', 'Alimentador', 'Chancador', 'Correa Transportadora',
                     'Chute Transferencia', 'Correa Overland', 'Filtros de mangas', 'Colector Polvo']
        kinds = ['supresor', 'supresor', 'supresor', 'humectador', 'supresor', 'humectador', 'filtro', 'filtro']
        for i, (sname, kind, pct) in enumerate(zip(sys_names, kinds, pcts)):
            installed = 20 + rnd.randrange(6)
            if kind == 'filtro':
                metrics = [('ΔP', f'{1 + rnd.random():.1f}'.replace('.', ','), 'kPa', 1.3),
                           ('Estado', 'Operativo' if pct else 'Detenido', '', None)]
            else:
                pres = 6.5 + rnd.random() * 2.5
                caudal = 35 + rnd.randrange(14)
                metrics = [('Presión', f'{pres:.1f}'.replace('.', ','), 'bar', round(pres, 1)),
                           ('Caudal', str(caudal), 'l/min', caudal)]
            reason = None
            if pct == 0:
                reason = models.StopReason.FALLA
            elif pct < 85:
                reason = models.StopReason.PROGRAMADA
            indicator = 'Estado Operativo' if i in (0, 4, 5) else 'Eficiencia'
            point = points[min(i + 1, len(points) - 1)] if i < 6 else None
            area = area_a if i < 5 else area_b
            systems_spec.append((sname, kind, f'DPSV0{seed}{i}', indicator, pct,
                                 installed, metrics, area, point, reason))
        self._create_systems(systems_spec, seed_base=seed)

        self._create_pm10_series(plant, avg_today=avg_today, avg_prev=avg_prev, seed=seed + 1)
        self._create_alerts(plant, counts=alert_counts, seed=seed + 2)

        models.EnvironmentReading.objects.create(
            plant=plant, temperature_c=round(10 + rnd.random() * 8, 1),
            humidity_pct=round(30 + rnd.random() * 20),
            wind_direction=rnd.choice(['NW', 'WNW', 'W', 'SW']),
            wind_speed_kmh=round(8 + rnd.random() * 12),
        )
        models.MitigationImpact.objects.create(
            plant=plant, reduction_pct=-delta_pct - 6,
            without_mitigation=avg_prev + 110, with_mitigation=avg_today,
        )
        self._create_work_orders(plant, count=6, seed=seed + 3)

    # ------------------------------------------------------------------ #
    #  Helpers                                                            #
    # ------------------------------------------------------------------ #
    def _create_systems(self, systems_spec, seed_base):
        for i, (name, kind, tag, indicator, pct, installed, metrics, area, point, reason) in \
                enumerate(systems_spec, start=1):
            operative = round(installed * pct / 100)
            system = models.System.objects.create(
                area=area, process_point=point, name=name, kind=kind, tag=tag,
                order=i, indicator_label=indicator,
                nozzles_installed=installed, nozzles_operative=operative,
                nozzles_running=max(0, operative - (1 if pct not in (0, 100) and i % 3 == 0 else 0)),
                stop_reason=reason,
            )
            for j, (label, value, unit, numeric) in enumerate(metrics):
                sparkline = []
                if numeric is not None:
                    sparkline = smooth_series(
                        numeric, points=14,
                        jitter=0.16 if system.estado_semaforo == 'ambar' else 0.06,
                        seed=seed_base * 10 + i * 2 + j,
                    )
                models.SystemMetric.objects.create(
                    system=system, label=label, value=value, unit=unit,
                    sparkline=sparkline, order=j, simulated=True,
                )

    def _create_pm10_series(self, plant, avg_today, avg_prev, seed):
        # Hoy: 13 puntos cada 2 horas, 00:00–24:00
        labels_today = [f'{h:02d}:00' for h in range(0, 25, 2)]
        models.Pm10Series.objects.create(
            plant=plant, range='hoy', labels=labels_today,
            current=smooth_series(avg_today, 13, jitter=0.12, seed=seed, trend=-0.12),
            previous=smooth_series(avg_prev, 13, jitter=0.10, seed=seed + 1),
        )
        # 7 días
        today = timezone.localdate()
        labels_7d = [(today - timedelta(days=d)).strftime('%d %b') for d in range(6, -1, -1)]
        models.Pm10Series.objects.create(
            plant=plant, range='7d', labels=labels_7d,
            current=smooth_series(avg_today * 1.05, 7, jitter=0.10, seed=seed + 2, trend=-0.10),
            previous=smooth_series(avg_prev * 1.02, 7, jitter=0.08, seed=seed + 3),
        )
        # 30 días: 15 puntos (cada 2 días)
        labels_30d = [(today - timedelta(days=d)).strftime('%d %b') for d in range(28, -1, -2)]
        models.Pm10Series.objects.create(
            plant=plant, range='30d', labels=labels_30d,
            current=smooth_series(avg_today * 1.12, 15, jitter=0.14, seed=seed + 4, trend=-0.18),
            previous=smooth_series(avg_prev * 1.05, 15, jitter=0.10, seed=seed + 5),
        )

    def _create_work_orders(self, plant, count, seed):
        """OTs del día asociadas a los sistemas de la planta, con registro
        fotográfico del operario (metadatos; las imágenes reales vendrán de
        la app de terreno)."""
        rnd = random.Random(seed)
        systems = list(models.System.objects.filter(area__plant=plant))
        if not systems:
            return
        today = timezone.localtime()
        technicians = ['C. Rojas', 'M. Díaz', 'P. Soto', 'J. Fuentes', 'A. Cortés']
        catalog = {
            'preventiva': {
                'desc': [
                    'Mantención preventiva programada del sistema de supresión',
                    'Limpieza y calibración de boquillas según pauta semanal',
                    'Revisión general de circuito de agua y aspersión',
                ],
                'tasks': [
                    'Inspección visual de boquillas y cañerías',
                    'Limpieza de boquillas obstruidas',
                    'Verificación de presión de línea (bar)',
                    'Prueba de aspersión en vacío',
                    'Registro fotográfico de estado final',
                ],
            },
            'correctiva': {
                'desc': [
                    'Reparación de rotura de cañería en línea de supresión',
                    'Reemplazo de boquillas fuera de servicio',
                    'Corrección de baja presión en gabinete supresor',
                ],
                'tasks': [
                    'Aislación y despresurización de la línea',
                    'Reemplazo de tramo de cañería / boquilla dañada',
                    'Prueba de estanqueidad y presión',
                    'Puesta en servicio y verificación de aspersión',
                    'Registro fotográfico antes / después',
                ],
            },
            'inspeccion': {
                'desc': [
                    'Inspección de rutina y catastro de boquillas',
                    'Inspección de ΔP y estado de mangas del filtro',
                    'Levantamiento de estado de sistema en terreno',
                ],
                'tasks': [
                    'Conteo de boquillas operativas / en funcionamiento',
                    'Lectura de manómetros y flujómetros',
                    'Verificación de accesos y condiciones del área',
                    'Registro fotográfico del estado del sistema',
                ],
            },
        }
        photo_labels = {
            'preventiva': ['Estado inicial del sistema', 'Boquillas tras limpieza',
                           'Manómetro de presión', 'Aspersión en prueba'],
            'correctiva': ['Falla detectada (antes)', 'Tramo reparado (después)',
                           'Boquilla reemplazada', 'Prueba de estanqueidad'],
            'inspeccion': ['Vista general del sistema', 'Detalle de boquillas',
                           'Lectura de manómetro', 'Condición de cañerías'],
        }
        kinds = ['preventiva', 'correctiva', 'inspeccion']
        for i in range(count):
            kind = kinds[i % 3] if i < 3 else rnd.choice(kinds)
            system = systems[i % len(systems)]
            hour = 7 + i  # jornada desde las 07:00
            scheduled = today.replace(hour=min(hour, 19), minute=rnd.choice([0, 15, 30]),
                                      second=0, microsecond=0)
            # Estado según la hora del día: mañana cerradas, mediodía en ejecución, tarde abiertas
            if hour <= 10:
                status = models.WorkOrder.Status.CERRADA
            elif hour <= 13:
                status = models.WorkOrder.Status.EN_EJECUCION
            else:
                status = models.WorkOrder.Status.ABIERTA
            info = catalog[kind]
            n_tasks = rnd.randrange(3, len(info['tasks']) + 1)
            n_photos = 0 if status == models.WorkOrder.Status.ABIERTA else rnd.randrange(2, 5)
            photos = [
                {
                    'label': photo_labels[kind][j % len(photo_labels[kind])],
                    'taken_at': scheduled.replace(minute=(10 + j * 12) % 60).isoformat(),
                }
                for j in range(n_photos)
            ]
            models.WorkOrder.objects.create(
                plant=plant, system=system,
                number=f'OT-{today.strftime("%Y%m%d")}-{i + 1:02d}',
                kind=kind, status=status,
                technician=rnd.choice(technicians),
                scheduled_at=scheduled,
                duration_hours=round(0.5 + rnd.random() * 3, 1) if status != models.WorkOrder.Status.ABIERTA else 0,
                description=rnd.choice(info['desc']),
                tasks=info['tasks'][:n_tasks],
                photos=photos,
            )

    def _create_alerts(self, plant, counts, seed):
        rnd = random.Random(seed)
        now = timezone.now()
        systems = list(models.System.objects.filter(area__plant=plant))
        catalog = {
            'critica': [
                'PM10 sobre umbral crítico en Chancador Primario',
                'Falla / rotura de cañería en línea de supresión',
                'Sistema fuera de servicio: sin boquillas operativas',
            ],
            'mayor': [
                'Presión bajo rango en gabinete supresor',
                'Caudal inestable en circuito de humectación',
                'Eficiencia de supresión bajo objetivo (< 85%)',
                'Detención programada por proyecto en curso',
                'ΔP elevado en filtro de mangas',
                'Boquillas obstruidas detectadas en inspección',
            ],
            'menor': [
                'Mantención preventiva próxima a vencer',
                'Área restringida por terceros: acceso pendiente',
                'Sensor de polvo con lectura intermitente',
                'Solicitud del cliente: ajuste de aspersión',
                'Nivel de estanque bajo el 40%',
                'Deriva leve en calibración de sensor PM10',
            ],
        }
        for severity, count in zip(('critica', 'mayor', 'menor'), counts):
            messages = catalog[severity]
            for i in range(count):
                models.Alert.objects.create(
                    plant=plant, severity=severity,
                    message=messages[i % len(messages)],
                    system=rnd.choice(systems) if systems else None,
                    timestamp=now - timedelta(minutes=rnd.randrange(15, 720)),
                )
