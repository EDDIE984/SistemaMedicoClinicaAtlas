// Vista del ChatBot integrado con Supabase
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Loader2, 
  Bot, 
  User as UserIcon, 
  Trash2,
  X,
  CheckCircle,
  Clock,
  Search,
  MoreVertical,
  MessageCircle
} from 'lucide-react';
import { SupabaseIndicator } from './SupabaseIndicator';
import { toast } from 'sonner';
import {
  useConversaciones,
  useConversacionActiva,
  useEstadisticasChatbot,
  formatearTipoConversacion,
  formatearEstadoConversacion,
  formatearFechaRelativa
} from '../hooks/useChatbot';
import type { Conversacion, Mensaje } from '../lib/chatbotService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ChatBotViewSupabaseProps {
  currentUser?: {
    id_usuario?: number;
    name?: string;
  } | null;
}

export function ChatBotViewSupabase({ currentUser }: ChatBotViewSupabaseProps) {
  // Estados
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<number | null>(null);
  const [mensajeInput, setMensajeInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversacionAEliminar, setConversacionAEliminar] = useState<Conversacion | null>(null);

  // Hooks
  const { conversaciones, isLoading: loadingConversaciones, crearConversacion, eliminarConversacion } = useConversaciones();
  const { conversacion, mensajes, isLoading: loadingMensajes, isSending, enviarMensaje } = useConversacionActiva(conversacionSeleccionada);
  const { estadisticas, isLoading: loadingStats } = useEstadisticasChatbot();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Focus en input al seleccionar conversación
  useEffect(() => {
    if (conversacionSeleccionada) {
      inputRef.current?.focus();
    }
  }, [conversacionSeleccionada]);

  // Filtrar conversaciones por búsqueda
  const conversacionesFiltradas = conversaciones.filter(conv => {
    const titulo = conv.paciente 
      ? `${conv.paciente.nombres} ${conv.paciente.apellidos}`
      : `Conversación #${conv.id_conversacion}`;
    return titulo.toLowerCase().includes(busqueda.toLowerCase());
  });

  // Handlers
  const handleNuevaConversacion = async () => {
    // Para crear una conversación, necesitamos un paciente
    // Por ahora usaremos un ID de paciente de ejemplo (1)
    // TODO: En producción, debería haber un selector de paciente
    const idPacienteDemo = 1;
    
    const nueva = await crearConversacion(
      idPacienteDemo,
      'consulta_info'
    );

    if (nueva) {
      setConversacionSeleccionada(nueva.id_conversacion);
      toast.success('Nueva conversación creada');
    } else {
      toast.error('Error al crear conversación');
    }
  };

  const handleEnviarMensaje = async () => {
    if (!mensajeInput.trim() || !conversacionSeleccionada) return;

    const mensajeTexto = mensajeInput;
    setMensajeInput(''); // Limpiar input inmediatamente

    const respuesta = await enviarMensaje(mensajeTexto);
    
    if (!respuesta) {
      toast.error('Error al enviar mensaje');
      setMensajeInput(mensajeTexto); // Restaurar mensaje si hubo error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const handleEliminarConversacion = (conv: Conversacion) => {
    setConversacionAEliminar(conv);
    setDeleteDialogOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!conversacionAEliminar) return;

    const success = await eliminarConversacion(conversacionAEliminar.id_conversacion);
    
    if (success) {
      toast.success('Conversación eliminada');
      if (conversacionSeleccionada === conversacionAEliminar.id_conversacion) {
        setConversacionSeleccionada(null);
      }
    } else {
      toast.error('Error al eliminar conversación');
    }

    setDeleteDialogOpen(false);
    setConversacionAEliminar(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <SupabaseIndicator />

      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Bot className="size-6 text-blue-600" />
            ChatBot Inteligente
          </h1>
          <p className="text-sm text-gray-500">
            Asistente virtual con memoria persistente
          </p>
        </div>

        {!loadingStats && (
          <div className="flex gap-4">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg">{estadisticas.totalConversaciones}</p>
                </div>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Activas</p>
                  <p className="text-lg">{estadisticas.conversacionesActivas}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Layout principal */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Panel izquierdo: Lista de conversaciones */}
        <Card className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col">
          <div className="p-4 border-b space-y-3">
            <Button onClick={handleNuevaConversacion} className="w-full">
              <Plus className="size-4 mr-2" />
              Nueva Conversación
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loadingConversaciones ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-blue-600" />
              </div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {busqueda ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversacionesFiltradas.map((conv) => (
                  <div
                    key={conv.id_conversacion}
                    className={`
                      group relative p-3 rounded-lg cursor-pointer transition-colors
                      ${conversacionSeleccionada === conv.id_conversacion
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                      }
                    `}
                    onClick={() => setConversacionSeleccionada(conv.id_conversacion)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="size-4 text-blue-600 flex-shrink-0" />
                          <p className="text-sm truncate">
                            {conv.paciente 
                              ? `${conv.paciente.nombres} ${conv.paciente.apellidos}`
                              : `Conversación #${conv.id_conversacion}`
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant={conv.estado === 'pendiente' ? 'default' : 'secondary'} className="text-xs">
                            {formatearEstadoConversacion(conv.estado)}
                          </Badge>
                          <span>{formatearFechaRelativa(conv.created_at || conv.fecha_conversacion)}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleEliminarConversacion(conv);
                            }}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Panel derecho: Chat */}
        <Card className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col">
          {!conversacionSeleccionada ? (
            // Estado vacío
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="bg-blue-100 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="size-10 text-blue-600" />
                </div>
                <h3 className="mb-2">¡Hola! Soy tu asistente virtual</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Puedo ayudarte con información sobre citas, pacientes, cobros, reportes y más.
                  Selecciona una conversación o crea una nueva para comenzar.
                </p>
                <Button onClick={handleNuevaConversacion}>
                  <Plus className="size-4 mr-2" />
                  Iniciar Conversación
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Bot className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm">
                        {conversacion?.paciente 
                          ? `${conversacion.paciente.nombres} ${conversacion.paciente.apellidos}`
                          : `Conversación #${conversacion?.id_conversacion}`
                        }
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatearTipoConversacion(conversacion?.tipo || 'consulta_info')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={conversacion?.estado === 'pendiente' ? 'default' : 'secondary'}>
                    {formatearEstadoConversacion(conversacion?.estado || 'pendiente')}
                  </Badge>
                </div>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                {loadingMensajes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-blue-600" />
                  </div>
                ) : mensajes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm mb-4">
                      No hay mensajes aún. ¡Escribe tu primera pregunta!
                    </p>
                    <div className="text-left max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm mb-2">💡 <strong>Prueba preguntar:</strong></p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• ¿Cómo agendar una cita?</li>
                        <li>• ¿Cómo registrar un paciente?</li>
                        <li>• ¿Cómo ver los reportes?</li>
                        <li>• ¿Cómo procesar un pago?</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mensajes.map((mensaje) => (
                      <MensajeChat key={mensaje.id_mensaje} mensaje={mensaje} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Indicador de escritura */}
                {isSending && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <span>Asistente está escribiendo...</span>
                  </div>
                )}
              </ScrollArea>

              {/* Input de mensaje */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Escribe tu mensaje..."
                    value={mensajeInput}
                    onChange={(e) => setMensajeInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleEnviarMensaje}
                    disabled={!mensajeInput.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Presiona Enter para enviar • Shift+Enter para nueva línea
                </p>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la conversación y todos sus mensajes.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarEliminar} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente individual de mensaje
function MensajeChat({ mensaje }: { mensaje: Mensaje }) {
  const esUsuario = mensaje.tipo === 'usuario' || mensaje.tipo === 'paciente';
  const esAsistente = mensaje.tipo === 'asistente' || mensaje.tipo === 'bot';

  return (
    <div className={`flex gap-3 ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      {esAsistente && (
        <div className="bg-blue-100 p-2 rounded-lg size-8 flex items-center justify-center flex-shrink-0">
          <Bot className="size-4 text-blue-600" />
        </div>
      )}

      <div
        className={`
          max-w-[70%] rounded-lg p-3
          ${esUsuario 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{mensaje.texto}</p>
        <p className={`text-xs mt-1 ${esUsuario ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatearFechaRelativa(mensaje.hora)}
        </p>
      </div>

      {esUsuario && (
        <div className="bg-gray-200 p-2 rounded-lg size-8 flex items-center justify-center flex-shrink-0">
          <UserIcon className="size-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}