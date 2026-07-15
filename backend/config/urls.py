from django.conf import settings
from django.contrib import admin
from django.http import FileResponse, Http404
from django.urls import include, path, re_path


def spa_index(request, *args, **kwargs):
    """Catch-all del SPA: entrega el index.html de Angular para cualquier
    ruta que no sea API/admin/estáticos, de modo que /flujo, /ots, etc.
    funcionen al recargar o abrir directamente la URL."""
    index = settings.FRONTEND_DIST / 'index.html'
    if index.is_file():
        return FileResponse(open(index, 'rb'), content_type='text/html')
    raise Http404('Frontend no compilado: ejecuta ng build (solo aplica en producción).')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('monitoring.urls')),
    re_path(r'^(?!api/|admin/|static/).*$', spa_index, name='spa-index'),
]
