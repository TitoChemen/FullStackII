import React, { useState } from 'react';
// Nota: Si usas React Router, descomenta la siguiente línea y cambia las etiquetas <a> por <Link to="...">
// import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeValidacion, setMensajeValidacion] = useState(''); // Para reemplazar el div #resultado-validacion

  const manejarLogin = (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    
    // Ejemplo de validación básica
    if (!email || !password) {
      setMensajeValidacion('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setMensajeValidacion('');
    console.log('Intentando iniciar sesión con:', { email, password });
    
    // Aquí puedes conectar tu fetch o axios hacia tu backend
  };

  return (
    <>
      <div className="franja-marca text-center">
        Sistema interno · Veterinaria San Marcos — Rancagua, Región de O'Higgins
      </div>

      <div className="container my-4" style={{ maxWidth: '520px' }}>
        {/* Botón de escape al Inicio */}
        <a href="/" className="btn btn-outline-warning btn-sm fw-bold mb-3">
          <i className="bi bi-arrow-left"></i> Volver a la página principal
        </a>

        <div className="card card-auth p-4 p-sm-5">
          <div className="icono-auth"><i className="bi bi-person-check"></i></div>
          <h1 className="h3 text-center mb-1">
            <i className="material-icons align-middle">pets</i>
            <span className="marca">Veterinaria San Marcos</span>
          </h1>
          <p className="text-center text-muted mb-4">Ingresa con tu cuenta para continuar</p>

          <form id="formLogin" noValidate onSubmit={manejarLogin}>
            <div className="mb-3">
              <label className="form-label"><i className="bi bi-envelope"></i> Correo electrónico</label>
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
              <label className="form-label"><i className="bi bi-lock"></i> Contraseña</label>
              <input 
                type="password" 
                className="form-control" 
                id="loginPass" 
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Reemplazo del div vacío original para mostrar validaciones en React */}
            {mensajeValidacion && (
              <div className="alert alert-danger mt-2" role="alert">
                {mensajeValidacion}
              </div>
            )}

            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-primario">
                <i className="bi bi-box-arrow-in-right"></i> Ingresar
              </button>
              <a href="/registro" className="btn btn-secundario">
                <i className="bi bi-person-plus"></i> Crear una cuenta
              </a>
            </div>
          </form>

          <hr className="my-4" />
          <p className="form-text-ayuda mb-1"><strong>Cuentas de demostración</strong> (etapa de maquetación):</p>
          <ul className="form-text-ayuda mb-0">
            <li>Administrador — admin@sanmarcos.cl / Admin2026</li>
            <li>Recepcionista — recepcion@sanmarcos.cl / Recepcion2026</li>
            <li>Veterinario — veterinario@sanmarcos.cl / Vet2026a</li>
          </ul>
        </div>
      </div>

      <footer className="pie-sanmarcos text-center py-4 mt-4">
        © 2026 Veterinaria San Marcos — Todos los derechos reservados
      </footer>
    </>
  );
};

export default Login;