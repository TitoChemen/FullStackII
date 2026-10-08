import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { inicializarDatosDemo, getServicios } from '../services/apiService';
import { useCarrito } from '../hooks/useCarrito';

const formatoCLP = (n) => `$${n.toLocaleString('es-CL')}`;

export const Agendar = () => {
  const [servicios] = useState(() => {
    inicializarDatosDemo();
    return getServicios();
  });
  const [categoria, setCategoria] = useState('Todos');
  const [verCarrito, setVerCarrito] = useState(false);
  const [aviso, setAviso] = useState('');
  const { carrito, agregar, cambiarCantidad, eliminar, vaciar, cantidadTotal, total } = useCarrito();

  const categorias = ['Todos', ...new Set(servicios.map((s) => s.categoria))];
  const visibles = categoria === 'Todos' ? servicios : servicios.filter((s) => s.categoria === categoria);

  // El aviso desaparece solo a los 3 segundos
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  // Cerrar el carrito con Escape
  useEffect(() => {
    if (!verCarrito) return;
    const onKey = (e) => e.key === 'Escape' && setVerCarrito(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [verCarrito]);

  const handleAgregar = (servicio) => {
    agregar(servicio);
    setAviso(`¡"${servicio.nombre}" se agregó a tus citas!`);
  };

  return (
    <Layout>
      <div className="container my-5">
        <div className="text-center mb-4">
          <h1 className="display-6 fw-bold text-warning">Nuestros servicios médicos y estética</h1>
          <p className="lead">Elige el servicio que necesita tu mascota y agenda una hora.</p>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex gap-2 filtros-catalogo" role="group" aria-label="Filtrar por categoría">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                className={`btn btn-sm ${categoria === c ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                onClick={() => setCategoria(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-outline-warning position-relative" onClick={() => setVerCarrito(true)}>
            <i className="bi bi-calendar-check"></i> Mis citas
            <span className="badge rounded-pill bg-danger ms-2">{cantidadTotal}</span>
          </button>
        </div>

        <div className="row">
          {visibles.map((s) => (
            <div key={s.id} className="col-12 col-sm-6 col-lg-4 mb-4">
              <div className="card h-100 shadow">
                <img src={s.imagen} className="card-img-top" alt={s.nombre} style={{ height: 200, objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-warning text-dark align-self-start mb-2">{s.categoria}</span>
                  <h5 className="card-title text-warning fw-bold">{s.nombre}</h5>
                  <p className="card-text text-muted flex-grow-1">{s.descripcion}</p>
                  <p className="fw-bold fs-5 mb-0">{formatoCLP(s.precio)}</p>
                </div>
                <div className="card-footer bg-transparent border-top-0 d-grid">
                  <button type="button" className="btn btn-warning text-dark fw-bold" onClick={() => handleAgregar(s)}>
                    <i className="bi bi-calendar-plus"></i> Agendar hora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {aviso && (
        <div className="alert alert-success position-fixed bottom-0 end-0 m-3 shadow-lg d-flex align-items-center gap-2" role="status" style={{ zIndex: 2000 }}>
          <i className="bi bi-check-circle-fill"></i> {aviso}
        </div>
      )}

      {verCarrito && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="titulo-carrito" onClick={() => setVerCarrito(false)}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-warning" id="titulo-carrito">
                    <i className="bi bi-calendar-check"></i> Mis citas solicitadas
                  </h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={() => setVerCarrito(false)}></button>
                </div>
                <div className="modal-body">
                  {carrito.length === 0 ? (
                    <p className="text-center text-muted py-4 mb-0">Aún no has agregado servicios. Elige uno del catálogo para empezar.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th className="text-center">Cantidad</th>
                            <th>Subtotal</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {carrito.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <img src={item.imagen} alt="" width="40" height="40" className="me-2 rounded" style={{ objectFit: 'cover' }} />
                                {item.nombre}
                              </td>
                              <td>{formatoCLP(item.precio)}</td>
                              <td className="text-center text-nowrap">
                                <button type="button" className="btn btn-outline-warning btn-sm" aria-label={`Quitar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, -1)}>
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="mx-2">{item.cantidad}</span>
                                <button type="button" className="btn btn-outline-warning btn-sm" aria-label={`Agregar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, 1)}>
                                  <i className="bi bi-plus"></i>
                                </button>
                              </td>
                              <td>{formatoCLP(item.precio * item.cantidad)}</td>
                              <td>
                                <button type="button" className="btn btn-outline-danger btn-sm" aria-label={`Eliminar ${item.nombre}`} onClick={() => eliminar(item.id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="text-end fw-bold fs-5">Total: {formatoCLP(total)}</div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={vaciar} disabled={carrito.length === 0}>
                    Vaciar lista
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVerCarrito(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </Layout>
  );
};
