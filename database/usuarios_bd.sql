-- VETERINARIA SAN MARCOS | Cuentas de conexión a MariaDB
-- Ejecutar UNA vez como root (phpMyAdmin → SQL). Reemplaza CAMBIAR_CLAVE.
-- La clave debe coincidir con la de tu .env (y con application.yml si usas el paso 3 anterior).

CREATE USER IF NOT EXISTS 'vet_usuarios'@'localhost'  IDENTIFIED BY 'CAMBIAR_CLAVE';
CREATE USER IF NOT EXISTS 'vet_mascotas'@'localhost'  IDENTIFIED BY 'CAMBIAR_CLAVE';
CREATE USER IF NOT EXISTS 'vet_citas'@'localhost'     IDENTIFIED BY 'CAMBIAR_CLAVE';
CREATE USER IF NOT EXISTS 'vet_historial'@'localhost' IDENTIFIED BY 'CAMBIAR_CLAVE';

GRANT ALL PRIVILEGES ON veterinaria_usuarios.*  TO 'vet_usuarios'@'localhost';
GRANT ALL PRIVILEGES ON veterinaria_mascotas.*  TO 'vet_mascotas'@'localhost';
GRANT ALL PRIVILEGES ON veterinaria_citas.*     TO 'vet_citas'@'localhost';
GRANT ALL PRIVILEGES ON veterinaria_historial.* TO 'vet_historial'@'localhost';

FLUSH PRIVILEGES;