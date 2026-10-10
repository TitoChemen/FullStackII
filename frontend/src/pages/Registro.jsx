import React, { useState } from 'react';
// Nota: Si usas React Router, recuerda cambiar los <a href="..."> por <Link to="...">

const Registro = () => {
  // Estados para cada campo del formulario
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mensajeValidacion, setMensajeValidacion] = useState(''); // Para mostrar errores

  const manejarRegistro = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Validación básica de ejemplo
    if (!nombre || !rut || !email || !rol || !password || !passwordConfirm) {
      setMensajeValidacion('Por favor, completa todos los campos.');
      return;
    }

    if (password !== passwordConfirm) {
      setMensajeValidacion('Las contraseñas no coinciden.');
      return;
    }

    setMensajeValidacion(''); // Limpiar errores si todo está bien
    console.log('Enviando datos de registro:', { nombre, rut, email, rol, password });

    // Aquí puedes conectar con tu base de datos o API (fetch/axios)
  };

  const resetearRegistro = () => {
    // Esta función reemplaza el comportamiento del botón "Limpiar"
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
      <div className="franja-marca text-center">
        Sistema interno · Veterinaria San Marcos — Rancagua, Región de O'Higgins
      </div>

      <div className="container">
        <div className="card card-auth p-4 p-sm-5">
          <div className="icono-auth">
            <i className="bi bi-person-plus-fill"></i>
          </div>

          <h1 className="h3 text-center mb-1">
            <i className="material-icons align-middle">pets</i>
            <span className="marca">Crear cuenta</span>
          </h1>

          <p className="text-center text-muted mb-4">
            Para dueños de mascotas y personal de la clínica
          </p>

          <form id="formularioRegistro" noValidate onSubmit={manejarRegistro}>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label">
                  <i className="bi bi-person"></i> Nombre completo
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
                  <i className="bi bi-card-heading"></i> RUT
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
                <i className="bi bi-envelope"></i> Correo electrónico
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
                <i className="bi bi-person-badge"></i> Tipo de usuario
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
              <div className="form-text-ayuda mt-1">
                Las cuentas de Administrador no se autorregistran: las crea otro administrador desde el panel interno.
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="bi bi-lock"></i> Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="regPass"
                  placeholder="Mínimo 8, letras y números"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="bi bi-shield-lock"></i> Confirmar contraseña
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

            {/* Espacio para mostrar mensajes de error de validación */}
            {mensajeValidacion && (
              <div className="alert alert-danger mt-2" role="alert">
                {mensajeValidacion}
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button type="submit" className="btn btn-primario">
                <i className="bi bi-check-lg"></i> Registrarse
              </button>
              
              <button
                type="button"
                className="btn btn-secundario"
                onClick={resetearRegistro}
              >
                <i className="bi bi-eraser"></i> Limpiar
              </button>
            </div>

            <p className="text-center mt-4 mb-0">
              ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
            </p>
          </form>
        </div>
      </div>

      <footer className="pie-sanmarcos text-center py-4 mt-4">
        © 2026 Veterinaria San Marcos — Todos los derechos reservados
      </footer>
    </>
  );
};

export default Registro;