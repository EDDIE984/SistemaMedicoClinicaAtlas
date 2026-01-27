// Hook personalizado para gestión de cobros con Supabase
import { useState, useEffect } from 'react';
import {
  getAllCargos,
  getCargosByUsuario,
  createPago,
  updatePago,
  deletePago,
  createCargoAdicional,
  deleteCargoAdicional,
  createDescuento,
  deleteDescuento,
  calcularTotalCargo,
  calcularTotalPagado,
  obtenerEstadoPago,
  calcularEstadisticas,
  type CargoCompleto,
  type Pago,
  type CargoAdicional,
  type Descuento,
  type EstadoPago
} from '../lib/cobrosService';

export function useCobros(
  idUsuario?: number | null,
  fechaInicio?: string,
  fechaFin?: string
) {
  const [cargos, setCargos] = useState<CargoCompleto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCargos();
  }, [idUsuario, fechaInicio, fechaFin]);

  const loadCargos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: CargoCompleto[];

      if (idUsuario) {
        data = await getCargosByUsuario(idUsuario, fechaInicio, fechaFin);
      } else {
        data = await getAllCargos(fechaInicio, fechaFin);
      }

      setCargos(data);
    } catch (err) {
      setError('Error al cargar cargos');
      console.error(err);
    }

    setIsLoading(false);
  };

  // Agregar pago
  const agregarPago = async (pago: Omit<Pago, 'id_pago' | 'created_at'>) => {
    const nuevoPago = await createPago(pago);

    if (nuevoPago) {
      await loadCargos(); // Recargar lista
      return nuevoPago;
    }

    return null;
  };

  // Actualizar pago
  const actualizarPago = async (idPago: number, updates: Partial<Pago>) => {
    const success = await updatePago(idPago, updates);

    if (success) {
      await loadCargos(); // Recargar lista
    }

    return success;
  };

  // Eliminar pago
  const eliminarPago = async (idPago: number) => {
    const success = await deletePago(idPago);

    if (success) {
      await loadCargos(); // Recargar lista
    }

    return success;
  };

  // Agregar cargo adicional
  const agregarCargoAdicional = async (cargo: Omit<CargoAdicional, 'id_cargo_adicional' | 'created_at'>) => {
    const nuevoCargoAdicional = await createCargoAdicional(cargo);

    if (nuevoCargoAdicional) {
      await loadCargos(); // Recargar lista
      return nuevoCargoAdicional;
    }

    return null;
  };

  // Eliminar cargo adicional
  const eliminarCargoAdicional = async (idCargoAdicional: number) => {
    const success = await deleteCargoAdicional(idCargoAdicional);

    if (success) {
      await loadCargos(); // Recargar lista
    }

    return success;
  };

  // Agregar descuento
  const agregarDescuento = async (descuento: Omit<Descuento, 'id_descuento' | 'created_at'>) => {
    const nuevoDescuento = await createDescuento(descuento);

    if (nuevoDescuento) {
      await loadCargos(); // Recargar lista
      return nuevoDescuento;
    }

    return null;
  };

  // Eliminar descuento
  const eliminarDescuento = async (idDescuento: number) => {
    const success = await deleteDescuento(idDescuento);

    if (success) {
      await loadCargos(); // Recargar lista
    }

    return success;
  };

  // Calcular estadísticas
  const estadisticas = calcularEstadisticas(cargos);

  return {
    cargos,
    isLoading,
    error,
    loadCargos,
    agregarPago,
    actualizarPago,
    eliminarPago,
    agregarCargoAdicional,
    eliminarCargoAdicional,
    agregarDescuento,
    eliminarDescuento,
    estadisticas
  };
}

// Hook para gestionar un cargo individual con todos sus detalles
export function useCargo(idCita: number | null) {
  const [cargo, setCargo] = useState<CargoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (idCita) {
      loadCargo();
    }
  }, [idCita]);

  const loadCargo = async () => {
    if (!idCita) return;

    setIsLoading(true);

    const cargos = await getAllCargos();
    const cargoEncontrado = cargos.find(c => c.id_cita === idCita);

    if (cargoEncontrado) {
      setCargo(cargoEncontrado);
    }

    setIsLoading(false);
  };

  const totales = cargo ? calcularTotalCargo(cargo) : null;
  const totalPagado = cargo ? calcularTotalPagado(cargo) : 0;
  const estadoPago = cargo ? obtenerEstadoPago(cargo) : 'pendiente';

  return {
    cargo,
    isLoading,
    loadCargo,
    totales,
    totalPagado,
    estadoPago
  };
}

// Exportar funciones auxiliares
export {
  calcularTotalCargo,
  calcularTotalPagado,
  obtenerEstadoPago,
  formatearMoneda,
  getColorEstadoPago,
  exportarCargosCSV
} from '../lib/cobrosService';
