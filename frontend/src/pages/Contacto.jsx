import React, { useState } from 'react';
import { Layout } from '../components/Layout';

const FORM_INICIAL = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };
const CLAVE_CONTACTOS = 'sanmarcos_contactos';
const DOMINIOS_VALIDOS = ['@duoc.cl', '@gmail.com'];

const validar = (f) => {
  const e = {};
  if (!f.nombre.trim()) e.nombre = 'Ingresa tu nombre completo.';
  if (!f.email.trim()) {
    e.email = 'Ingresa tu correo electrónico.';
  } else if (!DOMINIOS_VALIDOS.some((d) => f.email.trim().toLowerCase().endsWith(d))) {
    e.email = 'El correo debe terminar en @duoc.cl o @gmail.com.';
  }
  if (!f.telefono.trim()) e.telefono = 'Ingresa tu teléfono.';
  if (!f.asunto) e.asunto = 'Selecciona un motivo.';
  return e;
};

export default function Contacto() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setEnviado(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevos = validar(form);
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      setEnviado(false);
      return;
    }
    try {
      const previos = JSON.parse(localStorage.getItem(CLAVE_CONTACTOS)) || [];
      localStorage.setItem(CLAVE_CONTACTOS, JSON.stringify([...previos, { ...form, fecha: new Date().toISOString() }]));
    } catch {
      // Fallback
    }
    setForm(FORM_INICIAL);
    setEnviado(true);
  };

  const limpiar = () => {
    setForm(FORM_INICIAL);
    setErrores({});
    setEnviado(false);
  };

  const clase = (campo) => `form-control${errores[campo] ? ' is-invalid' : ''}`;

  return (
    <Layout>
      <section className="container py-5">
        <div className="mb-4">
          <h2 className="text-warning">
            <i className="bi bi-chat-heart me-2"></i>Formulario de contacto
          </h2>
          <p className="text-muted">Completa los datos y te responderemos a la brevedad.</p>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-8">
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label"><i className="bi bi-person me-1"></i> Nombre completo</label>
                <input id="nombre" name="nombre" type="text" className={clase('nombre')} placeholder="Ej: María González" value={form.nombre} onChange={handleChange} />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label"><i className="bi bi-envelope me-1"></i> Correo electrónico</label>
                <input id="email" name="email" type="email" className={clase('email')} placeholder="correo@gmail.com" value={form.email} onChange={handleChange} />
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="telefono" className="form-label"><i className="bi bi-phone me-1"></i> Teléfono</label>
                <input id="telefono" name="telefono" type="tel" className={clase('telefono')} placeholder="+56 9 1234 5678" value={form.telefono} onChange={handleChange} />
                {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="asunto" className="form-label"><i className="bi bi-tag me-1"></i> Asunto</label>
                <select id="asunto" name="asunto" className={`form-select${errores.asunto ? ' is-invalid' : ''}`} value={form.asunto} onChange={handleChange}>
                  <option value="">Selecciona un motivo</option>
                  <option value="consulta">Consulta general</option>
                  <option value="urgencia">Urgencias</option>
                  <option value="especialidad">Especialidades médicas</option>
                </select>
                {errores.asunto && <div className="invalid-feedback">{errores.asunto}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="mensaje" className="form-label"><i className="bi bi-chat-dots me-1"></i> Mensaje (opcional)</label>
                <textarea id="mensaje" name="mensaje" rows="4" className="form-control" placeholder="Escribe tu mensaje aquí..." value={form.mensaje} onChange={handleChange}></textarea>
              </div>

              {Object.keys(errores).length > 0 && (
                <div className="alert alert-danger" role="alert">
                  Revisa los campos marcados en rojo antes de enviar.
                </div>
              )}
              {enviado && (
                <div className="alert alert-success" role="status">
                  <i className="bi bi-check-circle-fill me-1"></i> ¡Mensaje enviado! Te responderemos a la brevedad.
                </div>
              )}

              <div className="d-flex flex-wrap gap-3">
                <button type="submit" className="btn btn-warning text-dark fw-bold px-4">
                  <i className="bi bi-send me-1"></i> Enviar
                </button>
                <button type="button" className="btn btn-secondary" onClick={limpiar}>
                  <i className="bi bi-eraser me-1"></i> Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="col-12 col-md-4">
            <div className="contact-info mb-3">
              <h5><i className="bi bi-geo-alt text-warning me-1"></i> Dirección</h5>
              <p className="mb-0">Av. República de Chile 0984<br />Rancagua, O'Higgins</p>
            </div>
            <div className="contact-info mb-3">
              <h5><i className="bi bi-telephone text-warning me-1"></i> Teléfono</h5>
              <p className="mb-0">+56 2 2345 6788</p>
            </div>
            <div className="contact-info mb-3">
              <h5><i className="bi bi-envelope text-warning me-1"></i> Email</h5>
              <p className="mb-0">contacto@sanmarcos.cl</p>
            </div>
            <iframe
              className="mapa-iframe shadow-sm rounded w-100"
              style={{ height: '200px', border: 0 }}
              title="Ubicación de Veterinaria San Marcos en Rancagua"
              loading="lazy"
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d1650.8531888222565!2d-70.74701634870554!3d-34.15385341829882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sRancagua%20Av.%20Republica%20de%20Chile!5e0!3m2!1ses!2scl!4v1788452209910!5m2!1ses!2scl"
            ></iframe>
          </div>
        </div>
      </section>
    </Layout>
  );
}