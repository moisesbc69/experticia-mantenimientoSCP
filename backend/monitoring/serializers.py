from rest_framework import serializers

from . import models


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Plant
        fields = ['id', 'name', 'client', 'general_status', 'general_status_detail', 'is_default', 'updated_at']


class ProcessPointSerializer(serializers.ModelSerializer):
    area = serializers.CharField(source='area.name', read_only=True)

    class Meta:
        model = models.ProcessPoint
        fields = ['id', 'name', 'order', 'icon', 'has_sensor', 'pm10', 'simulated_pm10', 'area']


class SystemMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SystemMetric
        fields = ['label', 'value', 'unit', 'sparkline', 'simulated']


class SystemSerializer(serializers.ModelSerializer):
    metrics = SystemMetricSerializer(many=True, read_only=True)
    disponibilidad = serializers.IntegerField(read_only=True)
    utilizacion = serializers.IntegerField(read_only=True)
    estado_semaforo = serializers.CharField(read_only=True)
    kind_display = serializers.CharField(source='get_kind_display', read_only=True)
    stop_reason_display = serializers.CharField(source='get_stop_reason_display', read_only=True)
    area = serializers.CharField(source='area.name', read_only=True)

    class Meta:
        model = models.System
        fields = [
            'id', 'name', 'kind', 'kind_display', 'tag', 'order', 'area', 'indicator_label',
            'nozzles_installed', 'nozzles_operative', 'nozzles_running',
            'disponibilidad', 'utilizacion', 'estado_semaforo',
            'stop_reason', 'stop_reason_display', 'metrics',
        ]


class Pm10SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Pm10Series
        fields = ['range', 'labels', 'current', 'previous', 'simulated']


class KpiSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Kpi
        fields = ['key', 'label', 'value', 'unit', 'delta', 'direction',
                  'delta_positive', 'comparison', 'icon', 'order', 'simulated']


class AlertSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    system = serializers.CharField(source='system.name', read_only=True, default=None)

    class Meta:
        model = models.Alert
        fields = ['id', 'severity', 'severity_display', 'message', 'system', 'timestamp']


class EnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EnvironmentReading
        fields = ['temperature_c', 'humidity_pct', 'wind_direction', 'wind_speed_kmh', 'simulated']


class MitigationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MitigationImpact
        fields = ['reduction_pct', 'without_mitigation', 'with_mitigation', 'simulated']
