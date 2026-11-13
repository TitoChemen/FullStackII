import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login, sesionExpirada } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const manejarLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMensajeValidacion('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMensajeValidacion('Ingresa un correo electrónico válido.');
      return;
    }

    setCargando(true);
    setMensajeValidacion('');
    try {
      const usuario = await login(email, password);
      const destinoPorRol = usuario.rol === ROLES.DUENO ? '/fichas' : '/admin';
      navigate(ubicacion.state?.desde || destinoPorRol, { replace: true });
    } catch (err) {
      setMensajeValidacion(
        err.status === 401 || err.status === 403
          ? 'Correo o contraseña incorrectos, o la cuenta está desactivada.'
          : err.message
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div className="franja-marca text-center py-2 bg-dark text-light small">
        Sistema interno · Veterinaria San Marcos — Rancagua, Región de O'Higgins
      </div>

      <div className="container my-4" style={{ maxWidth: '520px' }}>
        <Link to="/" className="btn btn-outline-warning btn-sm fw-bold mb-3">
          <i className="bi bi-arrow-left me-1"></i> Volver a la página principal
        </Link>

        <div className="card card-auth p-4 p-sm-5 shadow">
          <div className="icono-auth text-center fs-1 text-warning mb-2"><i className="bi bi-person-check"></i></div>
          <h1 className="h3 text-center mb-1">
            <span className="marca">Veterinaria San Marcos</span>
          </h1>
          <p className="text-center text-muted mb-4">Ingresa con tu cuenta para continuar</p>

          <form id="formLogin" noValidate onSubmit={manejarLogin}>
            <div className="mb-3">
              <label className="form-label"><i className="bi bi-envelope me-1"></i> Correo electrónico</label>
              <input 
                type="email" 
                className="form-control" 
                id="loginEmail" 
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label"><i className="bi bi-lock me-1"></i> Contraseña</label>
              <input 
                type="password" 
                className="form-control" 
                id="loginPass" 
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {sesionExpirada && !mensajeValidacion && (
              <div className="alert alert-warning mt-2" role="alert">
                Tu sesión expiró. Inicia sesión nuevamente.
              </div>
            )}

            {mensajeValidacion && (
              <div className="alert alert-danger mt-2" role="alert">
                {mensajeValidacion}
              </div>
            )}

            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={cargando}>
                <i className="bi bi-box-arrow-in-right me-1"></i> {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
              <Link to="/registro" className="btn btn-outline-secondary">
                <i className="bi bi-person-plus me-1"></i> Crear una cuenta
              </Link>
            </div>
          </form>

        </div>
      </div>

      <footer className="pie-sanmarcos text-center py-4 mt-4 text-muted small">
        © 2026 Veterinaria San Marcos — Todos los derechos reservados
      </footer>
    </>
  );
}