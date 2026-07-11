# Panel Operativo IIoT — Experticia (Demo)

Demo de presentación de la **Plataforma de Datos IIoT de Experticia (Grupo Air)** para el
monitoreo de salud y mantenimiento de **sistemas de control de polvo** en faenas mineras
(supresión, humectación y colección). Caso de uso: **"Salud de Máquinas"**.

- **Cliente de presentación (parametrizable):** BHP · Faena Spence — foco en control de
  exposición a sílice/silicosis (PM10 como *proxy*).
- **Una sola pantalla:** dashboard "Resumen" con KPIs, flujo del proceso con 7 puntos de
  monitoreo, emisión PM10, impacto de mitigación, condiciones ambientales, alertas y estado
  de 8 sistemas de supresión/colección.
- **Demo de alta fidelidad con datos precargados (seed)** — no conectada a sensores reales,
  pero construida sobre el stack productivo (Django + Angular + PostgreSQL) para poder
  evolucionar hacia el producto.

![Stack](https://img.shields.io/badge/stack-Django%205%20·%20DRF%20·%20PostgreSQL%20·%20Angular%2018-blue)

## Estructura del repo

```
/backend    Django 5 + Django REST Framework + PostgreSQL
/frontend   Angular 18 (standalone components) + SCSS + ngx-charts + lucide
docker-compose.yml
```

## Requisitos

- Python 3.11+
- Node.js 20+ (probado con 22) y npm
- Docker (solo para levantar PostgreSQL fácilmente) — o un PostgreSQL 16 local

## Cómo correr (3 pasos)

### 1. Base de datos (PostgreSQL)

```bash
docker compose up -d db
```

Sin Docker: crea una base `experticia_demo` con usuario/clave `experticia` en `localhost:5432`
(o ajusta las variables en `backend/.env`).

### 2. Backend (Django)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # ajusta si es necesario
python manage.py migrate
python manage.py seed_demo                             # carga los datos de la demo (idempotente)
python manage.py runserver                             # http://localhost:8000
```

> Alternativa rápida sin PostgreSQL (solo desarrollo): `USE_SQLITE=1` en `.env`.
> Alternativa full-Docker: `docker compose --profile full up` levanta DB + backend ya migrado y seedeado.

### 3. Frontend (Angular)

```bash
cd frontend
npm install
npm start                                              # ng serve → http://localhost:4200
```

Abrir **http://localhost:4200** (pensado para proyectarse a 1600×900).

## API

| Endpoint | Descripción |
|---|---|
| `GET /api/plants/` | Lista de plantas |
| `GET /api/plants/{id}/dashboard/` | Payload agregado con todo lo que la pantalla necesita: `plant`, `kpis`, `process_points`, `pm10_series` (hoy/7d/30d), `systems`, `alerts`, `environment`, `mitigation` |

## Modelo de dominio

Jerarquía de activos (del análisis real de planillas del cliente):

```
Boquilla → Gabinete (equipo) → Zona de aplicación / Punto de proceso → Área/Sector → Planta
```

KPIs con definición real:

- **Disponibilidad** = boquillas operativas / instaladas → ¿el sistema puede operar?
- **Utilización** = boquillas en funcionamiento / instaladas → ¿está operando?
- **Sistemas Operativos** = sistemas con disponibilidad > 0 sobre el total.
- **Semáforo**: regla real verde = 100 %, ámbar = 1–99 %, rojo = 0 %. En la demo se usa
  verde ≥ 85, ámbar 1–84, rojo 0 para variedad visual (coherente con el mockup).

### REAL vs. SIMULADO

Las entidades/campos que hoy **no se capturan en terreno** llevan el flag `simulated=True`
en el modelo y en la API: emisión PM10 (total, por punto y series), presión, caudal,
ΔP de filtros, camiones/día, condiciones ambientales y el gauge de mitigación.
Son **reales/derivables**: áreas, sistemas, equipos, disponibilidad, utilización,
sistemas operativos, semáforo y motivos de detención.

## Parametrización del cliente

El cliente mostrado en header y footer se configura con la variable de entorno
`DEMO_CLIENT_NAME` (default: `BHP · Faena Spence`) antes de ejecutar `seed_demo`.
Los datos de la demo son representativos.

## Interacciones de la demo

- Reloj en tiempo real + indicador "Tiempo real" con pulso.
- Tabs **Hoy / 7 días / 30 días** cambian la serie PM10 (series distintas por rango desde la API).
- Selector de planta (3 plantas seed) recarga el dashboard vía API — la tercera planta
  muestra un escenario degradado (sistema en rojo, alertas críticas).
- Hover en nodos del flujo y tarjetas de sistemas → tooltip con estado, TAG, boquillas y
  motivo de detención si aplica.
- "Ver en mapa", "Capas" y "Ver todas": decorativos (toast "Próximamente").

## Fuera de alcance (demo)

Autenticación real, roles, sensores reales, app de terreno, las demás vistas del menú
(Planta, Sistemas, Polvo, Reportes, Histórico, Configuración) y la carga de KPIs desde
los Excel del cliente (trabajo posterior de DataQu).
