
-- =============================================
-- VETERINARIA SAN MARCOS - EV3
-- Configuración de usuarios para MariaDB/XAMPP
-- Ejecutar desde phpMyAdmin como administrador
-- =============================================

-- 1. Crear bases de datos
CREATE DATABASE IF NOT EXISTS veterinaria_usuarios
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS veterinaria_mascotas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS veterinaria_citas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS veterinaria_historial
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Crear usuarios de desarrollo
-- Las contraseñas deben configurarse localmente
-- y no deben publicarse en Git.

-- Ejemplo para ejecutar localmente:
-- CREATE USER IF NOT EXISTS 'vet_usuarios'@'localhost'
-- IDENTIFIED BY 'TU_CLAVE_LOCAL';

-- Repetir para:
-- vet_mascotas
-- vet_citas
-- vet_historial

-- 3. Permisos por base de datos
-- Ejecutar después de crear los usuarios.

-- GRANT ALL PRIVILEGES ON veterinaria_usuarios.*
-- TO 'vet_usuarios'@'localhost';

-- GRANT ALL PRIVILEGES ON veterinaria_mascotas.*
-- TO 'vet_mascotas'@'localhost';

-- GRANT ALL PRIVILEGES ON veterinaria_citas.*
-- TO 'vet_citas'@'localhost';

-- GRANT ALL PRIVILEGES ON veterinaria_historial.*
-- TO 'vet_historial'@'localhost';
