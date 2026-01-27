// ============================================
// UTILIDADES PARA GENERACIÓN DE SLOTS
// ============================================

/**
 * Convierte una cadena de tiempo "HH:MM" a minutos desde medianoche
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde medianoche a formato "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Suma minutos a una hora en formato "HH:MM"
 */
export function addMinutes(time: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(totalMinutes);
}

/**
 * Obtiene el día de la semana en español a partir de una fecha
 */
export function getDiaSemana(fecha: string): string {
  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const date = new Date(fecha + 'T00:00:00');
  return diasSemana[date.getDay()];
}

/**
 * Genera todos los slots posibles para un rango horario
 */
export function generarSlots(
  horaInicio: string,
  horaFin: string,
  duracionMinutos: number
): Array<{ hora_inicio: string; hora_fin: string }> {
  const slots = [];
  const inicioMinutos = timeToMinutes(horaInicio);
  const finMinutos = timeToMinutes(horaFin);
  
  let actualMinutos = inicioMinutos;
  
  while (actualMinutos + duracionMinutos <= finMinutos) {
    const siguienteMinutos = actualMinutos + duracionMinutos;
    
    slots.push({
      hora_inicio: minutesToTime(actualMinutos),
      hora_fin: minutesToTime(siguienteMinutos)
    });
    
    actualMinutos = siguienteMinutos;
  }
  
  return slots;
}

/**
 * Verifica si un slot está ocupado por una cita
 */
export function isSlotOcupado(
  slotInicio: string,
  citasOcupadas: Array<{ hora_inicio: string; hora_fin: string }>
): boolean {
  return citasOcupadas.some(cita => cita.hora_inicio === slotInicio);
}

/**
 * Filtra los slots disponibles eliminando los ocupados
 */
export function filtrarSlotsDisponibles(
  todosLosSlots: Array<{ hora_inicio: string; hora_fin: string }>,
  citasOcupadas: Array<{ hora_inicio: string; hora_fin: string }>
): Array<{ hora_inicio: string; hora_fin: string; disponible: boolean }> {
  return todosLosSlots
    .filter(slot => !isSlotOcupado(slot.hora_inicio, citasOcupadas))
    .map(slot => ({
      ...slot,
      disponible: true
    }));
}
