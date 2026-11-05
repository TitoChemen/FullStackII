import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const CITAS_DEMO = [
  { id: 1, dueño: 'Carlos Pérez', mascota: 'Firulais', fecha: '2026-10-15', hora: '10:30', motivo: 'Vacunación', estado: 'PENDIENTE' },
  { id: 2, dueño: 'María Gómez', mascota: 'Michi', fecha: '2026-10-16', hora: '15:00', motivo: 'Consulta General', estado: 'PENDIENTE' },
  { id: 3, dueño: 'Juan Silva', mascota: 'Rocky', fecha: '2026-10-18', hora: '11:00', motivo: 'Control Post-Operatorio', estado: 'CONFIRMADA' }
];

export default function Admin() {
  const [listaCitas, setListaCitas] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. CARGAR SESIÓN DE USUARIO
    const sesionGuardada = JSON.parse(localStorage.getItem('usuario_logueado') || 'null');
    const usuario = sesionGuardada || (apiService?.getUsuarioLogueado ? apiService.getUsuarioLogueado() : null);

    setUsuarioActivo(usuario);

    // 2. PROTECCIÓN DE RUTA (Solo Admin, Recepcionista y Veterinario)
    const rolesPermitidos = ['ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'];
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      alert("Acceso denegado. Inicia sesión con un usuario autorizado.");
      navigate('/login');
      return;
    }

    // 3. CARGAR CITAS
    let datosCitas = apiService?.getCitas ? apiService.getCitas() : null;

    if (!datosCitas || datosCitas.length === 0) {
      const guardadas = JSON.parse(localStorage.getItem('sanmarcos_citas') || '[]');
      if (guardadas.length > 0) {
        datosCitas = guardadas;
      } else {
        localStorage.setItem('sanmarcos_citas', JSON.stringify(CITAS_DEMO));
        datosCitas = CITAS_DEMO;
      }
    }

    setListaCitas(datosCitas);
  }, [navigate]);

  // 4. CONFIRMAR CITA
  const handleConfirmar = (idCita) => {
    const actualizadas = listaCitas.map(cita => 
      cita.id === idCita ? { ...cita, estado: 'CONFIRMADA' } : cita
    );
    setListaCitas(actualizadas);
    localStorage.setItem('sanmarcos_citas', JSON.stringify(actualizadas));

    if (apiService?.confirmarCita) {
      apiService.confirmarCita(idCita);
    }
  };

  // 5. CERRAR SESIÓN
  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_logueado');
    navigate('/login');
  };

  return (
    <>
      {/* ===== NAVBAR RESPONSIVE CON RBAC ===== */}
      <nav className="navbar navbar-expand-md sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-1" to="/admin">
            <i className="bi bi-paw-fill text-warning me-1"></i> Veterinaria San Marcos
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navPrincipal">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navPrincipal">
            <ul className="navbar-nav me-auto mt-2 mt-md-0">
              {/* Citas: Admin, Recepcionista y Veterinario */}
              {(usuarioActivo?.rol === 'ADMINISTRADOR' || usuarioActivo?.rol === 'RECEPCIONISTA' || usuarioActivo?.rol === 'VETERINARIO') && (
                <li className="nav-item">
                  <Link className="nav-link active" to="/admin">
                    <i className="bi bi-calendar-check me-1"></i> Citas
                  </Link>
                </li>
              )}

              {/* Fichas Clínicas: Admin, Recepcionista y Veterinario */}
              {(usuarioActivo?.rol === 'ADMINISTRADOR' || usuarioActivo?.rol === 'RECEPCIONISTA' || usuarioActivo?.rol === 'VETERINARIO') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/fichas">
                    <i className="bi bi-journal-medical me-1"></i> Fichas clínicas
                  </Link>
                </li>
              )}

              {/* Usuarios: Exclusivo Administrador */}
              {usuarioActivo?.rol === 'ADMINISTRADOR' && (
                <li className="nav-item solo-administrador">
                  <Link className="nav-link" to="/usuarios">
                    <i className="bi bi-people me-1"></i> Usuarios
                  </Link>
                </li>
              )}
            </ul>
            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <span className="chip-rol">
                <span id="nombreUsuarioActivo">{usuarioActivo ? usuarioActivo.nombre : 'Invitado'}</span> · 
                <span id="chipRolActivo" className="ms-1">{usuarioActivo ? usuarioActivo.rol : 'SIN ROL'}</span>
              </span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleCerrarSesion}>
                <i className="bi bi-box-arrow-right me-1"></i> Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== CONTENIDO DE CITAS ===== */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gestión de Citas</h2>
          <span className="badge bg-primary">Panel de Administración</span>
        </div>
        
        <p className="text-muted">Revisa y confirma las horas solicitadas por los pacientes.</p>

        <div className="card shadow-sm border-0 p-0">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Dueño</th>
                  <th>Mascota</th>
                  <th>Fecha y Hora</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaCitas.length > 0 ? (
                  listaCitas.map(cita => (
                    <tr key={cita.id}>
                      <td>#{cita.id}</td>
                      <td>{cita.dueño}</td>
                      <td>{cita.mascota}</td>
                      <td>{cita.fecha} a las {cita.hora}</td>
                      <td>{cita.motivo}</td>
                      <td>
                        <span className={`badge ${cita.estado === 'CONFIRMADA' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-success text-white fw-bold"
                          onClick={() => handleConfirmar(cita.id)}
                          disabled={cita.estado === 'CONFIRMADA'}
                        >
                          {cita.estado === 'CONFIRMADA' ? 'Confirmada ✔' : 'Confirmar Cita'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">No hay citas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}