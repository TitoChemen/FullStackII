import React, { useState, useEffect } from 'react';
import { getServicios, getCarrito, saveCarrito } from '../services/apiService';

export const ListaServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [notif, setNotif] = useState('');

  useEffect(() => {
    setServicios(getServicios());
  }, []);

  const agregarAlCarrito = (servicio) => {
    let carrito = getCarrito();
    const existe = carrito.find(item => item.id === servicio.id);
    
    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push({ ...servicio, cantidad: 1 });
    }
    
    saveCarrito(carrito);
    setNotif(`¡"${servicio.nombre}" se agregó a tus citas!`);
    setTimeout(() => setNotif(''), 3000);
  };

  return (
    <div className="container mt-4">
      {notif && <div className="alert alert-success position-fixed bottom-0 end-0 m-3 shadow">{notif}</div>}
      <h2 className="mb-4 fw-bold text-primary">Servicios de la Veterinaria</h2>
      <div className="row">
        {servicios.map(servicio => (
          <div key={servicio.id} className="col-12 col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img src={servicio.imagen} className="card-img-top object-fit-cover" height="180" alt={servicio.nombre} />
              <div className="card-body d-flex flex-column">
                <span className="badge bg-warning text-dark w-auto mb-2">{servicio.categoria}</span>
                <h5 className="card-title fw-bold">{servicio.nombre}</h5>
                <p className="card-text small text-muted">{servicio.descripcion}</p>
                <div className="mt-auto">
                  <span className="fw-bold fs-5 text-dark">${servicio.precio.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 d-grid">
                <button onClick={() => agregarAlCarrito(servicio)} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-calendar-plus"></i> Agendar Cita
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};