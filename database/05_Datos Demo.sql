-- VETERINARIA SAN MARCOS | DATOS DEMO EV3
-- Ejecutar DESPUES de 00_setup.sql y los cuatro *_init.sql.
-- No borra ni modifica datos existentes. IDs demo reservados: 101-499.
-- INSERT IGNORE evita errores al volver a ejecutar este archivo.
-- Credenciales de ejemplo al final del archivo.
-- Nota: los IDs de distintos microservicios son referencias logicas, sin FK.

USE veterinaria_usuarios;
INSERT IGNORE INTO usuarios (id,nombre,apellido,correo,contrasena_hash,rol,activo,fecha_creacion) VALUES
(101,'Valentina','Rojas','admin.demo@sanmarcos.test','$2y$10$4RnhmrrPB83c0hylDFCSbOY8D.QhFtMn3KT3xQjFYKpNj.gsmBQuG','ADMINISTRADOR',b'1','2026-10-20 09:00:00.000000'),
(102,'Camila','Fuentes','recepcion.demo@sanmarcos.test','$2y$10$Ik9JnzRV5xceMufPuQ0sxezhAzoAvQ4Oa2Yyzh0ExZ3JN2xDgHpJi','RECEPCIONISTA',b'1','2026-10-20 09:00:00.000000'),
(103,'Daniel','Muñoz','veterinario.demo@sanmarcos.test','$2y$10$MEyiVu3g13NbrLkXydQz9u82JPYR8R4QJVbv.XAwLXEy9LyyKoDV2','VETERINARIO',b'1','2026-10-20 09:00:00.000000'),
(104,'Javiera','Pérez','javiera.vet@sanmarcos.test','$2y$10$Sn.H/eMSC0Pby1W3wB.QoeB24bLvCRxC4.TGr74uoSyRRF7ZPcAZS','VETERINARIO',b'1','2026-10-20 09:00:00.000000'),
(105,'Ana','Rojas','ana.duena@sanmarcos.test','$2y$10$FQ8Px0XZHlHIqUBe/C9woOkSnanWbRHyn7/0gURMrmU9gFwrdP2NC','DUENO_MASCOTA',b'1','2026-10-20 09:00:00.000000'),
(106,'Luis','Silva','luis.dueno@sanmarcos.test','$2y$10$WrqHFtpUB1rfSCV2tEtc6uYjgzJ7apPHlZ3OPUJoiChrCqLhaDbKi','DUENO_MASCOTA',b'1','2026-10-20 09:00:00.000000');

USE veterinaria_mascotas;
INSERT IGNORE INTO mascotas (id,nombre,especie,raza,sexo,fecha_nacimiento,dueno_id,activo,fecha_registro) VALUES
(201,'Pelusa','GATO','Mestizo','HEMBRA','2021-04-12',105,b'1','2026-10-21 10:00:00'),
(202,'Toby','PERRO','Poodle','MACHO','2020-09-03',106,b'1','2026-10-21 10:05:00'),
(203,'Milo','GATO','Siamés','MACHO','2023-01-15',105,b'1','2026-10-21 10:10:00'),
(204,'Kira','PERRO','Border Collie','HEMBRA','2022-07-19',106,b'1','2026-10-21 10:15:00'),
(205,'Copito','CONEJO','Enano','MACHO','2024-02-10',105,b'1','2026-10-21 10:20:00'),
(206,'Nala','PERRO','Mestiza','HEMBRA','2023-08-25',106,b'1','2026-10-21 10:25:00');

USE veterinaria_citas;
INSERT IGNORE INTO citas (id,mascota_id,veterinario_id,fecha_hora_inicio,fecha_hora_fin,motivo,estado,observaciones,fecha_creacion) VALUES
(301,201,103,'2026-10-22 09:00:00','2026-10-22 09:30:00','Vacunación antirrábica','COMPLETADA','Vacuna aplicada sin complicaciones','2026-10-21 12:00:00'),
(302,202,104,'2026-10-23 10:00:00','2026-10-23 10:30:00','Control dermatológico','COMPLETADA','Irritación leve en piel','2026-10-21 12:05:00'),
(303,203,103,'2026-10-24 11:00:00','2026-10-24 11:30:00','Chequeo general','COMPLETADA','Paciente estable','2026-10-21 12:10:00'),
(304,204,104,'2026-10-26 12:00:00','2026-10-26 12:30:00','Control de peso','COMPLETADA','Revisar alimentación','2026-10-21 12:15:00'),
(305,205,103,'2026-11-12 09:00:00','2026-11-12 09:30:00','Chequeo preventivo','CONFIRMADA','Llevar carnet de controles','2026-11-05 09:00:00'),
(306,206,104,'2026-11-13 15:00:00','2026-11-13 15:30:00','Vacunación anual','PENDIENTE','Pendiente de confirmación','2026-11-05 09:05:00'),
(307,201,103,'2026-11-14 10:00:00','2026-11-14 10:30:00','Control post vacunación','CONFIRMADA','Revisión de seguimiento','2026-11-05 09:10:00'),
(308,202,104,'2026-11-15 11:00:00','2026-11-15 11:30:00','Control dermatológico','CANCELADA','Cancelada a solicitud del propietario','2026-11-05 09:15:00');

USE veterinaria_historial;
INSERT IGNORE INTO historiales_clinicos (id,mascota_id,cita_id,veterinario_id,fecha_atencion,motivo_consulta,diagnostico,tratamiento,indicaciones,observaciones,fecha_creacion) VALUES
(401,201,301,103,'2026-10-22 09:20:00','Vacunación antirrábica','Paciente clínicamente sano','Aplicación de vacuna antirrábica','Observar durante las próximas 24 horas','Sin reacciones inmediatas','2026-10-22 09:25:00'),
(402,202,302,104,'2026-10-23 10:20:00','Control dermatológico','Dermatitis leve','Champú dermatológico de uso veterinario','Evitar productos irritantes y asistir a control','Evolución favorable','2026-10-23 10:25:00'),
(403,203,303,103,'2026-10-24 11:20:00','Chequeo general','Sin hallazgos patológicos relevantes','No requiere medicación','Mantener calendario de vacunación','Buen estado general','2026-10-24 11:25:00'),
(404,204,304,104,'2026-10-26 12:20:00','Control de peso','Sobrepeso leve','Plan de alimentación y ejercicio','Controlar raciones y actividad diaria','Reevaluar en cuatro semanas','2026-10-26 12:25:00');

-- CUENTAS DEMO (para entorno de desarrollo únicamente)
-- admin.demo@sanmarcos.test / Admin2026!
-- recepcion.demo@sanmarcos.test / Recepcion2026!
-- veterinario.demo@sanmarcos.test / Vet2026!
-- javiera.vet@sanmarcos.test / Vet2026!
-- ana.duena@sanmarcos.test / Dueno2026!
-- luis.dueno@sanmarcos.test / Dueno2026!

-- Verificacion rápida
SELECT COUNT(*) AS usuarios_demo FROM veterinaria_usuarios.usuarios WHERE id BETWEEN 101 AND 106;
SELECT COUNT(*) AS mascotas_demo FROM veterinaria_mascotas.mascotas WHERE id BETWEEN 201 AND 206;
SELECT COUNT(*) AS citas_demo FROM veterinaria_citas.citas WHERE id BETWEEN 301 AND 308;
SELECT COUNT(*) AS historiales_demo FROM veterinaria_historial.historiales_clinicos WHERE id BETWEEN 401 AND 404;
