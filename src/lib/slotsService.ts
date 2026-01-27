// ============================================
// SERVICIO PARA GESTIÓN DE SLOTS DISPONIBLES
// ============================================

import { projectId, publicAnonKey } from '../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3d193f8d`;

export interface Slot {
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

export interface SlotDisponible {
  id_asignacion: number;
  medico: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    nombre_completo: string;
  };
  consultorio: {
    id_consultorio: number;
    nombre: string;
  };
  sucursal: {
    id_sucursal: number;
    nombre: string;
  };
  horario_general: {
    hora_inicio: string;
    hora_fin: string;
    duracion_consulta: number;
  };
  slots: Slot[];
  total_slots: number;
  slots_disponibles: number;
  slots_ocupados: number;
}

export interface RespuestaSlotsDisponibles {
  fecha: string;
  dia_semana: string;
  total_horarios: number;
  slots_disponibles: SlotDisponible[];
  mensaje?: string;
}

/**
 * Obtiene los slots disponibles para una fecha específica
 * @param fecha Fecha en formato YYYY-MM-DD
 * @param idSucursal ID de la sucursal (opcional)
 * @param idMedico ID del médico (opcional)
 */
export async function obtenerSlotsDisponibles(
  fecha: string,
  idSucursal?: number,
  idMedico?: number
): Promise<RespuestaSlotsDisponibles> {
  try {
    // Construir URL con parámetros
    const params = new URLSearchParams({ fecha });
    if (idSucursal) params.append('id_sucursal', idSucursal.toString());
    if (idMedico) params.append('id_medico', idMedico.toString());

    const url = `${SERVER_URL}/agenda/slots-disponibles?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener slots disponibles');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error en obtenerSlotsDisponibles:', error);
    throw new Error(error.message || 'Error al obtener slots disponibles');
  }
}

/**
 * Obtiene solo los médicos que tienen disponibilidad para una fecha específica
 */
export async function obtenerMedicosDisponibles(
  fecha: string,
  idSucursal?: number
): Promise<Array<{ id_usuario: number; nombre_completo: string; slots_disponibles: number }>> {
  try {
    const respuesta = await obtenerSlotsDisponibles(fecha, idSucursal);
    
    return respuesta.slots_disponibles
      .filter(slot => slot.slots_disponibles > 0)
      .map(slot => ({
        id_usuario: slot.medico.id_usuario,
        nombre_completo: slot.medico.nombre_completo,
        slots_disponibles: slot.slots_disponibles
      }));
  } catch (error: any) {
    console.error('Error en obtenerMedicosDisponibles:', error);
    throw error;
  }
}

/**
 * Obtiene los horarios disponibles para un médico específico en una fecha
 */
export async function obtenerHorariosMedico(
  fecha: string,
  idMedico: number,
  idSucursal?: number
): Promise<SlotDisponible[]> {
  try {
    const respuesta = await obtenerSlotsDisponibles(fecha, idSucursal, idMedico);
    return respuesta.slots_disponibles;
  } catch (error: any) {
    console.error('Error en obtenerHorariosMedico:', error);
    throw error;
  }
}

/**
 * Verifica si un slot específico está disponible
 */
export async function verificarSlotDisponible(
  fecha: string,
  idAsignacion: number,
  horaInicio: string
): Promise<boolean> {
  try {
    const respuesta = await obtenerSlotsDisponibles(fecha);
    
    const horario = respuesta.slots_disponibles.find(
      slot => slot.id_asignacion === idAsignacion
    );
    
    if (!horario) return false;
    
    return horario.slots.some(
      slot => slot.hora_inicio === horaInicio && slot.disponible
    );
  } catch (error: any) {
    console.error('Error en verificarSlotDisponible:', error);
    return false;
  }
}
