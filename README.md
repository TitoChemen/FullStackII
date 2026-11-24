# 🐾 Veterinaria San Marcos — Plataforma Fullstack

Sistema web de la Veterinaria San Marcos (Rancagua, Chile). Está formado por un **frontend** en React y un **backend** de microservicios en Spring Boot, que se comunican mediante una **API REST** protegida con **JWT** y control de acceso por roles.

> Proyecto de la asignatura **DSY1104 – Desarrollo Fullstack II** (Evaluación Parcial N° 3: integración backend + frontend).

---

## 👥 Integrantes

| Integrante | Responsabilidades |
|---|---|
| Kevin | _Completar: por ejemplo, arquitectura del frontend, enrutamiento, RBAC y sesión._ |
| Jaime | _Completar: por ejemplo, vistas públicas, formularios y validaciones._ |
| Oscar | _Completar: por ejemplo, paneles Admin/Fichas/Usuarios y autenticación._ |

---

## 🏗️ Arquitectura

```
                         ┌──────────────────────────┐
  Navegador ───────────► │  Frontend React (Vite)   │  http://localhost:5173
                         └────────────┬─────────────┘
                                      │  /api/v1/...  (proxy de Vite)
                                      ▼
                         ┌──────────────────────────┐
                         │   API Gateway  :8080     │  CORS + enrutamiento
                         └────────────┬─────────────┘
              ┌───────────────┬───────┴────────┬────────────────┐
              ▼               ▼                ▼                ▼
      usuarios-service  mascotas-service  citas-service  historial-service
           :8081            :8082            :8083            :8084
              │               │                │                │
        BD usuarios      BD mascotas       BD citas        BD historial
                         (MySQL / MariaDB)

      Eureka Server :8761  →  registro y descubrimiento de servicios
```

- El frontend **solo** habla con el API Gateway; nunca directamente con los microservicios.
- Cada microservicio tiene su propia base de datos.
- Los servicios se consultan entre sí por Eureka (por ejemplo, citas valida la mascota en mascotas-service) reenviando el token del usuario.

### Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, Vite, React Router 7, Bootstrap 5, Bootstrap Icons, Vitest |
| Backend | Java, Spring Boot 4, Spring Security (OAuth2 Resource Server / JWT), Spring Data JPA, Spring Cloud Gateway, Eureka, springdoc-openapi (Swagger) |
| Base de datos | MySQL / MariaDB |

---

## ✅ Requisitos previos

- **Java 21** (o la versión definida en los `pom.xml`) y **Maven** (o el `mvnw` incluido en cada servicio)
- **Node.js 20+** y npm
- **MySQL o MariaDB** (por ejemplo, XAMPP)

---

## ⚙️ Configuración

### 1. Bases de datos

Ejecuta, en este orden, los scripts de la carpeta [`database/`](database/):

1. `00_setup.sql` — crea las 4 bases de datos (`veterinaria_usuarios`, `veterinaria_mascotas`, `veterinaria_citas`, `veterinaria_historial`). Dentro del archivo hay instrucciones para crear los usuarios de BD con tu propia contraseña local.
2. `01_citas_init.sql`, `02_historial_init.sql`, `03_mascota_init.sql`, `04_usuario_init.sql` — crean las tablas.
3. `05_Datos Demo.sql` — carga usuarios, mascotas, citas e historiales de ejemplo.

### 2. Variables de entorno

Copia la plantilla y completa tus valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `USUARIOS_DB_URL`, `USUARIOS_DB_USER`, `USUARIOS_DB_PASSWORD` | Conexión a la BD de usuarios |
| `MASCOTAS_DB_*`, `CITAS_DB_*`, `HISTORIAL_DB_*` | Ídem para los demás servicios |
| `JWT_SECRET` | Clave en Base64, **la misma para todos los microservicios** |

Para generar una clave segura:

```bash
openssl rand -base64 32
```

> ⚠️ El archivo `.env` está en `.gitignore`. **Nunca lo subas a GitHub.**

---

## ▶️ Cómo ejecutar

### Backend

Con los scripts incluidos (cargan el `.env` y levantan los 6 servicios en orden):

```powershell
# Windows
.\scripts\iniciar-windows.ps1
```

```bash
# Linux / macOS
./scripts/iniciar-linux.sh
```

Los logs quedan en la carpeta `logs/`.

Si prefieres hacerlo a mano, inicia en este orden (en cada carpeta: `./mvnw spring-boot:run`):
`eureka-server` → `api-gateway` → `usuarios-service` → `mascotas-service` → `citas-service` → `historial-service`.

Verifica que los servicios aparezcan registrados en http://localhost:8761.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

### Puertos

| Servicio | Puerto |
|---|---|
| Frontend (Vite) | 5173 |
| API Gateway | 8080 |
| usuarios-service | 8081 |
| mascotas-service | 8082 |
| citas-service | 8083 |
| historial-service | 8084 |
| Eureka Server | 8761 |

---

## 📖 Documentación de la API (Swagger)

Cada microservicio expone su propio Swagger UI:

| Servicio | URL |
|---|---|
| Usuarios y autenticación | http://localhost:8081/swagger-ui.html |
| Mascotas | http://localhost:8082/swagger-ui.html |
| Citas | http://localhost:8083/swagger-ui.html |
| Historial clínico | http://localhost:8084/swagger-ui.html |

Para probar endpoints protegidos: haz `POST /api/v1/auth/login`, copia el `accessToken`, pulsa **Authorize** y pega el token.

---

## 🔌 Endpoints principales

Todas las rutas se consumen vía el gateway (`http://localhost:8080`).

### Autenticación y usuarios

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/v1/auth/registro` | Registro de dueño de mascota | Público |
| POST | `/api/v1/auth/login` | Inicio de sesión, entrega JWT | Público |
| POST | `/api/v1/auth/refresh` | Renueva el token | Token válido |
| GET | `/api/v1/usuarios/me` | Perfil del usuario autenticado | Cualquier usuario con sesión |
| GET | `/api/v1/usuarios` | Listar usuarios | Administrador |
| GET | `/api/v1/usuarios/{id}` | Ver un usuario | Administrador |
| PUT | `/api/v1/usuarios/{id}` | Editar nombre, apellido, rol y estado | Administrador |
| DELETE | `/api/v1/usuarios/{id}` | Desactivar cuenta (borrado lógico) | Administrador |

### Mascotas

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/mascotas` | Registrar mascota |
| GET | `/api/v1/mascotas` | Listar mascotas |
| GET | `/api/v1/mascotas/mias` | Mascotas del usuario autenticado |
| GET | `/api/v1/mascotas/{id}` | Ver una mascota |
| PUT | `/api/v1/mascotas/{id}` | Actualizar mascota |
| DELETE | `/api/v1/mascotas/{id}` | Desactivar mascota (borrado lógico) |

### Citas

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/v1/citas` | Agendar cita | Dueño (sus mascotas) o personal |
| GET | `/api/v1/citas` | Listar todas las citas | Administrador / Recepcionista |
| GET | `/api/v1/citas/{id}` | Ver una cita | Según rol y pertenencia |
| GET | `/api/v1/citas/mascota/{id}` | Citas de una mascota | Según rol y pertenencia |
| GET | `/api/v1/citas/veterinario/{id}` | Citas de un veterinario | Personal o el mismo veterinario |
| PUT | `/api/v1/citas/{id}` | Reprogramar cita (pendiente/confirmada) | Personal o dueño |
| PATCH | `/api/v1/citas/{id}/estado` | Cambiar estado | Según transición y rol |
| PATCH | `/api/v1/citas/{id}/veterinario` | Asignar veterinario | Administrador / Recepcionista |
| DELETE | `/api/v1/citas/{id}` | Eliminar cita (pendiente o cancelada) | Administrador |

### Historial clínico

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/v1/historiales` | Registrar atención | Veterinario / Administrador |
| GET | `/api/v1/historiales/{id}` | Ver historial | Veterinario autor / Administrador |
| GET | `/api/v1/historiales/mascota/{id}` | Historial de una mascota | Veterinario / Administrador |
| GET | `/api/v1/historiales/veterinario/{id}` | Historiales de un veterinario | Veterinario / Administrador |
| GET | `/api/v1/historiales/cita/{id}` | Historial de una cita | Veterinario / Administrador |
| PUT | `/api/v1/historiales/{id}` | Editar historial | Veterinario autor / Administrador |
| DELETE | `/api/v1/historiales/{id}` | Eliminar historial | Administrador |

---

## 🔐 Seguridad

### Backend

- Autenticación con **JWT firmado (HS256)**, con vigencia de **30 minutos**.
- El token incluye el id del usuario (`sub`), el correo y los roles (`roles`).
- Las contraseñas se guardan con **hash** (nunca en texto plano).
- Cada microservicio valida el token con la misma clave (`JWT_SECRET`) y aplica reglas por rol (`@PreAuthorize` y validaciones en los servicios).
- `POST /api/v1/auth/refresh` entrega un token nuevo a quien presente uno válido y cuya cuenta siga activa.

### Frontend

- **Sesión:** el token y los datos del usuario se guardan en `sessionStorage`, por lo que la sesión **sobrevive a recargas de página** y se borra al cerrar la pestaña.
- **Expiración:** si el token vence, la sesión se cierra automáticamente. Antes de vencer se renueva con `/auth/refresh`.
- **Cliente HTTP central** (`src/services/http.js`): agrega `Authorization: Bearer <token>` a cada petición y cierra la sesión ante un `401`.
- **Rutas protegidas** (`RutaProtegida`): restringen pantallas según el rol. La autorización definitiva siempre la hace el backend.

### Roles

| Rol | Pantallas / acciones |
|---|---|
| **Administrador** | Todo: usuarios, citas, fichas e historial |
| **Recepcionista** | Gestión de citas y fichas |
| **Veterinario** | Citas asignadas, fichas e historial clínico |
| **Dueño de mascota** | Sus mascotas, agendar y cancelar sus citas |

| Ruta del frontend | Roles permitidos |
|---|---|
| `/`, `/contacto`, `/login`, `/registro` | Público |
| `/agendar` | Valida el rol dentro de la página |
| `/admin` (gestión de citas) | Administrador, Recepcionista, Veterinario |
| `/fichas` | Personal y Dueño de mascota |
| `/usuarios` | Solo Administrador |

### Usuarios de demostración

Se crean con `database/05_Datos Demo.sql`:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin.demo@sanmarcos.test | Admin2026! |
| Recepcionista | recepcion.demo@sanmarcos.test | Recepcion2026! |
| Veterinario | veterinario.demo@sanmarcos.test | Vet2026! |
| Veterinario | javiera.vet@sanmarcos.test | Vet2026! |
| Dueño | ana.duena@sanmarcos.test | Dueno2026! |
| Dueño | luis.dueno@sanmarcos.test | Dueno2026! |

> Son datos de prueba. No uses estas credenciales en un entorno real.

---

## 🧪 Pruebas

### Frontend

```bash
cd frontend
npm test
```

Verifica el login, la sesión, las rutas protegidas por rol y los componentes principales.

### Backend

Pruebas unitarias con JUnit 5 y Mockito (no requieren base de datos):

```bash
cd backend/usuarios-service  && ./mvnw test
cd backend/citas-service     && ./mvnw test
cd backend/historial-service && ./mvnw test
```

Cubren la lógica de negocio: autenticación y refresh de token, actualización y desactivación de usuarios, reglas de citas (horarios, estados, permisos) y permisos del historial clínico.

---

## 📁 Estructura del repositorio
