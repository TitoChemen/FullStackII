const CLAVES = {
  USUARIOS: 'sanmarcos_usuarios',
  SESION: 'sanmarcos_sesion',
  CITAS: 'sanmarcos_citas',
  PACIENTES: 'sanmarcos_pacientes',
  CARRITO: 'sanmarcos_carrito',
  SERVICIOS: 'sanmarcos_servicios'
};

// Datos iniciales (basados en tus archivos viejos)
export const inicializarDatosDemo = () => {
  if (!localStorage.getItem(CLAVES.SERVICIOS)) {
    localStorage.setItem(CLAVES.SERVICIOS, JSON.stringify([
      { id: 1, nombre: "Consulta Médica General", descripcion: "Evaluación física completa de la mascota, diagnóstico inicial.", precio: 25000, categoria: "Atención Básica", imagen: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=500&q=80" },
      { id: 2, nombre: "Programa de Vacunación", descripcion: "Aplicación de vacunas óctuple, quíntuple y antirrábica.", precio: 18000, categoria: "Preventiva", imagen: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80" },
      { id: 3, nombre: "Cirugía Menor y Esterilización", descripcion: "Procedimientos quirúrgicos ambulatorios con anestesia.", precio: 55000, categoria: "Quirúrgica", imagen: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80" },
      { id: 4, nombre: "Desparasitación Interna y Externa", descripcion: "Tratamiento profiláctico contra parásitos y pulgas.", precio: 12000, categoria: "Preventiva", imagen: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80" },
      { id: 5, nombre: "Peluquería y Estética Canina", descripcion: "Baño sanitizante, corte de pelo y limpieza de oídos.", precio: 18000, categoria: "Atención Básica", imagen: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80" }
    ]));
  }

  if (!localStorage.getItem(CLAVES.USUARIOS)) {
    localStorage.setItem(CLAVES.USUARIOS, JSON.stringify([
      { id: 1, nombre: 'Constanza Rivas', rut: '11111111-1', email: 'admin@sanmarcos.cl', rol: 'ADMINISTRADOR', password: 'Admin2026', activo: true },
      { id: 2, nombre: 'Pablo Herrera', rut: '22222222-2', email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA', password: 'Recepcion2026', activo: true },
      { id: 3, nombre: 'Dra. Javiera Muñoz', rut: '33333333-3', email: 'veterinario@sanmarcos.cl', rol: 'VETERINARIO', password: 'Vet2026a', activo: true }
    ]));
  }
  repararCuentasDemo();
};

// Repara cuentas demo que pudieron quedar guardadas sin contraseña
const PASS_DEMO = {
  'admin@sanmarcos.cl': 'Admin2026',
  'recepcion@sanmarcos.cl': 'Recepcion2026',
  'veterinario@sanmarcos.cl': 'Vet2026a'
};
const repararCuentasDemo = () => {
  const usuarios = JSON.parse(localStorage.getItem(CLAVES.USUARIOS)) || [];
  let cambio = false;
  usuarios.forEach(u => {
    if (!u.password && PASS_DEMO[u.email]) { u.password = PASS_DEMO[u.email]; cambio = true; }
  });
  if (cambio) localStorage.setItem(CLAVES.USUARIOS, JSON.stringify(usuarios));
};

export const getServicios = () => JSON.parse(localStorage.getItem(CLAVES.SERVICIOS)) || [];
export const getCarrito = () => JSON.parse(localStorage.getItem(CLAVES.CARRITO)) || [];
export const saveCarrito = (carrito) => localStorage.setItem(CLAVES.CARRITO, JSON.stringify(carrito));

// ==========================================
// MANEJO DE SESIÓN Y SEGURIDAD (RBAC)
// ==========================================
export const getUsuarioLogueado = () => {
  return JSON.parse(localStorage.getItem(CLAVES.SESION)) || null;
};

export const iniciarSesion = (usuario) => {
  localStorage.setItem(CLAVES.SESION, JSON.stringify(usuario));
};

export const cerrarSesion = () => {
  localStorage.removeItem(CLAVES.SESION);
};

// ==========================================
// REGISTRO Y LOGIN (usuarios guardados)
// ==========================================
export const registrarUsuario = ({ nombre, rut, email, rol, password }) => {
  const usuarios = getUsuarios();
  const emailNorm = email.trim().toLowerCase();

  if (usuarios.some(u => (u.email || '').toLowerCase() === emailNorm)) {
    return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
  }

  const nuevo = { id: Date.now(), nombre: nombre.trim(), rut: rut.trim(), email: emailNorm, rol, password, activo: true };
  usuarios.push(nuevo);
  localStorage.setItem(CLAVES.USUARIOS, JSON.stringify(usuarios));
  return { ok: true, usuario: nuevo };
};

export const autenticarUsuario = (email, password) => {
  const emailNorm = email.trim().toLowerCase();
  const usuario = getUsuarios().find(u => (u.email || '').toLowerCase() === emailNorm);

  if (!usuario || usuario.password !== password) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }
  if (usuario.activo === false) {
    return { ok: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' };
  }

  // La sesión no guarda la contraseña
  const sesion = { ...usuario };
  delete sesion.password;
  return { ok: true, usuario: sesion };
};

// ==========================================
// CRUD: GESTIÓN DE USUARIOS (Para Usuarios.jsx)
// ==========================================
export const getUsuarios = () => {
  return JSON.parse(localStorage.getItem(CLAVES.USUARIOS)) || [];
};

export const actualizarRolUsuario = (idUsuario, nuevoRol) => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.id === idUsuario);
  
  if (index !== -1) {
    usuarios[index].rol = nuevoRol;
    localStorage.setItem(CLAVES.USUARIOS, JSON.stringify(usuarios));
    return true;
  }
  return false;
};

// ==========================================
// CRUD: GESTIÓN DE CITAS (Para Admin.jsx)
// ==========================================
export const getCitas = () => {
  return JSON.parse(localStorage.getItem(CLAVES.CITAS)) || [];
};

export const confirmarCita = (idCita) => {
  const citas = getCitas();
  const index = citas.findIndex(c => c.id === idCita);
  
  if (index !== -1) {
    citas[index].estado = 'CONFIRMADA'; // Cambia el estado
    localStorage.setItem(CLAVES.CITAS, JSON.stringify(citas));
    return true;
  }
  return false;
};

// ==========================================
// CRUD: FICHAS CLÍNICAS (Para Fichas.jsx)
// ==========================================
export const getPacientes = () => {
  return JSON.parse(localStorage.getItem(CLAVES.PACIENTES)) || [];
};

export const guardarFicha = (nuevaFicha) => {
  const pacientes = getPacientes();
  // Agregamos un ID único simulado con la fecha
  const fichaConId = { ...nuevaFicha, id: Date.now(), historial: [] }; 
  pacientes.push(fichaConId);
  localStorage.setItem(CLAVES.PACIENTES, JSON.stringify(pacientes));
  return fichaConId;
};

export const registrarDiagnostico = (idPaciente, nuevoDiagnostico) => {
  const pacientes = getPacientes();
  const index = pacientes.findIndex(p => p.id === idPaciente);
  
  if (index !== -1) {
    // Si no tiene historial previo, lo creamos vacío y pusheamos
    if (!pacientes[index].historial) pacientes[index].historial = [];
    pacientes[index].historial.push({
      fecha: new Date().toISOString().split('T')[0],
      detalle: nuevoDiagnostico
    });
    
    localStorage.setItem(CLAVES.PACIENTES, JSON.stringify(pacientes));
    return true;
  }
  return false;
};

// Edita los datos de una ficha (nombre, especie, raza, dueño) sin tocar su historial
export const actualizarFicha = (idPaciente, datosNuevos) => {
  const pacientes = getPacientes();
  const index = pacientes.findIndex(p => p.id === idPaciente);

  if (index !== -1) {
    pacientes[index] = { ...pacientes[index], ...datosNuevos, id: pacientes[index].id };
    localStorage.setItem(CLAVES.PACIENTES, JSON.stringify(pacientes));
    return true;
  }
  return false;
};

// Elimina una ficha completa
export const eliminarFicha = (idPaciente) => {
  const pacientes = getPacientes();
  const restantes = pacientes.filter(p => p.id !== idPaciente);

  if (restantes.length !== pacientes.length) {
    localStorage.setItem(CLAVES.PACIENTES, JSON.stringify(restantes));
    return true;
  }
  return false;
};

// Mascotas que pertenecen a un dueño (según su usuario)
export const getMascotasPorDueno = (duenoId) => {
  return getPacientes().filter(p => p.duenoId === duenoId);
};

// Crea una cita nueva (queda PENDIENTE hasta que el personal la confirme)
export const crearCita = (cita) => {
  const citas = getCitas();
  const nueva = { ...cita, id: Date.now() + Math.floor(Math.random() * 1000), estado: 'PENDIENTE' };
  citas.push(nueva);
  localStorage.setItem(CLAVES.CITAS, JSON.stringify(citas));
  return nueva;
};

// Puedes exportar todo como un objeto por defecto al final si prefieres importarlo más limpio:
export default {
  inicializarDatosDemo,
  getServicios,
  getCarrito,
  saveCarrito,
  getUsuarioLogueado,
  iniciarSesion,
  cerrarSesion,
  getUsuarios,
  actualizarRolUsuario,
  getCitas,
  confirmarCita,
  getPacientes,
  guardarFicha,
  registrarDiagnostico,
  actualizarFicha,
  eliminarFicha,
  registrarUsuario,
  autenticarUsuario,
  getMascotasPorDueno,
  crearCita
};