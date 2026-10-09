import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService'; // Ajusta la ruta si es necesario

const Admin = () => {
  const [listaCitas, setListaCitas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. VALIDACIÓN DE RESTRICCIONES (RBAC)
    const usuarioActual = apiService.getUsuarioLogueado();

    // Solo Administradores y Recepcionistas pueden gestionar las citas
    if (!usuarioActual || (usuarioActual.rol !== 'ADMINISTRADOR' && usuarioActual.rol !== 'RECEPCIONISTA')) {
      alert("Acceso denegado. Área exclusiva para Administración y Recepción.");
      navigate('/'); // Lo mandas al login o al inicio
      return; 
    }

    // 2. CONECTAR EL CRUD (Lectura inicial)
    const cargarCitas = () => {
      // Si no hay citas previas en tu LocalStorage para las pruebas, 
      // puedes agregar un arreglo manual temporal o leer lo que devuelve getCitas
      const datosCitas = apiService.getCitas();
      
      // Si está vacío, metemos una cita de prueba para que veas la tabla funcionando
      if (datosCitas.length === 0) {
        const citasDemo = [
          { id: 1, dueño: 'Carlos Pérez', mascota: 'Firulais', fecha: '2026-10-15', hora: '10:30', motivo: 'Vacunación', estado: 'PENDIENTE' },
          { id: 2, dueño: 'María Gómez', mascota: 'Michi', fecha: '2026-10-16', hora: '15:00', motivo: 'Consulta General', estado: 'PENDIENTE' }
        ];
        localStorage.setItem('sanmarcos_citas', JSON.stringify(citasDemo));
        setListaCitas(citasDemo);
      } else {
        setListaCitas(datosCitas);
      }
    };

    cargarCitas();
  }, [navigate]);

  // 3. FUNCIÓN PARA EL BOTÓN "Confirmar cita"
  const handleConfirmar = (idCita) => {
    // Llamamos al servicio para guardar el cambio en el LocalStorage
    const confirmado = apiService.confirmarCita(idCita);

    if (confirmado) {
      // Actualizamos la tabla en pantalla sin recargar la página
      setListaCitas(citasPrevias => 
        citasPrevias.map(cita => 
          cita.id === idCita ? { ...cita, estado: 'CONFIRMADA' } : cita
        )
      );
    } else {
      alert("Hubo un problema al intentar confirmar la cita.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Citas</h2>
        <span className="badge bg-primary">Panel de Administración</span>
      </div>
      
      <p>Revisa y confirma las horas solicitadas por los pacientes.</p>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
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
                    {/* Estilos condicionales según el estado */}
                    <span className={`badge ${cita.estado === 'CONFIRMADA' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td>
                    {/* El botón se deshabilita si la cita ya está confirmada */}
                    <button 
                      className="btn btn-sm btn-success"
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
                <td colSpan="7" className="text-center py-3">No hay citas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;