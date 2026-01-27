// Hook personalizado para reportes y estadísticas
import { useState, useEffect } from 'react';
import {
  getEstadisticasGenerales,
  getCitasPorDia,
  getIngresosPorDia,
  getEstadisticasPorMedico,
  getEstadisticasPorSucursal,
  getTopPacientes,
  getDistribucionEstadoPago,
  getDistribucionFormaPago,
  type EstadisticasGenerales,
  type CitasPorDia,
  type IngresosPorDia,
  type EstadisticasPorMedico,
  type EstadisticasPorSucursal,
  type TopPacientes,
  type DistribucionEstadoPago,
  type DistribucionFormaPago
} from '../lib/reportesService';

export function useReportes(fechaInicio?: string, fechaFin?: string) {
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstadisticasGenerales();
  }, [fechaInicio, fechaFin]);

  const loadEstadisticasGenerales = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getEstadisticasGenerales(fechaInicio, fechaFin);
      setEstadisticasGenerales(data);
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error(err);
    }

    setIsLoading(false);
  };

  return {
    estadisticasGenerales,
    isLoading,
    error,
    loadEstadisticasGenerales
  };
}

export function useCitasPorDia(fechaInicio: string, fechaFin: string) {
  const [citasPorDia, setCitasPorDia] = useState<CitasPorDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCitasPorDia();
  }, [fechaInicio, fechaFin]);

  const loadCitasPorDia = async () => {
    setIsLoading(true);
    const data = await getCitasPorDia(fechaInicio, fechaFin);
    setCitasPorDia(data);
    setIsLoading(false);
  };

  return {
    citasPorDia,
    isLoading,
    loadCitasPorDia
  };
}

export function useIngresosPorDia(fechaInicio: string, fechaFin: string) {
  const [ingresosPorDia, setIngresosPorDia] = useState<IngresosPorDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIngresosPorDia();
  }, [fechaInicio, fechaFin]);

  const loadIngresosPorDia = async () => {
    setIsLoading(true);
    const data = await getIngresosPorDia(fechaInicio, fechaFin);
    setIngresosPorDia(data);
    setIsLoading(false);
  };

  return {
    ingresosPorDia,
    isLoading,
    loadIngresosPorDia
  };
}

export function useEstadisticasPorMedico(fechaInicio?: string, fechaFin?: string) {
  const [estadisticasPorMedico, setEstadisticasPorMedico] = useState<EstadisticasPorMedico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstadisticasPorMedico();
  }, [fechaInicio, fechaFin]);

  const loadEstadisticasPorMedico = async () => {
    setIsLoading(true);
    const data = await getEstadisticasPorMedico(fechaInicio, fechaFin);
    setEstadisticasPorMedico(data);
    setIsLoading(false);
  };

  return {
    estadisticasPorMedico,
    isLoading,
    loadEstadisticasPorMedico
  };
}

export function useEstadisticasPorSucursal(fechaInicio?: string, fechaFin?: string) {
  const [estadisticasPorSucursal, setEstadisticasPorSucursal] = useState<EstadisticasPorSucursal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstadisticasPorSucursal();
  }, [fechaInicio, fechaFin]);

  const loadEstadisticasPorSucursal = async () => {
    setIsLoading(true);
    const data = await getEstadisticasPorSucursal(fechaInicio, fechaFin);
    setEstadisticasPorSucursal(data);
    setIsLoading(false);
  };

  return {
    estadisticasPorSucursal,
    isLoading,
    loadEstadisticasPorSucursal
  };
}

export function useTopPacientes(
  limite: number = 10,
  ordenarPor: 'citas' | 'gastos' = 'citas',
  fechaInicio?: string,
  fechaFin?: string
) {
  const [topPacientes, setTopPacientes] = useState<TopPacientes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopPacientes();
  }, [limite, ordenarPor, fechaInicio, fechaFin]);

  const loadTopPacientes = async () => {
    setIsLoading(true);
    const data = await getTopPacientes(limite, ordenarPor, fechaInicio, fechaFin);
    setTopPacientes(data);
    setIsLoading(false);
  };

  return {
    topPacientes,
    isLoading,
    loadTopPacientes
  };
}

export function useDistribuciones(fechaInicio?: string, fechaFin?: string) {
  const [distribucionEstadoPago, setDistribucionEstadoPago] = useState<DistribucionEstadoPago[]>([]);
  const [distribucionFormaPago, setDistribucionFormaPago] = useState<DistribucionFormaPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDistribuciones();
  }, [fechaInicio, fechaFin]);

  const loadDistribuciones = async () => {
    setIsLoading(true);
    
    const [estadoPago, formaPago] = await Promise.all([
      getDistribucionEstadoPago(fechaInicio, fechaFin),
      getDistribucionFormaPago(fechaInicio, fechaFin)
    ]);

    setDistribucionEstadoPago(estadoPago);
    setDistribucionFormaPago(formaPago);
    setIsLoading(false);
  };

  return {
    distribucionEstadoPago,
    distribucionFormaPago,
    isLoading,
    loadDistribuciones
  };
}

// Exportar funciones auxiliares
export {
  formatearMoneda,
  formatearPorcentaje,
  formatearFechaCorta
} from '../lib/reportesService';
