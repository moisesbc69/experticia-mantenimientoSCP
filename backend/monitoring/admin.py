from django.contrib import admin

from . import models

admin.site.register(models.Plant)
admin.site.register(models.Area)
admin.site.register(models.ProcessPoint)
admin.site.register(models.System)
admin.site.register(models.SystemMetric)
admin.site.register(models.Pm10Series)
admin.site.register(models.Kpi)
admin.site.register(models.Alert)
admin.site.register(models.EnvironmentReading)
admin.site.register(models.MitigationImpact)
