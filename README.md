🐾 Veterinaria San Marcos — Portal Web & Sistema RBAC
Bienvenidos al repositorio oficial de Veterinaria San Marcos, ubicada en Rancagua, Chile.

Este proyecto consiste en la modernización de la plataforma web de la veterinaria mediante una Single Page Application (SPA) desarrollada con React y Vite. Incorpora una interfaz responsiva, navegación dinámica, gestión de usuarios y un sistema de control de acceso basado en roles (RBAC), además de pruebas unitarias para verificar el funcionamiento de los principales componentes y las restricciones de acceso.

📌 Características principales
⚛️ Arquitectura SPA: navegación fluida mediante React Router DOM.
🔐 Control de acceso RBAC: permisos diferenciados según el rol del usuario.
👥 Gestión de usuarios: administración de cuentas y roles autorizados.
📅 Gestión de citas: visualización y confirmación de citas pendientes.
🩺 Fichas clínicas: creación, consulta y registro de diagnósticos según los permisos.
📱 Diseño responsivo: interfaz adaptable a distintos tamaños de pantalla.
💾 Persistencia local: almacenamiento de datos y sesión mediante localStorage.
🧪 Pruebas automatizadas: suite de 10 pruebas unitarias con Vitest y React Testing Library.
🛠️ Integrantes y división del trabajo
Integrante	Responsabilidades
Kevin	Integración de la arquitectura React SPA, enrutamiento dinámico, centralización de estilos (estilos.css), implementación de RBAC, gestión del catálogo de servicios y citas, y configuración del entorno de pruebas.
Jaime	Maquetación de las vistas públicas (Home, Contacto), desarrollo de formularios responsivos y validaciones de interfaz.
Oscar	Desarrollo e integración del panel administrativo (Admin, Fichas, Usuarios), refactorización de la autenticación (Login, Registro) y persistencia de datos en localStorage.
🚀 Tecnologías utilizadas
Tecnología	Uso
React 19	Desarrollo de interfaces y componentes.
Vite	Servidor de desarrollo y herramientas de compilación.
React Router DOM 7	Enrutamiento y navegación entre vistas.
Bootstrap 5.3	Diseño y componentes responsivos.
Bootstrap Icons	Iconografía de la interfaz.
Vitest	Ejecución de pruebas unitarias.
React Testing Library	Pruebas de componentes e interacciones.
JSDOM	Simulación del entorno DOM para las pruebas.
JavaScript ES6+	Lógica de la aplicación y manejo de datos.
localStorage	Persistencia local de información y sesión.
📂 Estructura del proyecto
La aplicación se organiza de manera modular dentro de la carpeta frontend/.

frontend/
├── src/
│   ├── components/           # Componentes reutilizables
│   ├── pages/                # Vistas principales de la aplicación
│   │   ├── Home              # Página de inicio
│   │   ├── Contacto          # Información de contacto
│   │   ├── Admin             # Panel administrativo
│   │   ├── Fichas            # Gestión de fichas clínicas
│   │   ├── Usuarios          # Gestión de usuarios
│   │   ├── Login             # Inicio de sesión
│   │   └── Registro          # Registro de usuarios
│   ├── services/
│   │   └── apiService        # Servicios y persistencia local
│   ├── App.test.jsx          # Pruebas unitarias
│   ├── setupTests.js         # Configuración del entorno de pruebas
│   ├── App.css               # Estilos de la aplicación
│   ├── estilos.css            # Estilos centralizados
│   └── main.jsx              # Punto de entrada
├── vite.config.js            # Configuración de Vite y Vitest
└── package.json              # Dependencias y scripts
Nota: La estructura es referencial. Los nombres y las rutas exactas deben coincidir con los archivos existentes en el repositorio.

🔐 Sistema de control de acceso basado en roles (RBAC)
El sistema establece diferentes niveles de acceso según el rol asignado a cada usuario.

Permisos por rol
Funcionalidad	Administrador	Recepcionista	Veterinario
Gestión de citas	✅	✅	✅
Consulta y gestión de fichas clínicas	✅	✅	✅
Registro de diagnósticos	✅	Según permisos	✅
Gestión de usuarios	✅	❌	❌
👤 Credenciales de prueba
Las siguientes cuentas permiten probar los distintos niveles de acceso del portal interno.

Rol	Correo electrónico	Contraseña
Administrador	admin@sanmarcos.cl	Admin2026
Recepcionista	recepcion@sanmarcos.cl	Recepcion2026
Veterinario	veterinario@sanmarcos.cl	Vet2026a
Importante: Estas credenciales están destinadas exclusivamente al entorno de demostración. No utilices contraseñas reales ni publiques credenciales de producción en el repositorio. Si las cuentas siguen activas en un entorno accesible públicamente, reemplázalas por cuentas de prueba aisladas.

Consideración de seguridad: El uso de localStorage y de controles RBAC implementados únicamente en el frontend no constituye una protección suficiente para datos clínicos reales. En producción, los permisos deben validarse también en el backend y la información sensible debe protegerse adecuadamente.

🧪 Pruebas unitarias
El proyecto incorpora una suite de 10 pruebas unitarias desarrolladas con Vitest, React Testing Library y JSDOM.

Las pruebas están orientadas a verificar el renderizado de componentes, las interacciones con formularios y el cumplimiento de las restricciones de acceso por rol.

Casos de prueba
Renderizado de la tabla de citas en Admin.jsx.
Confirmación de citas pendientes.
Visualización de la sesión activa en el Navbar.
Renderizado del formulario de fichas clínicas.
Control de estados en los campos de los formularios.
Restricción de acceso a Usuarios.jsx para roles no autorizados.
Acceso permitido a Usuarios.jsx para el rol ADMINISTRADOR.
Renderizado correcto de las tablas de gestión.
Ocultamiento dinámico de elementos de navegación según el rol activo.
Renderizado del menú administrativo en distintos tamaños de pantalla.
Ejecutar las pruebas
Desde la carpeta frontend/, ejecuta el siguiente comando:

npm test
Este comando ejecuta las pruebas configuradas en el proyecto. La cobertura de código debe verificarse por separado si no existe un comando específico para generarla.

💻 Instalación y ejecución local
Requisitos previos
Node.js: una versión compatible con las dependencias del proyecto.
npm: incluido con Node.js.
Git: para clonar el repositorio.
1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
Reemplaza <URL_DEL_REPOSITORIO> por la URL real del repositorio de GitHub.

2. Ingresar a la carpeta del frontend
cd frontend
Si el frontend se encuentra dentro de otra carpeta, ingresa primero a la raíz del repositorio.

3. Instalar las dependencias
npm install
4. Iniciar el servidor de desarrollo
npm run dev
5. Abrir la aplicación
Vite mostrará en la consola la dirección local de la aplicación. Por defecto, suele ser:

http://localhost:5173

Abre esa dirección en tu navegador para comenzar a utilizar el portal.

📋 Scripts disponibles
Los comandos disponibles dependen de la configuración de package.json.

Comando	Descripción
npm install	Instala las dependencias del proyecto.
npm run dev	Inicia el servidor de desarrollo de Vite.
npm test	Ejecuta la suite de pruebas unitarias, si está configurado.
npm run build	Genera la versión de producción, si está configurado.
npm run preview	Permite previsualizar la compilación local, si está configurado.
🎯 Objetivo del proyecto
Desarrollar una plataforma web moderna, accesible y modular para Veterinaria San Marcos, facilitando la gestión de citas, fichas clínicas y usuarios mediante una interfaz responsiva y una administración de permisos diferenciada por roles.

El proyecto también busca reforzar las buenas prácticas de desarrollo frontend mediante la separación de componentes, la organización del código y la incorporación de pruebas automatizadas.

📄 Estado del proyecto
En desarrollo.

Las funcionalidades y los permisos descritos corresponden a la implementación del proyecto y deben validarse contra la versión actual del código fuente.

Desarrollado con ❤️ por el equipo de Veterinaria San Marcos — Rancagua, Chile. 🐾