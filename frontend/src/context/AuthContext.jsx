import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { configurarHttp } from '../services/http';
import * as api from '../services/apiService';

// La sesión guarda SOLO el token JWT y los datos públicos del usuario (id, nombre, rol...).
// Nunca contraseñas ni datos de negocio.
const CLAVE_SESION = 'sanmarcos_sesion';

const AuthContext = createContext(null);

// Lee la fecha de expiración (claim "exp", en segundos) del JWT.
const expiracionDelToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(decodeURIComponent(escape(atob(payload))));
    return json.exp ? json.exp * 1000 : null;
  } catch {
    return null;
  }
};

const leerSesion = () => {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE_SESION));
    if (!guardada?.token || !guardada?.usuario) return null;
    const exp = guardada.expira ?? expiracionDelToken(guardada.token);
    if (exp && exp <= Date.now()) {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
    return { ...guardada, expira: exp };
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [sesionExpirada, setSesionExpirada] = useState(false);
  const sesionRef = useRef(sesion);

  useEffect(() => {
    sesionRef.current = sesion;
  }, [sesion]);

  const logout = useCallback((porExpiracion = false) => {
    sessionStorage.removeItem(CLAVE_SESION);
    sesionRef.current = null;
    setSesion(null);
    setSesionExpirada(porExpiracion === true);
  }, []);

  // El cliente HTTP lee el token actual y nos avisa cuando el backend responde 401.
  useEffect(() => {
    configurarHttp({
      getToken: () => sesionRef.current?.token || null,
      onUnauthorized: () => logout(true),
    });
  }, [logout]);

  // Cierra la sesión automáticamente cuando vence el token.
  useEffect(() => {
    if (!sesion?.expira) return undefined;
    const restante = sesion.expira - Date.now();
    if (restante <= 0) {
      logout(true);
      return undefined;
    }
    const t = setTimeout(() => logout(true), Math.min(restante, 2147483647));
    return () => clearTimeout(t);
  }, [sesion, logout]);

  const login = useCallback(async (correo, contrasena) => {
    const resp = await api.login(correo.trim(), contrasena);
    const nueva = {
      token: resp.accessToken,
      usuario: resp.usuario,
      expira: expiracionDelToken(resp.accessToken) ?? Date.now() + (resp.expiresIn || 1800) * 1000,
    };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
    sesionRef.current = nueva;
    setSesion(nueva);
    setSesionExpirada(false);
    return resp.usuario;
  }, []);

  const valor = useMemo(
    () => ({
      usuario: sesion?.usuario || null,
      token: sesion?.token || null,
      autenticado: !!sesion,
      sesionExpirada,
      nombreCompleto: sesion?.usuario
        ? `${sesion.usuario.nombre} ${sesion.usuario.apellido || ''}`.trim()
        : '',
      login,
      logout,
    }),
    [sesion, sesionExpirada, login, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};