#!/usr/bin/env bash
# ============================================================
#  Demo Panel Operativo IIoT Experticia — arranque automático
#  Coloca este archivo dentro de la carpeta del proyecto
#  (experticia-mantenimientoSCP) y ejecútalo:  bash run-demo.sh
#  Requisitos: Docker corriendo, Python 3.11+, Node 20+.
# ============================================================
set -e
cd "$(dirname "$0")"

echo "=== [1/3] Levantando base de datos PostgreSQL (Docker) ==="
docker compose up -d db

echo "=== [2/3] Preparando backend Django ==="
cd backend
[ -d .venv ] || python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt --quiet
[ -f .env ] || cp .env.example .env
python manage.py migrate
python manage.py seed_demo
(python manage.py runserver &> ../backend.log &)
cd ..

echo "=== [3/3] Preparando frontend Angular ==="
cd frontend
[ -d node_modules ] || npm install --no-audit --no-fund
(npm start &> ../frontend.log &)
cd ..

echo
echo "============================================================"
echo " Listo. Backend en :8000 y frontend en :4200 (logs en *.log)"
echo " Abre http://localhost:4200 en ~20 segundos."
echo "============================================================"
sleep 22
( command -v open >/dev/null && open http://localhost:4200 ) || \
( command -v xdg-open >/dev/null && xdg-open http://localhost:4200 ) || true
