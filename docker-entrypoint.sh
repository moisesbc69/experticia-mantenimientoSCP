#!/bin/sh
# Arranque en producción: migra, siembra los datos de la demo y levanta gunicorn.
set -e

echo "=== Migrando base de datos ==="
python manage.py migrate --noinput

if [ "${SEED_ON_START:-1}" != "0" ]; then
  echo "=== Cargando datos de la demo (seed_demo) ==="
  python manage.py seed_demo
fi

echo "=== Iniciando gunicorn en puerto ${PORT:-8000} ==="
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 2 \
  --threads 4 \
  --timeout 120
