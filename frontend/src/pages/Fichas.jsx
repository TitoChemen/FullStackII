import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BarraInterna from '../components/BarraInterna';
import { useAuth } from '../context/AuthContext';
import {
  listarMascotas,
  listarMisMascotas,
  listarUsuarios,
  crearMascota,
  actualizarMascota,
  desactivarMascota,
  citasPorMascota,
  historialesPorMascota,
  crearHistorial,
} from '../services/apiService';
import { ROLES, aFormatoJava, fechaHoy, formatearFecha, formatearFechaHora } from '../utils';

// Valores de enumeración que entiende el backend
const ESPECIES = ['PERRO', 'GATO', 'AVE', 'CONEJO', 'ROEDOR', 'REPTIL', 'OTRO'];
const SEXOS = [
  { valor: 'MACHO', texto: 'Macho' },
  { valor: 'HEMBRA', texto: 'Hembra' },
  { valor: 'NO_DETERMINADO', texto: 'No determinado' },
];

const FORM_MASCOTA_VACIO = { nombre: '', especie: '', raza: '', sexo: '', fechaNacimiento: '', duenoId: '' };

const ahoraLocalInput = () => aFormatoJava(new Date()).slice(0, 16); // YYYY-MM-DDTHH:mm

// ---------------------------------------------------------------
// Tarjeta de una mascota: citas e historial clínico (según rol)
// ---------------------------------------------------------------
function FichaMascota({ mascota, nombreDueno, usuario, puedeEditar, onEditar, onEliminar }) {
  const esMedico = usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.VET;
  const puedeVerCitas = usuario.rol !== ROLES.VET;

  const [historial, setHistorial] = useState(null);
  const [citas, setCitas] = useState(null);
  const [cargando, setCargando] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    motivoConsulta: '', diagnostico: '', tratamiento: '', indicaciones: '', observaciones: '',
    fechaAtencion: ahoraLocalInput(),
    veterinarioId: usuario.rol === ROLES.VET ? String(usuario.id) : '',
    citaId: '',
  });

  const cargarHistorial = useCallback(async () => {
    setCargando('historial');
    setError('');
    try {
      const datos = await historialesPorMascota(mascota.id);
      setHistorial([...datos].sort((a, b) => new Date(b.fechaAtencion) - new Date(a.fechaAtencion)));
    } catch (err) {
      // Un 403 se respeta: la interfaz no intenta saltarse la seguridad del backend.
      setError(err.status === 403 ? 'No tienes permisos para ver el historial clínico.' : err.message);
    } finally {
      setCargando('');
    }
  }, [mascota.id]);

  const cargarCitas = useCallback(async () => {
    setCargando('citas');
    setError('');
    try {
      const datos = await citasPorMascota(mascota.id);
      setCitas([...datos].sort((a, b) => new Date(b.fechaHoraInicio) - new Date(a.fechaHoraInicio)));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando('');
    }
  }, [mascota.id]);

  const guardarHistorial = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    if (!form.motivoConsulta.trim()) {
      setError('El motivo de consulta es obligatorio.');
      return;
    }
    if (!form.veterinarioId || Number(form.veterinarioId) <= 0) {
      setError('Indica el ID del veterinario que realiza la atención.');
      return;
    }
    if (!form.fechaAtencion) {
      setError('Indica la fecha de la atención.');
      return;
    }
    setGuardando(true);
    try {
      await crearHistorial({
        mascotaId: mascota.id,
        veterinarioId: Number(form.veterinarioId),
        citaId: form.citaId ? Number(form.citaId) : null,
        fechaAtencion: `${form.fechaAtencion}:00`,
        motivoConsulta: form.motivoConsulta.trim(),
        diagnostico: form.diagnostico.trim() || null,
        tratamiento: form.tratamiento.trim() || null,
        indicaciones: form.indicaciones.trim() || null,
        observaciones: form.observaciones.trim() || null,
      });
      setExito('Atención registrada en el historial clínico.');
      setMostrarForm(false);
      setForm((f) => ({ ...f, motivoConsulta: '', diagnostico: '', tratamiento: '', indicaciones: '', observaciones: '', citaId: '', fechaAtencion: ahoraLocalInput() }));
      await cargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const campo = (nombre) => (e) => setForm({ ...form, [nombre]: e.target.value });

  return (
    <div className="col-md-6 mb-4">
      <div className="card h-100 border-info shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-warning fw-bold">{mascota.nombre} ({mascota.especie})</h5>
          <h6 className="card-subtitle mb-2 text-muted">
            Dueño: {nombreDueno} | Raza: {mascota.raza || '—'} | Sexo: {mascota.sexo}
            {mascota.fechaNacimiento && ` | Nac.: ${formatearFecha(mascota.fechaNacimiento)}`}
          </h6>

          <div className="d-flex flex-wrap gap-2 my-3">
            {puedeVerCitas && (
              <button className="btn btn-sm btn-outline-info" onClick={cargarCitas} disabled={cargando === 'citas'}>
                <i className="bi bi-calendar-check me-1"></i> {cargando === 'citas' ? 'Cargando...' : 'Ver citas'}
              </button>
            )}
            {esMedico && (
              <button className="btn btn-sm btn-outline-info" onClick={cargarHistorial} disabled={cargando === 'historial'}>
                <i className="bi bi-journal-medical me-1"></i> {cargando === 'historial' ? 'Cargando...' : 'Ver historial clínico'}
              </button>
            )}
          </div>

          {!esMedico && (
            <p className="small text-muted fst-italic mb-2">
              El historial clínico solo está disponible para el personal médico.
            </p>
          )}

          {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
          {exito && <div className="alert alert-success py-2 small" role="status">{exito}</div>}

          {citas && (
            <>
              <strong>Citas:</strong>
              <ul className="list-group list-group-flush my-2">
                {citas.length === 0 && <li className="list-group-item bg-transparent px-0 text-muted fst-italic">Sin citas registradas.</li>}
                {citas.map((c) => (
                  <li className="list-group-item bg-transparent px-0" key={c.id}>
                    <small className="text-secondary">{formatearFechaHora(c.fechaHoraInicio)}:</small> {c.motivo}{' '}
                    <span className="badge bg-secondary">{c.estado}</span>
                    <small className="text-muted"> (cita #{c.id})</small>
                  </li>
                ))}
              </ul>
            </>
          )}

          {historial && (
            <>
              <strong>Historial Clínico:</strong>
              <ul className="list-group list-group-flush my-2">
                {historial.length === 0 && <li className="list-group-item bg-transparent px-0 text-muted fst-italic">Sin atenciones previas.</li>}
                {historial.map((h) => (
                  <li className="list-group-item bg-transparent px-0" key={h.id}>
                    <small className="text-secondary">{formatearFechaHora(h.fechaAtencion)}</small>
                    <div><strong>Motivo:</strong> {h.motivoConsulta}</div>
                    {h.diagnostico && <div><strong>Diagnóstico:</strong> {h.diagnostico}</div>}
                    {h.tratamiento && <div><strong>Tratamiento:</strong> {h.tratamiento}</div>}
                    {h.indicaciones && <div><strong>Indicaciones:</strong> {h.indicaciones}</div>}
                    {h.observaciones && <div><strong>Observaciones:</strong> {h.observaciones}</div>}
                    <small className="text-muted">Veterinario #{h.veterinarioId}{h.citaId ? ` · Cita #${h.citaId}` : ''}</small>
                  </li>
                ))}
              </ul>
            </>
          )}

          {mostrarForm && esMedico && (
            <form onSubmit={guardarHistorial} className="border rounded p-3 mt-3 row g-2">
              <h6 className="mb-0">Nueva atención clínica</h6>
              <div className="col-12">
                <input className="form-control form-control-sm" placeholder="Motivo de consulta *" maxLength={500} value={form.motivoConsulta} onChange={campo('motivoConsulta')} />
              </div>
              <div className="col-12">
                <textarea className="form-control form-control-sm" rows={2} placeholder="Diagnóstico" value={form.diagnostico} onChange={campo('diagnostico')} />
              </div>
              <div className="col-12">
                <textarea className="form-control form-control-sm" rows={2} placeholder="Tratamiento" value={form.tratamiento} onChange={campo('tratamiento')} />
              </div>
              <div className="col-12">
                <textarea className="form-control form-control-sm" rows={2} placeholder="Indicaciones" value={form.indicaciones} onChange={campo('indicaciones')} />
              </div>
              <div className="col-12">
                <textarea className="form-control form-control-sm" rows={2} placeholder="Observaciones" value={form.observaciones} onChange={campo('observaciones')} />
              </div>
              <div className="col-sm-6">
                <label className="form-label small mb-0">Fecha de atención</label>
                <input type="datetime-local" className="form-control form-control-sm" value={form.fechaAtencion} onChange={campo('fechaAtencion')} />
              </div>
              <div className="col-sm-3">
                <label className="form-label small mb-0">ID veterinario</label>
                <input type="number" min="1" className="form-control form-control-sm" value={form.veterinarioId} readOnly={usuario.rol === ROLES.VET} onChange={campo('veterinarioId')} />
              </div>
              <div className="col-sm-3">
                <label className="form-label small mb-0">ID cita (opcional)</label>
                <input type="number" min="1" className="form-control form-control-sm" value={form.citaId} onChange={campo('citaId')} />
              </div>
              <div className="col-12 text-end">
                <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => setMostrarForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-sm btn-warning fw-bold" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar atención'}
                </button>
              </div>
              <div className="form-text">Si vinculas una cita, debe estar COMPLETADA y pertenecer a esta mascota y a este veterinario.</div>
            </form>
          )}
        </div>

        <div className="card-footer bg-transparent border-top-0 text-end">
          {puedeEditar && (
            <>
              <button className="btn btn-outline-primary btn-sm fw-bold me-2" onClick={() => onEditar(mascota)}>
                <i className="bi bi-pencil-square me-1"></i> Editar
              </button>
              <button className="btn btn-outline-danger btn-sm fw-bold me-2" onClick={() => onEliminar(mascota)}>
                <i className="bi bi-trash me-1"></i> Eliminar
              </button>
            </>
          )}
          {esMedico && (
            <button className="btn btn-outline-warning btn-sm fw-bold" onClick={() => setMostrarForm((v) => !v)}>
              + Registrar atención
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Página
// ---------------------------------------------------------------
export default function Fichas() {
  const { usuario } = useAuth();
  const esDueno = usuario.rol === ROLES.DUENO;
  const esAdmin = usuario.rol === ROLES.ADMIN;
  const puedeCrear = esDueno || esAdmin || usuario.rol === ROLES.RECEPCION; // el veterinario no registra mascotas

  const [mascotas, setMascotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(FORM_MASCOTA_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [hoy] = useState(() => fechaHoy());

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setMascotas(await (esDueno ? listarMisMascotas() : listarMascotas()));
    } catch (err) {
      setError(err.message);
      setMascotas([]);
    } finally {
      setCargando(false);
    }
  }, [esDueno]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Solo el administrador puede listar usuarios (para asociar dueños por nombre)
  useEffect(() => {
    if (!esAdmin) return;
    listarUsuarios().then(setUsuarios).catch(() => setUsuarios([]));
  }, [esAdmin]);

  const duenos = useMemo(() => usuarios.filter((u) => u.rol === ROLES.DUENO && u.activo), [usuarios]);
  const usuarioPorId = useMemo(() => Object.fromEntries(usuarios.map((u) => [u.id, u])), [usuarios]);

  const nombreDueno = (m) => {
    if (esDueno) return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
    const u = usuarioPorId[m.duenoId];
    return u ? `${u.nombre} ${u.apellido}` : `Usuario #${m.duenoId}`;
  };

  const limpiarForm = () => {
    setForm(FORM_MASCOTA_VACIO);
    setEditandoId(null);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    const duenoId = esDueno ? usuario.id : Number(form.duenoId);
    if (!form.nombre.trim()) return setError('El nombre de la mascota es obligatorio.');
    if (!form.especie) return setError('Selecciona la especie.');
    if (!form.sexo) return setError('Selecciona el sexo de la mascota.');
    if (!duenoId || duenoId <= 0) return setError('Indica el dueño de la mascota.');
    if (form.fechaNacimiento && form.fechaNacimiento > hoy) return setError('La fecha de nacimiento no puede ser futura.');

    const datos = {
      nombre: form.nombre.trim(),
      especie: form.especie,
      raza: form.raza.trim() || null,
      sexo: form.sexo,
      fechaNacimiento: form.fechaNacimiento || null,
      duenoId,
    };

    setGuardando(true);
    try {
      if (editandoId !== null) {
        await actualizarMascota(editandoId, datos);
        setExito('¡Mascota actualizada correctamente!');
      } else {
        await crearMascota(datos);
        setExito('¡Mascota registrada correctamente!');
      }
      limpiarForm();
      await cargar(); // se vuelve a leer desde el backend
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (m) => {
    setEditandoId(m.id);
    setForm({
      nombre: m.nombre || '',
      especie: m.especie || '',
      raza: m.raza || '',
      sexo: m.sexo || '',
      fechaNacimiento: m.fechaNacimiento || '',
      duenoId: String(m.duenoId || ''),
    });
    setError('');
    setExito('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (m) => {
    if (!window.confirm(`¿Desactivar la ficha de ${m.nombre}? La mascota dejará de aparecer en el listado.`)) return;
    setError('');
    setExito('');
    try {
      await desactivarMascota(m.id);
      setExito(`La ficha de ${m.nombre} fue desactivada.`);
      if (editandoId === m.id) limpiarForm();
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const puedeEditarMascota = (m) => esAdmin || usuario.rol === ROLES.RECEPCION || (esDueno && m.duenoId === usuario.id);
  const campo = (nombre) => (e) => setForm({ ...form, [nombre]: e.target.value });

  return (
    <>
      <BarraInterna activa="fichas" />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{esDueno ? 'Mis Mascotas' : 'Fichas Clínicas de Pacientes'}</h2>
          <span className="badge bg-danger">{esDueno ? 'Portal del Dueño' : 'Área Médica & Recepción'}</span>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {exito && <div className="alert alert-success" role="status">{exito}</div>}

        {puedeCrear && (
          <div className="card mb-5 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">{editandoId !== null ? 'Editar Mascota' : (esDueno ? 'Registrar Mascota' : 'Crear Nueva Ficha')}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleGuardar} className="row g-3">
                <div className="col-md-3">
                  <input type="text" className="form-control" placeholder="Nombre Mascota" maxLength={100} value={form.nombre} onChange={campo('nombre')} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={form.especie} onChange={campo('especie')}>
                    <option value="">Seleccione Especie...</option>
                    {ESPECIES.map((e) => <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <input type="text" className="form-control" placeholder="Raza" maxLength={100} value={form.raza} onChange={campo('raza')} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={form.sexo} onChange={campo('sexo')}>
                    <option value="">Seleccione Sexo...</option>
                    {SEXOS.map((s) => <option key={s.valor} value={s.valor}>{s.texto}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-0">Fecha de nacimiento (opcional)</label>
                  <input type="date" className="form-control" max={hoy} value={form.fechaNacimiento} onChange={campo('fechaNacimiento')} />
                </div>

                <div className="col-md-5">
                  <label className="form-label small mb-0">Dueño</label>
                  {esDueno ? (
                    <input type="text" className="form-control" readOnly value={`${usuario.nombre} ${usuario.apellido || ''}`} />
                  ) : esAdmin && duenos.length > 0 ? (
                    <select className="form-select" value={form.duenoId} onChange={campo('duenoId')}>
                      <option value="">Selecciona un dueño registrado...</option>
                      {duenos.map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre} {u.apellido} — {u.correo}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="number" min="1" className="form-control" placeholder="ID del usuario dueño" value={form.duenoId} onChange={campo('duenoId')} />
                  )}
                </div>

                <div className="col-12 text-end">
                  {editandoId !== null && (
                    <button type="button" className="btn btn-outline-secondary me-2" onClick={limpiarForm}>Cancelar</button>
                  )}
                  <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={guardando}>
                    {guardando ? 'Guardando...' : editandoId !== null ? 'Actualizar Ficha' : 'Guardar Ficha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h4>{esDueno ? 'Mis mascotas registradas' : 'Pacientes Registrados'}</h4>
        <div className="row">
          {cargando && (
            <p className="text-muted">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>Cargando mascotas...
            </p>
          )}
          {!cargando && mascotas.length === 0 && !error && (
            <p className="text-muted fst-italic">
              {esDueno ? 'Aún no has registrado mascotas. Usa el formulario de arriba para agregar la primera.' : 'No hay pacientes registrados.'}
            </p>
          )}
          {mascotas.map((m) => (
            <FichaMascota
              key={m.id}
              mascota={m}
              nombreDueno={nombreDueno(m)}
              usuario={usuario}
              puedeEditar={puedeEditarMascota(m)}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      </div>
    </>
  );
}