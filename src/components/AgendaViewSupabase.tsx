// Vista de Agenda integrada con Supabase
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Mail, FileText, XCircle, Stethoscope, Loader2, Calendar, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { useCitas } from '../hooks/useCitas';
import { AgendarCitaModalSupabase } from './AgendarCitaModalSupabase';
import { CancelarCitaModalSupabase } from './CancelarCitaModalSupabase';
import { DetalleCitaDialog } from './DetalleCitaDialog';
import { SupabaseIndicator } from './SupabaseIndicator';
import { toast } from 'sonner';
import type { CitaCompleta } from '../lib/citasService';
import { calcularEdad } from '../lib/pacientesService';
import { getSucursalesByCompania, getMedicosBySucursal, type AsignacionCompleta } from '../lib/authService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AgendaViewProps {
  currentUser?: {
    email: string;
    tipo_usuario?: string;
  } | null;
  onIniciarConsulta?: (pacienteId: string, citaId: number) => void;
}

export function AgendaViewSupabase({ currentUser, onIniciarConsulta }: AgendaViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isAgendarModalOpen, setIsAgendarModalOpen] = useState(false);
  const [isCancelarModalOpen, setIsCancelarModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaCompleta | null>(null);
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [vistaActual, setVistaActual] = useState<'semana' | 'lista'>('semana');
  const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);
  const [citaDetalle, setCitaDetalle] = useState<CitaCompleta | null>(null);
  const [nombreSucursal, setNombreSucursal] = useState<string>('');

  // Filtros
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<AsignacionCompleta[]>([]);
  const [filterSucursal, setFilterSucursal] = useState<string>(() => {
    return localStorage.getItem('currentSucursalId') || '';
  });
  const [filterMedico, setFilterMedico] = useState<string>('all');

  // Obtener el ID del usuario desde localStorage
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      setIdUsuarioActual(parseInt(userId));
    }
  }, [currentUser]);

  // Obtener el nombre de la sucursal desde currentUser
  useEffect(() => {
    if (currentUser && 'sucursal' in currentUser) {
      setNombreSucursal((currentUser as any).sucursal || '');
    }
  }, [currentUser]);

  // Cargar sucursales al inicio
  useEffect(() => {
    const cargarSucursales = async () => {
      const companiaId = localStorage.getItem('currentCompaniaId');
      if (companiaId) {
        const data: any[] = await getSucursalesByCompania(parseInt(companiaId));
        setSucursales(data);

        // Si no hay sucursal seleccionada y hay datos, seleccionar la primera o la almacenada
        if (!filterSucursal && data.length > 0) {
          const defaultSucursalId = localStorage.getItem('currentSucursalId');
          if (defaultSucursalId && data.some(s => s.id_sucursal.toString() === defaultSucursalId)) {
            setFilterSucursal(defaultSucursalId);
          } else {
            setFilterSucursal(data[0].id_sucursal.toString());
          }
        }
      }
    };
    cargarSucursales();
  }, []);

  // Cargar médicos cuando cambia la sucursal seleccionada
  useEffect(() => {
    const cargarMedicos = async () => {
      if (filterSucursal && filterSucursal !== 'all') {
        const data = await getMedicosBySucursal(parseInt(filterSucursal));
        setMedicos(data);
      } else {
        setMedicos([]); // Opcional: cargar todos los médicos de la compañía si se requieren
      }
      setFilterMedico('all'); // Resetear filtro de médico
    };
    cargarMedicos();
  }, [filterSucursal]);

  // Calcular rango de fechas para la semana actual
  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Domingo
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Sábado
    end.setHours(23, 59, 59, 999);

    return {
      inicio: start.toISOString().split('T')[0],
      fin: end.toISOString().split('T')[0]
    };
  };

  const { inicio, fin } = getWeekRange(currentWeek);
  const { citas, isLoading, loadCitas, marcarCompletada } = useCitas(
    idUsuarioActual,
    inicio,
    fin,
    currentUser?.tipo_usuario // Pasar tipo de usuario al hook
  );

  // Log para depuración
  useEffect(() => {
    if (citas && citas.length > 0) {

    }
  }, [citas]);

  // Generar días de la semana
  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Navegar semanas
  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  // Filtrar citas por día
  // Filtrar citas por día y filtros activos
  // Filtrar citas por día y filtros activos
  const getCitasPorDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const citasDelDia = citas.filter(cita => {
      const citaFecha = cita.fecha_cita;
      const cumpleFiltroCanceladas = mostrarCanceladas || cita.estado_cita !== 'cancelada';

      // Filtro de Sucursal
      const cumpleFiltroSucursal = !filterSucursal || filterSucursal === 'all' ||
        cita.usuario_sucursal.sucursal.id_sucursal === parseInt(filterSucursal);

      // Filtro de Médico
      const cumpleFiltroMedico = filterMedico === 'all' ||
        cita.usuario_sucursal.usuario.id_usuario === parseInt(filterMedico);

      return citaFecha === fechaStr && cumpleFiltroCanceladas && cumpleFiltroSucursal && cumpleFiltroMedico;
    });

    return citasDelDia;
  };

  // Manejar cancelación
  const handleCancelar = (cita: CitaCompleta) => {
    setCitaSeleccionada(cita);
    setIsCancelarModalOpen(true);
  };

  // Manejar inicio de consulta
  const handleIniciarConsulta = async (cita: CitaCompleta) => {
    if (onIniciarConsulta) {
      onIniciarConsulta(cita.id_paciente.toString(), cita.id_cita);
    }
  };

  // Manejar modificación de cita
  const handleModificar = (cita: CitaCompleta) => {
    setCitaSeleccionada(cita);
    setIsAgendarModalOpen(true);
  };

  // Color según sucursal
  const coloresSucursal = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
  const getColorSucursal = (idSucursal: number) => {
    return coloresSucursal[idSucursal % coloresSucursal.length];
  };

  // Vista de Lista
  const renderVistaLista = () => {
    const citasFiltradas = citas.filter(cita => {
      const cumpleFiltroCanceladas = mostrarCanceladas || cita.estado_cita !== 'cancelada';

      // Filtro de Sucursal
      const cumpleFiltroSucursal = !filterSucursal || filterSucursal === 'all' ||
        cita.usuario_sucursal.sucursal.id_sucursal === parseInt(filterSucursal);

      // Filtro de Médico
      const cumpleFiltroMedico = filterMedico === 'all' ||
        cita.usuario_sucursal.usuario.id_usuario === parseInt(filterMedico);

      return cumpleFiltroCanceladas && cumpleFiltroSucursal && cumpleFiltroMedico;
    });

    return (
      <div className="space-y-3">
        {citasFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="size-12 mx-auto mb-3 text-gray-300" />
            <p>No hay citas programadas para esta semana</p>
          </div>
        )}

        {citasFiltradas.map((cita) => (
          <Card key={cita.id_cita} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={`bg-${getColorSucursal(cita.usuario_sucursal.sucursal.id_sucursal)}-100 text-${getColorSucursal(cita.usuario_sucursal.sucursal.id_sucursal)}-700`}
                  >
                    {cita.usuario_sucursal.sucursal.nombre}
                  </Badge>
                  <Badge variant={cita.estado_cita === 'cancelada' ? 'destructive' : cita.consulta_realizada ? 'default' : 'secondary'}>
                    {cita.estado_cita === 'cancelada' ? 'Cancelada' : cita.consulta_realizada ? 'Completada' : 'Programada'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="size-4 text-gray-500" />
                      <span className="font-semibold">{cita.paciente.nombres} {cita.paciente.apellidos}</span>
                    </div>
                    {cita.paciente.telefono && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="size-3" />
                        <span className="text-xs">{cita.paciente.telefono}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="size-4 text-gray-500" />
                      <span className="font-semibold">
                        {new Date(cita.fecha_cita).toLocaleDateString('es-ES')} - {cita.hora_inicio.substring(0, 5)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {cita.motivo_consulta}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {!cita.consulta_realizada && cita.estado_cita !== 'cancelada' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleIniciarConsulta(cita)}
                    >
                      <Stethoscope className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelar(cita)}
                    >
                      <XCircle className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Vista de Semana
  const renderVistaSemana = () => {
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const citasDelDia = getCitasPorDia(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div key={index} className={`min-h-[400px] ${isToday ? 'bg-blue-50' : 'bg-white'} rounded-lg border p-2`}>
              <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-blue-300' : ''}`}>
                <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {dayNames[day.getDay()]}
                </div>
                <div className={`text-lg ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-1">
                {citasDelDia.map((cita) => (
                  <div
                    key={cita.id_cita}
                    className="relative"
                  >
                    <Card
                      className={`p-2 cursor-pointer hover:shadow-md transition-shadow ${cita.estado_cita === 'cancelada' ? 'opacity-50' : ''
                        }`}
                      onClick={() => setCitaDetalle(cita)}
                    >
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-blue-700">
                          <Clock className="size-3" />
                          <span>{cita.hora_inicio.substring(0, 5)}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium truncate">
                          Dr. {cita.usuario_sucursal.usuario.apellido.split(' ')[0]}
                        </div>
                        <div className="font-medium truncate text-gray-900">
                          {cita.paciente.nombres.split(' ')[0]} {cita.paciente.apellidos.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {cita.motivo_consulta}
                        </div>
                        <Badge
                          variant={cita.estado_cita === 'cancelada' ? 'destructive' : cita.consulta_realizada ? 'default' : 'secondary'}
                          className="text-[10px] px-1 h-5"
                        >
                          {cita.estado_cita === 'cancelada' ? 'Cancelada' : cita.consulta_realizada ? 'Completada' : 'Programada'}
                        </Badge>
                      </div>
                    </Card>
                  </div>
                ))}

                {citasDelDia.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    Sin citas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full p-6 space-y-4">
      <SupabaseIndicator />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="text-lg font-semibold">
            {weekDays[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </div>

          {/* Indicador de sucursal activa */}
          {nombreSucursal && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="size-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                <span className="font-medium">Sucursal:</span> {nombreSucursal}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro Sucursal */}
          <Select value={filterSucursal} onValueChange={setFilterSucursal}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Seleccione sucursal" />
            </SelectTrigger>
            <SelectContent>
              {sucursales.map((sucursal) => (
                <SelectItem key={sucursal.id_sucursal} value={sucursal.id_sucursal.toString()}>
                  {sucursal.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Médico */}
          <Select value={filterMedico} onValueChange={setFilterMedico}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Todos los médicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los médicos</SelectItem>
              {medicos.map((medico) => (
                <SelectItem key={medico.usuario?.id_usuario} value={medico.usuario?.id_usuario.toString()}>
                  {medico.usuario?.nombre} {medico.usuario?.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="mostrar-canceladas"
              checked={mostrarCanceladas}
              onCheckedChange={(checked: boolean) => setMostrarCanceladas(checked)}
            />
            <label htmlFor="mostrar-canceladas" className="text-sm cursor-pointer whitespace-nowrap">
              Mostrar canceladas
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant={vistaActual === 'semana' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVistaActual('semana')}
            >
              Semana
            </Button>
            <Button
              variant={vistaActual === 'lista' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVistaActual('lista')}
            >
              Lista
            </Button>
          </div>

          <Button
            onClick={() => setIsAgendarModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Contenido */}
      {!isLoading && (
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {vistaActual === 'semana' ? renderVistaSemana() : renderVistaLista()}
        </div>
      )}

      {/* Modal Agendar Cita */}
      <AgendarCitaModalSupabase
        isOpen={isAgendarModalOpen}
        onClose={() => {
          setIsAgendarModalOpen(false);
          setCitaSeleccionada(null);
        }}
        onCitaAgendada={loadCitas}
        idUsuarioActual={idUsuarioActual}
        citaEditar={citaSeleccionada}
        tipoUsuario={currentUser?.tipo_usuario}
      />

      {/* Modal Cancelar Cita */}
      <CancelarCitaModalSupabase
        isOpen={isCancelarModalOpen}
        onClose={() => {
          setIsCancelarModalOpen(false);
          setCitaSeleccionada(null);
        }}
        cita={citaSeleccionada}
        onCitaCancelada={loadCitas}
      />

      {/* Modal Detalles Cita */}
      <DetalleCitaDialog
        isOpen={!!citaDetalle}
        onClose={() => setCitaDetalle(null)}
        cita={citaDetalle}
        onIniciarConsulta={handleIniciarConsulta}
        onModificar={handleModificar}
        onCancelar={handleCancelar}
      />
    </div>
  );
}