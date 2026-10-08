import { useState, useEffect, useCallback } from 'react';
import { getCarrito, saveCarrito } from '../services/apiService';

// Evento propio para que Navbar y Agendar vean el mismo carrito al instante
const EVENTO_CARRITO = 'sanmarcos:carrito';

export const useCarrito = () => {
  const [carrito, setCarrito] = useState(() => getCarrito());

  useEffect(() => {
    const sincronizar = () => setCarrito(getCarrito());
    window.addEventListener(EVENTO_CARRITO, sincronizar);
    window.addEventListener('storage', sincronizar); // cambios desde otra pestaña
    return () => {
      window.removeEventListener(EVENTO_CARRITO, sincronizar);
      window.removeEventListener('storage', sincronizar);
    };
  }, []);

  const guardar = useCallback((nuevo) => {
    saveCarrito(nuevo);
    window.dispatchEvent(new Event(EVENTO_CARRITO));
  }, []);

  const agregar = useCallback((servicio) => {
    const actual = getCarrito();
    const existe = actual.some((i) => i.id === servicio.id);
    guardar(
      existe
        ? actual.map((i) => (i.id === servicio.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [
            ...actual,
            {
              id: servicio.id,
              nombre: servicio.nombre,
              precio: servicio.precio,
              imagen: servicio.imagen,
              cantidad: 1,
            },
          ]
    );
  }, [guardar]);

  const cambiarCantidad = useCallback((id, delta) => {
    const actualizado = getCarrito()
      .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
      .filter((i) => i.cantidad > 0);
    guardar(actualizado);
  }, [guardar]);

  const eliminar = useCallback((id) => {
    guardar(getCarrito().filter((i) => i.id !== id));
  }, [guardar]);

  const vaciar = useCallback(() => guardar([]), [guardar]);

  const cantidadTotal = carrito.reduce((suma, i) => suma + i.cantidad, 0);
  const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

  return { carrito, agregar, cambiarCantidad, eliminar, vaciar, cantidadTotal, total };
};
