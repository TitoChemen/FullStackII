import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// El frontend NO usa datos simulados: se simula (mock) la capa HTTP para probar la interfaz.
vi.mock('./services/apiService', () => ({
  login: vi.fn(),
  registrar: vi.fn(),
  listarUsuarios: vi.fn(),
  listarMascotas: vi.fn(),
  listarMisMascotas: vi.fn(),
  crearMascota: vi.fn(),
  actualizarMascota: vi.fn(),
  desactivarMascota: vi.fn(),
  crearCita: vi.fn(),
  citasPorMascota: vi.fn(),
  citasPorVeterinario: vi.fn(),
  cambiarEstadoCita: vi.fn(),
  asignarVeterinario: vi.fn(),
  crearHistorial: vi.fn(),
  historialesPorMascota: vi.fn(),
}));

import * as api from './services/apiService';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import { request, configurarHttp } from './services/http';
import Admin from './pages/Admin';
import Fichas from './pages/Fichas';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import Registro from './pages/Registro';
import { ROLES } from './utils';

const iniciarSesionComo = (usuario) => {
  sessionStorage.setItem(
    'sanmarcos_sesion',
    JSON.stringify({ token: 'token.de.prueba', usuario: { apellido: 'Prueba', activo: true, ...usuario } })
  );
};

const renderConRutas = (ruta, roles = null) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/login" element={<div>Pantalla de login</div>} />
          <Route path="/admin" element={<RutaProtegida roles={roles}><Admin /></RutaProtegida>} />
          <Route path="/fichas" element={<RutaProtegida roles={roles}><Fichas /></RutaProtegida>} />
          <Route path="/usuarios" element={<RutaProtegida roles={[ROLES.ADMIN]}><Usuarios /></RutaProtegida>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

const MASCOTAS = [{ id: 1, nombre: 'Luna', especie: 'PERRO', raza: 'Mestizo', sexo: 'HEMBRA', duenoId: 5, activo: true }];
const CITAS = [
  { id: 10, mascotaId: 1, veterinarioId: null, fechaHoraInicio: '2030-11-07T10:00:00', fechaHoraFin: '2030-11-07T10:30:00', motivo: 'Control', estado: 'PENDIENTE' },
];

describe('Frontend conectado al backend - Veterinaria San Marcos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    api.listarMascotas.mockResolvedValue(MASCOTAS);
    api.listarMisMascotas.mockResolvedValue(MASCOTAS);
    api.listarUsuarios.mockResolvedValue([]);
    api.citasPorMascota.mockResolvedValue(CITAS);
    api.citasPorVeterinario.mockResolvedValue(CITAS);
    api.cambiarEstadoCita.mockResolvedValue({ ...CITAS[0], estado: 'CONFIRMADA' });
  });

  test('1. Una ruta protegida redirige al login si no hay sesión', () => {
    renderConRutas('/admin', [ROLES.ADMIN]);
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  test('2. Admin muestra las citas obtenidas desde la API', async () => {
    iniciarSesionComo({ id: 1, nombre: 'Admin', rol: ROLES.ADMIN });
    renderConRutas('/admin', [ROLES.ADMIN]);
    expect(screen.getByText('Gestión de Citas')).toBeInTheDocument();
    expect(await screen.findByText('Control')).toBeInTheDocument();
    expect(api.citasPorMascota).toHaveBeenCalledWith(1);
  });

  test('3. Confirmar una cita llama al PATCH y vuelve a consultar los datos', async () => {
    iniciarSesionComo({ id: 1, nombre: 'Admin', rol: ROLES.ADMIN });
    renderConRutas('/admin', [ROLES.ADMIN]);
    fireEvent.click(await screen.findByText('Confirmar'));
    await waitFor(() => expect(api.cambiarEstadoCita).toHaveBeenCalledWith(10, 'CONFIRMADA'));
    await waitFor(() => expect(api.citasPorMascota).toHaveBeenCalledTimes(2));
  });

  test('4. El Navbar interno muestra nombre y rol de la sesión real', async () => {
    iniciarSesionComo({ id: 2, nombre: 'Ana', rol: ROLES.RECEPCION });
    renderConRutas('/admin');
    expect(await screen.findByText('Ana Prueba')).toBeInTheDocument();
    expect(screen.getByText('Recepcionista')).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });

  test('5. Cerrar sesión elimina la sesión y bloquea las rutas protegidas', async () => {
    iniciarSesionComo({ id: 2, nombre: 'Ana', rol: ROLES.RECEPCION });
    renderConRutas('/admin');
    fireEvent.click(await screen.findByText('Salir'));
    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument();
    expect(sessionStorage.getItem('sanmarcos_sesion')).toBeNull();
  });

  test('6. Fichas lista las mascotas que devuelve el backend (sin pacientes ficticios)', async () => {
    iniciarSesionComo({ id: 1, nombre: 'Admin', rol: ROLES.ADMIN });
    renderConRutas('/fichas');
    expect(await screen.findByText(/Luna/)).toBeInTheDocument();
    expect(screen.queryByText(/Pelusa/)).toBeNull();
    expect(screen.queryByText(/Toby/)).toBeNull();
  });

  test('7. Registrar una mascota envía los valores exactos de las enumeraciones', async () => {
    api.crearMascota.mockResolvedValue({ id: 2 });
    iniciarSesionComo({ id: 5, nombre: 'Carlos', rol: ROLES.DUENO });
    renderConRutas('/fichas');
    await screen.findByText(/Luna/);
    fireEvent.change(screen.getByPlaceholderText('Nombre Mascota'), { target: { value: 'Rocky' } });
    const [selEspecie, selSexo] = screen.getAllByRole('combobox');
    fireEvent.change(selEspecie, { target: { value: 'PERRO' } });
    fireEvent.change(selSexo, { target: { value: 'MACHO' } });
    fireEvent.click(screen.getByText('Guardar Ficha'));
    await waitFor(() =>
      expect(api.crearMascota).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Rocky', especie: 'PERRO', sexo: 'MACHO', duenoId: 5 })
      )
    );
  });

  test('8. El dueño no ve el historial clínico y el veterinario no ve el formulario de mascotas', async () => {
    iniciarSesionComo({ id: 5, nombre: 'Carlos', rol: ROLES.DUENO });
    const dueno = renderConRutas('/fichas');
    await screen.findByText(/Luna/);
    expect(screen.queryByText('Ver historial clínico')).toBeNull();
    dueno.unmount();

    sessionStorage.clear();
    iniciarSesionComo({ id: 3, nombre: 'Vet', rol: ROLES.VET });
    renderConRutas('/fichas');
    await screen.findByText(/Luna/);
    expect(screen.getByText('Ver historial clínico')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Nombre Mascota')).toBeNull();
  });

  test('9. Un 403 del historial se muestra como mensaje y no se intenta evadir', async () => {
    const error = Object.assign(new Error('forbidden'), { status: 403 });
    api.historialesPorMascota.mockRejectedValue(error);
    iniciarSesionComo({ id: 3, nombre: 'Vet', rol: ROLES.VET });
    renderConRutas('/fichas');
    fireEvent.click(await screen.findByText('Ver historial clínico'));
    expect(await screen.findByText('No tienes permisos para ver el historial clínico.')).toBeInTheDocument();
  });

  test('10. Usuarios es exclusivo del ADMINISTRADOR', async () => {
    iniciarSesionComo({ id: 2, nombre: 'Ana', rol: ROLES.RECEPCION });
    renderConRutas('/usuarios');
    await waitFor(() => expect(screen.queryByText('Gestión de usuarios')).toBeNull());
    expect(api.listarUsuarios).not.toHaveBeenCalled();
  });

  test('11. El administrador ve Citas, Fichas y Usuarios en el menú', async () => {
    iniciarSesionComo({ id: 1, nombre: 'Admin', rol: ROLES.ADMIN });
    renderConRutas('/admin');
    expect(await screen.findByText('Citas')).toBeInTheDocument();
    expect(screen.getByText('Fichas clínicas')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  test('12. Login usa el endpoint real y muestra el error del backend', async () => {
    api.login.mockRejectedValue(Object.assign(new Error('x'), { status: 401 }));
    render(
      <AuthProvider>
        <MemoryRouter><Login /></MemoryRouter>
      </AuthProvider>
    );
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'a@b.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'malaclave' } });
    fireEvent.click(screen.getByText('Ingresar'));
    expect(await screen.findByText(/incorrectos/)).toBeInTheDocument();
    expect(api.login).toHaveBeenCalledWith('a@b.cl', 'malaclave');
  });

  test('13. Registro no permite elegir rol y envía los campos del backend', async () => {
    api.registrar.mockResolvedValue({ id: 9 });
    render(
      <AuthProvider>
        <MemoryRouter><Registro /></MemoryRouter>
      </AuthProvider>
    );
    expect(screen.queryByText(/Tipo de usuario/)).toBeNull();
    fireEvent.change(screen.getByPlaceholderText('Ej: Juan'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: Pérez'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave12345' } });
    fireEvent.change(document.getElementById('regPassConfirm'), { target: { value: 'Clave12345' } });
    fireEvent.click(screen.getByText('Registrarse'));
    await waitFor(() =>
      expect(api.registrar).toHaveBeenCalledWith({
        nombre: 'Juan', apellido: 'Pérez', correo: 'juan@example.com', contrasena: 'Clave12345',
      })
    );
  });

  test('14. El cliente HTTP envía el token Bearer en las rutas protegidas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '[]' });
    vi.stubGlobal('fetch', fetchMock);
    configurarHttp({ getToken: () => 'TOKEN123', onUnauthorized: () => {} });
    await request('/api/v1/mascotas');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer TOKEN123');
    vi.unstubAllGlobals();
  });
});