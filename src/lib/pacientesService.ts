// Servicio de gestión de pacientes con Supabase
import { supabaseAdmin } from './supabase';  // ⚡ Cambio: usar supabaseAdmin en lugar de supabase

// ========================================
// INTERFACES Y TIPOS
// ========================================

export interface Paciente {
  id_paciente: number;
  id_compania: number;  // Agregado: campo de compañía
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F' | 'Otro';
  cedula: string;  // Cambio: era "identificacion"
  email: string | null;  // Cambio: era "correo"
  telefono: string | null;
  direccion: string | null;
  fecha_registro: string;
  estado: 'activo' | 'inactivo';
  created_at?: string;
}

export interface SignoVital {
  id_signo_vital: number;
  id_paciente: number;
  fecha_registro: string;
  estatura_cm: number | null;
  peso_kg: number | null;
  imc: number | null;
  temperatura_c: number | null;
  frecuencia_respiratoria: number | null;
  frecuencia_cardiaca: number | null;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  saturacion_oxigeno: number | null;
  notas: string | null;
  created_at?: string;
}

export interface Antecedente {
  id_antecedente: number;
  id_paciente: number;
  tipo_antecedente: string;
  descripcion: string;
  fecha_diagnostico: string | null;
  estado: 'activo' | 'inactivo';  // Cambio: era "activo: boolean"
  created_at?: string;
}

export interface ArchivoMedico {
  id_archivo: number;
  id_paciente: number;
  nombre_archivo: string;
  descripcion: string | null;
  tipo_archivo: string;
  url_archivo: string | null;
  fecha_carga: string;
  created_at?: string;
}

// ========================================
// FUNCIONES DE PACIENTES
// ========================================

/**
 * Obtener todos los pacientes activos
 */
export async function getAllPacientes(): Promise<Paciente[]> {
  try {
    console.log('📋 Obteniendo lista de pacientes...');

    const { data, error } = await supabaseAdmin
      .from('paciente')
      .select('*')
      .eq('estado', 'activo')
      .order('apellidos', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener pacientes:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} pacientes`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener pacientes:', error);
    return [];
  }
}

/**
 * Obtener todos los pacientes activos filtrados por compañía
 */
export async function getPacientesByCompania(idCompania: number): Promise<Paciente[]> {
  try {
    console.log('📋 Obteniendo pacientes de la compañía:', idCompania);

    const { data, error } = await supabaseAdmin
      .from('paciente')
      .select('*')
      .eq('estado', 'activo')
      .eq('id_compania', idCompania)
      .order('apellidos', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener pacientes:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} pacientes de la compañía ${idCompania}`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener pacientes:', error);
    return [];
  }
}

/**
 * Buscar pacientes por nombre, apellido o identificación
 */
export async function searchPacientes(query: string): Promise<Paciente[]> {
  try {
    console.log('🔍 Buscando pacientes:', query);

    const searchTerm = `%${query}%`;

    const { data, error } = await supabaseAdmin
      .from('paciente')
      .select('*')
      .eq('activo', true)
      .or(`nombres.ilike.${searchTerm},apellidos.ilike.${searchTerm},cedula.ilike.${searchTerm}`)
      .order('apellidos', { ascending: true });

    if (error) {
      console.error('❌ Error al buscar pacientes:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} pacientes`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al buscar pacientes:', error);
    return [];
  }
}

/**
 * Buscar pacientes por nombre, apellido o identificación filtrado por compañía
 */
export async function searchPacientesByCompania(query: string, idCompania: number): Promise<Paciente[]> {
  try {
    console.log('🔍 Buscando pacientes:', query, 'en compañía:', idCompania);

    const searchTerm = `%${query}%`;

    const { data, error } = await supabaseAdmin
      .from('paciente')
      .select('*')
      .eq('estado', 'activo')
      .eq('id_compania', idCompania)
      .or(`nombres.ilike.${searchTerm},apellidos.ilike.${searchTerm},cedula.ilike.${searchTerm}`)
      .order('apellidos', { ascending: true });

    if (error) {
      console.error('❌ Error al buscar pacientes:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} pacientes de la compañía ${idCompania}`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al buscar pacientes:', error);
    return [];
  }
}

/**
 * Obtener un paciente por ID
 */
export async function getPacienteById(id_paciente: number): Promise<Paciente | null> {
  try {
    console.log('🔍 Obteniendo paciente ID:', id_paciente);

    const { data, error } = await supabaseAdmin
      .from('paciente')
      .select('*')
      .eq('id_paciente', id_paciente)
      .maybeSingle(); // Cambiado de .single() a .maybeSingle()

    if (error) {
      console.error('❌ Error al obtener paciente:', error);
      return null;
    }

    console.log('✅ Paciente encontrado:', data.nombres, data.apellidos);
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al obtener paciente:', error);
    return null;
  }
}

/**
 * Buscar paciente por cédula y compañía
 */
export async function getPacienteByCedula(cedula: string, id_compania?: number): Promise<Paciente | null> {
  try {
    console.log('🔍 Buscando paciente por cédula:', cedula, id_compania ? `en compañía ${id_compania}` : '');

    let query = supabaseAdmin
      .from('paciente')
      .select('*')
      .eq('cedula', cedula)
      .eq('estado', 'activo');
    
    // Si se proporciona id_compania, filtrar por compañía
    if (id_compania) {
      query = query.eq('id_compania', id_compania);
    }
    
    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('❌ Error al buscar paciente por cédula:', error);
      return null;
    }

    if (data) {
      console.log('✅ Paciente encontrado con cédula:', cedula);
    } else {
      console.log('ℹ️ No se encontró paciente con cédula:', cedula);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al buscar paciente por cédula:', error);
    return null;
  }
}

/**
 * Crear un nuevo paciente
 */
export async function createPaciente(paciente: Omit<Paciente, 'id_paciente' | 'created_at' | 'estado'>): Promise<Paciente | null> {
  try {
    console.log('➕ Creando nuevo paciente:', paciente.nombres, paciente.apellidos);

    const { data, error } = await supabaseAdmin
      .from('paciente')
      .insert({
        ...paciente,
        estado: 'activo'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear paciente:', error);
      
      // Si es error de cédula duplicada, retornar null con mensaje específico
      if (error.code === '23505' && error.message.includes('cedula')) {
        throw new Error('CEDULA_DUPLICADA');
      }
      
      return null;
    }

    console.log('✅ Paciente creado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear paciente:', error);
    
    // Re-lanzar error de cédula duplicada
    if (error instanceof Error && error.message === 'CEDULA_DUPLICADA') {
      throw error;
    }
    
    return null;
  }
}

/**
 * Actualizar datos de un paciente
 */
export async function updatePaciente(id_paciente: number, updates: Partial<Paciente>): Promise<boolean> {
  try {
    console.log('✏️ Actualizando paciente ID:', id_paciente);

    const { error } = await supabaseAdmin
      .from('paciente')
      .update(updates)
      .eq('id_paciente', id_paciente);

    if (error) {
      console.error('❌ Error al actualizar paciente:', error);
      return false;
    }

    console.log('✅ Paciente actualizado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al actualizar paciente:', error);
    return false;
  }
}

/**
 * Desactivar un paciente (soft delete)
 */
export async function deletePaciente(id_paciente: number): Promise<boolean> {
  try {
    console.log('🗑️ Desactivando paciente ID:', id_paciente);

    const { error } = await supabaseAdmin
      .from('paciente')
      .update({ estado: 'inactivo' })
      .eq('id_paciente', id_paciente);

    if (error) {
      console.error('❌ Error al desactivar paciente:', error);
      return false;
    }

    console.log('✅ Paciente desactivado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al desactivar paciente:', error);
    return false;
  }
}

// ========================================
// FUNCIONES DE SIGNOS VITALES
// ========================================

/**
 * Obtener todos los signos vitales de un paciente
 */
export async function getSignosVitalesByPaciente(id_paciente: number): Promise<SignoVital[]> {
  try {
    console.log('🔍 Obteniendo signos vitales del paciente:', id_paciente);

    const { data, error } = await supabaseAdmin
      .from('signo_vital')
      .select('*')
      .eq('id_paciente', id_paciente)
      .order('fecha_registro', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener signos vitales:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} registros de signos vitales`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener signos vitales:', error);
    return [];
  }
}

/**
 * Crear un nuevo registro de signos vitales
 */
export async function createSignoVital(signo: Omit<SignoVital, 'id_signo_vital' | 'created_at'>): Promise<SignoVital | null> {
  try {
    console.log('➕ Creando nuevo registro de signos vitales para paciente:', signo.id_paciente);
    console.log('📊 Datos a insertar:', JSON.stringify(signo, null, 2));

    // Asegurar que todos los valores numéricos estén en el formato correcto
    const signoLimpio = {
      ...signo,
      estatura_cm: signo.estatura_cm !== null ? Math.min(999.99, Math.max(0, Number(signo.estatura_cm))) : null,
      peso_kg: signo.peso_kg !== null ? Math.min(999.99, Math.max(0, Number(signo.peso_kg))) : null,
      imc: signo.imc !== null ? Math.min(999.99, Math.max(0, Number(signo.imc))) : null,
      temperatura_c: signo.temperatura_c !== null ? Math.min(999.99, Math.max(0, Number(signo.temperatura_c))) : null,
      frecuencia_respiratoria: signo.frecuencia_respiratoria !== null ? Math.min(999, Math.max(0, Number(signo.frecuencia_respiratoria))) : null,
      frecuencia_cardiaca: signo.frecuencia_cardiaca !== null ? Math.min(999, Math.max(0, Number(signo.frecuencia_cardiaca))) : null,
      presion_sistolica: signo.presion_sistolica !== null ? Math.min(999, Math.max(0, Number(signo.presion_sistolica))) : null,
      presion_diastolica: signo.presion_diastolica !== null ? Math.min(999, Math.max(0, Number(signo.presion_diastolica))) : null,
      saturacion_oxigeno: signo.saturacion_oxigeno !== null ? Math.min(100, Math.max(0, Number(signo.saturacion_oxigeno))) : null,
    };

    console.log('📊 Datos limpiados:', JSON.stringify(signoLimpio, null, 2));

    const { data, error } = await supabaseAdmin
      .from('signo_vital')
      .insert(signoLimpio)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear signos vitales:', error);
      return null;
    }

    console.log('✅ Signos vitales guardados exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear signos vitales:', error);
    return null;
  }
}

/**
 * Actualizar un registro de signos vitales
 */
export async function updateSignoVital(id_signo_vital: number, updates: Partial<SignoVital>): Promise<boolean> {
  try {
    console.log('✏️ Actualizando signos vitales ID:', id_signo_vital);

    const { error } = await supabaseAdmin
      .from('signo_vital')
      .update(updates)
      .eq('id_signo_vital', id_signo_vital);

    if (error) {
      console.error('❌ Error al actualizar signos vitales:', error);
      return false;
    }

    console.log('✅ Signos vitales actualizados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al actualizar signos vitales:', error);
    return false;
  }
}

// ========================================
// FUNCIONES DE ANTECEDENTES MÉDICOS
// ========================================

// Almacenamiento en memoria y localStorage para antecedentes
const ANTECEDENTES_STORAGE_KEY = 'medical_antecedentes';

interface AntecedentesStorage {
  [pacienteId: number]: any;
}

/**
 * Cargar antecedentes desde localStorage
 */
function cargarAntecedentesStorage(): AntecedentesStorage {
  try {
    const stored = localStorage.getItem(ANTECEDENTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error al cargar antecedentes del localStorage:', error);
    return {};
  }
}

/**
 * Guardar antecedentes en localStorage
 */
function guardarAntecedentesStorage(storage: AntecedentesStorage): void {
  try {
    localStorage.setItem(ANTECEDENTES_STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error al guardar antecedentes en localStorage:', error);
  }
}

/**
 * Obtener todos los antecedentes de un paciente
 */
export async function getAntecedentesByPaciente(id_paciente: number): Promise<any> {
  try {
    console.log('🔍 Obteniendo antecedentes del paciente:', id_paciente);
    
    const storage = cargarAntecedentesStorage();
    const antecedentes = storage[id_paciente] || {};
    
    console.log(`✅ Antecedentes cargados para paciente ${id_paciente}`);
    return antecedentes;
  } catch (error) {
    console.error('❌ Error inesperado al obtener antecedentes:', error);
    return {};
  }
}

/**
 * Guardar o actualizar antecedente de un paciente
 */
export async function saveAntecedente(id_paciente: number, tipo: string, datos: any): Promise<boolean> {
  try {
    console.log('💾 Guardando antecedente:', { id_paciente, tipo });
    
    const storage = cargarAntecedentesStorage();
    
    // Obtener antecedentes actuales del paciente
    const antecedentesActuales = storage[id_paciente] || {};
    
    // Actualizar con los nuevos datos
    storage[id_paciente] = {
      ...antecedentesActuales,
      [tipo]: datos,
      updated_at: new Date().toISOString()
    };
    
    // Guardar en localStorage
    guardarAntecedentesStorage(storage);
    
    console.log('✅ Antecedente guardado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al guardar antecedente:', error);
    return false;
  }
}

/**
 * Funciones legacy para compatibilidad
 */
export async function createAntecedente(antecedente: Omit<Antecedente, 'id_antecedente' | 'created_at' | 'estado'>): Promise<Antecedente | null> {
  const success = await saveAntecedente(
    antecedente.id_paciente,
    antecedente.tipo_antecedente,
    JSON.parse(antecedente.descripcion)
  );
  
  if (success) {
    return {
      id_antecedente: Date.now(),
      ...antecedente,
      estado: 'activo',
      created_at: new Date().toISOString()
    };
  }
  return null;
}

export async function updateAntecedente(id_antecedente: number, updates: Partial<Antecedente>): Promise<boolean> {
  console.log('⚠️ updateAntecedente está deprecada, usar saveAntecedente');
  return true;
}

export async function deleteAntecedente(id_antecedente: number): Promise<boolean> {
  console.log('⚠️ deleteAntecedente no implementada');
  return true;
}

// ========================================
// FUNCIONES DE ARCHIVOS MÉDICOS
// ========================================

/**
 * Obtener todos los archivos de un paciente
 */
export async function getArchivosByPaciente(id_paciente: number): Promise<ArchivoMedico[]> {
  try {
    console.log('🔍 Obteniendo archivos del paciente:', id_paciente);

    const { data, error } = await supabaseAdmin
      .from('archivo_medico')
      .select('*')
      .eq('id_paciente', id_paciente)
      .order('fecha_carga', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener archivos:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} archivos`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al obtener archivos:', error);
    return [];
  }
}

/**
 * Crear un registro de archivo (metadata)
 */
export async function createArchivoMedico(archivo: Omit<ArchivoMedico, 'id_archivo' | 'created_at'>): Promise<ArchivoMedico | null> {
  try {
    console.log('➕ Creando nuevo archivo para paciente:', archivo.id_paciente);

    const { data, error } = await supabaseAdmin
      .from('archivo_medico')
      .insert(archivo)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear archivo:', error);
      return null;
    }

    console.log('✅ Archivo registrado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado al crear archivo:', error);
    return null;
  }
}

/**
 * Eliminar un archivo médico
 */
export async function deleteArchivoMedico(id_archivo: number): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando archivo ID:', id_archivo);

    const { error } = await supabaseAdmin
      .from('archivo_medico')
      .delete()
      .eq('id_archivo', id_archivo);

    if (error) {
      console.error('❌ Error al eliminar archivo:', error);
      return false;
    }

    console.log('✅ Archivo eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al eliminar archivo:', error);
    return false;
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Calcular IMC a partir de peso y estatura
 */
export function calcularIMC(peso_kg: number | null, estatura_cm: number | null): number | null {
  if (!peso_kg || !estatura_cm || estatura_cm === 0) {
    return null;
  }
  
  const estaturaMetros = estatura_cm / 100;
  const imc = peso_kg / (estaturaMetros * estaturaMetros);
  
  // Limitar a 999.99 para cumplir con NUMERIC(5,2)
  const imcRedondeado = Math.round(imc * 100) / 100;
  return Math.min(999.99, imcRedondeado);
}

/**
 * Calcular edad a partir de fecha de nacimiento
 */
export function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

/**
 * Obtener iniciales de un nombre completo
 */
export function getIniciales(nombres: string, apellidos: string): string {
  const primeraLetraNombre = nombres.charAt(0).toUpperCase();
  const primeraLetraApellido = apellidos.charAt(0).toUpperCase();
  return `${primeraLetraNombre}${primeraLetraApellido}`;
}