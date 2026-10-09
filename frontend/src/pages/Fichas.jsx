import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService'; 

const Fichas = () => {
  const [listaPacientes, setListaPacientes] = useState([]);
  
  // Estado para el formulario de nueva ficha
  const [nuevaFicha, setNuevaFicha] = useState({
    nombreMascota: '',
    especie: '',
    raza: '',
    dueño: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    // 1. VALIDACIÓN DE RESTRICCIONES (RBAC)
    const usuarioActual = apiService.getUsuarioLogueado();

    // Solo Veterinarios y Administradores pueden ver y editar fichas clínicas
    if (!usuarioActual || (usuarioActual.rol !== 'VETERINARIO' && usuarioActual.rol !== 'ADMINISTRADOR')) {
      alert("Acceso denegado. Área exclusiva para personal médico veterinario.");
      navigate('/'); 
      return; 
    }

    // 2. CARGAR PACIENTES
    const cargarDatos = () => {
      const pacientesDb = apiService.getPacientes();
      
      // Datos de prueba por si el LocalStorage está vacío
      if (pacientesDb.length === 0) {
        const pacientesDemo = [
          { id: 1, nombreMascota: 'Pelusa', especie: 'Felino', raza: 'Mestizo', dueño: 'Ana Rojas', historial: [{ fecha: '2026-10-01', detalle: 'Vacuna antirrábica al día.' }] },
          { id: 2, nombreMascota: 'Toby', especie: 'Canino', raza: 'Poodle', dueño: 'Luis Silva', historial: [] }
        ];
        localStorage.setItem('sanmarcos_pacientes', JSON.stringify(pacientesDemo));
        setListaPacientes(pacientesDemo);
      } else {
        setListaPacientes(pacientesDb);
      }
    };

    cargarDatos();
  }, [navigate]);

  // 3. FUNCIÓN PARA CREAR UNA NUEVA FICHA
  const handleGuardarFicha = (e) => {
    e.preventDefault(); // Evita que la página se recargue al mandar el formulario
    
    if (!nuevaFicha.nombreMascota || !nuevaFicha.dueño) {
      alert("Por favor, ingresa al menos el nombre de la mascota y el dueño.");
      return;
    }

    // Guardamos en LocalStorage a través del apiService
    const fichaGuardada = apiService.guardarFicha(nuevaFicha);
    
    // Actualizamos la vista
    setListaPacientes([...listaPacientes, fichaGuardada]);
    
    // Limpiamos el formulario
    setNuevaFicha({ nombreMascota: '', especie: '', raza: '', dueño: '' });
    alert("¡Ficha creada exitosamente!");
  };

  // 4. FUNCIÓN PARA AGREGAR UN DIAGNÓSTICO AL HISTORIAL
  const handleRegistrarDiagnostico = (idPaciente) => {
    // Usamos un prompt simple para pedir el diagnóstico (puedes cambiarlo por un modal después si quieres)
    const nuevoDiagnostico = window.prompt("Ingrese el detalle del diagnóstico o tratamiento:");
    
    if (nuevoDiagnostico && nuevoDiagnostico.trim() !== "") {
      const exito = apiService.registrarDiagnostico(idPaciente, nuevoDiagnostico);
      
      if (exito) {
        // Refrescamos la lista completa para que aparezca el nuevo historial
        setListaPacientes(apiService.getPacientes());
        alert("Diagnóstico registrado correctamente.");
      } else {
        alert("Hubo un error al registrar el diagnóstico.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Fichas Clínicas de Pacientes</h2>
        <span className="badge bg-danger">Área Médica</span>
      </div>

      {/* FORMULARIO PARA NUEVA FICHA */}
      <div className="card mb-5 shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Crear Nueva Ficha</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleGuardarFicha} className="row g-3">
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Nombre Mascota" 
                value={nuevaFicha.nombreMascota} onChange={(e) => setNuevaFicha({...nuevaFicha, nombreMascota: e.target.value})} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={nuevaFicha.especie} onChange={(e) => setNuevaFicha({...nuevaFicha, especie: e.target.value})}>
                <option value="">Seleccione Especie...</option>
                <option value="Canino">Canino</option>
                <option value="Felino">Felino</option>
                <option value="Exótico">Exótico</option>
              </select>
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Raza" 
                value={nuevaFicha.raza} onChange={(e) => setNuevaFicha({...nuevaFicha, raza: e.target.value})} />
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Nombre Dueño" 
                value={nuevaFicha.dueño} onChange={(e) => setNuevaFicha({...nuevaFicha, dueño: e.target.value})} />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-primary">Guardar Ficha</button>
            </div>
          </form>
        </div>
      </div>

      {/* LISTA DE FICHAS Y DIAGNÓSTICOS */}
      <h4>Pacientes Registrados</h4>
      <div className="row">
        {listaPacientes.map(paciente => (
          <div className="col-md-6 mb-4" key={paciente.id}>
            <div className="card h-100 border-info">
              <div className="card-body">
                <h5 className="card-title text-info">{paciente.nombreMascota} ({paciente.especie})</h5>
                <h6 className="card-subtitle mb-2 text-muted">Dueño: {paciente.dueño} | Raza: {paciente.raza}</h6>
                
                <hr/>
                <strong>Historial Clínico:</strong>
                <ul className="list-group list-group-flush my-2">
                  {paciente.historial && paciente.historial.length > 0 ? (
                    paciente.historial.map((item, index) => (
                      <li className="list-group-item bg-transparent px-0" key={index}>
                        <small className="text-secondary">{item.fecha}:</small> {item.detalle}
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item bg-transparent px-0 text-muted fst-italic">Sin atenciones previas.</li>
                  )}
                </ul>
              </div>
              <div className="card-footer bg-transparent border-top-0 text-end">
                <button 
                  className="btn btn-outline-info btn-sm"
                  onClick={() => handleRegistrarDiagnostico(paciente.id)}
                >
                  + Registrar Diagnóstico
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fichas;