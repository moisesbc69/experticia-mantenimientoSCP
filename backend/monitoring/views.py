from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import models, serializers


@api_view(['GET'])
def plant_list(request):
    plants = models.Plant.objects.all()
    return Response(serializers.PlantSerializer(plants, many=True).data)


@api_view(['GET'])
def plant_dashboard(request, plant_id):
    """Payload agregado con todo lo que la pantalla 'Resumen' necesita."""
    plant = get_object_or_404(
        models.Plant.objects.prefetch_related(
            'kpis', 'alerts', 'pm10_series',
            'areas__process_points', 'areas__systems__metrics',
        ),
        pk=plant_id,
    )

    process_points = models.ProcessPoint.objects.filter(area__plant=plant).order_by('order')
    systems = models.System.objects.filter(area__plant=plant).order_by('order').prefetch_related('metrics')

    alerts = plant.alerts.all()
    severity_counts = {
        'critica': alerts.filter(severity='critica').count(),
        'mayor': alerts.filter(severity='mayor').count(),
        'menor': alerts.filter(severity='menor').count(),
    }

    environment = getattr(plant, 'environment', None)
    mitigation = getattr(plant, 'mitigation', None)

    return Response({
        'plant': serializers.PlantSerializer(plant).data,
        'kpis': serializers.KpiSerializer(plant.kpis.all(), many=True).data,
        'process_points': serializers.ProcessPointSerializer(process_points, many=True).data,
        'pm10_series': serializers.Pm10SeriesSerializer(plant.pm10_series.all(), many=True).data,
        'systems': serializers.SystemSerializer(systems, many=True).data,
        'alerts': {
            'total': alerts.count(),
            'by_severity': severity_counts,
            'items': serializers.AlertSerializer(alerts, many=True).data,
        },
        'environment': serializers.EnvironmentSerializer(environment).data if environment else None,
        'mitigation': serializers.MitigationSerializer(mitigation).data if mitigation else None,
    })
