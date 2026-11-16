import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ETIQUETA_ROL, ROLES } from '../utils';

// Barra de navegación del portal interno (Citas / Fichas / Usuarios).
// Muestra las opciones según el rol de la sesión real y permite cerrar sesión.
export default function BarraInterna({ activa }) {
  const { usuario, nombreCompleto, logout } = useAuth();
  const navigate = useNavigate();

  const esPersonal = [ROLES.ADMIN, ROLES.RECEPCION, ROLES.VET].includes(usuario?.rol);
  const esDueno = usuario?.rol === ROLES.DUENO;

  const salir = () => {
    logout();
    navigate('/login');
  };

  const clase = (nombre) => `nav-link${activa === nombre ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-md sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-1" to={esDueno ? '/fichas' : '/admin'}>
          <i className="bi bi-paw-fill text-warning me-1"></i> Veterinaria San Marcos
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navPrincipal"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navPrincipal">
          <ul className="navbar-nav me-auto mt-2 mt-md-0">
            {esPersonal && (
              <>
                <li className="nav-item">
                  <Link className={clase('citas')} to="/admin">
                    <i className="bi bi-calendar-check me-1"></i> Citas
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={clase('fichas')} to="/fichas">
                    <i className="bi bi-journal-medical me-1"></i> Fichas clínicas
                  </Link>
                </li>
              </>
            )}
            {esDueno && (
              <>
                <li className="nav-item">
                  <Link className={clase('fichas')} to="/fichas">
                    <i className="bi bi-journal-medical me-1"></i> Mis mascotas
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={clase('agendar')} to="/agendar">
                    <i className="bi bi-calendar-plus me-1"></i> Agendar cita
                  </Link>
                </li>
              </>
            )}
            {usuario?.rol === ROLES.ADMIN && (
              <li className="nav-item solo-administrador">
                <Link className={clase('usuarios')} to="/usuarios">
                  <i className="bi bi-people me-1"></i> Usuarios
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <span className="chip-rol">
              <span id="nombreUsuarioActivo">{nombreCompleto || 'Invitado'}</span> ·
              <span id="chipRolActivo" className="ms-1">{usuario ? ETIQUETA_ROL[usuario.rol] || usuario.rol : 'SIN ROL'}</span>
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={salir}>
              <i className="bi bi-box-arrow-right me-1"></i> Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}