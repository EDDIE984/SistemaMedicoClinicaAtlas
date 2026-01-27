import { type AsignacionConsultorio, type EstadoConsultorio } from '../data/mockData';

/**
 * Sincroniza el estado de las asignaciones cuando un consultorio cambia de estado
 * 
 * @param id_consultorio - ID del consultorio que cambió de estado
 * @param nuevoEstadoConsultorio - Nuevo estado del consultorio
 * @param asignaciones - Lista actual de asignaciones
 * @returns Lista actualizada de asignaciones
 */
export function sincronizarAsignacionesConsultorio(
  id_consultorio: number,
  nuevoEstadoConsultorio: EstadoConsultorio,
  asignaciones: AsignacionConsultorio[]
): AsignacionConsultorio[] {
  return asignaciones.map(asignacion => {
    // Solo actualizar asignaciones del consultorio específico
    if (asignacion.id_consultorio !== id_consultorio) {
      return asignacion;
    }

    // Si el consultorio pasa a mantenimiento, desactivar asignaciones
    if (nuevoEstadoConsultorio === 'mantenimiento') {
      return {
        ...asignacion,
        estado: 'inactivo'
      };
    }

    // Si el consultorio vuelve a estar activo, reactivar asignaciones que estaban activas
    if (nuevoEstadoConsultorio === 'activo') {
      return {
        ...asignacion,
        estado: 'activo'
      };
    }

    // Para otros estados, desactivar asignaciones
    return {
      ...asignacion,
      estado: 'inactivo'
    };
  });
}

/**
 * Valida si un consultorio está disponible para asignaciones
 * 
 * @param id_consultorio - ID del consultorio a validar
 * @param consultorios - Lista de consultorios disponibles
 * @returns true si el consultorio está activo, false en caso contrario
 */
export function validarConsultorioDisponible(
  id_consultorio: number,
  consultorios: Array<{ id_consultorio: number; estado: EstadoConsultorio }>
): { disponible: boolean; mensaje: string } {
  const consultorio = consultorios.find(c => c.id_consultorio === id_consultorio);
  
  if (!consultorio) {
    return {
      disponible: false,
      mensaje: 'Consultorio no encontrado'
    };
  }

  if (consultorio.estado === 'mantenimiento') {
    return {
      disponible: false,
      mensaje: 'El consultorio está en mantenimiento y no se puede asignar'
    };
  }

  if (consultorio.estado !== 'activo') {
    return {
      disponible: false,
      mensaje: 'Solo se pueden asignar consultorios activos'
    };
  }

  return {
    disponible: true,
    mensaje: 'Consultorio disponible'
  };
}

/**
 * Obtiene el número de asignaciones afectadas por un cambio de estado del consultorio
 * 
 * @param id_consultorio - ID del consultorio
 * @param asignaciones - Lista de asignaciones
 * @returns Número de asignaciones activas que serían afectadas
 */
export function contarAsignacionesAfectadas(
  id_consultorio: number,
  asignaciones: AsignacionConsultorio[]
): number {
  return asignaciones.filter(
    a => a.id_consultorio === id_consultorio && a.estado === 'activo'
  ).length;
}

/**
 * Valida si hay conflicto de horarios para un consultorio en un día específico
 * Detecta si dos asignaciones diferentes usan el mismo consultorio con horarios solapados
 * 
 * @param id_consultorio - ID del consultorio a validar
 * @param dia_semana - Día de la semana (1-7)
 * @param hora_inicio - Hora de inicio en formato HH:MM
 * @param hora_fin - Hora de fin en formato HH:MM
 * @param asignaciones - Lista completa de asignaciones
 * @param id_asignacion_actual - ID de la asignación actual (null si es nueva)
 * @returns Objeto con disponibilidad y mensaje
 */
export function validarConflictoHorarioConsultorio(
  id_consultorio: number,
  dia_semana: number,
  hora_inicio: string,
  hora_fin: string,
  asignaciones: AsignacionConsultorio[],
  id_asignacion_actual: number | null = null
): { disponible: boolean; mensaje: string; conflicto?: AsignacionConsultorio } {
  // Convertir horas a minutos para facilitar comparación
  const convertirAMinutos = (hora: string): number => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  const inicioMinutos = convertirAMinutos(hora_inicio);
  const finMinutos = convertirAMinutos(hora_fin);

  // Validar que la hora de inicio sea menor que la de fin
  if (inicioMinutos >= finMinutos) {
    return {
      disponible: false,
      mensaje: 'La hora de inicio debe ser menor que la hora de fin'
    };
  }

  // Buscar conflictos con otras asignaciones
  for (const asignacion of asignaciones) {
    // Ignorar la asignación actual (al editar) y asignaciones inactivas
    if (
      (id_asignacion_actual && asignacion.id_asignacion === id_asignacion_actual) ||
      asignacion.estado === 'inactivo'
    ) {
      continue;
    }

    // Solo verificar asignaciones del mismo consultorio y día
    if (
      asignacion.id_consultorio === id_consultorio &&
      asignacion.dia_semana === dia_semana
    ) {
      const asignacionInicioMinutos = convertirAMinutos(asignacion.hora_inicio);
      const asignacionFinMinutos = convertirAMinutos(asignacion.hora_fin);

      // Verificar sobreposición de horarios
      // Hay conflicto si: (inicio1 < fin2) Y (inicio2 < fin1)
      const haySolapamiento = 
        inicioMinutos < asignacionFinMinutos && 
        asignacionInicioMinutos < finMinutos;

      if (haySolapamiento) {
        return {
          disponible: false,
          mensaje: `El consultorio ya está asignado de ${asignacion.hora_inicio} a ${asignacion.hora_fin}`,
          conflicto: asignacion
        };
      }
    }
  }

  return {
    disponible: true,
    mensaje: 'Horario disponible'
  };
}