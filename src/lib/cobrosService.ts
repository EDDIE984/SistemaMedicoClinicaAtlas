// Servicio de gestión de cobros y pagos con Supabase
import { supabaseAdmin } from './supabase';  // ⚡ Cambio: usar supabaseAdmin para bypasear RLS

// ========================================
// INTERFACES Y TIPOS
// ========================================

export type FormaPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro' | 'cortesia';
export type EstadoPago = 'pendiente' | 'pagado' | 'parcial' | 'cancelado';

export interface Pago {
  id_pago: number;
  id_cita: number;
  monto: number;
  forma_pago: FormaPago;
  estado_pago: EstadoPago;
  fecha_pago: string;
  referencia_pago: string | null;
  notas: string | null;
  created_at?: string;
}

export interface CargoAdicional {
  id_cargo_adicional: number;
  id_cita: number;
  descripcion: string;
  monto: number;
  created_at?: string;
}

export interface Descuento {
  id_descuento: number;
  id_cita: number;
  descripcion: string;
  monto: number;
  porcentaje: number | null;
  created_at?: string;
}

export interface CargoCompleto {
  id_cita: number;
  fecha: string;
  hora_inicio: string;
  motivo_consulta: string;
  precio: number;
  estado: string;
  consulta_realizada: boolean;

  paciente: {
    id_paciente: number;
    nombres: string;
    apellidos: string;
    cedula: string;
    telefono: string | null;
    email: string | null;
  };

  usuario_sucursal: {
    id_usuario_sucursal: number;
    especialidad: string | null;
    usuario: {
      id_usuario: number;
      nombre: string;
      apellido: string;
    };
    sucursal: {
      id_sucursal: number;
      nombre: string;
      compania: {
        id_compania: number;
        nombre: string;
      };
    };
  };

  pagos: Pago[];
  cargos_adicionales: CargoAdicional[];
  descuentos: Descuento[];
}

// ========================================
// FUNCIONES PRINCIPALES
// ========================================

export async function getAllCargos(
  fechaInicio?: string,
  fechaFin?: string
): Promise<CargoCompleto[]> {
  try {
    console.log('🔍 Obteniendo cargos...');

    let query = supabaseAdmin
      .from('cita')
      .select(`
        *,
        paciente:paciente!inner (
          id_paciente,
          nombres,
          apellidos,
          cedula,
          telefono,
          email
        ),
        usuario_sucursal:usuario_sucursal!inner (
          id_usuario_sucursal,
          especialidad,
          usuario:usuario!inner (
            id_usuario,
            nombre,
            apellido
          ),
          sucursal:sucursal!inner (
            id_sucursal,
            nombre,
            compania:compania!inner (
              id_compania,
              nombre
            )
          )
        )
      `)
      .eq('consulta_realizada', true)
      .order('fecha_cita', { ascending: false })
      .order('hora_inicio', { ascending: false });

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }

    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data: citas, error } = await query;

    if (error) {
      console.error('❌ Error al obtener cargos:', error);
      return [];
    }

    // Obtener IDs de citas para buscar datos relacionados
    const idsCitas = (citas || []).map(c => c.id_cita);

    // Cargar pagos, cargos adicionales y descuentos desde Supabase
    const { data: todosPagos } = await supabaseAdmin
      .from('pago')
      .select('*')
      .in('id_cita', idsCitas);

    const { data: todosCargos } = await supabaseAdmin
      .from('cargo_adicional')
      .select('*')
      .in('id_cita', idsCitas);

    const { data: todosDescuentos } = await supabaseAdmin
      .from('descuento')
      .select('*')
      .in('id_cita', idsCitas);

    const citasCompletas = (citas || []).map((cita: any) => ({
      ...cita,
      fecha: cita.fecha_cita,
      precio_cita: parseFloat(cita.precio_cita) || 0,
      precio: parseFloat(cita.precio_cita) || 0, // Mantener compatibilidad
      estado: cita.estado_cita,
      pagos: ((todosPagos as any[]) || []).filter((p: any) => p.id_cita === cita.id_cita),
      cargos_adicionales: ((todosCargos as any[]) || []).filter((c: any) => c.id_cita === cita.id_cita),
      descuentos: ((todosDescuentos as any[]) || []).filter((d: any) => d.id_cita === cita.id_cita)
    }));

    console.log(`✅ Se encontraron ${citasCompletas.length} cargos`);
    return citasCompletas as any;
  } catch (error) {
    console.error('❌ Error inesperado al obtener cargos:', error);
    return [];
  }
}

export async function getCargosByUsuario(
  idUsuario: number,
  fechaInicio?: string,
  fechaFin?: string
): Promise<CargoCompleto[]> {
  try {
    console.log('🔍 Obteniendo cargos del usuario:', idUsuario);

    const { data: asignaciones, error: errorAsignaciones } = await supabaseAdmin
      .from('usuario_sucursal')
      .select('id_usuario_sucursal')
      .eq('id_usuario', idUsuario)
      .eq('estado', 'activo');

    if (errorAsignaciones) {
      console.error('❌ Error al obtener asignaciones:', errorAsignaciones);
      return [];
    }

    if (!asignaciones || asignaciones.length === 0) {
      console.log('⚠️ El usuario no tiene asignaciones');
      return [];
    }

    const idsAsignaciones = asignaciones.map(a => a.id_usuario_sucursal);

    let query = supabaseAdmin
      .from('cita')
      .select(`
        *,
        paciente:paciente!inner (
          id_paciente,
          nombres,
          apellidos,
          cedula,
          telefono,
          email
        ),
        usuario_sucursal:usuario_sucursal!inner (
          id_usuario_sucursal,
          especialidad,
          usuario:usuario!inner (
            id_usuario,
            nombre,
            apellido
          ),
          sucursal:sucursal!inner (
            id_sucursal,
            nombre,
            compania:compania!inner (
              id_compania,
              nombre
            )
          )
        )
      `)
      .in('id_usuario_sucursal', idsAsignaciones)
      .eq('consulta_realizada', true)
      .order('fecha_cita', { ascending: false });

    if (fechaInicio) {
      query = query.gte('fecha_cita', fechaInicio);
    }

    if (fechaFin) {
      query = query.lte('fecha_cita', fechaFin);
    }

    const { data: citas, error } = await query;

    if (error) {
      console.error('❌ Error al obtener cargos:', error);
      return [];
    }

    // Obtener IDs de citas para buscar datos relacionados
    const idsCitas = (citas || []).map(c => c.id_cita);

    // Cargar pagos, cargos adicionales y descuentos desde Supabase
    const { data: todosPagos } = await supabaseAdmin
      .from('pago')
      .select('*')
      .in('id_cita', idsCitas);

    const { data: todosCargos } = await supabaseAdmin
      .from('cargo_adicional')
      .select('*')
      .in('id_cita', idsCitas);

    const { data: todosDescuentos } = await supabaseAdmin
      .from('descuento')
      .select('*')
      .in('id_cita', idsCitas);

    const citasCompletas = (citas || []).map((cita: any) => ({
      ...cita,
      fecha: cita.fecha_cita,
      precio_cita: parseFloat(cita.precio_cita) || 0,
      precio: parseFloat(cita.precio_cita) || 0, // Mantener compatibilidad
      estado: cita.estado_cita,
      pagos: ((todosPagos as any[]) || []).filter((p: any) => p.id_cita === cita.id_cita),
      cargos_adicionales: ((todosCargos as any[]) || []).filter((c: any) => c.id_cita === cita.id_cita),
      descuentos: ((todosDescuentos as any[]) || []).filter((d: any) => d.id_cita === cita.id_cita)
    }));

    console.log(`✅ Se encontraron ${citasCompletas.length} cargos`);
    return citasCompletas as any;
  } catch (error) {
    console.error('❌ Error inesperado al obtener cargos:', error);
    return [];
  }
}

// ========================================
// FUNCIONES DE PAGOS, CARGOS Y DESCUENTOS
// ========================================

// ========================================
// FUNCIONES DE PAGOS (SUPABASE)
// ========================================

export async function createPago(pago: Omit<Pago, 'id_pago' | 'created_at'>): Promise<Pago | null> {
  try {
    console.log('💰 Registrando pago para cita:', pago.id_cita);

    // Preparar datos para inserción (asegurar tipos)
    const pagoData = {
      ...pago,
      fecha_pago: pago.fecha_pago || new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('pago')
      .insert(pagoData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear pago:', error);
      return null;
    }

    console.log('✅ Pago creado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear pago:', error);
    return null;
  }
}

export async function getPagosByCita(idCita: number): Promise<Pago[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('pago')
      .select('*')
      .eq('id_cita', idCita)
      .order('fecha_pago', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener pagos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener pagos:', error);
    return [];
  }
}

export async function updatePago(idPago: number, updates: Partial<Pago>): Promise<boolean> {
  try {
    console.log('✏️ Actualizando pago ID:', idPago);

    const { error } = await supabaseAdmin
      .from('pago')
      .update(updates)
      .eq('id_pago', idPago);

    if (error) {
      console.error('❌ Error al actualizar pago:', error);
      return false;
    }

    console.log('✅ Pago actualizado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al actualizar pago:', error);
    return false;
  }
}

export async function deletePago(idPago: number): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando pago ID:', idPago);

    const { error } = await supabaseAdmin
      .from('pago')
      .delete()
      .eq('id_pago', idPago);

    if (error) {
      console.error('❌ Error al eliminar pago:', error);
      return false;
    }

    console.log('✅ Pago eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al eliminar pago:', error);
    return false;
  }
}

// ========================================
// FUNCIONES DE CARGOS ADICIONALES (SUPABASE)
// ========================================

export async function createCargoAdicional(cargo: Omit<CargoAdicional, 'id_cargo_adicional' | 'created_at'>): Promise<CargoAdicional | null> {
  try {
    console.log('➕ Agregando cargo adicional a cita:', cargo.id_cita);

    const { data, error } = await supabaseAdmin
      .from('cargo_adicional')
      .insert(cargo)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear cargo adicional:', error);
      return null;
    }

    console.log('✅ Cargo adicional creado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear cargo adicional:', error);
    return null;
  }
}

export async function getCargosByCita(idCita: number): Promise<CargoAdicional[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cargo_adicional')
      .select('*')
      .eq('id_cita', idCita)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener cargos adicionales:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener cargos adicionales:', error);
    return [];
  }
}

export async function deleteCargoAdicional(idCargoAdicional: number): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando cargo adicional ID:', idCargoAdicional);

    const { error } = await supabaseAdmin
      .from('cargo_adicional')
      .delete()
      .eq('id_cargo_adicional', idCargoAdicional);

    if (error) {
      console.error('❌ Error al eliminar cargo adicional:', error);
      return false;
    }

    console.log('✅ Cargo adicional eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al eliminar cargo adicional:', error);
    return false;
  }
}

// ========================================
// FUNCIONES DE DESCUENTOS (SUPABASE)
// ========================================

export async function createDescuento(descuento: Omit<Descuento, 'id_descuento' | 'created_at'>): Promise<Descuento | null> {
  try {
    console.log('📉 Aplicando descuento a cita:', descuento.id_cita);

    const { data, error } = await supabaseAdmin
      .from('descuento')
      .insert(descuento)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear descuento:', error);
      return null;
    }

    console.log('✅ Descuento creado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear descuento:', error);
    return null;
  }
}

export async function getDescuentosByCita(idCita: number): Promise<Descuento[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('descuento')
      .select('*')
      .eq('id_cita', idCita)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener descuentos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error al obtener descuentos:', error);
    return [];
  }
}

export async function deleteDescuento(idDescuento: number): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando descuento ID:', idDescuento);

    const { error } = await supabaseAdmin
      .from('descuento')
      .delete()
      .eq('id_descuento', idDescuento);

    if (error) {
      console.error('❌ Error al eliminar descuento:', error);
      return false;
    }

    console.log('✅ Descuento eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al eliminar descuento:', error);
    return false;
  }
}

// ========================================
// FUNCIONES AUXILIARES Y CÁLCULOS
// ========================================

export function calcularTotalCargo(cargo: CargoCompleto): {
  subtotal: number;
  totalAdicionales: number;
  totalDescuentos: number;
  total: number;
} {
  const subtotal = cargo.precio;

  const totalAdicionales = cargo.cargos_adicionales?.reduce(
    (sum, adicional) => sum + adicional.monto,
    0
  ) || 0;

  const totalDescuentos = cargo.descuentos?.reduce(
    (sum, descuento) => sum + descuento.monto,
    0
  ) || 0;

  const total = subtotal + totalAdicionales - totalDescuentos;

  return {
    subtotal,
    totalAdicionales,
    totalDescuentos,
    total: Math.max(0, total)
  };
}

export function calcularTotalPagado(cargo: CargoCompleto): number {
  return cargo.pagos?.reduce(
    (sum, pago) => pago.estado_pago === 'pagado' ? sum + pago.monto : sum,
    0
  ) || 0;
}

export function obtenerEstadoPago(cargo: CargoCompleto): EstadoPago {
  const { total } = calcularTotalCargo(cargo);
  const totalPagado = calcularTotalPagado(cargo);

  if (totalPagado === 0) {
    return 'pendiente';
  } else if (totalPagado >= total) {
    return 'pagado';
  } else {
    return 'parcial';
  }
}

export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(monto);
}

export function getColorEstadoPago(estado: EstadoPago): string {
  switch (estado) {
    case 'pagado':
      return 'green';
    case 'parcial':
      return 'yellow';
    case 'pendiente':
      return 'red';
    case 'cancelado':
      return 'gray';
    default:
      return 'gray';
  }
}

export function calcularEstadisticas(cargos: CargoCompleto[]): {
  totalCargos: number;
  totalPendiente: number;
  totalPagado: number;
  totalParcial: number;
  numeroPendientes: number;
  numeroPagados: number;
  numeroParciales: number;
} {
  let totalPendiente = 0;
  let totalPagado = 0;
  let totalParcial = 0;
  let numeroPendientes = 0;
  let numeroPagados = 0;
  let numeroParciales = 0;

  cargos.forEach(cargo => {
    const { total } = calcularTotalCargo(cargo);
    const pagado = calcularTotalPagado(cargo);
    const estado = obtenerEstadoPago(cargo);

    if (estado === 'pendiente') {
      totalPendiente += total;
      numeroPendientes++;
    } else if (estado === 'pagado') {
      totalPagado += total;
      numeroPagados++;
    } else if (estado === 'parcial') {
      totalParcial += total;
      numeroParciales++;
    }
  });

  return {
    totalCargos: cargos.length,
    totalPendiente,
    totalPagado,
    totalParcial,
    numeroPendientes,
    numeroPagados,
    numeroParciales
  };
}

export function exportarCargosCSV(cargos: CargoCompleto[]): void {
  const headers = [
    'Fecha',
    'Hora',
    'Paciente',
    'Cédula',
    'Médico',
    'Sucursal',
    'Motivo',
    'Subtotal',
    'Adicionales',
    'Descuentos',
    'Total',
    'Pagado',
    'Estado'
  ];

  const rows = cargos.map(cargo => {
    const { subtotal, totalAdicionales, totalDescuentos, total } = calcularTotalCargo(cargo);
    const pagado = calcularTotalPagado(cargo);
    const estado = obtenerEstadoPago(cargo);

    return [
      cargo.fecha,
      cargo.hora_inicio,
      `${cargo.paciente.nombres} ${cargo.paciente.apellidos}`,
      cargo.paciente.cedula,
      `Dr. ${cargo.usuario_sucursal.usuario.nombre} ${cargo.usuario_sucursal.usuario.apellido}`,
      cargo.usuario_sucursal.sucursal.nombre,
      cargo.motivo_consulta,
      subtotal.toFixed(2),
      totalAdicionales.toFixed(2),
      totalDescuentos.toFixed(2),
      total.toFixed(2),
      pagado.toFixed(2),
      estado.toUpperCase()
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `cobros_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}