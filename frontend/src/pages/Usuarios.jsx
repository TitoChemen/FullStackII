import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import apiService from '../services/apiService'; 

const Usuarios = () => {
  // Estado para guardar la lista de usuarios que viene del LocalStorage
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. VALIDACIÓN DE RESTRICCIONES (RBAC)
    // Suponiendo que tu apiService tiene un método para obtener al usuario logueado
    const usuarioActual = apiService.obtenerUsuarioLogueado();

    // Si no hay usuario o no es administrador, lo mandamos pa' fuera (al login o al home)
    if (!usuarioActual || usuarioActual.rol !== 'admin') {
      alert("Acceso denegado. No tienes permisos para ver esta página.");
      navigate('/home'); 
      return; 
    }

    // 2. CONECTAR EL CRUD (Lectura inicial)
    // Si pasa la validación, cargamos los usuarios desde el LocalStorage
    const cargarDatos = () => {
      const datos = apiService.obtenerUsuarios(); 
      setListaUsuarios(datos || []);
    };

    cargarDatos();
  }, [navigate]);

  // 3. FUNCIÓN PARA EL BOTÓN "Cambiar rol de usuario"
  const handleCambiarRol = (idUsuario, nuevoRol) => {
    // Llamamos al apiService para que guarde el cambio en el LocalStorage
    const actualizado = apiService.actualizarRolUsuario(idUsuario, nuevoRol);

    if (actualizado) {
      // Actualizamos el estado de React para que la tabla se refresque en tiempo real 
      // sin necesidad de recargar la página (F3)
      setListaUsuarios(usuariosPrevios => 
        usuariosPrevios.map(user => 
          user.id === idUsuario ? { ...user, rol: nuevoRol } : user
        )
      );
      alert("¡Rol actualizado con éxito!");
    } else {
      alert("Hubo un error al actualizar el rol.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>
      <p>Panel de control de roles.</p>

      {/* Aquí pasas tu tabla de usuarios.html a JSX */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaUsuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
              <td>
                {/* Botón de ejemplo para cambiar rol a Veterinario */}
                <button 
                  className="btn btn-warning btn-sm"
                  onClick={() => handleCambiarRol(usuario.id, 'veterinario')}
                  disabled={usuario.rol === 'veterinario'}
                >
                  Hacer Veterinario
                </button>
                
                {/* Puedes agregar más botones según los roles que manejen */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;