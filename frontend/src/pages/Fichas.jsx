import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService'; 

export default function Fichas() {
  const [listaPacientes, setListaPacientes] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [duenosRegistrados, setDuenosRegistrados] = useState([]);
  
  // Estado para el formulario de nueva ficha
  const [nuevaFicha, setNuevaFicha] = useState({
    nombreMascota: '',
    especie: '',
    raza: '',
    dueño: '',
    duenoId: ''
  });

  // ID de la ficha que se está editando (null = modo crear)
  const [editandoId, setEditandoId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // 1. CARGAR SESIÓN DE USUARIO
    const sesionGuardada = JSON.parse(localStorage.getItem('usuario_logueado') || 'null');
    const usuario = sesionGuardada || (apiService?.getUsuarioLogueado ? apiService.getUsuarioLogueado() : null);

    setUsuarioActivo(usuario);

    // 2. PROTECCIÓN DE RUTA (Personal de la clínica y dueños de mascotas)
    const rolesPermitidos = ['ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'DUEÑO'];
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      alert("Acceso denegado. Inicia sesión con un usuario autorizado.");
      navigate('/admin');
      return;
    }

    // Dueños registrados (para que el personal asocie la mascota a un usuario)
    const todos = apiService?.getUsuarios ? apiService.getUsuarios() : [];
    setDuenosRegistrados(todos.filter(u => u.rol === 'DUEÑO' && u.activo !== false));

    // 3. CARGAR PACIENTES Y GARANTIZAR DATOS DEMO
    const cargarDatos = () => {
      let pacientesDb = apiService?.getPacientes ? apiService.getPacientes() : null;
      
      if (!pacientesDb || pacientesDb.length === 0) {
        const guardados = JSON.parse(localStorage.getItem('sanmarcos_pacientes') || '[]');
        if (guardados.length > 0) {
          pacientesDb = guardados;
        } else {
          const pacientesDemo = [
            { id: 1, nombreMascota: 'Pelusa', especie: 'Felino', raza: 'Mestizo', dueño: 'Ana Rojas', historial: [{ fecha: '2026-10-01', detalle: 'Vacuna antirrábica al día.' }] },
            { id: 2, nombreMascota: 'Toby', especie: 'Canino', raza: 'Poodle', dueño: 'Luis Silva', historial: [] }
          ];
          localStorage.setItem('sanmarcos_pacientes', JSON.stringify(pacientesDemo));
          pacientesDb = pacientesDemo;
        }
      }
      setListaPacientes(pacientesDb);
    };

    cargarDatos();
  }, [navigate]);

  // 4. FUNCIÓN PARA CREAR O EDITAR UNA FICHA
  const handleGuardarFicha = (e) => {
    e.preventDefault();
    
    // Si quien registra es un dueño, la mascota queda asociada a su propio usuario
    const datosFicha = usuarioActivo?.rol === 'DUEÑO'
      ? { ...nuevaFicha, dueño: usuarioActivo.nombre, duenoId: usuarioActivo.id }
      : nuevaFicha;

    if (!datosFicha.nombreMascota || !datosFicha.dueño) {
      alert("Por favor, ingresa al menos el nombre de la mascota y el dueño.");
      return;
    }

    // MODO EDICIÓN: actualiza la ficha existente (conserva su historial)
    if (editandoId !== null) {
      const actualizadas = listaPacientes.map(pac =>
        pac.id === editandoId ? { ...pac, ...datosFicha } : pac
      );
      setListaPacientes(actualizadas);
      localStorage.setItem('sanmarcos_pacientes', JSON.stringify(actualizadas));
      if (apiService?.actualizarFicha) {
        apiService.actualizarFicha(editandoId, datosFicha);
      }
      setEditandoId(null);
      setNuevaFicha({ nombreMascota: '', especie: '', raza: '', dueño: '', duenoId: '' });
      alert("¡Ficha actualizada exitosamente!");
      return;
    }

    // MODO CREAR
    const fichaNueva = { 
      id: Date.now(), 
      ...datosFicha, 
      historial: [] 
    };

    const actualizadas = [...listaPacientes, fichaNueva];
    setListaPacientes(actualizadas);
    localStorage.setItem('sanmarcos_pacientes', JSON.stringify(actualizadas));
    
    setNuevaFicha({ nombreMascota: '', especie: '', raza: '', dueño: '', duenoId: '' });
    alert("¡Ficha creada exitosamente!");
  };

  // 4.1 CARGAR UNA FICHA EN EL FORMULARIO PARA EDITARLA
  const handleEditarFicha = (paciente) => {
    setEditandoId(paciente.id);
    setNuevaFicha({
      nombreMascota: paciente.nombreMascota || '',
      especie: paciente.especie || '',
      raza: paciente.raza || '',
      dueño: paciente.dueño || '',
      duenoId: paciente.duenoId || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4.2 CANCELAR LA EDICIÓN
  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setNuevaFicha({ nombreMascota: '', especie: '', raza: '', dueño: '', duenoId: '' });
  };

  // 4.3 ELIMINAR UNA FICHA
  const handleEliminarFicha = (paciente) => {
    if (!window.confirm(`¿Eliminar la ficha de ${paciente.nombreMascota}? Esta acción no se puede deshacer.`)) {
      return;
    }
    const actualizadas = listaPacientes.filter(pac => pac.id !== paciente.id);
    setListaPacientes(actualizadas);
    localStorage.setItem('sanmarcos_pacientes', JSON.stringify(actualizadas));
    if (apiService?.eliminarFicha) {
      apiService.eliminarFicha(paciente.id);
    }

    // Si se estaba editando esta misma ficha, salir del modo edición
    if (editandoId === paciente.id) handleCancelarEdicion();
  };

  // 5. FUNCIÓN PARA AGREGAR UN DIAGNÓSTICO AL HISTORIAL
  const handleRegistrarDiagnostico = (idPaciente) => {
    const nuevoDiagnostico = window.prompt("Ingrese el detalle del diagnóstico o tratamiento:");
    
    if (nuevoDiagnostico && nuevoDiagnostico.trim() !== "") {
      const actualizadas = listaPacientes.map(pac => 
        pac.id === idPaciente ? {
          ...pac,
          historial: [...(pac.historial || []), { fecha: new Date().toISOString().split('T')[0], detalle: nuevoDiagnostico }]
        } : pac
      );

      setListaPacientes(actualizadas);
      localStorage.setItem('sanmarcos_pacientes', JSON.stringify(actualizadas));

      if (apiService?.registrarDiagnostico) {
        apiService.registrarDiagnostico(idPaciente, nuevoDiagnostico);
      }
      
      alert("Diagnóstico registrado correctamente.");
    }
  };

  // 6. CERRAR SESIÓN
  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_logueado');
    navigate('/login');
  };

  const esDueno = usuarioActivo?.rol === 'DUEÑO';
  // Un dueño solo ve sus mascotas; el personal ve todas
  const pacientesVisibles = esDueno
    ? listaPacientes.filter(p => p.duenoId === usuarioActivo.id)
    : listaPacientes;

  return (
    <>
      {/* ===== NAVBAR RESPONSIVE CON RBAC ===== */}
      <nav className="navbar navbar-expand-md sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-1" to={esDueno ? '/fichas' : '/admin'}>
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
                  <Link className="nav-link active" to="/fichas">
                    <i className="bi bi-journal-medical me-1"></i> Fichas clínicas
                  </Link>
                </li>
              )}

              {/* Dueño de mascota: sus mascotas y agendar hora */}
              {esDueno && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link active" to="/fichas">
                      <i className="bi bi-journal-medical me-1"></i> Mis mascotas
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/agendar">
                      <i className="bi bi-calendar-plus me-1"></i> Agendar cita
                    </Link>
                  </li>
                </>
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

      {/* ===== CONTENIDO DE FICHAS ===== */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{esDueno ? 'Mis Mascotas' : 'Fichas Clínicas de Pacientes'}</h2>
          <span className="badge bg-danger">{esDueno ? 'Portal del Dueño' : 'Área Médica & Recepción'}</span>
        </div>

        {/* FORMULARIO PARA NUEVA FICHA */}
        <div className="card mb-5 shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">{editandoId !== null ? 'Editar Ficha' : (esDueno ? 'Registrar Mascota' : 'Crear Nueva Ficha')}</h5>
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
                  value={esDueno ? usuarioActivo.nombre : nuevaFicha.dueño}
                  readOnly={esDueno}
                  onChange={(e) => setNuevaFicha({...nuevaFicha, dueño: e.target.value})} />
              </div>
              {/* El personal puede asociar la mascota a un dueño ya registrado */}
              {!esDueno && (
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={nuevaFicha.duenoId || ''}
                    onChange={(e) => {
                      const elegido = duenosRegistrados.find(u => String(u.id) === e.target.value);
                      setNuevaFicha({
                        ...nuevaFicha,
                        duenoId: elegido ? elegido.id : '',
                        dueño: elegido ? elegido.nombre : nuevaFicha.dueño
                      });
                    }}
                  >
                    <option value="">Asociar a un dueño registrado (opcional)...</option>
                    {duenosRegistrados.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} — {u.email}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="col-12 text-end">
                {editandoId !== null && (
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={handleCancelarEdicion}>Cancelar</button>
                )}
                <button type="submit" className="btn btn-warning text-dark fw-bold">
                  {editandoId !== null ? 'Actualizar Ficha' : 'Guardar Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LISTA DE FICHAS Y DIAGNÓSTICOS */}
        <h4>Pacientes Registrados</h4>
        <div className="row">
          {pacientesVisibles.length === 0 && (
            <p className="text-muted fst-italic">
              {esDueno ? 'Aún no has registrado mascotas. Usa el formulario de arriba para agregar la primera.' : 'No hay pacientes registrados.'}
            </p>
          )}
          {pacientesVisibles.map(paciente => (
            <div className="col-md-6 mb-4" key={paciente.id}>
              <div className="card h-100 border-info shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-warning fw-bold">{paciente.nombreMascota} ({paciente.especie})</h5>
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
                    className="btn btn-outline-primary btn-sm fw-bold me-2"
                    onClick={() => handleEditarFicha(paciente)}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Editar
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm fw-bold me-2"
                    onClick={() => handleEliminarFicha(paciente)}
                  >
                    <i className="bi bi-trash me-1"></i> Eliminar
                  </button>
                  {!esDueno && (
                    <button 
                      className="btn btn-outline-warning btn-sm fw-bold"
                      onClick={() => handleRegistrarDiagnostico(paciente.id)}
                    >
                      + Registrar Diagnóstico
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}