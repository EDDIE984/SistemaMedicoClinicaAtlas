// Servicio de reportes y estadísticas con Supabase
import { supabaseAdmin } from './supabase';  // ⚡ Cambio: usar supabaseAdmin para bypasear RLS
import type { CargoCompleto } from './cobrosService';
import { calcularTotalCargo, calcularTotalPagado, obtenerEstadoPago } from './cobrosService';

// ========================================
// INTERFACES Y TIPOS
// ========================================

export interface EstadisticasGenerales {
  totalPacientes: number;
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasPendientes: number;
  totalIngresos: number;
  totalPendienteCobro: number;
  promedioConsultaPorDia: number;
  tasaAsistencia: number;
  tasaCancelacion: number;
}

export interface CitasPorDia {
  fecha: string;
  total: number;
  completadas: number;
  canceladas: number;
  pendientes: number;
}

export interface IngresosPorDia {
  fecha: string;
  ingresos: number;
  pagado: number;
  pendiente: number;
}

export interface EstadisticasPorMedico {
  medico: string;
  idMedico: number;
  totalCitas: number;
  citasCompletadas: number;
  totalIngresos: number;
  ingresosRecaudados: number;
  tasaAsistencia: number;
}

export interface EstadisticasPorSucursal {
  sucursal: string;
  idSucursal: number;
  totalCitas: number;
  citasCompletadas: number;
  totalIngresos: number;
  ingresosRecaudados: number;
  numeroMedicos: number;
}

export interface TopPaciente {
  paciente: string;
  idPaciente: number;
  cedula: string;  // Cambio: era "identificacion"
  totalCitas: number;
  totalGastado: number;
}

export interface DistribucionEstadoPago {
  estado: string;
  cantidad: number;
  monto: number;
  porcentaje: number;
}

export interface DistribucionFormaPago {
  forma: string;
  cantidad: number;
  monto: number;
  porcentaje: number;
}

// ========================================
// FUNCIONES DE ESTADÍSTICAS GENERALES
// ========================================

/**
 * Obtener estadísticas generales del sistema
 */
export async function getEstadisticasGenerales(
  fechaInicio?: string,
  fechaFin?: string
): Promise<EstadisticasGenerales> {
  try {
    console.log('📊 Calculando estadísticas generales...');

    // Obtener total de pacientes
    const { count: totalPacientes } = await supabaseAdmin
      .from('paciente')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo');

    // Obtener citas con filtros de fecha
    let queryCitas = supabaseAdmin
      .from('cita')
      .select('*');

    if (fechaInicio) {
      queryCitas = queryCitas.gte('fecha_cita', fechaInicio);
    }
    if (fechaFin) {
      queryCitas = queryCitas.lte('fecha_cita', fechaFin);
    }

    const { data: citas, error } = await queryCitas;

    if (error) {
      console.error('❌ Error al obtener citas:', error);
      return getEstadisticasVacias();
    }

    const totalCitas = citas?.length || 0;
    const citasCompletadas = citas?.filter(c => c.consulta_realizada).length || 0;
    const citasCanceladas = citas?.filter(c => c.estado_cita === 'cancelada').length || 0;
    const citasPendientes = citas?.filter(c => c.estado_cita === 'agendada' && !c.consulta_realizada).length || 0;

    // Calcular ingresos
    let totalIngresos = 0;
    let totalPagado = 0;

    citas?.forEach(cita => {
      if (cita.consulta_realizada) {
        totalIngresos += parseFloat(cita.precio_cita) || 0;
        if (cita.estado_pago === 'pagado') {
          totalPagado += parseFloat(cita.precio_cita) || 0;
        } else if (cita.estado_pago === 'parcial') {
          // Para pagos parciales, asumimos 50% pagado (se puede mejorar con tabla de pagos)
          totalPagado += (parseFloat(cita.precio_cita) || 0) * 0.5;
        }
      }
    });

    const totalPendienteCobro = totalIngresos - totalPagado;

    // Calcular promedios
    const diasRango = fechaInicio && fechaFin ? 
      Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) : 
      30;
    
    const promedioConsultaPorDia = totalCitas / Math.max(diasRango, 1);

    // Calcular tasas
    const tasaAsistencia = totalCitas > 0 ? (citasCompletadas / totalCitas) * 100 : 0;
    const tasaCancelacion = totalCitas > 0 ? (citasCanceladas / totalCitas) * 100 : 0;

    const estadisticas: EstadisticasGenerales = {
      totalPacientes: totalPacientes || 0,
      totalCitas,
      citasCompletadas,
      citasCanceladas,
      citasPendientes,
      totalIngresos,
      totalPendienteCobro,
      promedioConsultaPorDia,
      tasaAsistencia,
      tasaCancelacion
    };

    console.log('✅ Estadísticas calculadas:', estadisticas);
    return estadisticas;
  } catch (error) {
    console.error('❌ Error al calcular estadísticas:', error);
    return getEstadisticasVacias();
  }
}

function getEstadisticasVacias(): EstadisticasGenerales {
  return {
    totalPacientes: 0,
    totalCitas: 0,
    citasCompletadas: 0,
    citasCanceladas: 0,
    citasPendientes: 0,
    totalIngresos: 0,
    totalPendienteCobro: 0,
    promedioConsultaPorDia: 0,
    tasaAsistencia: 0,
    tasaCancelacion: 0
  };
}

// ========================================
// FUNCIONES DE REPORTES POR PERÍODO
// ========================================

/**
 * Obtener citas agrupadas por día
 */
export async function getCitasPorDia(
  fechaInicio: string,
  fechaFin: string
): Promise<CitasPorDia[]> {
  try {
    console.log('📅 Obteniendo citas por día...');

    const { data, error } = await supabaseAdmin
      .from('cita')
      .select('fecha_cita, estado_cita, consulta_realizada')
      .gte('fecha_cita', fechaInicio)
      .lte('fecha_cita', fechaFin)
      .order('fecha_cita', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener citas por día:', error);
      return [];
    }

    // Agrupar por fecha
    const citasPorFecha = new Map<string, CitasPorDia>();

    data?.forEach(cita => {
      const fecha = cita.fecha_cita;
      if (!citasPorFecha.has(fecha)) {
        citasPorFecha.set(fecha, {
          fecha,
          total: 0,
          completadas: 0,
          canceladas: 0,
          pendientes: 0
        });
      }

      const stats = citasPorFecha.get(fecha)!;
      stats.total++;

      if (cita.consulta_realizada) {
        stats.completadas++;
      } else if (cita.estado_cita === 'cancelada') {
        stats.canceladas++;
      } else {
        stats.pendientes++;
      }
    });

    return Array.from(citasPorFecha.values());
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

/**
 * Obtener ingresos agrupados por día
 */
export async function getIngresosPorDia(
  fechaInicio: string,
  fechaFin: string
): Promise<IngresosPorDia[]> {
  try {
    console.log('💰 Obteniendo ingresos por día...');

    const { data, error } = await supabaseAdmin
      .from('cita')
      .select(`
        fecha_cita,
        precio_cita,
        consulta_realizada,
        estado_pago
      `)
      .eq('consulta_realizada', true)
      .gte('fecha_cita', fechaInicio)
      .lte('fecha_cita', fechaFin)
      .order('fecha_cita', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener ingresos:', error);
      return [];
    }

    // Agrupar por fecha
    const ingresosPorFecha = new Map<string, IngresosPorDia>();

    data?.forEach((cita: any) => {
      const fecha = cita.fecha_cita;
      if (!ingresosPorFecha.has(fecha)) {
        ingresosPorFecha.set(fecha, {
          fecha,
          ingresos: 0,
          pagado: 0,
          pendiente: 0
        });
      }

      const stats = ingresosPorFecha.get(fecha)!;
      const ingresos = parseFloat(cita.precio_cita) || 0;
      stats.ingresos += ingresos;

      // Calcular pagado
      if (cita.estado_pago === 'pagado') {
        stats.pagado += ingresos;
      } else if (cita.estado_pago === 'parcial') {
        // Para pagos parciales, asumimos 50% pagado (se puede mejorar con tabla de pagos)
        stats.pagado += ingresos * 0.5;
      }
      stats.pendiente += (ingresos - stats.pagado);
    });

    return Array.from(ingresosPorFecha.values());
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

// ========================================
// FUNCIONES DE ESTADÍSTICAS POR ENTIDAD
// ========================================

/**
 * Obtener estadísticas por médico
 */
export async function getEstadisticasPorMedico(
  fechaInicio?: string,
  fechaFin?: string
): Promise<EstadisticasPorMedico[]> {
  try {
    console.log('👨‍⚕️ Obteniendo estadísticas por médico...');

    let query = supabaseAdmin
      .from('cita')
      .select(`
        id_usuario_sucursal,
        estado_cita,
        consulta_realizada,
        precio_cita,
        usuario_sucursal:usuario_sucursal!inner(
          id_usuario_sucursal,
          usuario:usuario!inner(
            id_usuario,
            nombre,
            apellido
          )
        ),
        estado_pago
      `);

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al obtener estadísticas por médico:', error);
      return [];
    }

    // Agrupar por médico
    const statsPorMedico = new Map<number, EstadisticasPorMedico>();

    data?.forEach((cita: any) => {
      const idUsuario = cita.usuario_sucursal.usuario.id_usuario;
      const nombreMedico = `Dr. ${cita.usuario_sucursal.usuario.nombre} ${cita.usuario_sucursal.usuario.apellido}`;

      if (!statsPorMedico.has(idUsuario)) {
        statsPorMedico.set(idUsuario, {
          medico: nombreMedico,
          idMedico: idUsuario,
          totalCitas: 0,
          citasCompletadas: 0,
          totalIngresos: 0,
          ingresosRecaudados: 0,
          tasaAsistencia: 0
        });
      }

      const stats = statsPorMedico.get(idUsuario)!;
      stats.totalCitas++;

      if (cita.consulta_realizada) {
        stats.citasCompletadas++;
        stats.totalIngresos += parseFloat(cita.precio_cita) || 0;

        // Calcular pagado
        if (cita.estado_pago === 'pagado') {
          stats.ingresosRecaudados += parseFloat(cita.precio_cita) || 0;
        } else if (cita.estado_pago === 'parcial') {
          // Para pagos parciales, asumimos 50% pagado (se puede mejorar con tabla de pagos)
          stats.ingresosRecaudados += (parseFloat(cita.precio_cita) || 0) * 0.5;
        }
      }
    });

    // Calcular tasa de asistencia
    statsPorMedico.forEach(stats => {
      stats.tasaAsistencia = stats.totalCitas > 0 ? 
        (stats.citasCompletadas / stats.totalCitas) * 100 : 0;
    });

    return Array.from(statsPorMedico.values());
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

/**
 * Obtener estadísticas por sucursal
 */
export async function getEstadisticasPorSucursal(
  fechaInicio?: string,
  fechaFin?: string
): Promise<EstadisticasPorSucursal[]> {
  try {
    console.log('🏥 Obteniendo estadísticas por sucursal...');

    let query = supabaseAdmin
      .from('cita')
      .select(`
        estado_cita,
        consulta_realizada,
        precio_cita,
        usuario_sucursal:usuario_sucursal!inner(
          id_usuario,
          sucursal:sucursal!inner(
            id_sucursal,
            nombre
          )
        ),
        estado_pago
      `);

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al obtener estadísticas por sucursal:', error);
      return [];
    }

    // Agrupar por sucursal
    const statsPorSucursal = new Map<number, EstadisticasPorSucursal>();
    const medicosPorSucursal = new Map<number, Set<number>>();

    data?.forEach((cita: any) => {
      const idSucursal = cita.usuario_sucursal.sucursal.id_sucursal;
      const nombreSucursal = cita.usuario_sucursal.sucursal.nombre;
      const idUsuario = cita.usuario_sucursal.id_usuario;

      if (!statsPorSucursal.has(idSucursal)) {
        statsPorSucursal.set(idSucursal, {
          sucursal: nombreSucursal,
          idSucursal: idSucursal,
          totalCitas: 0,
          citasCompletadas: 0,
          totalIngresos: 0,
          ingresosRecaudados: 0,
          numeroMedicos: 0
        });
        medicosPorSucursal.set(idSucursal, new Set());
      }

      const stats = statsPorSucursal.get(idSucursal)!;
      stats.totalCitas++;

      // Contar médicos únicos
      medicosPorSucursal.get(idSucursal)!.add(idUsuario);

      if (cita.consulta_realizada) {
        stats.citasCompletadas++;
        stats.totalIngresos += parseFloat(cita.precio_cita) || 0;

        // Calcular pagado
        if (cita.estado_pago === 'pagado') {
          stats.ingresosRecaudados += parseFloat(cita.precio_cita) || 0;
        } else if (cita.estado_pago === 'parcial') {
          // Para pagos parciales, asumimos 50% pagado (se puede mejorar con tabla de pagos)
          stats.ingresosRecaudados += (parseFloat(cita.precio_cita) || 0) * 0.5;
        }
      }
    });

    // Asignar número de médicos
    statsPorSucursal.forEach((stats, idSucursal) => {
      stats.numeroMedicos = medicosPorSucursal.get(idSucursal)?.size || 0;
    });

    return Array.from(statsPorSucursal.values());
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

/**
 * Obtener top pacientes (más citas o más gastos)
 */
export async function getTopPacientes(
  limite: number = 10,
  ordenarPor: 'citas' | 'gastos' = 'citas',
  fechaInicio?: string,
  fechaFin?: string
): Promise<TopPaciente[]> {
  try {
    console.log('👥 Obteniendo top pacientes...');

    let query = supabaseAdmin
      .from('cita')
      .select(`
        id_paciente,
        precio_cita,
        consulta_realizada,
        fecha_cita,
        paciente:paciente!inner(
          id_paciente,
          nombres,
          apellidos,
          cedula
        )
      `)
      .eq('consulta_realizada', true);

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al obtener top pacientes:', error);
      return [];
    }

    // Agrupar por paciente
    const statsPorPaciente = new Map<number, TopPaciente>();

    data?.forEach((cita: any) => {
      const idPaciente = cita.paciente.id_paciente;
      const nombrePaciente = `${cita.paciente.nombres} ${cita.paciente.apellidos}`;

      if (!statsPorPaciente.has(idPaciente)) {
        statsPorPaciente.set(idPaciente, {
          paciente: nombrePaciente,
          idPaciente: idPaciente,
          cedula: cita.paciente.cedula,
          totalCitas: 0,
          totalGastado: 0,
          ultimaCita: cita.fecha_cita
        });
      }

      const stats = statsPorPaciente.get(idPaciente)!;
      stats.totalCitas++;
      stats.totalGastado += parseFloat(cita.precio_cita) || 0;

      // Actualizar última cita
      if (cita.fecha_cita > stats.ultimaCita) {
        stats.ultimaCita = cita.fecha_cita;
      }
    });

    // Convertir a array y ordenar
    let topPacientes = Array.from(statsPorPaciente.values());

    if (ordenarPor === 'citas') {
      topPacientes.sort((a, b) => b.totalCitas - a.totalCitas);
    } else {
      topPacientes.sort((a, b) => b.totalGastado - a.totalGastado);
    }

    return topPacientes.slice(0, limite);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

// ========================================
// FUNCIONES DE DISTRIBUCIONES
// ========================================

/**
 * Obtener distribución por estado de pago
 */
export async function getDistribucionEstadoPago(
  fechaInicio?: string,
  fechaFin?: string
): Promise<DistribucionEstadoPago[]> {
  try {
    console.log('💳 Obteniendo distribución de estados de pago...');

    let query = supabaseAdmin
      .from('cita')
      .select(`
        precio_cita,
        consulta_realizada,
        estado_pago
      `)
      .eq('consulta_realizada', true);

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error:', error);
      return [];
    }

    const distribucion = {
      pendiente: { cantidad: 0, monto: 0 },
      pagado: { cantidad: 0, monto: 0 },
      parcial: { cantidad: 0, monto: 0 }
    };

    data?.forEach((cita: any) => {
      const total = parseFloat(cita.precio_cita) || 0;
      const estadoPago = cita.estado_pago;

      if (estadoPago === 'pendiente') {
        distribucion.pendiente.cantidad++;
        distribucion.pendiente.monto += total;
      } else if (estadoPago === 'pagado') {
        distribucion.pagado.cantidad++;
        distribucion.pagado.monto += total;
      } else if (estadoPago === 'parcial') {
        distribucion.parcial.cantidad++;
        distribucion.parcial.monto += total;
      }
    });

    const totalCargos = data?.length || 0;

    return [
      {
        estado: 'Pagado',
        cantidad: distribucion.pagado.cantidad,
        monto: distribucion.pagado.monto,
        porcentaje: totalCargos > 0 ? (distribucion.pagado.cantidad / totalCargos) * 100 : 0
      },
      {
        estado: 'Pendiente',
        cantidad: distribucion.pendiente.cantidad,
        monto: distribucion.pendiente.monto,
        porcentaje: totalCargos > 0 ? (distribucion.pendiente.cantidad / totalCargos) * 100 : 0
      },
      {
        estado: 'Parcial',
        cantidad: distribucion.parcial.cantidad,
        monto: distribucion.parcial.monto,
        porcentaje: totalCargos > 0 ? (distribucion.parcial.cantidad / totalCargos) * 100 : 0
      }
    ];
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

/**
 * Obtener distribución por forma de pago
 */
export async function getDistribucionFormaPago(
  fechaInicio?: string,
  fechaFin?: string
): Promise<DistribucionFormaPago[]> {
  try {
    console.log('💰 Obteniendo distribución de formas de pago...');

    let query = supabaseAdmin
      .from('cita')
      .select(`
        forma_pago,
        precio_cita,
        estado_pago
      `)
      .eq('consulta_realizada', true)
      .eq('estado_pago', 'pagado');

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error:', error);
      return [];
    }

    // Agrupar por forma de pago
    const formasPago = new Map<string, { cantidad: number; monto: number }>();

    data?.forEach((cita: any) => {
      const forma = cita.forma_pago || 'efectivo';
      if (!formasPago.has(forma)) {
        formasPago.set(forma, { cantidad: 0, monto: 0 });
      }
      const stats = formasPago.get(forma)!;
      stats.cantidad++;
      stats.monto += parseFloat(cita.precio_cita) || 0;
    });

    const totalPagos = data?.length || 0;

    return Array.from(formasPago.entries()).map(([forma, stats]) => ({
      forma: forma.charAt(0).toUpperCase() + forma.slice(1),
      cantidad: stats.cantidad,
      monto: stats.monto,
      porcentaje: totalPagos > 0 ? (stats.cantidad / totalPagos) * 100 : 0
    }));
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Formatear moneda
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(monto);
}

/**
 * Formatear porcentaje
 */
export function formatearPorcentaje(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

/**
 * Formatear fecha corta
 */
export function formatearFechaCorta(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  });
}