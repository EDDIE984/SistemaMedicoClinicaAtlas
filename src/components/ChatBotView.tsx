import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, MessageCircle, Calendar, X, CheckCircle, XCircle, AlertCircle, TrendingUp, User, Bot as BotIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { conversacionesChatbot, type ConversacionChatbot, type MensajeChatbot } from '../data/conversacionesChatbot';
import { citas, pacientes, usuarios } from '../data/mockData';
import type { EstadoCita } from '../data/mockData';

export function ChatBotView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [metricsFilter, setMetricsFilter] = useState('30dias');
  const [selectedConversacion, setSelectedConversacion] = useState<ConversacionChatbot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generar datos para métricas desde citas reales
  const metricsData = useMemo(() => {
    // Datos de estado de citas (desde citas reales)
    const citasPorEstado = citas.reduce((acc, cita) => {
      const estado = cita.estado_cita;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<EstadoCita, number>);

    const citasEstadoData = [
      { name: 'Atendidas', value: citasPorEstado['atendida'] || 0, color: '#10b981' },
      { name: 'Agendadas', value: citasPorEstado['agendada'] || 0, color: '#3b82f6' },
      { name: 'Confirmadas', value: citasPorEstado['confirmada'] || 0, color: '#8b5cf6' },
      { name: 'Canceladas', value: citasPorEstado['cancelada'] || 0, color: '#ef4444' },
      { name: 'No Asistió', value: citasPorEstado['no_asistio'] || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0);

    // Conversaciones por día de la semana
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const conversacionesPorDia = conversacionesChatbot.reduce((acc, conv) => {
      const fecha = new Date(conv.fecha_conversacion + 'T00:00:00');
      const dia = fecha.getDay();
      const nombreDia = diasSemana[dia];
      acc[nombreDia] = (acc[nombreDia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const citasPorDiaData = diasSemana.map(dia => ({
      name: dia,
      conversaciones: conversacionesPorDia[dia] || 0
    }));

    // Conversaciones por tipo
    const conversacionesPorTipo = conversacionesChatbot.reduce((acc, conv) => {
      acc[conv.tipo] = (acc[conv.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conversacionesPorTipoData = [
      { name: 'Agendamientos', value: conversacionesPorTipo['agendamiento'] || 0, color: '#3b82f6' },
      { name: 'Consultas Info', value: conversacionesPorTipo['consulta_info'] || 0, color: '#8b5cf6' },
      { name: 'Reagendamientos', value: conversacionesPorTipo['reagendamiento'] || 0, color: '#f59e0b' },
      { name: 'Cancelaciones', value: conversacionesPorTipo['cancelacion'] || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Tasa de conversión semanal (simulada basada en conversaciones completadas)
    const conversacionesCompletadas = conversacionesChatbot.filter(c => c.estado === 'completado').length;
    const totalConversaciones = conversacionesChatbot.length;
    const tasaBase = totalConversaciones > 0 ? Math.round((conversacionesCompletadas / totalConversaciones) * 100) : 0;

    const tasaConversionData = [
      { name: 'Sem 1', conversion: Math.min(100, tasaBase - 5 + Math.random() * 5) },
      { name: 'Sem 2', conversion: Math.min(100, tasaBase + Math.random() * 5) },
      { name: 'Sem 3', conversion: Math.min(100, tasaBase - 3 + Math.random() * 5) },
      { name: 'Sem 4', conversion: Math.min(100, tasaBase + 2 + Math.random() * 5) },
    ].map(item => ({ ...item, conversion: Math.round(item.conversion) }));

    return {
      citasEstadoData,
      citasPorDiaData,
      conversacionesPorTipoData,
      tasaConversionData,
      totalCitas: citas.length,
      totalConversaciones: conversacionesChatbot.length,
      tasaConversionPromedio: tasaBase,
      tiempoPromedioRespuesta: '2.5 min'
    };
  }, []);

  const handleRemoveFilters = () => {
    setSearchTerm('');
    setTipoFilter('todos');
    setEstadoFilter('todos');
  };

  // Filtrar conversaciones con nombres de pacientes reales
  const conversacionesFiltradas = conversacionesChatbot.filter((conv) => {
    const paciente = pacientes.find(p => p.id_paciente === conv.id_paciente);
    const nombrePaciente = paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente Desconocido';
    
    const matchSearch = nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFilter === 'todos' || conv.tipo === tipoFilter;
    const matchEstado = estadoFilter === 'todos' || conv.estado === estadoFilter;
    return matchSearch && matchTipo && matchEstado;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'agendamiento':
        return <Calendar className="size-4" />;
      case 'consulta_info':
        return <MessageCircle className="size-4" />;
      case 'reagendamiento':
        return <AlertCircle className="size-4" />;
      case 'cancelacion':
        return <XCircle className="size-4" />;
      default:
        return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'agendamiento':
        return 'Agendamiento';
      case 'consulta_info':
        return 'Consulta Info';
      case 'reagendamiento':
        return 'Reagendamiento';
      case 'cancelacion':
        return 'Cancelación';
      default:
        return tipo;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>;
      case 'pendiente':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pendiente</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getNombrePaciente = (id_paciente: number) => {
    const paciente = pacientes.find(p => p.id_paciente === id_paciente);
    return paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente Desconocido';
  };

  const getNombreMedico = (id_medico?: number) => {
    if (!id_medico) return 'N/A';
    const medico = usuarios.find(u => u.id_usuario === id_medico);
    return medico ? `Dr. ${medico.nombre} ${medico.apellido}` : 'Médico Desconocido';
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-2">ChatBot</h1>
        <p className="text-gray-600">Historial de conversaciones y reportes de agendamientos</p>
      </div>

      <Tabs defaultValue="historial" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historial">Historial de Conversaciones</TabsTrigger>
          <TabsTrigger value="reporte">Reporte</TabsTrigger>
        </TabsList>

        {/* Tab de Historial */}
        <TabsContent value="historial" className="space-y-4">
          {/* Filtros */}
          <Card className="p-3">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Búsqueda */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tipo */}
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendamiento">Agendamiento</SelectItem>
                  <SelectItem value="consulta_info">Consulta Info</SelectItem>
                  <SelectItem value="reagendamiento">Reagendamiento</SelectItem>
                  <SelectItem value="cancelacion">Cancelación</SelectItem>
                </SelectContent>
              </Select>

              {/* Estado */}
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {/* Limpiar filtros */}
              <Button
                onClick={handleRemoveFilters}
                variant="ghost"
                size="icon"
                title="Limpiar filtros"
              >
                <X className="size-5" />
              </Button>
            </div>
          </Card>

          {/* Lista de conversaciones */}
          <div className="grid grid-cols-1 gap-3">
            {conversacionesFiltradas.length === 0 ? (
              <Card className="p-8">
                <p className="text-center text-gray-500">No se encontraron conversaciones.</p>
              </Card>
            ) : (
              conversacionesFiltradas.map((conv) => (
                <Card key={conv.id_conversacion} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {getTipoIcon(conv.tipo)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{getNombrePaciente(conv.id_paciente)}</p>
                          {getEstadoBadge(conv.estado)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{getTipoLabel(conv.tipo)}</span>
                          <span>•</span>
                          <span>{conv.fecha_conversacion}</span>
                          <span>•</span>
                          <span>{conv.hora_inicio}</span>
                          <span>•</span>
                          <span>{conv.mensajes.length} mensajes</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedConversacion(conv);
                        setIsDialogOpen(true);
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab de Reporte */}
        <TabsContent value="reporte" className="space-y-4">
          {/* Filtro de métricas */}
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Ver métricas de:</span>
              <Select value={metricsFilter} onValueChange={setMetricsFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ver métricas de" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Últimos 7 días</SelectItem>
                  <SelectItem value="30dias">Últimos 30 días</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                  <SelectItem value="año">Este año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Citas</p>
                  <p className="text-3xl">{metricsData.totalCitas}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="size-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Conversaciones</p>
                  <p className="text-3xl">{metricsData.totalConversaciones}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <MessageCircle className="size-5 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tasa Conversión</p>
                  <p className="text-3xl">{metricsData.tasaConversionPromedio}%</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="size-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
                  <p className="text-3xl">{metricsData.tiempoPromedioRespuesta}</p>
                </div>
                <div className="bg-orange-100 p-2 rounded-lg">
                  <AlertCircle className="size-5 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Estado de Citas */}
            <Card className="p-6">
              <h3 className="text-sm text-gray-600 mb-4">ESTADO DE CITAS</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  {metricsData.citasEstadoData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={metricsData.citasEstadoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metricsData.citasEstadoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Conversaciones por Día */}
            <Card className="p-6">
              <h3 className="text-sm text-gray-600 mb-4">CONVERSACIONES POR DÍA</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metricsData.citasPorDiaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="conversaciones" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Conversaciones por Tipo */}
            <Card className="p-6">
              <h3 className="text-sm text-gray-600 mb-4">CONVERSACIONES POR TIPO</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  {metricsData.conversacionesPorTipoData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={metricsData.conversacionesPorTipoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metricsData.conversacionesPorTipoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Tasa de Conversión */}
            <Card className="p-6">
              <h3 className="text-sm text-gray-600 mb-4">TASA DE CONVERSIÓN SEMANAL</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metricsData.tasaConversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para detalles de conversación */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Conversación</DialogTitle>
            <DialogDescription>Información detallada de la conversación seleccionada.</DialogDescription>
          </DialogHeader>
          {selectedConversacion && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {getTipoIcon(selectedConversacion.tipo)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{getNombrePaciente(selectedConversacion.id_paciente)}</p>
                    {getEstadoBadge(selectedConversacion.estado)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{getTipoLabel(selectedConversacion.tipo)}</span>
                    <span>•</span>
                    <span>{selectedConversacion.fecha_conversacion}</span>
                    <span>•</span>
                    <span>{selectedConversacion.hora_inicio} - {selectedConversacion.hora_fin}</span>
                    <span>•</span>
                    <span>{selectedConversacion.mensajes.length} mensajes</span>
                  </div>
                </div>
              </div>

              {selectedConversacion.mensajes && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto border rounded-lg p-4">
                  {selectedConversacion.mensajes.map((msg) => (
                    <div key={msg.id_mensaje} className="flex items-start gap-3">
                      <div
                        className={`${
                          msg.tipo === 'bot' ? 'bg-blue-100' : 'bg-gray-100'
                        } p-2 rounded-lg shrink-0`}
                      >
                        {msg.tipo === 'bot' ? (
                          <BotIcon className="size-4" />
                        ) : (
                          <User className="size-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {msg.tipo === 'bot' ? 'Bot' : 'Paciente'}
                          </p>
                          <span className="text-sm text-gray-500">{msg.hora}</span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedConversacion.resultado && (
                <div className="border-t pt-4 space-y-2">
                  <p className="font-medium text-sm text-gray-600">RESULTADO DE LA CONVERSACIÓN</p>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                    {selectedConversacion.resultado.cita_fecha && (
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-500" />
                        <p className="text-sm text-gray-700">
                          Fecha: {selectedConversacion.resultado.cita_fecha}
                        </p>
                      </div>
                    )}
                    {selectedConversacion.resultado.cita_hora && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="size-4 text-gray-500" />
                        <p className="text-sm text-gray-700">
                          Hora: {selectedConversacion.resultado.cita_hora}
                        </p>
                      </div>
                    )}
                    {selectedConversacion.resultado.id_medico && (
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-gray-500" />
                        <p className="text-sm text-gray-700">
                          Médico: {getNombreMedico(selectedConversacion.resultado.id_medico)}
                        </p>
                      </div>
                    )}
                    {selectedConversacion.resultado.motivo && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-gray-500" />
                        <p className="text-sm text-gray-700">
                          Motivo: {selectedConversacion.resultado.motivo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
