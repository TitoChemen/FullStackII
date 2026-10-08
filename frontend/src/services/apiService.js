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
};

export const getServicios = () => JSON.parse(localStorage.getItem(CLAVES.SERVICIOS)) || [];
export const getCarrito = () => JSON.parse(localStorage.getItem(CLAVES.CARRITO)) || [];
export const saveCarrito = (carrito) => localStorage.setItem(CLAVES.CARRITO, JSON.stringify(carrito));