// Utilidades compartidas

// Roles EXACTOS del backend
export const ROLES = {
  ADMIN: 'ADMINISTRADOR',
  RECEPCION: 'RECEPCIONISTA',
  VET: 'VETERINARIO',
  DUENO: 'DUENO_MASCOTA',
};

export const ETIQUETA_ROL = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  VETERINARIO: 'Veterinario',
  DUENO_MASCOTA: 'Dueño de mascota',
};

const dos = (n) => String(n).padStart(2, '0');

// Formato que espera Java (LocalDateTime): YYYY-MM-DDTHH:mm:ss, SIN zona horaria.
// (toISOString() agregaría una "Z" y cambiaría la hora, por eso no se usa.)
export const aFormatoJava = (fecha) =>
  `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}` +
  `T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;

export const fechaHoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

export const formatearFechaHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
};

export const formatearFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CL');
};