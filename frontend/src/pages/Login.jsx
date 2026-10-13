import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService'; // Asegúrate de importar tu servicio

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const navigate = useNavigate();

  const manejarLogin = (e) => {
  e.preventDefault();
  if (!email || !password) {
    setMensajeValidacion('Por favor, ingresa tu correo y contraseña.');
    return;
  }

  // Detectar el rol exacto según el correo ingresado
  let rolAsignado = 'DUEÑO';
  let nombreUsuario = email.split('@')[0];

  if (email.includes('admin')) {
    rolAsignado = 'ADMINISTRADOR';
    nombreUsuario = 'Administrador';
  } else if (email.includes('recepcion')) {
    rolAsignado = 'RECEPCIONISTA';
    nombreUsuario = 'Recepcionista';
  } else if (email.includes('veterinario')) {
    rolAsignado = 'VETERINARIO';
    nombreUsuario = 'Dr. Veterinario';
  }

  const usuarioSimulado = {
    nombre: nombreUsuario,
    email: email,
    rol: rolAsignado
  };

  localStorage.setItem('usuario_logueado', JSON.stringify(usuarioSimulado));
  setMensajeValidacion('');

  // Redirigir según el rol
  if (rolAsignado === 'VETERINARIO') {
    navigate('/fichas');
  } else {
    navigate('/admin');
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
                placeholder="nombre@sanmarcos.cl"
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

            {mensajeValidacion && (
              <div className="alert alert-danger mt-2" role="alert">
                {mensajeValidacion}
              </div>
            )}

            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-warning text-dark fw-bold">
                <i className="bi bi-box-arrow-in-right me-1"></i> Ingresar
              </button>
              <Link to="/registro" className="btn btn-outline-secondary">
                <i className="bi bi-person-plus me-1"></i> Crear una cuenta
              </Link>
            </div>
          </form>

          <hr className="my-4" />
          <p className="form-text-ayuda mb-1 small text-muted"><strong>Cuentas de demostración</strong>:</p>
          <ul className="form-text-ayuda mb-0 small text-muted">
            <li>Administrador — admin@sanmarcos.cl / Admin2026</li>
            <li>Recepcionista — recepcion@sanmarcos.cl / Recepcion2026</li>
            <li>Veterinario — veterinario@sanmarcos.cl / Vet2026a</li>
          </ul>
        </div>
      </div>

      <footer className="pie-sanmarcos text-center py-4 mt-4 text-muted small">
        © 2026 Veterinaria San Marcos — Todos los derechos reservados
      </footer>
    </>
  );
}