const DB_KEY = 'tienda_fullstack_db';

// Datos iniciales por defecto (puedes adaptarlos a lo que tenían en la Eval 1)
const initialData = {
  productos: [
    { id: 1, nombre: "Producto de Prueba 1", precio: 10000, stock: 5, categoria: "General" }
  ],
  usuarios: [
    { id: 1, correo: "admin@duoc.cl", pass: "123", rol: "admin" }
  ],
  ordenes: []
};

export const getDB = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

export const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --- CRUD DE PRODUCTOS (Para el Admin y la Tienda) ---
export const agregarProducto = (nuevoProducto) => {
  const db = getDB();
  nuevoProducto.id = Date.now(); // ID único
  db.productos.push(nuevoProducto);
  saveDB(db);
  return db.productos;
};

export const eliminarProducto = (id) => {
  const db = getDB();
  db.productos = db.productos.filter(p => p.id !== id);
  saveDB(db);
  return db.productos;
};