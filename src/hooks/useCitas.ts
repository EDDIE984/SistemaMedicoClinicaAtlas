// Hook personalizado para gestión de citas con Supabase
import { useState, useEffect } from 'react';
import {
  getCitasByUsuarioYFechas,
  getCitasBySucursalYFechas,
  createCita,
  updateCita,
  cancelarCita,
  marcarCitaCompletada,
  getPrecioUsuarioSucursal,
  getDiasSemanaUsuarioSucursal,
  verificarDisponibilidad,
  type CitaCompleta,
  type Cita,
  type DiaSemana
} from '../lib/citasService';

export function useCitas(idUsuario: number | null, fechaInicio: string, fechaFin: string, tipoUsuario?: string) {
  const [citas, setCitas] = useState<CitaCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idUsuario) {
      loadCitas();
    }
  }, [idUsuario, fechaInicio, fechaFin]);

  const loadCitas = async () => {
    if (!idUsuario) return;

    setIsLoading(true);
    setError(null);

    // Obtener id_sucursal desde localStorage para filtrar solo citas de la sucursal actual
    const idSucursal = localStorage.getItem('currentSucursalId');
    const idSucursalNumber = idSucursal ? parseInt(idSucursal) : undefined;

    console.log('🔍 useCitas - Tipo de usuario:', tipoUsuario);
    console.log('🔍 useCitas - Filtrando por sucursal:', idSucursalNumber || 'todas');

    let data;
    
    // Si es SECRETARIA, obtener todas las citas de la sucursal
    if (tipoUsuario === 'secretaria' && idSucursalNumber) {
      console.log('👩‍💼 useCitas - Cargando citas como SECRETARIA');
      data = await getCitasBySucursalYFechas(idSucursalNumber, fechaInicio, fechaFin);
    } else {
      // Si es MÉDICO, obtener solo las citas del usuario
      console.log('👨‍⚕️ useCitas - Cargando citas como MÉDICO');
      data = await getCitasByUsuarioYFechas(idUsuario, fechaInicio, fechaFin, idSucursalNumber);
    }

    if (data) {
      setCitas(data);
    } else {
      setError('Error al cargar citas');
    }

    setIsLoading(false);
  };

  const crearCita = async (cita: Omit<Cita, 'id_cita' | 'created_at' | 'consulta_realizada'>) => {
    const nuevaCita = await createCita(cita);

    if (nuevaCita) {
      await loadCitas(); // Recargar lista
      return nuevaCita;
    }

    return null;
  };

  const actualizarCita = async (
    idCita: number, 
    updates: Partial<Cita>,
    idUsuario?: number,
    motivoCambio?: string
  ) => {
    const success = await updateCita(idCita, updates, idUsuario, motivoCambio);

    if (success) {
      await loadCitas(); // Recargar lista
    }

    return success;
  };

  const cancelarCitaCompleta = async (idCita: number, idUsuarioCancelo: number, motivo: string) => {
    const success = await cancelarCita(idCita, idUsuarioCancelo, motivo);

    if (success) {
      await loadCitas(); // Recargar lista
    }

    return success;
  };

  const marcarCompletada = async (idCita: number, idUsuario: number) => {
    const success = await marcarCitaCompletada(idCita, idUsuario);

    if (success) {
      await loadCitas(); // Recargar lista
    }

    return success;
  };

  return {
    citas,
    isLoading,
    error,
    loadCitas,
    crearCita,
    actualizarCita,
    cancelarCitaCompleta,
    marcarCompletada
  };
}

export function useHorarios(idUsuarioSucursal: number | null) {
  const [diasSemana, setDiasSemana] = useState<DiaSemana[]>([]);
  const [precio, setPrecio] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 useHorarios - idUsuarioSucursal cambió:', idUsuarioSucursal);
    if (idUsuarioSucursal) {
      loadHorarios();
    } else {
      console.log('⚠️ useHorarios - idUsuarioSucursal es null, no se cargan horarios');
      // Resetear estado cuando no hay selección
      setDiasSemana([]);
      setPrecio(0);
    }
  }, [idUsuarioSucursal]);

  const loadHorarios = async () => {
    if (!idUsuarioSucursal) {
      console.log('⚠️ loadHorarios - idUsuarioSucursal es null, abortando');
      return;
    }

    console.log('🔍 loadHorarios - Cargando horarios y precio para id_usuario_sucursal:', idUsuarioSucursal);
    setIsLoading(true);

    const [dias, precioData] = await Promise.all([
      getDiasSemanaUsuarioSucursal(idUsuarioSucursal),
      getPrecioUsuarioSucursal(idUsuarioSucursal)
    ]);

    console.log('✅ loadHorarios - Días cargados:', dias.length);
    console.log('💰 loadHorarios - Precio obtenido:', precioData);

    setDiasSemana(dias);
    setPrecio(precioData);
    setIsLoading(false);
  };

  const verificarDisponibilidadHorario = async (
    fecha: string,
    horaInicio: string,
    horaFin: string,
    idCitaExcluir?: number
  ) => {
    if (!idUsuarioSucursal) return false;

    return await verificarDisponibilidad(
      idUsuarioSucursal,
      fecha,
      horaInicio,
      horaFin,
      idCitaExcluir
    );
  };

  return {
    diasSemana,
    precio,
    isLoading,
    loadHorarios,
    verificarDisponibilidadHorario
  };
}