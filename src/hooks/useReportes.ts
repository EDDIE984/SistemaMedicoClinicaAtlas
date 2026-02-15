// Hook personalizado para reportes y estadísticas (Versión Revertida + Citas Dashboard)
import { useState, useEffect } from 'react';
import {
  getEstadisticasGenerales,
  getCitasPorDia,
  getIngresosPorDia,
  getEstadisticasPorMedico,
  getDistribucionAseguradora,
  getCitasPorEspecialidad,
  getDistribucionTipoCita,
  getDistribucionFormaPago,
  getDistribucionEstadoPago,
  getCitasPorHora,
  getDuracionPromedioPorTipo,
  getDistribucionReferencia,
  getTopPacientes,
  formatearMoneda,
  formatearPorcentaje,
  formatearFechaCorta,
  type EstadisticasGenerales,
  type CitasPorDia,
  type IngresosPorDia,
  type EstadisticasPorMedico,
  type TopPaciente,
  type CitasPorEspecialidad,
  type DistribucionAseguradora,
  type DistribucionTipoCita,
  type DistribucionFormaPago,
  type DistribucionEstadoPago,
  type CitasPorHora,
  type DuracionPromedio,
  type DistribucionReferencia
} from '../lib/reportesService';

export function useCitasDashboard(fechaInicio: string, fechaFin: string, idSucursal?: number, idEspecialidad?: number) {
  const [stats, setStats] = useState<EstadisticasGenerales | null>(null);
  const [citasDia, setCitasDia] = useState<CitasPorDia[]>([]);
  const [citasEsp, setCitasEsp] = useState<CitasPorEspecialidad[]>([]);
  const [distAseguradora, setDistAseguradora] = useState<DistribucionAseguradora[]>([]);
  const [distTipo, setDistTipo] = useState<DistribucionTipoCita[]>([]);
  const [distFormaPago, setDistFormaPago] = useState<DistribucionFormaPago[]>([]);
  const [distEstadoPago, setDistEstadoPago] = useState<DistribucionEstadoPago[]>([]);
  const [citasHora, setCitasHora] = useState<CitasPorHora[]>([]);
  const [duracionProm, setDuracionProm] = useState<DuracionPromedio[]>([]);
  const [distReferencia, setDistReferencia] = useState<DistribucionReferencia[]>([]);
  const [medicos, setMedicos] = useState<EstadisticasPorMedico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [s, c, esp, a, t, f, ep, h, d, r, m] = await Promise.all([
        getEstadisticasGenerales(fechaInicio, fechaFin, idSucursal, undefined, idEspecialidad),
        getCitasPorDia(fechaInicio, fechaFin, idSucursal, undefined, idEspecialidad),
        getCitasPorEspecialidad(idSucursal, fechaInicio, fechaFin),
        getDistribucionAseguradora(fechaInicio, fechaFin, idSucursal, idEspecialidad),
        getDistribucionTipoCita(fechaInicio, fechaFin, idSucursal),
        getDistribucionFormaPago(fechaInicio, fechaFin, idSucursal),
        getDistribucionEstadoPago(fechaInicio, fechaFin, idSucursal),
        getCitasPorHora(fechaInicio, fechaFin, idSucursal),
        getDuracionPromedioPorTipo(fechaInicio, fechaFin, idSucursal),
        getDistribucionReferencia(fechaInicio, fechaFin, idSucursal),
        getEstadisticasPorMedico(fechaInicio, fechaFin)
      ]);

      setStats(s);
      setCitasDia(c);
      setCitasEsp(esp);
      setDistAseguradora(a);
      setDistTipo(t);
      setDistFormaPago(f);
      setDistEstadoPago(ep);
      setCitasHora(h);
      setDuracionProm(d);
      setDistReferencia(r);
      setMedicos(m);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [fechaInicio, fechaFin, idSucursal, idEspecialidad]);

  return {
    stats, citasDia, citasEsp, distAseguradora, distTipo,
    distFormaPago, distEstadoPago, citasHora, duracionProm,
    distReferencia, medicos, isLoading, loadAll
  };
}

export function useReportes(fechaInicio?: string, fechaFin?: string, idSucursal?: number, idMedico?: number) {
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEstadisticasGenerales = async () => {
    setIsLoading(true);
    const data = await getEstadisticasGenerales(fechaInicio, fechaFin, idSucursal, idMedico);
    setEstadisticasGenerales(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEstadisticasGenerales();
  }, [fechaInicio, fechaFin, idSucursal, idMedico]);

  return { estadisticasGenerales, isLoading, loadEstadisticasGenerales };
}

export function useCitasPorDia(fechaInicio: string, fechaFin: string, idSucursal?: number, idMedico?: number) {
  const [citasPorDia, setCitasPorDia] = useState<CitasPorDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getCitasPorDia(fechaInicio, fechaFin, idSucursal, idMedico);
      setCitasPorDia(data);
      setIsLoading(false);
    };
    load();
  }, [fechaInicio, fechaFin, idSucursal, idMedico]);

  return { citasPorDia, isLoading };
}

export function useIngresosPorDia(fechaInicio: string, fechaFin: string) {
  const [ingresosPorDia, setIngresosPorDia] = useState<IngresosPorDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getIngresosPorDia(fechaInicio, fechaFin);
      setIngresosPorDia(data);
      setIsLoading(false);
    };
    load();
  }, [fechaInicio, fechaFin]);

  return { ingresosPorDia, isLoading };
}

export function useEstadisticasPorMedico(fechaInicio?: string, fechaFin?: string) {
  const [estadisticasPorMedico, setEstadisticasPorMedico] = useState<EstadisticasPorMedico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getEstadisticasPorMedico(fechaInicio, fechaFin);
      setEstadisticasPorMedico(data);
      setIsLoading(false);
    };
    load();
  }, [fechaInicio, fechaFin]);

  return { estadisticasPorMedico, isLoading };
}

export function useEstadisticasPorSucursal(fechaInicio?: string, fechaFin?: string) {
  const [estadisticasPorSucursal, setEstadisticasPorSucursal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return { estadisticasPorSucursal, isLoading };
}

export function useTopPacientes(limite: number = 10, ordenarPor: 'citas' | 'gastos' = 'citas', fi?: string, ff?: string) {
  const [topPacientes, setTopPacientes] = useState<TopPaciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getTopPacientes(limite, ordenarPor, fi, ff);
      setTopPacientes(data);
      setIsLoading(false);
    };
    load();
  }, [limite, ordenarPor, fi, ff]);

  return { topPacientes, isLoading };
}

export function useDistribuciones(fi?: string, ff?: string) {
  const [distribucionEstadoPago, setDistribucionEstadoPago] = useState<any[]>([]);
  const [distribucionFormaPago, setDistribucionFormaPago] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return { distribucionEstadoPago, distribucionFormaPago, isLoading };
}

export { formatearMoneda, formatearPorcentaje, formatearFechaCorta };
