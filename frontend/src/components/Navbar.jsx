import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../context/AuthContext';
import { ETIQUETA_ROL, ROLES } from '../utils';

export const Navbar = () => {
  const [abierto, setAbierto] = useState(false);
  const { cantidadTotal } = useCarrito();
  const { autenticado, usuario, nombreCompleto, logout } = useAuth();
  const navigate = useNavigate();
  const destinoPortal = usuario?.rol === ROLES.DUENO ? '/fichas' : '/admin';

  const salir = () => {
    cerrar();
    logout();
    navigate('/');
  };

  const cerrar = () => setAbierto(false);
  const claseLink = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <header>
      <div className="top-bar py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-md-4 mb-3 mb-md-0">
              <h2 className="m-0 fw-bold">
                <i className="bi bi-shield-plus text-warning"></i> San Marcos
              </h2>
              <small className="text-muted">Centro Médico Veterinario</small>
            </div>
            <div className="col-12 col-md-4 mb-3 mb-md-0">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt-fill fs-3 text-warning"></i>
                <div>
                  <h6 className="m-0 fw-bold fs-6">Nuestra ubicación</h6>
                  <p className="m-0 text-muted small">Av. República de Chile, Rancagua</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-clock-fill fs-3 text-warning"></i>
                <div>
                  <h6 className="m-0 fw-bold fs-6">Horario</h6>
                  <p className="m-0 text-muted small">Lun - Sáb: 09:00 – 19:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand d-lg-none" to="/" onClick={cerrar}>
            <i className="bi bi-shield-plus"></i> San Marcos
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={abierto}
            onClick={() => setAbierto(!abierto)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse${abierto ? ' show' : ''}`}>
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className={claseLink} to="/" end onClick={cerrar}>
                  <i className="bi bi-house"></i> Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={claseLink} to="/agendar" onClick={cerrar}>
                  <i className="bi bi-calendar-check"></i> Agendar cita
                  {cantidadTotal > 0 && (
                    <span className="badge rounded-pill bg-danger ms-2">{cantidadTotal}</span>
                  )}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={claseLink} to="/contacto" onClick={cerrar}>
                  <i className="bi bi-envelope"></i> Contacto
                </NavLink>
              </li>
            </ul>
            <ul className="navbar-nav align-items-lg-center">
              {autenticado ? (
                <>
                  <li className="nav-item">
                    <NavLink className={claseLink} to={destinoPortal} onClick={cerrar}>
                      <i className="bi bi-person-circle"></i> {nombreCompleto}
                      <span className="badge bg-warning text-dark ms-2">{ETIQUETA_ROL[usuario.rol] || usuario.rol}</span>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button type="button" className="btn btn-outline-light btn-sm ms-lg-2 mt-2 mt-lg-0" onClick={salir}>
                      <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <NavLink className={claseLink} to="/login" onClick={cerrar}>
                    <i className="bi bi-person-circle"></i> Iniciar sesión
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};