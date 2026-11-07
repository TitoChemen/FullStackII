CREATE DATABASE IF NOT EXISTS veterinaria_usuarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria_usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
                                        id BIGINT NOT NULL AUTO_INCREMENT,
                                        nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('ADMINISTRADOR','RECEPCIONISTA','VETERINARIO','DUENO_MASCOTA') NOT NULL,
    activo BIT(1) NOT NULL DEFAULT b'1',
    fecha_creacion DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_correo (correo),
    KEY idx_usuarios_rol (rol)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
