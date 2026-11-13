// Funciones de acceso a los microservicios (a través del API Gateway).
// No hay datos simulados ni localStorage aquí.
import { request } from './http';

const V1 = '/api/v1';

// ---------- Autenticación y usuarios ----------
export const login = (correo, contrasena) =>
  request(`${V1}/auth/login`, { method: 'POST', body: { correo, contrasena }, auth: false });

export const registrar = ({ nombre, apellido, correo, contrasena }) =>
  request(`${V1}/auth/registro`, {
    method: 'POST',
    body: { nombre, apellido, correo, contrasena },
    auth: false,
  });

export const miPerfil = () => request(`${V1}/usuarios/me`);
export const listarUsuarios = () => request(`${V1}/usuarios`); // solo ADMINISTRADOR

// ---------- Mascotas ----------
export const listarMascotas = () => request(`${V1}/mascotas`); // personal
export const listarMisMascotas = () => request(`${V1}/mascotas/mias`); // dueño
export const crearMascota = (datos) => request(`${V1}/mascotas`, { method: 'POST', body: datos });
export const actualizarMascota = (id, datos) =>
  request(`${V1}/mascotas/${id}`, { method: 'PUT', body: datos });
export const desactivarMascota = (id) => request(`${V1}/mascotas/${id}`, { method: 'DELETE' });

// ---------- Citas ----------
export const crearCita = (datos) => request(`${V1}/citas`, { method: 'POST', body: datos });
export const citasPorMascota = (mascotaId) => request(`${V1}/citas/mascota/${mascotaId}`);
export const citasPorVeterinario = (vetId) => request(`${V1}/citas/veterinario/${vetId}`);
export const cambiarEstadoCita = (id, estado) =>
  request(`${V1}/citas/${id}/estado`, { method: 'PATCH', body: { estado } });
export const asignarVeterinario = (id, veterinarioId) =>
  request(`${V1}/citas/${id}/veterinario`, { method: 'PATCH', body: { veterinarioId } });

// ---------- Historial clínico (solo ADMINISTRADOR y VETERINARIO) ----------
export const crearHistorial = (datos) => request(`${V1}/historiales`, { method: 'POST', body: datos });
export const historialesPorMascota = (mascotaId) => request(`${V1}/historiales/mascota/${mascotaId}`);

export default {
  login,
  registrar,
  miPerfil,
  listarUsuarios,
  listarMascotas,
  listarMisMascotas,
  crearMascota,
  actualizarMascota,
  desactivarMascota,
  crearCita,
  citasPorMascota,
  citasPorVeterinario,
  cambiarEstadoCita,
  asignarVeterinario,
  crearHistorial,
  historialesPorMascota,
};