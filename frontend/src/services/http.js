// Cliente HTTP central. Todas las llamadas al backend pasan por aquí.
// - Agrega Authorization: Bearer <token> cuando hay sesión.
// - Convierte los errores del backend en ApiError con un mensaje legible.
// - Ante un 401 (token vencido o inválido) avisa para cerrar la sesión.

export class ApiError extends Error {
  constructor(status, message, detalles = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

let obtenerToken = () => null;
let alNoAutorizado = () => {};

// Lo configura el AuthContext al iniciar.
export const configurarHttp = ({ getToken, onUnauthorized }) => {
  obtenerToken = getToken || (() => null);
  alNoAutorizado = onUnauthorized || (() => {});
};

const MENSAJES_POR_ESTADO = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con datos existentes.',
};

const extraerMensaje = (estado, datos) => {
  let mensaje =
    (datos && (datos.message || datos.mensaje || datos.error || datos.detail)) ||
    MENSAJES_POR_ESTADO[estado] ||
    `Error inesperado del servidor (HTTP ${estado}).`;

  const detalles = datos && (datos.detalles || datos.errores || datos.errors);
  if (detalles && typeof detalles === 'object' && !Array.isArray(detalles)) {
    const lista = Object.entries(detalles).map(([campo, msg]) => `${campo}: ${msg}`);
    if (lista.length) mensaje += ` (${lista.join('; ')})`;
  }
  return mensaje;
};

export async function request(ruta, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? obtenerToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(ruta, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica que el API Gateway esté en ejecución.');
  }

  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    // 401 con token enviado = sesión vencida. (Un 401 del login es "credenciales inválidas".)
    if (respuesta.status === 401 && token) alNoAutorizado();
    throw new ApiError(respuesta.status, extraerMensaje(respuesta.status, datos), datos?.detalles || null);
  }

  return datos;
}