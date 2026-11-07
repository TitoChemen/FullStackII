
# ============================================
# VETERINARIA SAN MARCOS - EV3
# Iniciador de microservicios para Windows
# ============================================

$ErrorActionPreference = "Stop"

$ROOT = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ENV_FILE = Join-Path $ROOT ".env"
$LOG_DIR = Join-Path $ROOT "logs"
$PID_DIR = Join-Path $ROOT ".run"

$SERVICIOS = @(
    "eureka-server",
    "api-gateway",
    "usuarios-service",
    "mascotas-service",
    "citas-service",
    "historial-service"
)

Write-Host "===================================="
Write-Host " VETERINARIA SAN MARCOS - EV3"
Write-Host "===================================="

# 1. Comprobar archivo .env
if (-not (Test-Path $ENV_FILE)) {
    throw "No existe .env. Copia .env.example y configura las credenciales."
}

# 2. Cargar variables de entorno
foreach ($linea in Get-Content $ENV_FILE) {
    $linea = $linea.Trim()

    if ($linea -eq "" -or $linea.StartsWith("#")) {
        continue
    }

    $partes = $linea -split "=", 2

    if ($partes.Count -ne 2) {
        throw "Linea invalida en .env: $linea"
    }

    $nombre = $partes[0].Trim()
    $valor = $partes[1].Trim()

    if ($nombre -notmatch '^[A-Z][A-Z0-9_]*$') {
        throw "Nombre de variable invalido: $nombre"
    }

    [Environment]::SetEnvironmentVariable(
        $nombre,
        $valor,
        "Process"
    )
}

# 3. Validar variables obligatorias
$OBLIGATORIAS = @(
    "JWT_SECRET",
    "USUARIOS_DB_USER", "USUARIOS_DB_PASSWORD",
    "MASCOTAS_DB_USER", "MASCOTAS_DB_PASSWORD",
    "CITAS_DB_USER", "CITAS_DB_PASSWORD",
    "HISTORIAL_DB_USER", "HISTORIAL_DB_PASSWORD"
)

foreach ($variable in $OBLIGATORIAS) {
    $valor = [Environment]::GetEnvironmentVariable($variable, "Process")

    if ([string]::IsNullOrWhiteSpace($valor) -or
        $valor.StartsWith("REEMPLAZAR")) {
        throw "Debes configurar $variable en .env"
    }
}

# 4. Comprobar Java
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    throw "Java no esta instalado o no esta disponible en PATH."
}

# 5. Comprobar MariaDB
$conexion = Test-NetConnection `
    -ComputerName 127.0.0.1 `
    -Port 3306 `
    -InformationLevel Quiet `
    -WarningAction SilentlyContinue

if (-not $conexion) {
    throw "MariaDB no responde en localhost:3306. Inicia MySQL desde XAMPP."
}

# 6. Preparar directorios
New-Item -ItemType Directory -Force -Path $LOG_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $PID_DIR | Out-Null

# 7. Iniciar microservicios
foreach ($servicio in $SERVICIOS) {
    $directorio = Join-Path $ROOT "backend\$servicio"
    $wrapper = Join-Path $directorio "mvnw.cmd"

    if (-not (Test-Path $wrapper)) {
        throw "No existe el Maven Wrapper: $wrapper"
    }

    Write-Host "Iniciando $servicio..."

    $log = Join-Path $LOG_DIR "$servicio.log"
    $errorLog = Join-Path $LOG_DIR "$servicio-error.log"

    $proceso = Start-Process `
        -FilePath "cmd.exe" `
        -ArgumentList "/d", "/c", "call mvnw.cmd spring-boot:run" `
        -WorkingDirectory $directorio `
        -RedirectStandardOutput $log `
        -RedirectStandardError $errorLog `
        -PassThru `
        -WindowStyle Hidden

    $pidFile = Join-Path $PID_DIR "$servicio.pid"
    Set-Content -Path $pidFile -Value $proceso.Id

    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Se enviaron las solicitudes de inicio."
Write-Host "Revisa los registros en: $LOG_DIR"
Write-Host ""
Write-Host "Eureka:   http://localhost:8761"
Write-Host "Gateway:  http://localhost:8080"
Write-Host "Historial: http://localhost:8084/swagger-ui/index.html"
