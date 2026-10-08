import React, { useState, useEffect } from 'react';
import { getDB, agregarProducto, eliminarProducto } from '../services/dbService';

export const AdminPanel = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    const db = getDB();
    setProductos(db.productos);
  }, []);

  const handleCrear = (e) => {
    e.preventDefault();
    const actualizados = agregarProducto({ nombre, precio: Number(precio), stock: 10 });
    setProductos([...actualizados]);
    setNombre('');
    setPrecio('');
  };

  const handleEliminar = (id) => {
    const actualizados = eliminarProducto(id);
    setProductos([...actualizados]);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary">Panel de Administración (CRUD Productos)</h2>
      
      {/* Formulario para agregar */}
      <form onSubmit={handleCrear} className="card p-3 mb-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Nombre del Producto</label>
          <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio</label>
          <input type="number" className="form-control" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-success">Guardar Producto</button>
      </form>

      {/* Tabla de productos */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>${p.precio}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};