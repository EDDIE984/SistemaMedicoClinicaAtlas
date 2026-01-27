import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight, Calendar, Plus, User, Clock, MapPin, Phone, Mail, FileText, XCircle, Edit, Stethoscope, CalendarDays, Menu } from 'lucide-react';
import { AgendarCitaModal } from './AgendarCitaModal';
import { CancelarCitaModal } from './CancelarCitaModal';
import { ModificarCitaModal } from './ModificarCitaModal';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  getCitasByUsuario,
  getPacienteById,
  getSucursalById,
  getUsuarioByEmail,
  getAsignacionesByUsuario,
  type Cita,
  type Paciente
} from '../data/mockData';

interface AgendaViewProps {
  currentUser?: {
    email: string;
    sucursal?: string;
  } | null;
  onIniciarConsulta?: (pacienteId: string, citaId: number) => void;
}

interface CitaConDetalles extends Cita {
  paciente: Paciente;
  sucursalNombre: string;
  colorSucursal: string;
}

export function AgendaView({ currentUser, onIniciarConsulta }: AgendaViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isAgendarModalOpen, setIsAgendarModalOpen] = useState(false);
  const [isCancelarModalOpen, setIsCancelarModalOpen] = useState(false);
  const [isModificarModalOpen, setIsModificarModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaConDetalles | null>(null);
  const [citas, setCitas] = useState<CitaConDetalles[]>([]);
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [sucursalesFiltro, setSucursalesFiltro] = useState<number[]>([]);
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<{id: number, nombre: string, color: string}[]>([]);
  const [vistaActual, setVistaActual] = useState<'semana' | 'lista'>('semana');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [citaExpandida, setCitaExpandida] = useState<number | null>(null);

  // Cargar citas del usuario
  useEffect(() => {
    if (currentUser?.email) {
      const usuario = getUsuarioByEmail(currentUser.email);
      if (usuario) {
        const citasUsuario = getCitasByUsuario(usuario.id_usuario);
        const citasConDetalles: CitaConDetalles[] = citasUsuario.map(cita => {
          const paciente = getPacienteById(cita.id_paciente)!;
          const sucursal = getSucursalById(cita.id_sucursal)!;
          
          // Asignar colores por sucursal
          const colorSucursal = cita.id_sucursal === 1 ? 'bg-blue-500' : 'bg-purple-500';
          
          return {
            ...cita,
            paciente,
            sucursalNombre: sucursal.nombre,
            colorSucursal
          };
        });
        setCitas(citasConDetalles);
        
        // Cargar sucursales disponibles para el usuario
        const asignaciones = getAsignacionesByUsuario(usuario.id_usuario);
        const sucursalesUnicas = Array.from(new Set(asignaciones.map(a => a.id_sucursal)));
        const sucursalesInfo = sucursalesUnicas.map(id => {
          const sucursal = getSucursalById(id);
          return {
            id,
            nombre: sucursal?.nombre || '',
            color: id === 1 ? 'bg-blue-500' : 'bg-purple-500'
          };
        });
        setSucursalesDisponibles(sucursalesInfo);
        
        // Inicialmente mostrar todas las sucursales
        setSucursalesFiltro(sucursalesUnicas);
      }
    }
  }, [currentUser]);

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getMonday(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

  const previousWeek = () => {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)));
  };

  const nextWeek = () => {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getDayAppointments = (day: Date) => {
    return citas.filter(cita => {
      const citaDate = new Date(cita.fecha_cita + 'T00:00:00');
      const esMismoDia = (
        citaDate.getDate() === day.getDate() &&
        citaDate.getMonth() === day.getMonth() &&
        citaDate.getFullYear() === day.getFullYear()
      );
      
      const debeMostrar = mostrarCanceladas || cita.estado_cita !== 'cancelada';
      const esSucursalFiltrada = sucursalesFiltro.includes(cita.id_sucursal);
      
      return esMismoDia && debeMostrar && esSucursalFiltrada;
    }).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  };

  const getWeekAppointments = () => {
    return weekDays.map(day => ({
      day,
      citas: getDayAppointments(day)
    })).filter(item => item.citas.length > 0);
  };
  
  const toggleSucursalFiltro = (idSucursal: number) => {
    setSucursalesFiltro(prev => {
      if (prev.includes(idSucursal)) {
        return prev.filter(id => id !== idSucursal);
      } else {
        return [...prev, idSucursal];
      }
    });
  };

  const getAppointmentStyle = (cita: CitaConDetalles) => {
    const [horaInicio, minutosInicio] = cita.hora_inicio.split(':').map(Number);
    const duracionHoras = cita.duracion_minutos / 60;
    
    const topPosition = ((horaInicio - 6) * 64) + (minutosInicio * 64 / 60);
    const heightPosition = duracionHoras * 64;
    
    return {
      top: `${topPosition}px`,
      height: `${Math.max(heightPosition, 48)}px`,
    };
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'agendada':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'en_atencion':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'atendida':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'no_asistio':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatEstado = (estado: string) => {
    return estado
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatMonthYear = (date: Date) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    return {
      diaNombre: dias[date.getDay()],
      dia: date.getDate(),
      mes: meses[date.getMonth()],
      mesCompleto: formatMonthYear(date)
    };
  };

  const handleCitaCreada = () => {
    if (currentUser?.email) {
      const usuario = getUsuarioByEmail(currentUser.email);
      if (usuario) {
        const citasUsuario = getCitasByUsuario(usuario.id_usuario);
        const citasConDetalles: CitaConDetalles[] = citasUsuario.map(cita => {
          const paciente = getPacienteById(cita.id_paciente)!;
          const sucursal = getSucursalById(cita.id_sucursal)!;
          const colorSucursal = cita.id_sucursal === 1 ? 'bg-blue-500' : 'bg-purple-500';
          
          return {
            ...cita,
            paciente,
            sucursalNombre: sucursal.nombre,
            colorSucursal
          };
        });
        setCitas(citasConDetalles);
      }
    }
  };

  const handleCitaSeleccionada = (cita: CitaConDetalles) => {
    setCitaSeleccionada(cita);
    setIsCancelarModalOpen(true);
  };

  const handleModificarCitaSeleccionada = (cita: CitaConDetalles) => {
    setCitaSeleccionada(cita);
    setIsModificarModalOpen(true);
  };

  const handleIniciarConsulta = (cita: CitaConDetalles) => {
    console.log('Iniciar consulta para paciente:', cita.id_paciente);
    // Navegar a Pacientes con el ID del paciente
    if (onIniciarConsulta) {
      onIniciarConsulta(cita.id_paciente.toString(), cita.id_cita);
    }
  };

  // Vista móvil - Lista de citas
  const VistaLista = () => {
    const citasAgrupadas = getWeekAppointments();

    return (
      <div className="space-y-4">
        {citasAgrupadas.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay citas programadas esta semana</p>
          </Card>
        ) : (
          citasAgrupadas.map(({ day, citas }) => {
            const fechaInfo = formatFecha(day.toISOString().split('T')[0]);
            const esHoy = 
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear();

            return (
              <div key={day.toISOString()}>
                <div className={`flex items-center gap-3 mb-3 pb-2 border-b-2 ${esHoy ? 'border-blue-600' : 'border-gray-200'}`}>
                  <div className={`text-center ${esHoy ? 'text-blue-600' : 'text-gray-700'}`}>
                    <div className="text-3xl">{fechaInfo.dia}</div>
                    <div className="text-xs uppercase">{fechaInfo.mes}</div>
                  </div>
                  <div>
                    <div className={`${esHoy ? 'text-blue-600' : 'text-gray-900'}`}>
                      {fechaInfo.diaNombre}
                    </div>
                    <div className="text-sm text-gray-500">{citas.length} cita{citas.length !== 1 ? 's' : ''}</div>
                  </div>
                  {esHoy && (
                    <Badge className="ml-auto bg-blue-600 text-white">Hoy</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {citas.map(cita => (
                    <Card 
                      key={cita.id_cita} 
                      className={`overflow-hidden cursor-pointer transition-all ${
                        citaExpandida === cita.id_cita ? 'ring-2 ring-blue-600' : ''
                      }`}
                      onClick={() => setCitaExpandida(citaExpandida === cita.id_cita ? null : cita.id_cita)}
                    >
                      <div className={`h-2 ${cita.colorSucursal}`}></div>
                      
                      <div className="p-4">
                        {/* Vista compacta */}
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="bg-gray-100 p-2 rounded-lg text-center min-w-[60px]">
                              <div className="text-xs text-gray-500">Hora</div>
                              <div className="text-sm text-gray-900">{cita.hora_inicio}</div>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <User className="size-4 text-blue-600 flex-shrink-0" />
                                <span className="text-gray-900 truncate">
                                  {cita.paciente.nombres} {cita.paciente.apellidos}
                                </span>
                              </div>
                              <Badge className={`text-xs flex-shrink-0 ${getEstadoColor(cita.estado_cita)}`}>
                                {formatEstado(cita.estado_cita)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Clock className="size-4 flex-shrink-0" />
                              <span>{cita.duracion_minutos} min</span>
                              <span className="text-gray-400">•</span>
                              <MapPin className="size-4 flex-shrink-0" />
                              <span className="truncate">{cita.sucursalNombre}</span>
                            </div>
                          </div>
                        </div>

                        {/* Vista expandida */}
                        {citaExpandida === cita.id_cita && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Información detallada */}
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-700">
                                <FileText className="size-4 text-blue-600 flex-shrink-0" />
                                <span>CI: {cita.paciente.numero_identificacion}</span>
                              </div>
                              {cita.paciente.telefono && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Phone className="size-4 text-blue-600 flex-shrink-0" />
                                  <span>{cita.paciente.telefono}</span>
                                </div>
                              )}
                              {cita.paciente.email && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Mail className="size-4 text-blue-600 flex-shrink-0" />
                                  <span className="truncate">{cita.paciente.email}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="size-4 text-orange-600 flex-shrink-0" />
                                <span>
                                  Tipo: {cita.tipo_cita === 'primera_vez' ? 'Primera Vez' : 
                                         cita.tipo_cita === 'emergencia' ? 'Emergencia' : 'Consulta'}
                                </span>
                              </div>
                              {cita.motivo_consulta && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-600 mb-1">Motivo:</p>
                                  <p className="text-sm text-gray-800">{cita.motivo_consulta}</p>
                                </div>
                              )}
                            </div>

                            {/* Botones de acción */}
                            {cita.estado_cita !== 'cancelada' && cita.estado_cita !== 'atendida' && (
                              <div className="grid grid-cols-1 gap-2">
                                <Button
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleIniciarConsulta(cita);
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                  size="sm"
                                >
                                  <Stethoscope className="size-4" />
                                  Iniciar Consulta
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      handleModificarCitaSeleccionada(cita);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 gap-1"
                                  >
                                    <Edit className="size-4" />
                                    <span className="hidden sm:inline">Modificar</span>
                                  </Button>
                                  <Button
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      handleCitaSeleccionada(cita);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1"
                                  >
                                    <XCircle className="size-4" />
                                    <span className="hidden sm:inline">Cancelar</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Vista desktop - Calendario semanal
  const VistaSemana = () => (
    <Card className="p-4 overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Days Header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-center text-sm text-gray-500">Hora</div>
          {weekDays.map((day, index) => {
            const isToday =
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear();
            const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            
            return (
              <div
                key={index}
                className={`text-center p-2 rounded-lg ${
                  isToday ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50'
                }`}
              >
                <div className="text-sm text-gray-600">{dayNames[index]}</div>
                <div
                  className={`text-xl ${
                    isToday ? 'text-blue-600' : 'text-gray-800'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-2 border-t border-gray-200">
              <div className="text-sm text-gray-500 py-4 text-center">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="relative border-l border-gray-100"
                  style={{ minHeight: '64px' }}
                >
                </div>
              ))}
            </div>
          ))}
          
          {/* Citas con posicionamiento absoluto */}
          <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
            <div className="grid grid-cols-8 gap-2 h-full">
              <div></div>
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="relative pointer-events-auto">
                  {getDayAppointments(day).map((cita) => (
                    <TooltipProvider key={cita.id_cita}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute left-0 right-0 ${cita.colorSucursal} rounded-lg p-2 text-white shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all z-10`}
                            style={getAppointmentStyle(cita)}
                          >
                            <div className="text-xs">
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="size-3 flex-shrink-0" />
                                <span>{cita.hora_inicio}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="size-3 flex-shrink-0" />
                                <span className="truncate">
                                  {cita.paciente.nombres}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm bg-white p-0 shadow-xl border">
                          <div className="p-4 space-y-3">
                            <div>
                              <h4 className="text-gray-900 mb-2">Información del Paciente</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="size-4 text-blue-600" />
                                  <span className="text-gray-700">
                                    {cita.paciente.nombres} {cita.paciente.apellidos}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="size-4 text-blue-600" />
                                  <span className="text-gray-700">CI: {cita.paciente.numero_identificacion}</span>
                                </div>
                                {cita.paciente.telefono && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="size-4 text-blue-600" />
                                    <span className="text-gray-700">{cita.paciente.telefono}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="border-t pt-3">
                              <h4 className="text-gray-900 mb-2">Detalles de la Cita</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="size-4 text-green-600" />
                                  <span className="text-gray-700">
                                    {cita.hora_inicio} - {cita.hora_fin} ({cita.duracion_minutos} min)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="size-4 text-purple-600" />
                                  <span className="text-gray-700">{cita.sucursalNombre}</span>
                                </div>
                                {cita.motivo_consulta && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-600">Motivo:</p>
                                    <p className="text-sm text-gray-800">{cita.motivo_consulta}</p>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <Badge className={getEstadoColor(cita.estado_cita)}>
                                    {formatEstado(cita.estado_cita)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {cita.estado_cita !== 'cancelada' && cita.estado_cita !== 'atendida' && (
                            <div className="border-t p-3 bg-gray-50 space-y-2">
                              <Button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleIniciarConsulta(cita);
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                size="sm"
                              >
                                <Stethoscope className="size-4" />
                                Iniciar Consulta
                              </Button>
                              <Button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleModificarCitaSeleccionada(cita);
                                }}
                                variant="outline"
                                size="sm"
                                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 gap-2"
                              >
                                <Edit className="size-4" />
                                Modificar Fecha/Hora
                              </Button>
                              <Button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleCitaSeleccionada(cita);
                                }}
                                variant="outline"
                                size="sm"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-2"
                              >
                                <XCircle className="size-4" />
                                Cancelar Cita
                              </Button>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-gray-900 mb-1 md:mb-2">Agenda Médica</h1>
          <p className="text-sm text-gray-500">Gestión de citas y horarios</p>
        </div>
        <Button
          onClick={() => setIsAgendarModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2 w-full sm:w-auto"
        >
          <Plus className="size-4" />
          <span>Agendar Cita</span>
        </Button>
      </div>

      {/* Filtros - Mobile collapsible / Desktop always visible */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <span className="text-gray-700">Filtros</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Menu className="size-4" />
          </Button>
        </div>

        <div className={`space-y-4 ${mostrarFiltros ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-3">
            <span className="text-sm text-gray-600 block">Filtrar por Sucursal:</span>
            <div className="flex flex-wrap gap-3">
              {sucursalesDisponibles.map(sucursal => (
                <div key={sucursal.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`sucursal-${sucursal.id}`}
                    checked={sucursalesFiltro.includes(sucursal.id)}
                    onCheckedChange={() => toggleSucursalFiltro(sucursal.id)}
                  />
                  <label
                    htmlFor={`sucursal-${sucursal.id}`}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div className={`w-4 h-4 rounded ${sucursal.color}`}></div>
                    <span className="text-sm">{sucursal.nombre}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="mostrar-canceladas"
              checked={mostrarCanceladas}
              onCheckedChange={(checked: boolean) => setMostrarCanceladas(checked)}
            />
            <label
              htmlFor="mostrar-canceladas"
              className="text-sm text-gray-600 cursor-pointer select-none"
            >
              Mostrar citas canceladas
            </label>
          </div>
        </div>
      </Card>

      {/* Calendar Controls */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={previousWeek} className="flex-1 sm:flex-none">
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Calendar className="size-5 text-blue-600" />
              <h2 className="text-gray-800 text-sm md:text-base">{formatMonthYear(weekStart)}</h2>
            </div>
            <Button variant="outline" size="sm" onClick={nextWeek} className="flex-1 sm:flex-none">
              <ChevronRight className="size-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={goToToday}
              className="flex-1 sm:flex-none"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              onClick={() => setVistaActual(vistaActual === 'semana' ? 'lista' : 'semana')}
              className="flex-1 sm:flex-none md:hidden"
            >
              {vistaActual === 'semana' ? <CalendarDays className="size-4" /> : <Calendar className="size-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Vista adaptativa */}
      <div className="block md:hidden">
        <VistaLista />
      </div>
      <div className="hidden md:block">
        <VistaSemana />
      </div>

      {/* Modales */}
      <AgendarCitaModal
        isOpen={isAgendarModalOpen}
        onClose={() => setIsAgendarModalOpen(false)}
        onCitaCreada={handleCitaCreada}
        currentUser={currentUser}
      />

      <CancelarCitaModal
        isOpen={isCancelarModalOpen}
        onClose={() => setIsCancelarModalOpen(false)}
        cita={citaSeleccionada}
        onCitaCancelada={handleCitaCreada}
      />

      <ModificarCitaModal
        isOpen={isModificarModalOpen}
        onClose={() => setIsModificarModalOpen(false)}
        cita={citaSeleccionada}
        onCitaModificada={handleCitaCreada}
      />
    </div>
  );
}