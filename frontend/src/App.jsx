import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación directa de páginas (sin llaves para evitar errores de exportación)
import Home from './pages/Home';
import Agendar from './pages/Agendar';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Admin from './pages/Admin';
import Fichas from './pages/Fichas';
import Usuarios from './pages/Usuarios';

import './estilos.css'

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/fichas" element={<Fichas />} />
        <Route path="/usuarios" element={<Usuarios />} />
      </Routes>
    </Router>
  );
}

export default App;