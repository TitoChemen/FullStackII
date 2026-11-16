import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils';

// Protege una ruta según sesión y rol. Es solo mejora de interfaz:
// la autorización definitiva la hace el backend.
export default function RutaProtegida({ roles, children }) {
  const { autenticado, usuario } = useAuth();
  const ubicacion = useLocation();

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    const destino = usuario.rol === ROLES.DUENO ? '/fichas' : '/admin';
    return <Navigate to={destino} replace />;
  }

  return children;
}