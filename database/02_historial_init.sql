-- Veterinaria San Marcos | historial-service | esquema inicial propuesto
-- Se revisara con las entidades JPA antes de implementar el microservicio.
-- mascota_id, cita_id y veterinario_id son referencias logicas a otros servicios.
CREATE DATABASE IF NOT EXISTS veterinaria_historial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria_historial;

CREATE TABLE IF NOT EXISTS historiales_clinicos (
                                                    id BIGINT NOT NULL AUTO_INCREMENT,
                                                    mascota_id BIGINT NOT NULL,
                                                    cita_id BIGINT NULL,
                                                    veterinario_id BIGINT NOT NULL,
                                                    fecha_atencion DATETIME(6) NOT NULL,
    motivo_consulta VARCHAR(500) NOT NULL,
    diagnostico TEXT NULL,
    tratamiento TEXT NULL,
    indicaciones TEXT NULL,
    observaciones TEXT NULL,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_historial_cita (cita_id),
    KEY idx_historial_mascota_fecha (mascota_id, fecha_atencion),
    KEY idx_historial_veterinario (veterinario_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
