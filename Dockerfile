# ============================================================
# Imagen de producción — Demo Panel Operativo IIoT Experticia
# Etapa 1: compila Angular. Etapa 2: Django + gunicorn sirve
# API y frontend desde un solo contenedor (puerto 8000).
# ============================================================

FROM node:22-alpine AS frontend
WORKDIR /front
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npx ng build --configuration production

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend /front/dist/experticia-panel-operativo/browser /app/frontend_dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh \
    && USE_SQLITE=1 python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["/app/docker-entrypoint.sh"]
