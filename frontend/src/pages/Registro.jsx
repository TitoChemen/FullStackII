import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const navigate = useNavigate();

  const manejarRegistro = (e) => {
    e.preventDefault();

    if (!nombre || !rut || !email || !rol || !password || !passwordConfirm) {
      setMensajeValidacion('Por favor, completa todos los campos.');
      return;
    }

    if (password !== passwordConfirm) {
      setMensajeValidacion('Las contraseñas no coinciden.');
      return;
    }

    setMensajeValidacion('');
    alert("¡Registro exitoso! Redirigiendo al inicio de sesión...");
    navigate('/login');
  };

  const resetearRegistro = () => {
    setNombre('');
    setRut('');
    setEmail('');
    setRol('');
    setPassword('');
    setPasswordConfirm('');
    setMensajeValidacion('');
  };

  return (
    <>
      <div className="franja-marca text-center py-2 bg-dark text-light small">
        Sistema interno · Veterinaria San Marcos — Rancagua, Región de O'Higgins
      </div>

      <div className="container my-4" style={{ maxWidth: '650px' }}>
        <Link to="/" className="btn btn-outline-warning btn-sm fw-bold mb-3">
          <i className="bi bi-arrow-left me-1"></i> Volver a la página principal
        </Link>

        <div className="card card-auth p-4 p-sm-5 shadow">
          <div className="icono-auth text-center fs-1 text-warning mb-2">
            <i className="bi bi-person-plus-fill"></i>
          </div>

          <h1 className="h3 text-center mb-1">
            <span className="marca">Crear cuenta</span>
          </h1>

          <p className="text-center text-muted mb-4">
            Para dueños de mascotas y personal de la clínica
          </p>

          <form id="formularioRegistro" noValidate onSubmit={manejarRegistro}>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label">
                  <i className="bi bi-person me-1"></i> Nombre completo
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="regNombre"
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  <i className="bi bi-card-heading me-1"></i> RUT
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="regRut"
                  placeholder="12345678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-envelope me-1"></i> Correo electrónico
              </label>
              <input
                type="email"
                className="form-control"
                id="regEmail"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-person-badge me-1"></i> Tipo de usuario
              </label>
              <select 
                className="form-select" 
                id="regRol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="">Selecciona un tipo de usuario</option>
                <option value="DUENO">Dueño de mascota</option>
                <option value="RECEPCIONISTA">Recepcionista / Operador</option>
                <option value="VETERINARIO">Médico veterinario</option>
              </select>
              <div className="form-text mt-1 small">
                Las cuentas de Administrador no se autorregistran: las crea otro administrador desde el panel interno.
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="bi bi-lock me-1"></i> Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="regPass"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="bi bi-shield-lock me-1"></i> Confirmar contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="regPassConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>

            {mensajeValidacion && (
              <div className="alert alert-danger mt-2" role="alert">
                {mensajeValidacion}
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-warning text-dark fw-bold w-100">
                <i className="bi bi-check-circle me-1"></i> Registrarse
              </button>
              <button type="button" className="btn btn-outline-secondary w-100" onClick={resetearRegistro}>
                <i className="bi bi-eraser me-1"></i> Limpiar
              </button>
            </div>
          </form>

          <hr className="my-4" />
          <div className="text-center">
            <span className="small text-muted me-2">¿Ya tienes una cuenta?</span>
            <Link to="/login" className="small fw-bold text-warning">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
    </>
  );
}