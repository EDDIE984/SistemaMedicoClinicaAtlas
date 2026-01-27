// Servicio de gestión de citas con Supabase
import { supabaseAdmin } from './supabase';  // ⚡ Cambio: usar supabaseAdmin para bypasear RLS

// ========================================
// INTERFACES Y TIPOS
// ========================================

export interface Cita {
  id_cita: number;
  id_paciente: number;
  id_usuario_sucursal: number;
  id_sucursal: number;
  id_consultorio: number;
  fecha_cita: string;  // Cambio: era "fecha"
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  tipo_cita: 'consulta' | 'control' | 'emergencia' | 'primera_vez';
  motivo_consulta: string;
  estado_cita: 'agendada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';  // Cambio: era "estado"
  consulta_realizada: boolean;
  precio_cita: number;  // Cambio: era "precio"
  forma_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro';
  estado_pago?: 'pendiente' | 'pagado' | 'parcial';
  created_at?: string;
  cancelada_por?: number;
  motivo_cancelacion?: string;
}

export interface CitaCompleta extends Cita {
  paciente: {
    id_paciente: number;
    nombres: string;
    apellidos: string;
    cedula: string;  // Cambio: era "identificacion"
    telefono: string | null;
    email: string | null;  // Cambio: era "correo"
    fecha_nacimiento: string;
    sexo: string;
  };
  usuario_sucursal: {
    id_usuario_sucursal: number;
    especialidad: string | null;
    usuario: {
      id_usuario: number;
      nombre: string;
      apellido: string;
      tipo_usuario: string;
    };
    sucursal: {
      id_sucursal: number;
      nombre: string;
      id_compania: number;
      compania: {
        id_compania: number;
        nombre: string;
      };
    };
  };
}

export interface Cancelacion {
  id_cancelacion: number;
  id_cita: number;
  id_usuario_cancelo: number;
  fecha_cancelacion: string;
  motivo_cancelacion: string;
  created_at?: string;
}

export interface Precio {
  id_precio: number;
  id_usuario_sucursal: number;
  precio: number;
  activo: boolean;
}

export interface DiaSemana {
  id_asignacion: number;
  id_usuario_sucursal: number;
  id_consultorio: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_consulta: number; // Duración de cada cita en minutos
  estado: string;
  created_at?: string;
  updated_at?: string;
}

// ========================================
// FUNCIONES DE CITAS
// ========================================

/**
 * Obtener todas las citas de un paciente
 */
export async function getCitasByPaciente(idPaciente: number): Promise<CitaCompleta[]> {
  try {
    console.log('🔍 Obteniendo citas del paciente:', idPaciente);

    const { data, error } = await supabaseAdmin
      .from('cita')
      .select(`
        *,
        paciente:paciente!inner (
          id_paciente,
          nombres,
          apellidos,
          cedula,
          telefono,
          email,
          fecha_nacimiento,
          sexo
        ),
        usuario_sucursal:usuario_sucursal!inner (
          id_usuario_sucursal,
          especialidad,
          usuario:usuario!inner (
            id_usuario,
            nombre,
            apellido,
            tipo_usuario
          ),
          sucursal:sucursal!inner (
            id_sucursal,
            nombre,
            id_compania,
            compania:compania!inner (
              id_compania,
              nombre
            )
          )
        )
      `)
      .eq('id_paciente', idPaciente)
      .order('fecha_cita', { ascending: false })
      .order('hora_inicio', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener citas del paciente:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} citas para el paciente`);

    // Mapear los datos para incluir el campo "fecha" (alias de fecha_cita) para compatibilidad con el frontend
    const citasMapeadas = (data || []).map((cita: any) => ({
      ...cita,
      fecha: cita.fecha_cita // Agregar alias para compatibilidad
    }));

    return citasMapeadas;
  } catch (error) {
    console.error('❌ Error inesperado al obtener citas del paciente:', error);
    return [];
  }
}

/**
 * Obtener todas las citas de un usuario en un rango de fechas
 */
export async function getCitasByUsuarioYFechas(
  idUsuario: number,
  fechaInicio: string,
  fechaFin: string,
  idSucursal?: number  // Parámetro opcional para filtrar por sucursal específica
): Promise<CitaCompleta[]> {
  try {
    console.log('🔍 Obteniendo citas del usuario:', idUsuario, 'desde', fechaInicio, 'hasta', fechaFin,
      idSucursal ? `en sucursal ${idSucursal}` : 'en todas las sucursales');

    // Primero obtener las asignaciones del usuario
    let query = supabaseAdmin
      .from('usuario_sucursal')
      .select('id_usuario_sucursal')
      .eq('id_usuario', idUsuario)
      .eq('estado', 'activo');

    // Si se especifica sucursal, filtrar también por ella
    if (idSucursal) {
      query = query.eq('id_sucursal', idSucursal);
    }

    const { data: asignaciones, error: errorAsignaciones } = await query;

    if (errorAsignaciones) {
      console.error('❌ Error al obtener asignaciones:', errorAsignaciones);
      return [];
    }

    if (!asignaciones || asignaciones.length === 0) {
      console.log('⚠️ El usuario no tiene asignaciones', idSucursal ? 'en esta sucursal' : '');
      return [];
    }

    const idsAsignaciones = asignaciones.map(a => a.id_usuario_sucursal);

    // Obtener citas con relaciones
    const { data, error } = await supabaseAdmin
      .from('cita')
      .select(`
        *,
        paciente:paciente!inner (
          id_paciente,
          nombres,
          apellidos,
          cedula,
          telefono,
          email,
          fecha_nacimiento,
          sexo
        ),
        usuario_sucursal:usuario_sucursal!inner (
          id_usuario_sucursal,
          especialidad,
          usuario:usuario!inner (
            id_usuario,
            nombre,
            apellido,
            tipo_usuario
          ),
          sucursal:sucursal!inner (
            id_sucursal,
            nombre,
            id_compania,
            compania:compania!inner (
              id_compania,
              nombre
            )
          )
        )
      `)
      .in('id_usuario_sucursal', idsAsignaciones)
      .gte('fecha_cita', fechaInicio)
      .lte('fecha_cita', fechaFin)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener citas:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} citas`);

    // Mapear los datos para incluir el campo "fecha" (alias de fecha_cita) para compatibilidad con el frontend
    const citasMapeadas = (data || []).map((cita: any) => ({
      ...cita,
      fecha: cita.fecha_cita // Agregar alias para compatibilidad
    }));

    return citasMapeadas;
  } catch (error) {
    console.error('❌ Error inesperado al obtener citas:', error);
    return [];
  }
}

/**
 * Obtener todas las citas de una sucursal en un rango de fechas
 */
export async function getCitasBySucursalYFechas(
  idSucursal: number,
  fechaInicio: string,
  fechaFin: string
): Promise<CitaCompleta[]> {
  try {

    const { data, error } = await supabaseAdmin
      .from('cita')
      .select(`
        *,
        paciente:paciente!inner (
          id_paciente,
          nombres,
          apellidos,
          cedula,
          telefono,
          email,
          fecha_nacimiento,
          sexo
        ),
        usuario_sucursal:usuario_sucursal!inner (
          id_usuario_sucursal,
          especialidad,
          usuario:usuario!inner (
            id_usuario,
            nombre,
            apellido,
            tipo_usuario
          ),
          sucursal:sucursal!inner (
            id_sucursal,
            nombre,
            id_compania,
            compania:compania!inner (
              id_compania,
              nombre
            )
          )
        )
      `)
      .eq('usuario_sucursal.id_sucursal', idSucursal)
      .gte('fecha_cita', fechaInicio)
      .lte('fecha_cita', fechaFin)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (error) {
      return [];
    }


    // Mapear los datos para incluir el campo "fecha" (alias de fecha_cita) para compatibilidad con el frontend
    const citasMapeadas = (data || []).map((cita: any) => ({
      ...cita,
      fecha: cita.fecha_cita // Agregar alias para compatibilidad
    }));

    return citasMapeadas;
  } catch (error) {
    return [];
  }
}

/**
 * Crear una nueva cita
 */
export async function createCita(cita: Omit<Cita, 'id_cita' | 'created_at' | 'consulta_realizada'>): Promise<Cita | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cita')
      .insert({
        ...cita,
        consulta_realizada: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear cita:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear cita:', error);
    return null;
  }
}

/**
 * Actualizar una cita existente
 * NOTA: Si se actualiza el estado_cita, también se debe proporcionar idUsuario para el historial
 */
export async function updateCita(
  idCita: number,
  updates: Partial<Cita>,
  idUsuario?: number,
  motivoCambio?: string
): Promise<boolean> {
  try {
    console.log('✏️ Actualizando cita ID:', idCita);

    // Si se está actualizando el estado, obtener el estado anterior
    let estadoAnterior: string | undefined;
    if (updates.estado_cita && idUsuario) {
      const { data: citaActual, error: errorObtener } = await supabaseAdmin
        .from('cita')
        .select('estado_cita')
        .eq('id_cita', idCita)
        .maybeSingle(); // Cambiado de .single() a .maybeSingle()

      if (citaActual) {
        estadoAnterior = citaActual.estado_cita;
      }
    }

    const { error } = await supabaseAdmin
      .from('cita')
      .update(updates)
      .eq('id_cita', idCita);

    if (error) {
      console.error('❌ Error al actualizar cita:', error);
      return false;
    }

    // Si se actualizó el estado y tenemos el idUsuario, crear registro de historial
    if (updates.estado_cita && idUsuario && estadoAnterior) {
      const { error: errorHistorial } = await supabaseAdmin
        .from('historial_estado_cita')
        .insert({
          id_cita: idCita,
          estado_anterior: estadoAnterior,
          estado_nuevo: updates.estado_cita,
          id_usuario_cambio: idUsuario,
          observaciones: motivoCambio || 'Actualización de cita'
        });

      if (errorHistorial) {
        console.error('⚠️ Error al crear historial de estado:', errorHistorial);
        // No retornamos false porque la cita ya fue actualizada
      }
    }

    console.log('✅ Cita actualizada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al actualizar cita:', error);
    return false;
  }
}

/**
 * Cancelar una cita
 */
export async function cancelarCita(
  idCita: number,
  idUsuarioCancelo: number,
  motivoCancelacion: string
): Promise<boolean> {
  try {
    console.log('🗑️ Cancelando cita ID:', idCita);

    // PASO 1: Obtener el estado actual ANTES de cancelar
    const { data: citaActual, error: errorObtener } = await supabaseAdmin
      .from('cita')
      .select('estado_cita')
      .eq('id_cita', idCita)
      .maybeSingle(); // Cambiado de .single() a .maybeSingle()

    if (errorObtener || !citaActual) {
      console.error('❌ Error al obtener cita:', errorObtener);
      return false;
    }

    const estadoAnterior = citaActual.estado_cita;

    // PASO 2: Actualizar estado de la cita con los datos de cancelación
    const { error: errorCita } = await supabaseAdmin
      .from('cita')
      .update({
        estado_cita: 'cancelada',
        cancelada_por: idUsuarioCancelo,
        motivo_cancelacion: motivoCancelacion
      })
      .eq('id_cita', idCita);

    if (errorCita) {
      console.error('❌ Error al actualizar estado de cita:', errorCita);
      return false;
    }

    // PASO 3: Crear registro en historial de estados
    const { error: errorHistorial } = await supabaseAdmin
      .from('historial_estado_cita')
      .insert({
        id_cita: idCita,
        estado_anterior: estadoAnterior,
        estado_nuevo: 'cancelada',
        id_usuario_cambio: idUsuarioCancelo,
        observaciones: motivoCancelacion
      });

    if (errorHistorial) {
      // Verificar si es error de duplicado (trigger ya lo insertó)
      if (errorHistorial.code === '23505') {
        console.log('ℹ️ Historial ya existe (insertado por trigger)');
      } else {
        console.error('⚠️ Error al crear historial de estado:', errorHistorial);
      }
    }

    console.log('✅ Cita cancelada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al cancelar cita:', error);
    return false;
  }
}

/**
 * Marcar una cita como completada
 */
export async function marcarCitaCompletada(idCita: number, idUsuario: number): Promise<boolean> {
  try {
    console.log('✅ Marcando cita como completada:', idCita, 'Usuario:', idUsuario);

    // PASO 1: Obtener el estado actual ANTES de actualizar
    const { data: citaActual, error: errorObtener } = await supabaseAdmin
      .from('cita')
      .select('estado_cita')
      .eq('id_cita', idCita)
      .maybeSingle(); // Cambiado de .single() a .maybeSingle()

    if (errorObtener) {
      console.error('❌ Error al obtener cita actual:', errorObtener);
      return false;
    }

    if (!citaActual) {
      console.error('❌ Cita no encontrada');
      return false;
    }

    const estadoAnterior = citaActual.estado_cita;
    console.log('📋 Estado anterior:', estadoAnterior);

    // PASO 2: Actualizar la cita (esto puede activar el trigger)
    const { error: errorUpdate } = await supabaseAdmin
      .from('cita')
      .update({
        estado_cita: 'atendida',
        consulta_realizada: true
      })
      .eq('id_cita', idCita);

    if (errorUpdate) {
      console.error('❌ Error al actualizar cita:', errorUpdate);
      // Si el error es por id_usuario_cambio, intentamos insertar manualmente
      if (errorUpdate.code === '23502' && errorUpdate.message?.includes('id_usuario_cambio')) {
        console.log('⚠️ Detectado trigger automático que causa error, insertando manualmente...');

        // Insertar manualmente en el historial
        const { error: errorHistorial } = await supabaseAdmin
          .from('historial_estado_cita')
          .insert({
            id_cita: idCita,
            estado_anterior: estadoAnterior,
            estado_nuevo: 'atendida',
            id_usuario_cambio: idUsuario,
            observaciones: 'Consulta médica completada'
          });

        if (errorHistorial) {
          console.error('❌ Error al insertar en historial:', errorHistorial);
        }
      }
      return false;
    }

    // PASO 3: Insertar en historial manualmente (si el trigger no lo hizo)
    const { error: errorHistorial } = await supabaseAdmin
      .from('historial_estado_cita')
      .insert({
        id_cita: idCita,
        estado_anterior: estadoAnterior,
        estado_nuevo: 'atendida',
        id_usuario_cambio: idUsuario,
        observaciones: 'Consulta médica completada'
      });

    if (errorHistorial) {
      // Verificar si el error es porque ya existe (trigger lo insertó)
      if (errorHistorial.code === '23505') {
        console.log('ℹ️ Historial ya existe (insertado por trigger)');
      } else {
        console.error('⚠️ Error al insertar historial:', errorHistorial);
        // No retornamos false porque la cita ya fue actualizada
      }
    }

    console.log('✅ Cita marcada como completada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al marcar cita como completada:', error);
    return false;
  }
}

/**
 * Obtener cancelacin de una cita
 * NOTA: Los datos de cancelación ahora están en la tabla 'cita' (campos: cancelada_por, motivo_cancelacion)
 * Esta función se mantiene para compatibilidad pero consulta directamente la tabla 'cita'
 */
export async function getCancelacionByCita(idCita: number): Promise<Cancelacion | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cita')
      .select('id_cita, cancelada_por, motivo_cancelacion, created_at')
      .eq('id_cita', idCita)
      .eq('estado_cita', 'cancelada')
      .maybeSingle();

    if (error) {
      console.error('❌ Error al obtener cancelación:', error);
      return null;
    }

    if (!data || !data.cancelada_por || !data.motivo_cancelacion) {
      return null;
    }

    // Mapear al formato de Cancelacion
    return {
      id_cancelacion: data.id_cita, // Usar id_cita como id_cancelacion
      id_cita: data.id_cita,
      id_usuario_cancelo: data.cancelada_por,
      fecha_cancelacion: data.created_at || '',
      motivo_cancelacion: data.motivo_cancelacion,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('❌ Error inesperado al obtener cancelación:', error);
    return null;
  }
}

// ========================================
// FUNCIONES DE HORARIOS Y PRECIOS
// ========================================

/**
 * Obtener precio de un usuario en una sucursal
 * Busca primero en precio_usuario_sucursal, si no existe busca en precio_base_especialidad
 */
export async function getPrecioUsuarioSucursal(idUsuarioSucursal: number): Promise<number> {
  try {
    console.log('💰 Buscando precio para id_usuario_sucursal:', idUsuarioSucursal);

    // 1. Buscar precio personalizado del usuario
    const { data: precioUsuario, error: errorPrecioUsuario } = await supabaseAdmin
      .from('precio_usuario_sucursal')
      .select('precio_consulta')
      .eq('id_usuario_sucursal', idUsuarioSucursal)
      .eq('estado', 'activo')
      .maybeSingle();

    if (errorPrecioUsuario) {
      console.error('❌ Error al obtener precio de usuario:', errorPrecioUsuario);
    }

    // Si encontró precio personalizado, retornarlo
    if (precioUsuario?.precio_consulta) {
      console.log('✅ Precio personalizado encontrado:', precioUsuario.precio_consulta);
      return precioUsuario.precio_consulta;
    }

    console.log('⚠️ No hay precio personalizado, buscando precio base por especialidad...');

    // 2. Si no hay precio personalizado, obtener especialidad del usuario y la compañía
    const { data: usuarioSucursal, error: errorUsuarioSucursal } = await supabaseAdmin
      .from('usuario_sucursal')
      .select(`
        especialidad,
        sucursal:sucursal!inner (
          id_compania
        )
      `)
      .eq('id_usuario_sucursal', idUsuarioSucursal)
      .single();

    if (errorUsuarioSucursal || !usuarioSucursal?.especialidad) {
      console.error('❌ Error al obtener especialidad del usuario:', errorUsuarioSucursal);
      return 0;
    }

    console.log('📋 Especialidad encontrada:', usuarioSucursal.especialidad);
    console.log('🏢 Compañía:', (usuarioSucursal as any).sucursal?.id_compania);

    // 3. Buscar precio base de la especialidad en la compañía
    const { data: precioBase, error: errorPrecioBase } = await supabaseAdmin
      .from('precio_base_especialidad')
      .select('precio_consulta')
      .eq('especialidad', usuarioSucursal.especialidad)
      .eq('id_compania', (usuarioSucursal as any).sucursal?.id_compania)
      .eq('estado', 'activo')
      .maybeSingle();

    if (errorPrecioBase) {
      console.error('❌ Error al obtener precio base de especialidad:', errorPrecioBase);
      return 0;
    }

    if (precioBase?.precio_consulta) {
      console.log('✅ Precio base por especialidad encontrado:', precioBase.precio_consulta);
      return precioBase.precio_consulta;
    }

    console.log('⚠️ No se encontró precio base para la especialidad');
    return 0;
  } catch (error) {
    console.error('❌ Error inesperado al obtener precio:', error);
    return 0;
  }
}

/**
 * Obtener días de semana habilitados para un usuario en una sucursal
 */
export async function getDiasSemanaUsuarioSucursal(idUsuarioSucursal: number): Promise<DiaSemana[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('asignacion_consultorio')
      .select('*')
      .eq('id_usuario_sucursal', idUsuarioSucursal)
      .eq('estado', 'activo')
      .order('dia_semana', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener días de semana:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener días de semana:', error);
    return [];
  }
}

/**
 * Verificar disponibilidad de horario para una cita
 */
export async function verificarDisponibilidad(
  idUsuarioSucursal: number,
  fecha: string,
  horaInicio: string,
  horaFin: string,
  idCitaExcluir?: number
): Promise<boolean> {
  try {
    let query = supabaseAdmin
      .from('cita')
      .select('id_cita')
      .eq('id_usuario_sucursal', idUsuarioSucursal)
      .eq('fecha_cita', fecha)
      .neq('estado_cita', 'cancelada');

    if (idCitaExcluir) {
      query = query.neq('id_cita', idCitaExcluir);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al verificar disponibilidad:', error);
      return false;
    }

    // Si no hay citas, está disponible
    if (!data || data.length === 0) {
      return true;
    }

    // Verificar que no haya traslapes de horarios
    for (const cita of data as any[]) {
      const citaInicio = cita.hora_inicio;
      const citaFin = cita.hora_fin;

      // Verificar traslape
      if (
        (horaInicio >= citaInicio && horaInicio < citaFin) ||
        (horaFin > citaInicio && horaFin <= citaFin) ||
        (horaInicio <= citaInicio && horaFin >= citaFin)
      ) {
        return false; // Hay traslape
      }
    }

    return true; // No hay traslape
  } catch (error) {
    console.error('❌ Error inesperado al verificar disponibilidad:', error);
    return false;
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Formatear fecha para visualización
 */
export function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatear hora para visualización
 */
export function formatearHora(hora: string): string {
  return hora.substring(0, 5); // HH:MM
}

/**
 * Obtener color según estado de cita
 */
export function getColorEstado(estado: string): string {
  switch (estado) {
    case 'agendada':
      return 'blue';
    case 'confirmada':
      return 'blue';
    case 'en_atencion':
      return 'blue';
    case 'atendida':
      return 'green';
    case 'cancelada':
      return 'red';
    case 'no_asistio':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Calcular duración de cita en minutos
 */
export function calcularDuracionMinutos(horaInicio: string, horaFin: string): number {
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFin2, minFin] = horaFin.split(':').map(Number);

  const minutosInicio = horaIni * 60 + minIni;
  const minutosFin = horaFin2 * 60 + minFin;

  return minutosFin - minutosInicio;
}

/**
 * Generar horarios disponibles
 */
export function generarHorariosDisponibles(
  horaInicio: string,
  horaFin: string,
  intervaloMinutos: number = 30
): string[] {
  const horarios: string[] = [];

  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFinNum, minFin] = horaFin.split(':').map(Number);

  let minutosActual = horaIni * 60 + minIni;
  const minutosFin = horaFinNum * 60 + minFin;

  while (minutosActual < minutosFin) {
    const horas = Math.floor(minutosActual / 60);
    const minutos = minutosActual % 60;

    const horaFormateada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    horarios.push(horaFormateada);

    minutosActual += intervaloMinutos;
  }

  return horarios;
}