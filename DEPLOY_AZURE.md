# Despliegue en Azure — Demo Panel Operativo IIoT Experticia

Publica la demo en una URL pública (`https://<app>.azurewebsites.net`) usando:

- **Azure App Service** (contenedor Linux) → Django + Angular en un solo servicio
- **Azure Database for PostgreSQL** (Flexible Server)
- **Azure Container Registry (ACR)** → construye la imagen Docker **en la nube** (no necesitas Docker local)

Costo aproximado: ~US$27/mes (B1 + B1ms + ACR Basic). Todo se elimina con un comando al final.

---

## 0. Prerrequisitos (una sola vez)

- Cuenta de Azure activa ([portal.azure.com](https://portal.azure.com)).
- **Azure CLI** en tu Mac:
  ```bash
  brew install azure-cli
  az login          # abre el navegador para iniciar sesión
  ```

## 1. Variables base

Copia y pega este bloque en la terminal (ajusta `APP` si el nombre está tomado — debe ser único global):

```bash
RG=experticia-demo-rg
LOC=eastus2                       # o brazilsouth (más cerca de Chile, algo más caro)
APP=experticia-demo-scp           # → https://experticia-demo-scp.azurewebsites.net
ACR=experticiademoacr             # solo minúsculas y números, único global
PG=experticia-demo-pg             # único global
DB_PASS='CAMBIA-est4-Clave!'      # clave del administrador de PostgreSQL
SECRET_KEY=$(openssl rand -hex 32)
```

## 2. Grupo de recursos

```bash
az group create --name $RG --location $LOC
```

## 3. PostgreSQL Flexible Server

```bash
az postgres flexible-server create \
  --resource-group $RG --name $PG --location $LOC \
  --admin-user experticia --admin-password "$DB_PASS" \
  --tier Burstable --sku-name Standard_B1ms \
  --storage-size 32 --version 16 \
  --database-name experticia_demo \
  --public-access 0.0.0.0
```

> `--public-access 0.0.0.0` permite el acceso desde servicios de Azure (la App Service).
> Tarda ~5 minutos.

## 4. Container Registry + build de la imagen en la nube

Desde la **carpeta raíz del proyecto** (donde está el `Dockerfile`):

```bash
az acr create --resource-group $RG --name $ACR --sku Basic --admin-enabled true

az acr build --registry $ACR --image experticia-demo:v1 .
```

> `az acr build` sube el código y construye la imagen en Azure (~5-8 min la primera vez).

## 5. App Service

```bash
az appservice plan create --resource-group $RG --name ${APP}-plan \
  --is-linux --sku B1

az webapp create --resource-group $RG --plan ${APP}-plan --name $APP \
  --deployment-container-image-name $ACR.azurecr.io/experticia-demo:v1

# Credenciales del registro para que la app pueda bajar la imagen
ACR_USER=$(az acr credential show -n $ACR --query username -o tsv)
ACR_PASS=$(az acr credential show -n $ACR --query "passwords[0].value" -o tsv)
az webapp config container set --resource-group $RG --name $APP \
  --container-image-name $ACR.azurecr.io/experticia-demo:v1 \
  --container-registry-url https://$ACR.azurecr.io \
  --container-registry-user $ACR_USER \
  --container-registry-password "$ACR_PASS"
```

## 6. Variables de entorno de la aplicación

```bash
az webapp config appsettings set --resource-group $RG --name $APP --settings \
  WEBSITES_PORT=8000 \
  SECRET_KEY="$SECRET_KEY" \
  DEBUG=False \
  ALLOWED_HOSTS=$APP.azurewebsites.net \
  CSRF_TRUSTED_ORIGINS=https://$APP.azurewebsites.net \
  DB_HOST=$PG.postgres.database.azure.com \
  DB_NAME=experticia_demo \
  DB_USER=experticia \
  DB_PASSWORD="$DB_PASS" \
  DB_SSLMODE=require \
  SEED_ON_START=1 \
  DEMO_CLIENT_NAME="BHP · Faena Spence"

az webapp restart --resource-group $RG --name $APP
```

## 7. Probar

```bash
echo "https://$APP.azurewebsites.net"
```

Abre esa URL (el primer arranque tarda 1-2 min: migra y carga el seed).
Para ver los logs en vivo si algo falla:

```bash
az webapp log tail --resource-group $RG --name $APP
```

---

## Actualizar la demo (después de cambios de código)

```bash
az acr build --registry $ACR --image experticia-demo:v1 .
az webapp restart --resource-group $RG --name $APP
```

## Apagar / eliminar todo (deja de facturar)

```bash
az group delete --name $RG --yes --no-wait
```

## Notas

- `SEED_ON_START=1` recarga los datos de la demo en cada reinicio (siempre fresca).
  Ponlo en `0` si editas datos vía admin/DBeaver y quieres conservarlos.
- La URL es pública: cualquiera con el enlace ve la demo. Compártela solo con
  quienes corresponda, o pídele a Claude agregar una clave de acceso simple.
- El plan B1 no se "duerme": la demo responde al instante en la presentación.
