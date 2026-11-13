import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrar } from '../services/apiService';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setExito('');

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password || !passwordConfirm) {
      setMensajeValidacion('Por favor, completa todos los campos.');
      return;
    }
    if (nombre.trim().length > 100 || apellido.trim().length > 100) {
      setMensajeValidacion('El nombre y el apellido no pueden superar los 100 caracteres.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMensajeValidacion('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 8 || password.length > 72) {
      setMensajeValidacion('La contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }
    if (password !== passwordConfirm) {
      setMensajeValidacion('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    setMensajeValidacion('');
    try {
      // El rol NO se envía: el backend asigna DUENO_MASCOTA a las cuentas nuevas.
      await registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: email.trim(),
        contrasena: password,
      });
      setExito('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMensajeValidacion(
        err.status === 409 ? 'Ya existe una cuenta registrada con ese correo.' : err.message
      );
    } finally {
      setCargando(false);
    }
  };

  const resetearRegistro = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setMensajeValidacion('');
    setExito('');
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
            Cuenta para dueños de mascotas. El personal de la clínica recibe su acceso del administrador.
          </p>

          <form id="formularioRegistro" noValidate onSubmit={manejarRegistro}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="bi bi-person me-1"></i> Nombre
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="regNombre"
                  placeholder="Ej: Juan"
                  maxLength={100}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="bi bi-person me-1"></i> Apellido
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="regApellido"
                  placeholder="Ej: Pérez"
                  maxLength={100}
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
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

            {exito && (
              <div className="alert alert-success mt-2" role="status">
                {exito}
              </div>
            )}

            {mensajeValidacion && (
              <div className="alert alert-danger mt-2" role="alert">
                {mensajeValidacion}
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-warning text-dark fw-bold w-100" disabled={cargando}>
                <i className="bi bi-check-circle me-1"></i> {cargando ? 'Registrando...' : 'Registrarse'}
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