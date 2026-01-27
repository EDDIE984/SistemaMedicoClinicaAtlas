// Datos de conversaciones del Chatbot integradas con el modelo ER

import type { TipoConversacionChatbot, EstadoConversacion, TipoMensaje } from './mockData';

export interface MensajeChatbot {
  id_mensaje: number;
  tipo: TipoMensaje;
  texto: string;
  hora: string;
}

export interface ConversacionChatbot {
  id_conversacion: number;
  id_paciente: number; // FK a PACIENTE
  id_cita?: number; // FK a CITA (opcional)
  fecha_conversacion: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: TipoConversacionChatbot;
  estado: EstadoConversacion;
  mensajes: MensajeChatbot[];
  resultado?: {
    cita_fecha?: string;
    cita_hora?: string;
    id_medico?: number; // FK a USUARIO
    motivo?: string;
  };
}

// CONVERSACIONES_CHATBOT - Vinculadas a pacientes reales del sistema
export const conversacionesChatbot: ConversacionChatbot[] = [
  {
    id_conversacion: 1,
    id_paciente: 1, // Pedro Antonio García Mora
    id_cita: 1,
    fecha_conversacion: "2024-11-25",
    hora_inicio: "09:30",
    hora_fin: "09:35",
    tipo: "agendamiento",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "09:30" },
      { id_mensaje: 2, tipo: "paciente", texto: "Hola, quiero agendar una cita con cardiología", hora: "09:31" },
      { id_mensaje: 3, tipo: "bot", texto: "Perfecto, con gusto te ayudo. Tenemos disponibles al Dr. Juan Yepez y la Dra. María López en cardiología. ¿Con cuál prefieres?", hora: "09:31" },
      { id_mensaje: 4, tipo: "paciente", texto: "Con el Dr. Yepez por favor", hora: "09:32" },
      { id_mensaje: 5, tipo: "bot", texto: "Excelente. El Dr. Juan Yepez tiene disponibilidad. ¿Qué día prefieres?", hora: "09:32" },
      { id_mensaje: 6, tipo: "paciente", texto: "Mañana martes si es posible", hora: "09:33" },
      { id_mensaje: 7, tipo: "bot", texto: "Tengo disponibilidad el martes 26 de noviembre a las 09:00 AM en Sucursal Norte. ¿Te parece bien?", hora: "09:33" },
      { id_mensaje: 8, tipo: "paciente", texto: "Perfecto, agenda esa por favor", hora: "09:34" },
      { id_mensaje: 9, tipo: "bot", texto: "¡Listo! Tu cita ha sido agendada para el martes 26 de noviembre a las 09:00 AM con el Dr. Juan Yepez. Te enviaremos un recordatorio. ¿Necesitas algo más?", hora: "09:34" },
      { id_mensaje: 10, tipo: "paciente", texto: "No, gracias", hora: "09:35" }
    ],
    resultado: {
      cita_fecha: "2024-11-26",
      cita_hora: "09:00",
      id_medico: 1,
      motivo: "Control de presión arterial"
    }
  },
  {
    id_conversacion: 2,
    id_paciente: 2, // María Fernanda Rodríguez Silva
    id_cita: 2,
    fecha_conversacion: "2024-11-24",
    hora_inicio: "10:15",
    hora_fin: "10:20",
    tipo: "agendamiento",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "10:15" },
      { id_mensaje: 2, tipo: "paciente", texto: "Necesito agendar una cita urgente, tengo dolor en el pecho", hora: "10:16" },
      { id_mensaje: 3, tipo: "bot", texto: "Entiendo tu preocupación. Te recomiendo una cita de primera vez con cardiología. Tengo disponibilidad mañana con el Dr. Juan Yepez a las 10:00 AM. ¿Te funciona?", hora: "10:17" },
      { id_mensaje: 4, tipo: "paciente", texto: "Sí, perfecto. Allí estaré", hora: "10:18" },
      { id_mensaje: 5, tipo: "bot", texto: "¡Cita confirmada! Martes 26 de noviembre a las 10:00 AM con el Dr. Juan Yepez en Sucursal Norte. Si el dolor persiste, por favor acude a emergencias.", hora: "10:19" },
      { id_mensaje: 6, tipo: "paciente", texto: "Entendido, gracias", hora: "10:20" }
    ],
    resultado: {
      cita_fecha: "2024-11-26",
      cita_hora: "10:00",
      id_medico: 1,
      motivo: "Dolor en el pecho"
    }
  },
  {
    id_conversacion: 3,
    id_paciente: 3, // Carlos Andrés Martínez López
    id_cita: 3,
    fecha_conversacion: "2024-11-20",
    hora_inicio: "14:20",
    hora_fin: "14:26",
    tipo: "agendamiento",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "14:20" },
      { id_mensaje: 2, tipo: "paciente", texto: "Hola, quiero agendar control pediátrico para mi hijo", hora: "14:21" },
      { id_mensaje: 3, tipo: "bot", texto: "Claro, tenemos al Dr. Carlos Ramírez especialista en pediatría. ¿Qué día necesitas la cita?", hora: "14:21" },
      { id_mensaje: 4, tipo: "paciente", texto: "Necesito para esta semana si es posible", hora: "14:22" },
      { id_mensaje: 5, tipo: "bot", texto: "Tengo disponibilidad este miércoles 27 de noviembre a las 2:00 PM en Sucursal Sur. ¿Te sirve?", hora: "14:22" },
      { id_mensaje: 6, tipo: "paciente", texto: "Sí, perfecto", hora: "14:23" },
      { id_mensaje: 7, tipo: "bot", texto: "¿Cuál es el motivo de la consulta?", hora: "14:24" },
      { id_mensaje: 8, tipo: "paciente", texto: "Control pediátrico mensual", hora: "14:25" },
      { id_mensaje: 9, tipo: "bot", texto: "¡Excelente! Tu cita ha sido agendada para el miércoles 27 de noviembre a las 2:00 PM con el Dr. Carlos Ramírez para control pediátrico. Te llegará un SMS de confirmación.", hora: "14:25" }
    ],
    resultado: {
      cita_fecha: "2024-11-27",
      cita_hora: "14:00",
      id_medico: 3,
      motivo: "Control pediátrico mensual"
    }
  },
  {
    id_conversacion: 4,
    id_paciente: 4, // Ana María Pérez Vargas
    fecha_conversacion: "2024-11-22",
    hora_inicio: "11:00",
    hora_fin: "11:04",
    tipo: "consulta_info",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "11:00" },
      { id_mensaje: 2, tipo: "paciente", texto: "Necesito información sobre horarios de atención", hora: "11:01" },
      { id_mensaje: 3, tipo: "bot", texto: "Con gusto te ayudo. Nuestros horarios son: Sucursal Norte de lunes a viernes 08:00-18:00. Sucursal Sur de lunes a sábado 07:00-19:00.", hora: "11:02" },
      { id_mensaje: 4, tipo: "paciente", texto: "¿Tienen servicio de cardiología?", hora: "11:03" },
      { id_mensaje: 5, tipo: "bot", texto: "Sí, contamos con dos especialistas en cardiología: Dr. Juan Yepez y Dra. María López. ¿Deseas agendar una cita?", hora: "11:03" },
      { id_mensaje: 6, tipo: "paciente", texto: "No por ahora, gracias", hora: "11:04" }
    ]
  },
  {
    id_conversacion: 5,
    id_paciente: 1, // Pedro Antonio García Mora
    fecha_conversacion: "2024-11-18",
    hora_inicio: "15:45",
    hora_fin: "15:48",
    tipo: "consulta_info",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "15:45" },
      { id_mensaje: 2, tipo: "paciente", texto: "¿Cuál es la dirección de la Sucursal Norte?", hora: "15:46" },
      { id_mensaje: 3, tipo: "bot", texto: "La Sucursal Norte está ubicada en Av. Norte 456. Teléfono: 022345679", hora: "15:47" },
      { id_mensaje: 4, tipo: "paciente", texto: "Gracias", hora: "15:48" }
    ]
  },
  {
    id_conversacion: 6,
    id_paciente: 2, // María Fernanda Rodríguez Silva
    fecha_conversacion: "2024-11-23",
    hora_inicio: "16:30",
    hora_fin: "16:34",
    tipo: "reagendamiento",
    estado: "pendiente",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "16:30" },
      { id_mensaje: 2, tipo: "paciente", texto: "Quiero cambiar mi cita de mañana", hora: "16:31" },
      { id_mensaje: 3, tipo: "bot", texto: "Entiendo. Veo que tienes una cita el 26 de noviembre a las 10:00 AM con el Dr. Juan Yepez. ¿A qué día te gustaría cambiarla?", hora: "16:32" },
      { id_mensaje: 4, tipo: "paciente", texto: "Para la próxima semana", hora: "16:33" },
      { id_mensaje: 5, tipo: "bot", texto: "Déjame verificar disponibilidad y te contacto por correo con las opciones disponibles.", hora: "16:34" }
    ]
  },
  {
    id_conversacion: 7,
    id_paciente: 3, // Carlos Andrés Martínez López (niño)
    fecha_conversacion: "2024-11-19",
    hora_inicio: "09:15",
    hora_fin: "09:18",
    tipo: "consulta_info",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "09:15" },
      { id_mensaje: 2, tipo: "paciente", texto: "¿Tienen pediatría?", hora: "09:16" },
      { id_mensaje: 3, tipo: "bot", texto: "Sí, contamos con el Dr. Carlos Ramírez especialista en pediatría. Atiende en Sucursal Sur.", hora: "09:17" },
      { id_mensaje: 4, tipo: "paciente", texto: "Gracias", hora: "09:18" }
    ]
  },
  {
    id_conversacion: 8,
    id_paciente: 4, // Ana María Pérez Vargas
    id_cita: 7,
    fecha_conversacion: "2024-11-23",
    hora_inicio: "16:00",
    hora_fin: "16:06",
    tipo: "agendamiento",
    estado: "completado",
    mensajes: [
      { id_mensaje: 1, tipo: "bot", texto: "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", hora: "16:00" },
      { id_mensaje: 2, tipo: "paciente", texto: "Quiero agendar una cita para control de presión arterial", hora: "16:01" },
      { id_mensaje: 3, tipo: "bot", texto: "Claro, eso requiere una consulta cardiológica. Tengo disponibilidad con el Dr. Juan Yepez este lunes 25 a las 10:30 AM. ¿Te funciona?", hora: "16:02" },
      { id_mensaje: 4, tipo: "paciente", texto: "Perfecto", hora: "16:03" },
      { id_mensaje: 5, tipo: "bot", texto: "¡Cita agendada! Lunes 25 de noviembre a las 10:30 AM con el Dr. Juan Yepez en Sucursal Norte. Te enviaremos recordatorio.", hora: "16:04" }
    ],
    resultado: {
      cita_fecha: "2024-11-25",
      cita_hora: "10:30",
      id_medico: 1,
      motivo: "Presión arterial alta"
    }
  }
];
