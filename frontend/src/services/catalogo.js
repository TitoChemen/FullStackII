// Catálogo de servicios (contenido informativo de la clínica) y lista de servicios
// que el visitante va eligiendo antes de agendar. NO es información de negocio:
// las citas, mascotas, usuarios e historiales viven en los microservicios.
const CLAVE_CARRITO = 'sanmarcos_carrito';

const SERVICIOS = [
  { id: 1, nombre: "Consulta Médica General", descripcion: "Evaluación física completa de la mascota, diagnóstico inicial.", precio: 25000, categoria: "Atención Básica", imagen: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=500&q=80" },
  { id: 2, nombre: "Programa de Vacunación", descripcion: "Aplicación de vacunas óctuple, quíntuple y antirrábica.", precio: 18000, categoria: "Preventiva", imagen: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80" },
  { id: 3, nombre: "Cirugía Menor y Esterilización", descripcion: "Procedimientos quirúrgicos ambulatorios con anestesia.", precio: 55000, categoria: "Quirúrgica", imagen: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80" },
  { id: 4, nombre: "Desparasitación Interna y Externa", descripcion: "Tratamiento profiláctico contra parásitos y pulgas.", precio: 12000, categoria: "Preventiva", imagen: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80" },
  { id: 5, nombre: "Peluquería y Estética Canina", descripcion: "Baño sanitizante, corte de pelo y limpieza de oídos.", precio: 18000, categoria: "Atención Básica", imagen: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80" }
];

export const getServicios = () => SERVICIOS;

export const getCarrito = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
  } catch {
    return [];
  }
};

export const saveCarrito = (carrito) =>
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));