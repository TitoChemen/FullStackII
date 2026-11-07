-- Veterinaria San Marcos | citas-service | MariaDB 10.4+ / MySQL 8
-- mascota_id y veterinario_id se validan por API, no con FK entre bases.
CREATE DATABASE IF NOT EXISTS veterinaria_citas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria_citas;

CREATE TABLE IF NOT EXISTS citas (
                                     id BIGINT NOT NULL AUTO_INCREMENT,
                                     mascota_id BIGINT NOT NULL,
                                     veterinario_id BIGINT NULL,
                                     fecha_hora_inicio DATETIME(6) NOT NULL,
    fecha_hora_fin DATETIME(6) NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    estado ENUM('PENDIENTE','CONFIRMADA','EN_CURSO','COMPLETADA','CANCELADA','NO_ASISTIO') NOT NULL DEFAULT 'PENDIENTE',
    observaciones VARCHAR(1000) NULL,
    fecha_creacion DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_citas_mascota_inicio (mascota_id, fecha_hora_inicio),
    KEY idx_citas_veterinario_inicio (veterinario_id, fecha_hora_inicio)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
