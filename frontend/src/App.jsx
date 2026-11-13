import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Agendar from './pages/Agendar';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Admin from './pages/Admin';
import Fichas from './pages/Fichas';
import Usuarios from './pages/Usuarios';
import RutaProtegida from './components/RutaProtegida';
import { ROLES } from './utils';

import './estilos.css'

const PERSONAL = [ROLES.ADMIN, ROLES.RECEPCION, ROLES.VET];

export function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Protegidas (la autorización definitiva la hace el backend) */}
        <Route
          path="/agendar"
          element={<Agendar />}
        />
        <Route
          path="/admin"
          element={<RutaProtegida roles={PERSONAL}><Admin /></RutaProtegida>}
        />
        <Route
          path="/fichas"
          element={<RutaProtegida roles={[...PERSONAL, ROLES.DUENO]}><Fichas /></RutaProtegida>}
        />
        <Route
          path="/usuarios"
          element={<RutaProtegida roles={[ROLES.ADMIN]}><Usuarios /></RutaProtegida>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;