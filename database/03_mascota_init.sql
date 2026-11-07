-- Veterinaria San Marcos | mascotas-service | MariaDB 10.4+ / MySQL 8
-- dueno_id apunta al servicio Usuarios: sin FK entre microservicios.
CREATE DATABASE IF NOT EXISTS veterinaria_mascotas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria_mascotas;

CREATE TABLE IF NOT EXISTS mascotas (
                                        id BIGINT NOT NULL AUTO_INCREMENT,
                                        nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100) NULL,
    sexo VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NULL,
    dueno_id BIGINT NOT NULL,
    activo BIT(1) NOT NULL DEFAULT b'1',
    fecha_registro DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_mascotas_dueno (dueno_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
