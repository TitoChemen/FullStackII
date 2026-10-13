import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from './pages/Admin';
import Fichas from './pages/Fichas';
import Usuarios from './pages/Usuarios';

describe('Pruebas Unitarias de Componentes - Veterinaria San Marcos', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // TEST 1: Citas en Admin.jsx
  test('1. Renderiza correctamente la tabla de citas en Admin', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Admin', rol: 'ADMINISTRADOR' }));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    expect(screen.getByText('Gestión de Citas')).toBeInTheDocument();
  });

  // TEST 2: Confirmación de Cita
  test('2. Permite confirmar una cita pendiente', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Admin', rol: 'ADMINISTRADOR' }));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    const botonesConfirmar = screen.getAllByText('Confirmar Cita');
    expect(botonesConfirmar.length).toBeGreaterThan(0);
  });

  // TEST 3: Sesión de Usuario en Navbar
  test('3. Muestra el nombre y rol del usuario logueado en el Navbar', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Ana Recepción', rol: 'RECEPCIONISTA' }));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    expect(screen.getByText('Ana Recepción')).toBeInTheDocument();
    expect(screen.getByText('RECEPCIONISTA')).toBeInTheDocument();
  });

  // TEST 4: Formulario de Fichas
  test('4. Renderiza el formulario para crear nuevas fichas médicas', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Vet Carlos', rol: 'VETERINARIO' }));
    render(
      <MemoryRouter>
        <Fichas />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Nombre Mascota')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre Dueño')).toBeInTheDocument();
  });

  // TEST 5: Guardar Ficha
  test('5. Permite ingresar valores en el formulario de Fichas', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Admin', rol: 'ADMINISTRADOR' }));
    render(
      <MemoryRouter>
        <Fichas />
      </MemoryRouter>
    );
    const inputMascota = screen.getByPlaceholderText('Nombre Mascota');
    fireEvent.change(inputMascota, { target: { value: 'Boby' } });
    expect(inputMascota.value).toBe('Boby');
  });

  // TEST 6: Bloqueo RBAC en Usuarios
  test('6. Restringe la vista de Usuarios a roles no administradores', () => {
    const usuarioRecepcion = { nombre: 'Ana Recepción', rol: 'RECEPCIONISTA', email: 'recepcion@sanmarcos.cl' };
    localStorage.setItem('usuario_logueado', JSON.stringify(usuarioRecepcion));

    render(
      <MemoryRouter>
        <Usuarios />
      </MemoryRouter>
    );

    // Al ser RECEPCIONISTA, no debe renderizar el título ni la tabla de gestión de usuarios
    expect(screen.queryByText('Gestión de usuarios')).toBeNull();
  });

  // TEST 7: Visibilidad de Usuarios para Admin
  test('7. Permite el acceso a la vista de Usuarios si el rol es ADMINISTRADOR', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Kevin Admin', rol: 'ADMINISTRADOR' }));
    render(
      <MemoryRouter>
        <Usuarios />
      </MemoryRouter>
    );
    expect(screen.getByText('Gestión de usuarios')).toBeInTheDocument();
  });

  // TEST 8: Cambiar estado de un usuario
  test('8. Renderiza la tabla de administración de usuarios correctamente', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Kevin Admin', rol: 'ADMINISTRADOR' }));
    render(
      <MemoryRouter>
        <Usuarios />
      </MemoryRouter>
    );
    expect(screen.getByText('Rol asignado')).toBeInTheDocument();
  });

  // TEST 9: Menú Navbar Oculto para Recepcionista
  test('9. Oculta la opción de menú "Usuarios" a usuarios con rol RECEPCIONISTA', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Ana Recepción', rol: 'RECEPCIONISTA' }));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    expect(screen.queryByText('Usuarios')).toBeNull();
  });

  // TEST 10: Menú Navbar Visibles para Administrador
  test('10. Muestra las 3 secciones (Citas, Fichas, Usuarios) en el Navbar para el ADMINISTRADOR', () => {
    localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Kevin Admin', rol: 'ADMINISTRADOR' }));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    expect(screen.getByText('Citas')).toBeInTheDocument();
    expect(screen.getByText('Fichas clínicas')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

});