import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Usuarios() {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. OBTENER USUARIO ACTIVO DE LA SESIÓN
    const sesionGuardada = JSON.parse(localStorage.getItem('usuario_logueado') || 'null');
    const actual = sesionGuardada || (apiService?.getUsuarioLogueado ? apiService.getUsuarioLogueado() : null);

    setUsuarioActivo(actual);

    // 2. PROTECCIÓN DE RUTA ESTRICTA (Exclusivo Administrador)
    if (!actual || actual.rol !== 'ADMINISTRADOR') {
      alert("Acceso denegado. Módulo exclusivo para Administradores.");
      navigate('/admin');
      return;
    }

    // 3. CARGAR USUARIOS DESDE LOCALSTORAGE O DEMO
    const cargarDatos = () => {
      let datos = apiService?.getUsuarios ? apiService.getUsuarios() : null;

      if (!datos || datos.length === 0) {
        const guardados = JSON.parse(localStorage.getItem('sanmarcos_usuarios') || '[]');
        if (guardados.length > 0) {
          datos = guardados;
        } else {
          const usuariosDemo = [
            { id: 1, nombre: 'Kevin Sosa', email: 'admin@sanmarcos.cl', rut: '11.111.111-1', rol: 'ADMINISTRADOR', activo: true },
            { id: 2, nombre: 'Ana Torres', email: 'recepcion@sanmarcos.cl', rut: '22.222.222-2', rol: 'RECEPCIONISTA', activo: true },
            { id: 3, nombre: 'Dr. Carlos Mendoza', email: 'veterinario@sanmarcos.cl', rut: '33.333.333-3', rol: 'VETERINARIO', activo: true },
            { id: 4, nombre: 'Juan Pérez', email: 'juan@gmail.com', rut: '18.888.888-8', rol: 'DUEÑO', activo: false }
          ];
          localStorage.setItem('sanmarcos_usuarios', JSON.stringify(usuariosDemo));
          datos = usuariosDemo;
        }
      }

      setListaUsuarios(datos);
    };

    cargarDatos();
  }, [navigate]);

  // 4. CAMBIAR ROL
  const handleCambiarRol = (idUsuario, nuevoRol) => {
    const actualizados = listaUsuarios.map(u => 
      u.id === idUsuario ? { ...u, rol: nuevoRol } : u
    );
    setListaUsuarios(actualizados);
    localStorage.setItem('sanmarcos_usuarios', JSON.stringify(actualizados));

    if (apiService?.actualizarRolUsuario) {
      apiService.actualizarRolUsuario(idUsuario, nuevoRol);
    }
  };

  // 5. TOGGLE ESTADO (Activo / Inactivo)
  const handleToggleEstado = (idUsuario) => {
    const actualizados = listaUsuarios.map(u => 
      u.id === idUsuario ? { ...u, activo: !u.activo } : u
    );
    setListaUsuarios(actualizados);
    localStorage.setItem('sanmarcos_usuarios', JSON.stringify(actualizados));
  };

  // 6. CERRAR SESIÓN
  const handleCerrarSesion = () => {
    if (apiService?.cerrarSesion) apiService.cerrarSesion();
    localStorage.removeItem('usuario_logueado');
    navigate('/login');
  };

  // BLOQUEO DE RENDERIZADO: Si el usuario no es ADMINISTRADOR, no renderiza el componente mientras redirige
  if (usuarioActivo && usuarioActivo.rol !== 'ADMINISTRADOR') {
    return null;
  }

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
                  <Link className="nav-link" to="/admin">
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
                  <Link className="nav-link active" to="/usuarios">
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

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div className="container contenedor-ancho py-4">
        <div className="encabezado-seccion d-flex align-items-center justify-content-between mb-2">
          <h4 className="mb-0"><i className="bi bi-people me-2"></i>Gestión de usuarios</h4>
          <span className="badge bg-primary">Solo Administrador</span>
        </div>
        <p className="text-muted mb-3">
          Crea cuentas desde <Link to="/registro">registro</Link>, reasigna roles o desactiva accesos del personal y dueños.
        </p>

        <div className="card p-0 shadow-sm border-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Usuario</th>
                  <th>RUT</th>
                  <th>Rol asignado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.length > 0 ? (
                  listaUsuarios.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-bold">{u.nombre}</div>
                        <small className="text-muted">{u.email}</small>
                      </td>
                      <td>{u.rut || 'N/A'}</td>
                      <td>
                        <select 
                          className="form-select form-select-sm w-auto bg-dark text-light border-secondary"
                          value={u.rol}
                          onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                        >
                          <option value="DUEÑO">Dueño</option>
                          <option value="RECEPCIONISTA">Recepcionista</option>
                          <option value="VETERINARIO">Veterinario</option>
                          <option value="ADMINISTRADOR">Administrador</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.activo !== false ? 'bg-success' : 'bg-secondary'}`}>
                          {u.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`btn btn-sm ${u.activo !== false ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleEstado(u.id)}
                        >
                          {u.activo !== false ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No hay usuarios registrados en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-muted small">
        © 2026 Veterinaria San Marcos — Todos los derechos reservados
      </footer>
    </>
  );
}