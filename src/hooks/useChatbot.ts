// Hooks personalizados para el ChatBot
import { useState, useEffect, useCallback } from 'react';
import {
  getAllConversaciones,
  getConversacionesByPaciente,
  getConversacionConMensajes,
  createConversacion,
  updateConversacion,
  cerrarConversacion,
  deleteConversacion,
  procesarMensajeUsuario,
  getEstadisticasConversaciones,
  formatearTipoConversacion,
  formatearEstadoConversacion,
  formatearFechaRelativa,
  type Conversacion,
  type ConversacionConMensajes,
  type TipoConversacion,
  type Mensaje
} from '../lib/chatbotService';

// ========================================
// HOOK: CONVERSACIONES
// ========================================

export function useConversaciones(idPaciente?: number) {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversaciones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = idPaciente
        ? await getConversacionesByPaciente(idPaciente)
        : await getAllConversaciones();
      setConversaciones(data);
    } catch (err) {
      setError('Error al cargar conversaciones');
      console.error(err);
    }
    
    setIsLoading(false);
  }, [idPaciente]);

  useEffect(() => {
    loadConversaciones();
  }, [loadConversaciones]);

  const crearConversacion = async (
    idPaciente: number,
    tipo: TipoConversacion = 'consulta_info'
  ) => {
    const nueva = await createConversacion(idPaciente, tipo);
    if (nueva) {
      await loadConversaciones();
      return nueva;
    }
    return null;
  };

  const actualizarConversacion = async (id: number, updates: Partial<Conversacion>) => {
    const success = await updateConversacion(id, updates);
    if (success) {
      await loadConversaciones();
    }
    return success;
  };

  const cerrarConversacionById = async (id: number) => {
    const success = await cerrarConversacion(id);
    if (success) {
      await loadConversaciones();
    }
    return success;
  };

  const eliminarConversacion = async (id: number) => {
    const success = await deleteConversacion(id);
    if (success) {
      await loadConversaciones();
    }
    return success;
  };

  return {
    conversaciones,
    isLoading,
    error,
    loadConversaciones,
    crearConversacion,
    actualizarConversacion,
    cerrarConversacionById,
    eliminarConversacion
  };
}

// ========================================
// HOOK: CONVERSACIÓN ACTIVA CON MENSAJES
// ========================================

export function useConversacionActiva(idConversacion: number | null) {
  const [conversacion, setConversacion] = useState<ConversacionConMensajes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversacion = useCallback(async () => {
    if (!idConversacion) {
      setConversacion(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getConversacionConMensajes(idConversacion);
      setConversacion(data);
    } catch (err) {
      setError('Error al cargar conversación');
      console.error(err);
    }
    
    setIsLoading(false);
  }, [idConversacion]);

  useEffect(() => {
    loadConversacion();
  }, [loadConversacion]);

  const enviarMensaje = async (mensaje: string) => {
    if (!idConversacion || !mensaje.trim()) {
      return null;
    }

    setIsSending(true);
    setError(null);

    try {
      const respuesta = await procesarMensajeUsuario(idConversacion, mensaje.trim());
      
      if (respuesta) {
        // Recargar conversación para obtener todos los mensajes actualizados
        await loadConversacion();
        return respuesta;
      }
      
      setError('Error al enviar mensaje');
      return null;
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error(err);
      return null;
    } finally {
      setIsSending(false);
    }
  };

  return {
    conversacion,
    mensajes: conversacion?.mensajesArray || [],
    isLoading,
    isSending,
    error,
    loadConversacion,
    enviarMensaje
  };
}

// ========================================
// HOOK: ESTADÍSTICAS
// ========================================

export function useEstadisticasChatbot() {
  const [estadisticas, setEstadisticas] = useState({
    totalConversaciones: 0,
    conversacionesActivas: 0,
    conversacionesCerradas: 0,
    porTipo: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadEstadisticas = useCallback(async () => {
    setIsLoading(true);
    const stats = await getEstadisticasConversaciones();
    setEstadisticas(stats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEstadisticas();
  }, [loadEstadisticas]);

  return {
    estadisticas,
    isLoading,
    loadEstadisticas
  };
}

// Exportar funciones auxiliares
export {
  formatearTipoConversacion,
  formatearEstadoConversacion,
  formatearFechaRelativa
};