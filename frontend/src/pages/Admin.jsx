import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BarraInterna from '../components/BarraInterna';
import { useAuth } from '../context/AuthContext';
import {
  listarMascotas,
  listarUsuarios,
  citasPorMascota,
  citasPorVeterinario,
  cambiarEstadoCita,
  asignarVeterinario,
} from '../services/apiService';
import { ROLES, formatearFechaHora } from '../utils';

const COLOR_ESTADO = {
  PENDIENTE: 'bg-warning text-dark',
  CONFIRMADA: 'bg-success',
  EN_CURSO: 'bg-info text-dark',
  COMPLETADA: 'bg-primary',
  CANCELADA: 'bg-secondary',
  NO_ASISTIO: 'bg-danger',
};

// Transiciones que permite el backend (CitaService.cambiarEstado)
const TRANSICIONES = {
  PENDIENTE: [
    { estado: 'CONFIRMADA', texto: 'Confirmar', clase: 'btn-success text-white', quien: 'personal' },
    { estado: 'CANCELADA', texto: 'Cancelar', clase: 'btn-outline-danger', quien: 'personal' },
  ],
  CONFIRMADA: [
    { estado: 'EN_CURSO', texto: 'Iniciar atención', clase: 'btn-info', quien: 'atiende' },
    { estado: 'NO_ASISTIO', texto: 'No asistió', clase: 'btn-outline-secondary', quien: 'personal' },
    { estado: 'CANCELADA', texto: 'Cancelar', clase: 'btn-outline-danger', quien: 'personal' },
  ],
  EN_CURSO: [{ estado: 'COMPLETADA', texto: 'Completar', clase: 'btn-primary', quien: 'atiende' }],
};

export default function Admin() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [procesando, setProcesando] = useState(null);
  const [filtro, setFiltro] = useState('TODAS');
  const [vetAsignar, setVetAsignar] = useState({});

  const esPersonalAdmin = usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.RECEPCION;
  const esAdmin = usuario.rol === ROLES.ADMIN;

  // No existe un endpoint "listar todas las citas": se consultan las citas de cada mascota
  // (personal administrativo) o las del veterinario autenticado.
  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const listaMascotas = await listarMascotas();
      setMascotas(listaMascotas);

      if (esAdmin) {
        listarUsuarios().then(setUsuarios).catch(() => setUsuarios([]));
      }

      let todas = [];
      if (usuario.rol === ROLES.VET) {
        todas = await citasPorVeterinario(usuario.id);
      } else {
        const resultados = await Promise.allSettled(listaMascotas.map((m) => citasPorMascota(m.id)));
        todas = resultados.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
        const fallidas = resultados.filter((r) => r.status === 'rejected');
        if (fallidas.length) {
          setError(`No se pudieron consultar las citas de ${fallidas.length} mascota(s): ${fallidas[0].reason?.message || 'error'}`);
        }
      }
      todas.sort((a, b) => new Date(b.fechaHoraInicio) - new Date(a.fechaHoraInicio));
      setCitas(todas);
    } catch (err) {
      setError(err.message);
      setCitas([]);
    } finally {
      setCargando(false);
    }
  }, [usuario.id, usuario.rol, esAdmin]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mascotaPorId = useMemo(() => Object.fromEntries(mascotas.map((m) => [m.id, m])), [mascotas]);
  const usuarioPorId = useMemo(() => Object.fromEntries(usuarios.map((u) => [u.id, u])), [usuarios]);
  const veterinarios = useMemo(() => usuarios.filter((u) => u.rol === ROLES.VET && u.activo), [usuarios]);

  const nombreDueno = (mascota) => {
    if (!mascota) return '—';
    const u = usuarioPorId[mascota.duenoId];
    return u ? `${u.nombre} ${u.apellido}` : `Dueño #${mascota.duenoId}`;
  };

  const nombreVeterinario = (id) => {
    if (!id) return <span className="text-muted fst-italic">Sin asignar</span>;
    const u = usuarioPorId[id];
    return u ? `${u.nombre} ${u.apellido}` : `Veterinario #${id}`;
  };

  const puedeEjecutar = (accion, cita) => {
    if (esPersonalAdmin) return true;
    return accion.quien === 'atiende' && usuario.rol === ROLES.VET && cita.veterinarioId === usuario.id;
  };

  const handleCambiarEstado = async (cita, estado) => {
    setProcesando(cita.id);
    setError('');
    setExito('');
    try {
      await cambiarEstadoCita(cita.id, estado); // el backend decide; no se cambia nada solo en React
      setExito(`Cita #${cita.id} actualizada a ${estado}.`);
      await cargar(); // refresca desde el backend
    } catch (err) {
      setError(`No se pudo cambiar el estado de la cita #${cita.id}: ${err.message}`);
    } finally {
      setProcesando(null);
    }
  };

  const handleAsignar = async (cita) => {
    const id = Number(vetAsignar[cita.id]);
    if (!id || id <= 0) {
      setError('Indica un veterinario válido para asignar.');
      return;
    }
    setProcesando(cita.id);
    setError('');
    setExito('');
    try {
      await asignarVeterinario(cita.id, id);
      setExito(`Veterinario asignado a la cita #${cita.id}.`);
      setVetAsignar((prev) => ({ ...prev, [cita.id]: '' }));
      await cargar();
    } catch (err) {
      setError(`No se pudo asignar el veterinario: ${err.message}`);
    } finally {
      setProcesando(null);
    }
  };

  const visibles = filtro === 'TODAS' ? citas : citas.filter((c) => c.estado === filtro);

  return (
    <>
      <BarraInterna activa="citas" />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="mb-0">Gestión de Citas</h2>
          <span className="badge bg-primary">
            {usuario.rol === ROLES.VET ? 'Mis citas asignadas' : 'Panel de Administración'}
          </span>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <p className="text-muted mb-0 me-auto">
            Información en tiempo real desde el sistema. Revisa y gestiona las horas solicitadas.
          </p>
          <select
            className="form-select form-select-sm w-auto"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="TODAS">Todos los estados</option>
            {Object.keys(COLOR_ESTADO).map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <button className="btn btn-outline-warning btn-sm" onClick={cargar} disabled={cargando}>
            <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
          </button>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {exito && <div className="alert alert-success" role="status">{exito}</div>}

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
                  <th>Veterinario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Cargando citas...
                    </td>
                  </tr>
                ) : visibles.length > 0 ? (
                  visibles.map((cita) => {
                    const mascota = mascotaPorId[cita.mascotaId];
                    const acciones = (TRANSICIONES[cita.estado] || []).filter((a) => puedeEjecutar(a, cita));
                    const puedeAsignar =
                      esPersonalAdmin && (cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA');
                    return (
                      <tr key={cita.id}>
                        <td>#{cita.id}</td>
                        <td>{nombreDueno(mascota)}</td>
                        <td>{mascota ? `${mascota.nombre} (${mascota.especie})` : `Mascota #${cita.mascotaId}`}</td>
                        <td>{formatearFechaHora(cita.fechaHoraInicio)}</td>
                        <td>{cita.motivo}</td>
                        <td>
                          {nombreVeterinario(cita.veterinarioId)}
                          {puedeAsignar && (
                            <div className="d-flex gap-1 mt-1">
                              {veterinarios.length > 0 ? (
                                <select
                                  className="form-select form-select-sm"
                                  value={vetAsignar[cita.id] || ''}
                                  onChange={(e) => setVetAsignar({ ...vetAsignar, [cita.id]: e.target.value })}
                                >
                                  <option value="">Asignar...</option>
                                  {veterinarios.map((v) => (
                                    <option key={v.id} value={v.id}>{v.nombre} {v.apellido}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control form-control-sm"
                                  style={{ width: 90 }}
                                  placeholder="ID vet."
                                  value={vetAsignar[cita.id] || ''}
                                  onChange={(e) => setVetAsignar({ ...vetAsignar, [cita.id]: e.target.value })}
                                />
                              )}
                              <button
                                className="btn btn-sm btn-outline-warning"
                                disabled={procesando === cita.id}
                                onClick={() => handleAsignar(cita)}
                              >
                                OK
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${COLOR_ESTADO[cita.estado] || 'bg-secondary'}`}>{cita.estado}</span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {acciones.length === 0 && <span className="text-muted small">—</span>}
                            {acciones.map((a) => (
                              <button
                                key={a.estado}
                                className={`btn btn-sm fw-bold ${a.clase}`}
                                disabled={procesando === cita.id}
                                onClick={() => handleCambiarEstado(cita, a.estado)}
                              >
                                {a.texto}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">No hay citas registradas.</td>
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