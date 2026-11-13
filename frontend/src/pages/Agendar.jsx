import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getServicios } from '../services/catalogo';
import { listarMascotas, listarMisMascotas, crearCita } from '../services/apiService';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../context/AuthContext';
import { ROLES, aFormatoJava, fechaHoy } from '../utils';

const formatoCLP = (n) => `$${(n || 0).toLocaleString('es-CL')}`;
const DURACION_MIN = 30; // cada servicio reserva un bloque de 30 minutos
const HORA_APERTURA = '09:00';
const HORA_CIERRE = '19:00';

export default function Agendar() {
  const [servicios] = useState(() => getServicios());
  const [categoria, setCategoria] = useState('Todos');
  const [verCarrito, setVerCarrito] = useState(false);
  const [aviso, setAviso] = useState('');
  const [mascotaId, setMascotaId] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [errorCita, setErrorCita] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [citasCreadas, setCitasCreadas] = useState([]);
  const [misMascotas, setMisMascotas] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  const [hoy] = useState(() => fechaHoy());

  const { usuario, autenticado } = useAuth();
  const puedeAgendar = [ROLES.DUENO, ROLES.ADMIN, ROLES.RECEPCION].includes(usuario?.rol);
  const esDueno = usuario?.rol === ROLES.DUENO;

  const {
    carrito = [],
    agregar = () => {},
    cambiarCantidad = () => {},
    eliminar = () => {},
    vaciar = () => {},
    cantidadTotal = 0,
    total = 0,
  } = useCarrito();

  const categorias = ['Todos', ...new Set((servicios || []).map((s) => s.categoria).filter(Boolean))];
  const visibles = categoria === 'Todos' ? (servicios || []) : (servicios || []).filter((s) => s.categoria === categoria);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  useEffect(() => {
    if (!verCarrito) return;
    const onKey = (e) => e.key === 'Escape' && setVerCarrito(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [verCarrito]);

  // Mascotas reales desde el backend (dueño: las suyas; personal: todas)
  useEffect(() => {
    if (!puedeAgendar) return undefined;
    let activo = true;
    setCargandoMascotas(true);
    (esDueno ? listarMisMascotas() : listarMascotas())
      .then((datos) => activo && setMisMascotas(datos || []))
      .catch((err) => activo && setErrorCita(err.message))
      .finally(() => activo && setCargandoMascotas(false));
    return () => {
      activo = false;
    };
  }, [puedeAgendar, esDueno]);

  const handleSolicitarCitas = async () => {
    setErrorCita('');
    if (!mascotaId || !fechaCita || !horaCita) {
      setErrorCita('Selecciona la mascota, la fecha y la hora.');
      return;
    }
    if (horaCita < HORA_APERTURA || horaCita > HORA_CIERRE) {
      setErrorCita(`El horario de atención es de ${HORA_APERTURA} a ${HORA_CIERRE}.`);
      return;
    }

    // Una cita por cada servicio (y por cada unidad), una a continuación de la otra.
    const motivos = carrito.flatMap((item) => Array(item.cantidad).fill(item.nombre));
    const inicioBase = new Date(`${fechaCita}T${horaCita}:00`);
    if (Number.isNaN(inicioBase.getTime()) || inicioBase <= new Date()) {
      setErrorCita('La fecha y hora de la cita deben ser futuras.');
      return;
    }
    const finUltima = new Date(inicioBase.getTime() + motivos.length * DURACION_MIN * 60000);
    const cierre = new Date(`${fechaCita}T${HORA_CIERRE}:00`);
    if (finUltima > cierre) {
      setErrorCita(`Con ${motivos.length} servicio(s) la atención terminaría después de las ${HORA_CIERRE}. Elige una hora más temprana.`);
      return;
    }

    setEnviando(true);
    const creadas = [];
    try {
      for (let i = 0; i < motivos.length; i += 1) {
        const inicio = new Date(inicioBase.getTime() + i * DURACION_MIN * 60000);
        const fin = new Date(inicio.getTime() + DURACION_MIN * 60000);
        const cita = await crearCita({
          mascotaId: Number(mascotaId),
          fechaHoraInicio: aFormatoJava(inicio),
          fechaHoraFin: aFormatoJava(fin),
          motivo: motivos[i],
        });
        creadas.push(cita);
      }
      vaciar();
      setMascotaId('');
      setFechaCita('');
      setHoraCita('');
      setVerCarrito(false);
      setCitasCreadas(creadas);
      setAviso('¡Solicitud enviada! La clínica confirmará tu hora.');
    } catch (err) {
      // Si algunas citas ya se guardaron, se informa cuáles.
      setCitasCreadas(creadas);
      setErrorCita(
        `${err.message}${creadas.length ? ` (se alcanzaron a registrar ${creadas.length} cita(s) antes del error)` : ''}`
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleAgregar = (servicio) => {
    agregar(servicio);
    setAviso(`¡"${servicio.nombre}" se agregó a tus citas!`);
  };

  return (
    <Layout>
      <div className="container my-5">
        <div className="text-center mb-4">
          <h1 className="display-6 fw-bold text-warning">Nuestros servicios médicos y estética</h1>
          <p className="lead">Elige el servicio que necesita tu mascota y agenda una hora.</p>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex gap-2 filtros-catalogo flex-wrap" role="group" aria-label="Filtrar por categoría">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                className={`btn btn-sm ${categoria === c ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                onClick={() => setCategoria(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-outline-warning position-relative" onClick={() => setVerCarrito(true)}>
            <i className="bi bi-calendar-check me-1"></i> Mis citas
            <span className="badge rounded-pill bg-danger ms-2">{cantidadTotal}</span>
          </button>
        </div>

        <div className="row">
          {visibles.map((s) => (
            <div key={s.id || s.nombre} className="col-12 col-sm-6 col-lg-4 mb-4">
              <div className="card h-100 shadow">
                {s.imagen && <img src={s.imagen} className="card-img-top" alt={s.nombre} style={{ height: 200, objectFit: 'cover' }} />}
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-warning text-dark align-self-start mb-2">{s.categoria}</span>
                  <h5 className="card-title text-warning fw-bold">{s.nombre}</h5>
                  <p className="card-text text-muted flex-grow-1">{s.descripcion}</p>
                  <p className="fw-bold fs-5 mb-0">{formatoCLP(s.precio)}</p>
                </div>
                <div className="card-footer bg-transparent border-top-0 d-grid">
                  <button type="button" className="btn btn-warning text-dark fw-bold" onClick={() => handleAgregar(s)}>
                    <i className="bi bi-calendar-plus me-1"></i> Agendar hora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {citasCreadas.length > 0 && (
        <div className="container mb-5">
          <div className="alert alert-success">
            <h6 className="fw-bold mb-2"><i className="bi bi-check-circle-fill me-1"></i> Citas registradas en el sistema</h6>
            <ul className="mb-0">
              {citasCreadas.map((c) => (
                <li key={c.id}>
                  Cita #{c.id} — {c.motivo} — {new Date(c.fechaHoraInicio).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })} — <strong>{c.estado}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {aviso && (
        <div className="alert alert-success position-fixed bottom-0 end-0 m-3 shadow-lg d-flex align-items-center gap-2" role="status" style={{ zIndex: 2000 }}>
          <i className="bi bi-check-circle-fill"></i> {aviso}
        </div>
      )}

      {verCarrito && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="titulo-carrito" onClick={() => setVerCarrito(false)}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-warning" id="titulo-carrito">
                    <i className="bi bi-calendar-check me-1"></i> Mis citas solicitadas
                  </h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={() => setVerCarrito(false)}></button>
                </div>
                <div className="modal-body">
                  {carrito.length === 0 ? (
                    <p className="text-center text-muted py-4 mb-0">Aún no has agregado servicios. Elige uno del catálogo para empezar.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th className="text-center">Cantidad</th>
                            <th>Subtotal</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {carrito.map((item) => (
                            <tr key={item.id}>
                              <td>
                                {item.imagen && <img src={item.imagen} alt="" width="40" height="40" className="me-2 rounded" style={{ objectFit: 'cover' }} />}
                                {item.nombre}
                              </td>
                              <td>{formatoCLP(item.precio)}</td>
                              <td className="text-center text-nowrap">
                                <button type="button" className="btn btn-outline-warning btn-sm" aria-label={`Quitar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, -1)}>
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="mx-2">{item.cantidad}</span>
                                <button type="button" className="btn btn-outline-warning btn-sm" aria-label={`Agregar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, 1)}>
                                  <i className="bi bi-plus"></i>
                                </button>
                              </td>
                              <td>{formatoCLP(item.precio * item.cantidad)}</td>
                              <td>
                                <button type="button" className="btn btn-outline-danger btn-sm" aria-label={`Eliminar ${item.nombre}`} onClick={() => eliminar(item.id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="text-end fw-bold fs-5">Total: {formatoCLP(total)}</div>

                  {carrito.length > 0 && (
                    <div className="border-top mt-3 pt-3">
                      {!autenticado ? (
                        <p className="mb-0 text-center">
                          Para solicitar tu hora, <Link to="/login" className="fw-bold text-warning">inicia sesión</Link> o{' '}
                          <Link to="/registro" className="fw-bold text-warning">crea tu cuenta</Link> como dueño de mascota.
                        </p>
                      ) : !puedeAgendar ? (
                        <p className="mb-0 text-center text-muted">
                          Tu rol ({usuario.rol}) no solicita citas desde esta pantalla.
                        </p>
                      ) : cargandoMascotas ? (
                        <p className="mb-0 text-center text-muted">Cargando mascotas...</p>
                      ) : misMascotas.length === 0 ? (
                        <p className="mb-0 text-center">
                          {esDueno ? 'Aún no tienes mascotas registradas. ' : 'No hay mascotas registradas. '}
                          <Link to="/fichas" className="fw-bold text-warning">Registra una mascota</Link> para poder agendar.
                        </p>
                      ) : (
                        <div className="row g-2">
                          <div className="col-md-4">
                            <select className="form-select" value={mascotaId} onChange={(e) => setMascotaId(e.target.value)}>
                              <option value="">Selecciona la mascota...</option>
                              {misMascotas.map((m) => (
                                <option key={m.id} value={m.id}>{m.nombre} ({m.especie}){!esDueno ? ` · dueño #${m.duenoId}` : ''}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-4">
                            <input type="date" className="form-control" min={hoy} value={fechaCita} onChange={(e) => setFechaCita(e.target.value)} />
                          </div>
                          <div className="col-md-4">
                            <input type="time" className="form-control" min={HORA_APERTURA} max={HORA_CIERRE} value={horaCita} onChange={(e) => setHoraCita(e.target.value)} />
                          </div>
                        </div>
                      )}
                      {errorCita && <div className="text-danger small mt-2" role="alert">{errorCita}</div>}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={vaciar} disabled={carrito.length === 0}>
                    Vaciar lista
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVerCarrito(false)}>
                    Cerrar
                  </button>
                  {puedeAgendar && misMascotas.length > 0 && (
                    <button type="button" className="btn btn-warning text-dark fw-bold btn-sm" onClick={handleSolicitarCitas} disabled={carrito.length === 0 || enviando}>
                      <i className="bi bi-send me-1"></i> {enviando ? 'Enviando...' : 'Solicitar hora'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </Layout>
  );
}