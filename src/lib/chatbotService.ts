// Servicio de ChatBot con Supabase y memoria persistente
import { supabaseAdmin } from './supabase';  // ⚡ Cambio: usar supabaseAdmin para bypasear RLS

// ========================================
// INTERFACES
// ========================================

export type TipoConversacion = 'agendamiento' | 'consulta_info' | 'reagendamiento' | 'cancelacion';
export type EstadoConversacion = 'completado' | 'pendiente' | 'cancelado';
export type RolMensaje = 'usuario' | 'asistente' | 'sistema' | 'bot' | 'paciente';

export interface Conversacion {
  id_conversacion: number;
  id_paciente: number;
  id_cita: number | null;
  fecha_conversacion: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: TipoConversacion;
  estado: EstadoConversacion;
  mensajes: any; // JSONB
  resultado: any; // JSONB
  created_at?: string;
  updated_at?: string;
  paciente?: {
    id_paciente: number;
    nombres: string;
    apellidos: string;
    cedula: string;
  };
}

export interface Mensaje {
  id_mensaje: number;
  tipo: RolMensaje;
  texto: string;
  hora: string;
}

export interface ConversacionConMensajes extends Conversacion {
  mensajesArray: Mensaje[];
}

// ========================================
// FUNCIONES - CONVERSACIONES
// ========================================

/**
 * Obtener todas las conversaciones
 */
export async function getAllConversaciones(): Promise<Conversacion[]> {
  try {
    console.log('💬 Obteniendo conversaciones...');
    const { data, error } = await supabaseAdmin
      .from('conversacion_chatbot')
      .select(`
        *,
        paciente:paciente(id_paciente, nombres, apellidos, cedula)
      `)
      .order('fecha_conversacion', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener conversaciones:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} conversaciones`);
    return data as any || [];
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

/**
 * Obtener conversaciones por paciente
 */
export async function getConversacionesByPaciente(idPaciente: number): Promise<Conversacion[]> {
  try {
    console.log('💬 Obteniendo conversaciones del paciente:', idPaciente);
    const { data, error } = await supabaseAdmin
      .from('conversacion_chatbot')
      .select(`
        *,
        paciente:paciente(id_paciente, nombres, apellidos, cedula)
      `)
      .eq('id_paciente', idPaciente)
      .order('fecha_conversacion', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener conversaciones:', error);
      return [];
    }

    return data as any || [];
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

/**
 * Obtener una conversación con sus mensajes
 */
export async function getConversacionConMensajes(idConversacion: number): Promise<ConversacionConMensajes | null> {
  try {
    console.log('💬 Obteniendo conversación con mensajes:', idConversacion);
    
    // Obtener conversación
    const { data: conversacion, error: errorConv } = await supabaseAdmin
      .from('conversacion_chatbot')
      .select(`
        *,
        paciente:paciente(id_paciente, nombres, apellidos, cedula)
      `)
      .eq('id_conversacion', idConversacion)
      .maybeSingle(); // Cambiado de .single() a .maybeSingle()

    if (errorConv || !conversacion) {
      console.error('❌ Error al obtener conversación:', errorConv);
      return null;
    }

    // Obtener mensajes
    const { data: mensajes, error: errorMsg } = await supabaseAdmin
      .from('mensaje_chatbot')
      .select('*')
      .eq('id_conversacion', idConversacion)
      .order('hora', { ascending: true });

    if (errorMsg) {
      console.error('❌ Error al obtener mensajes:', errorMsg);
      return null;
    }

    return {
      ...(conversacion as any),
      mensajesArray: mensajes || []
    };
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
}

/**
 * Crear nueva conversación
 */
export async function createConversacion(
  idPaciente: number,
  tipo: TipoConversacion = 'consulta_info'
): Promise<Conversacion | null> {
  try {
    console.log('➕ Creando conversación para paciente:', idPaciente);
    
    const ahora = new Date().toISOString();
    const nuevaConversacion = {
      id_paciente: idPaciente,
      tipo,
      estado: 'pendiente' as EstadoConversacion,
      fecha_conversacion: ahora,
      hora_inicio: ahora,
      hora_fin: ahora,
      mensajes: [],
      resultado: {}
    };

    const { data, error } = await supabaseAdmin
      .from('conversacion_chatbot')
      .insert(nuevaConversacion)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear conversación:', error);
      return null;
    }

    console.log('✅ Conversación creada exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
}

/**
 * Actualizar estado de conversación
 */
export async function updateConversacion(
  idConversacion: number,
  updates: Partial<Conversacion>
): Promise<boolean> {
  try {
    console.log('✏️ Actualizando conversación:', idConversacion);
    
    const { error } = await supabaseAdmin
      .from('conversacion_chatbot')
      .update({
        ...updates,
        hora_fin: new Date().toISOString()
      })
      .eq('id_conversacion', idConversacion);

    if (error) {
      console.error('❌ Error al actualizar conversación:', error);
      return false;
    }

    console.log('✅ Conversación actualizada');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}

/**
 * Cerrar conversación
 */
export async function cerrarConversacion(idConversacion: number): Promise<boolean> {
  return updateConversacion(idConversacion, { estado: 'completado' });
}

/**
 * Eliminar conversación
 */
export async function deleteConversacion(idConversacion: number): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando conversación:', idConversacion);
    
    // Primero eliminar mensajes
    await supabaseAdmin
      .from('mensaje_chatbot')
      .delete()
      .eq('id_conversacion', idConversacion);

    // Luego eliminar conversación
    const { error } = await supabaseAdmin
      .from('conversacion_chatbot')
      .delete()
      .eq('id_conversacion', idConversacion);

    if (error) {
      console.error('❌ Error al eliminar conversación:', error);
      return false;
    }

    console.log('✅ Conversación eliminada');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}

// ========================================
// FUNCIONES - MENSAJES
// ========================================

/**
 * Agregar mensaje a conversación
 */
export async function addMensaje(
  idConversacion: number,
  rol: RolMensaje,
  contenido: string,
  metadatos?: any
): Promise<Mensaje | null> {
  try {
    console.log('➕ Agregando mensaje a conversación:', idConversacion);
    
    const nuevoMensaje = {
      id_conversacion: idConversacion,
      tipo: rol,
      texto: contenido,
      hora: new Date().toISOString(),
      metadatos: metadatos || {}
    };

    const { data, error } = await supabaseAdmin
      .from('mensaje_chatbot')
      .insert(nuevoMensaje)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al agregar mensaje:', error);
      return null;
    }

    // Actualizar fecha de última actualización de la conversación
    await updateConversacion(idConversacion, {});

    console.log('✅ Mensaje agregado');
    return data;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
}

/**
 * Obtener mensajes de una conversación
 */
export async function getMensajesByConversacion(idConversacion: number): Promise<Mensaje[]> {
  try {
    console.log('💬 Obteniendo mensajes de conversación:', idConversacion);
    
    const { data, error } = await supabaseAdmin
      .from('mensaje_chatbot')
      .select('*')
      .eq('id_conversacion', idConversacion)
      .order('hora', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener mensajes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
}

// ========================================
// FUNCIONES - INTEGRACIÓN CON IA
// ========================================

/**
 * Generar respuesta del chatbot (simulada)
 * En producción, aquí integrarías OpenAI, Anthropic, etc.
 */
export async function generarRespuestaIA(
  mensajeUsuario: string,
  contexto: Mensaje[] = []
): Promise<string> {
  try {
    console.log('🤖 Generando respuesta IA para:', mensajeUsuario);

    // SIMULACIÓN - En producción, llamarías a la API de OpenAI aquí
    // Ejemplo con OpenAI:
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [
    //     { role: "system", content: "Eres un asistente médico..." },
    //     ...contexto.map(m => ({ role: m.rol, content: m.contenido })),
    //     { role: "user", content: mensajeUsuario }
    //   ]
    // });
    // return response.choices[0].message.content;

    // RESPUESTAS SIMULADAS INTELIGENTES
    const mensajeLower = mensajeUsuario.toLowerCase();

    // Respuestas sobre citas
    if (mensajeLower.includes('cita') || mensajeLower.includes('agendar')) {
      return `Para agendar una cita, puedes ir a la sección "Agenda" en el menú principal. Allí podrás:

📅 Ver el calendario semanal con disponibilidad
➕ Crear nueva cita seleccionando paciente, médico y horario
🔍 Buscar pacientes existentes o registrar nuevos
✅ Confirmar la cita

¿Necesitas ayuda con algo específico del proceso de agendamiento?`;
    }

    // Respuestas sobre pacientes
    if (mensajeLower.includes('paciente') || mensajeLower.includes('historia')) {
      return `En la sección "Pacientes" puedes:

👤 Ver lista completa de pacientes registrados
🔍 Buscar por nombre, cédula o código
📋 Registrar signos vitales (presión, temperatura, peso, etc.)
📝 Llenar historia clínica y antecedentes médicos
📎 Adjuntar archivos y documentos
💊 Registrar alergias y medicamentos

¿Qué información de pacientes necesitas consultar?`;
    }

    // Respuestas sobre cobros
    if (mensajeLower.includes('cobro') || mensajeLower.includes('pago') || mensajeLower.includes('factura')) {
      return `El módulo de "Cobros" te permite:

💰 Gestionar pagos de consultas y procedimientos
➕ Agregar cargos adicionales (exámenes, medicamentos)
💳 Registrar múltiples formas de pago (efectivo, tarjeta, transferencia)
💵 Aplicar descuentos
📊 Ver dashboard con métricas financieras
📥 Exportar reportes a CSV

¿Necesitas ayuda con algún proceso de cobro?`;
    }

    // Respuestas sobre reportes
    if (mensajeLower.includes('reporte') || mensajeLower.includes('estadística') || mensajeLower.includes('análisis')) {
      return `En "Reportes" encontrarás análisis completo del sistema:

📊 Estadísticas generales (pacientes, citas, ingresos)
📈 Gráficos de citas por día
💰 Análisis de ingresos y pagos pendientes
👨‍⚕️ Desempeño por médico
🏥 Desempeño por sucursal
👥 Top pacientes (más frecuentes o que más gastan)
💳 Distribución de formas de pago

¿Qué tipo de análisis necesitas ver?`;
    }

    // Respuestas sobre configuraciones
    if (mensajeLower.includes('configuración') || mensajeLower.includes('configurar') || mensajeLower.includes('usuario')) {
      return `El panel de "Configuraciones" te permite administrar:

🏢 Compañías y sucursales
🚪 Consultorios
👥 Usuarios del sistema (médicos, administrativos)
🔗 Asignaciones de usuarios a sucursales
📅 Horarios de atención por médico
💰 Precios base y personalizados

¿Qué necesitas configurar en el sistema?`;
    }

    // Saludo
    if (mensajeLower.includes('hola') || mensajeLower.includes('buenos') || mensajeLower.includes('buenas')) {
      return `¡Hola! 👋 Soy tu asistente virtual de MediControl.

Puedo ayudarte con:
• 📅 Información sobre citas y agenda
• 👤 Gestión de pacientes
• 💰 Cobros y facturación
• 📊 Reportes y estadísticas
• ⚙️ Configuraciones del sistema

¿En qué puedo ayudarte hoy?`;
    }

    // Ayuda general
    if (mensajeLower.includes('ayuda') || mensajeLower.includes('help')) {
      return `Estoy aquí para ayudarte con el sistema MediControl. Puedo asistirte con:

📋 **Módulos disponibles:**
• Agenda - Gestión de citas médicas
• Pacientes - Historias clínicas y datos
• Cobros - Facturación y pagos
• Reportes - Análisis y estadísticas
• Configuraciones - Administración del sistema

💡 **Pregúntame sobre:**
• Cómo agendar una cita
• Cómo registrar información de pacientes
• Cómo procesar pagos
• Cómo ver reportes
• Cualquier duda del sistema

¿Qué necesitas saber?`;
    }

    // Respuesta por defecto
    return `Entiendo tu consulta sobre "${mensajeUsuario}".

Como asistente de MediControl, puedo ayudarte con:
• 📅 Agendamiento de citas
• 👤 Gestión de pacientes
• 💰 Cobros y facturación
• 📊 Reportes del sistema
• ⚙️ Configuraciones

¿Podrías darme más detalles sobre lo que necesitas? Por ejemplo, puedes preguntarme:
- "¿Cómo agendar una cita?"
- "¿Cómo registrar un paciente?"
- "¿Cómo ver los reportes?"`;
  } catch (error) {
    console.error('❌ Error al generar respuesta:', error);
    return 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?';
  }
}

/**
 * Procesar mensaje del usuario y generar respuesta
 */
export async function procesarMensajeUsuario(
  idConversacion: number,
  mensajeUsuario: string
): Promise<Mensaje | null> {
  try {
    // 1. Guardar mensaje del usuario
    const mensajeGuardado = await addMensaje(idConversacion, 'usuario', mensajeUsuario);
    if (!mensajeGuardado) {
      console.error('❌ No se pudo guardar el mensaje del usuario');
      return null;
    }

    // 2. Obtener contexto (últimos 10 mensajes)
    const mensajes = await getMensajesByConversacion(idConversacion);
    const contexto = mensajes.slice(-10);

    // 3. Generar respuesta IA
    const respuestaIA = await generarRespuestaIA(mensajeUsuario, contexto);

    // 4. Guardar respuesta del asistente
    const respuestaGuardada = await addMensaje(idConversacion, 'asistente', respuestaIA);

    return respuestaGuardada;
  } catch (error) {
    console.error('❌ Error al procesar mensaje:', error);
    return null;
  }
}

// ========================================
// FUNCIONES - ESTADÍSTICAS
// ========================================

/**
 * Obtener estadísticas de conversaciones
 */
export async function getEstadisticasConversaciones() {
  try {
    console.log('📊 Obteniendo estadísticas de conversaciones...');

    const { data: conversaciones, error } = await supabaseAdmin
      .from('conversacion_chatbot')
      .select('tipo, estado');

    if (error) {
      console.error('❌ Error:', error);
      return {
        totalConversaciones: 0,
        conversacionesActivas: 0,
        conversacionesCerradas: 0,
        porTipo: {}
      };
    }

    const stats = {
      totalConversaciones: conversaciones?.length || 0,
      conversacionesActivas: conversaciones?.filter(c => c.estado === 'pendiente').length || 0,
      conversacionesCerradas: conversaciones?.filter(c => c.estado === 'completado').length || 0,
      porTipo: conversaciones?.reduce((acc, c) => {
        acc[c.tipo] = (acc[c.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    return stats;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return {
      totalConversaciones: 0,
      conversacionesActivas: 0,
      conversacionesCerradas: 0,
      porTipo: {}
    };
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

export function formatearTipoConversacion(tipo: TipoConversacion): string {
  const tipos = {
    agendamiento: 'Agendamiento',
    consulta_info: 'Consulta de Información',
    reagendamiento: 'Reagendamiento',
    cancelacion: 'Cancelación'
  };
  return tipos[tipo] || tipo;
}

export function formatearEstadoConversacion(estado: EstadoConversacion): string {
  const estados = {
    completado: 'Completado',
    pendiente: 'Pendiente',
    cancelado: 'Cancelado'
  };
  return estados[estado] || estado;
}

export function formatearFechaRelativa(fecha: string): string {
  const ahora = new Date();
  const fechaMsg = new Date(fecha);
  const diferencia = ahora.getTime() - fechaMsg.getTime();
  
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(diferencia / 3600000);
  const dias = Math.floor(diferencia / 86400000);

  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  
  return fechaMsg.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short' 
  });
}