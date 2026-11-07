
#!/usr/bin/env bash
set -Eeuo pipefail

# Veterinaria San Marcos - EV3
# Iniciador de microservicios para Linux

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env"
LOG_DIR="$ROOT/logs"
PID_DIR="$ROOT/.run"

SERVICIOS=(
  "eureka-server"
  "api-gateway"
  "usuarios-service"
  "mascotas-service"
  "citas-service"
  "historial-service"
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: No existe el archivo .env"
  echo "Crea una copia de .env.example y configura tus credenciales."
  exit 1
fi

# Cargar configuración local
set -a
source "$ENV_FILE"
set +a

# Validar variables obligatorias
VARIABLES=(
  JWT_SECRET
  USUARIOS_DB_USER USUARIOS_DB_PASSWORD
  MASCOTAS_DB_USER MASCOTAS_DB_PASSWORD
  CITAS_DB_USER CITAS_DB_PASSWORD
  HISTORIAL_DB_USER HISTORIAL_DB_PASSWORD
)

for variable in "${VARIABLES[@]}"; do
  valor="${!variable:-}"

  if [[ -z "$valor" || "$valor" == REEMPLAZAR* ]]; then
    echo "ERROR: Debes configurar $variable en .env"
    exit 1
  fi
done

mkdir -p "$LOG_DIR" "$PID_DIR"

# Evitar exponer las credenciales del archivo
chmod 600 "$ENV_FILE"

# Comprobar herramientas
if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java no está instalado."
  exit 1
fi

# Comprobar conexión TCP con MariaDB
if ! (echo >/dev/tcp/127.0.0.1/3306) 2>/dev/null; then
  echo "ERROR: MariaDB no está disponible en localhost:3306."
  echo "Inicia MySQL/MariaDB desde XAMPP."
  exit 1
fi

echo "===================================="
echo " VETERINARIA SAN MARCOS - EV3"
echo "===================================="

for servicio in "${SERVICIOS[@]}"; do
  DIR="$ROOT/backend/$servicio"
  WRAPPER="$DIR/mvnw"

  if [[ ! -f "$WRAPPER" ]]; then
    echo "ERROR: No existe $WRAPPER"
    exit 1
  fi

  echo "Iniciando $servicio..."

  (
    cd "$DIR"
    bash ./mvnw spring-boot:run
  ) > "$LOG_DIR/$servicio.log" 2>&1 &

  echo "$!" > "$PID_DIR/$servicio.pid"

  # Pausa inicial; no sustituye una comprobación de salud
  sleep 5
done

echo
echo "Se enviaron las solicitudes de inicio."
echo "Revisa los logs para confirmar que cada servicio arrancó:"
echo "  $LOG_DIR"
echo
echo "Eureka: http://localhost:8761"
echo "Gateway: http://localhost:8080"
echo "Historial: http://localhost:8084/swagger-ui/index.html"
