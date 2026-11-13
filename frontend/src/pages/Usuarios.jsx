import React, { useState, useEffect, useCallback } from 'react';
import BarraInterna from '../components/BarraInterna';
import { listarUsuarios } from '../services/apiService';
import { ETIQUETA_ROL, formatearFecha } from '../utils';

// Consulta de usuarios del sistema (GET /api/v1/usuarios, solo ADMINISTRADOR).
// El backend no expone endpoints para cambiar roles ni activar/desactivar cuentas,
// por eso esta pantalla es de solo lectura.
export default function Usuarios() {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setListaUsuarios(await listarUsuarios());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <>
      <BarraInterna activa="usuarios" />

      <div className="container contenedor-ancho py-4">
        <div className="encabezado-seccion d-flex align-items-center justify-content-between mb-2">
          <h4 className="mb-0"><i className="bi bi-people me-2"></i>Gestión de usuarios</h4>
          <span className="badge bg-primary">Solo Administrador</span>
        </div>
        <p className="text-muted mb-3">
          Usuarios registrados en el sistema. Los dueños crean su cuenta desde la página de registro;
          las cuentas del personal las gestiona el equipo de backend.
        </p>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="card p-0 shadow-sm border-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Rol asignado</th>
                  <th>Estado</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>Cargando usuarios...
                    </td>
                  </tr>
                ) : listaUsuarios.length > 0 ? (
                  listaUsuarios.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <div className="fw-bold">{u.nombre} {u.apellido}</div>
                        <small className="text-muted">{u.correo}</small>
                      </td>
                      <td>{ETIQUETA_ROL[u.rol] || u.rol}</td>
                      <td>
                        <span className={`badge ${u.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{formatearFecha(u.fechaCreacion)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No hay usuarios registrados en el sistema.</td>
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