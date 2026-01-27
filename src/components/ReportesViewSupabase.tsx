// Vista de Reportes y Estadísticas integrada con Supabase
import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Activity,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building2
} from 'lucide-react';
import { SupabaseIndicator } from './SupabaseIndicator';
import { toast } from 'sonner';
import {
  useReportes,
  useCitasPorDia,
  useIngresosPorDia,
  useEstadisticasPorMedico,
  useEstadisticasPorSucursal,
  useTopPacientes,
  useDistribuciones,
  formatearMoneda,
  formatearPorcentaje,
  formatearFechaCorta
} from '../hooks/useReportes';

const COLORES_GRAFICO = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReportesViewSupabase() {
  // Estados de filtros
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('30dias');
  const [ordenPacientes, setOrdenPacientes] = useState<'citas' | 'gastos'>('citas');

  // Calcular fechas según período
  const { fechaInicio, fechaFin } = useMemo(() => {
    const hoy = new Date();
    let inicio = new Date();

    switch (periodoSeleccionado) {
      case '7dias':
        inicio.setDate(hoy.getDate() - 7);
        break;
      case '30dias':
        inicio.setDate(hoy.getDate() - 30);
        break;
      case '90dias':
        inicio.setDate(hoy.getDate() - 90);
        break;
      case '1ano':
        inicio.setFullYear(hoy.getFullYear() - 1);
        break;
      case 'mesActual':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'mesAnterior':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        return {
          fechaInicio: inicio.toISOString().split('T')[0],
          fechaFin: fin.toISOString().split('T')[0]
        };
      default:
        inicio.setDate(hoy.getDate() - 30);
    }

    return {
      fechaInicio: inicio.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    };
  }, [periodoSeleccionado]);

  // Hooks de datos
  const { estadisticasGenerales, isLoading: loadingGenerales, loadEstadisticasGenerales } = useReportes(fechaInicio, fechaFin);
  const { citasPorDia, isLoading: loadingCitas } = useCitasPorDia(fechaInicio, fechaFin);
  const { ingresosPorDia, isLoading: loadingIngresos } = useIngresosPorDia(fechaInicio, fechaFin);
  const { estadisticasPorMedico, isLoading: loadingMedicos } = useEstadisticasPorMedico(fechaInicio, fechaFin);
  const { estadisticasPorSucursal, isLoading: loadingSucursales } = useEstadisticasPorSucursal(fechaInicio, fechaFin);
  const { topPacientes, isLoading: loadingPacientes } = useTopPacientes(10, ordenPacientes, fechaInicio, fechaFin);
  const { distribucionEstadoPago, distribucionFormaPago, isLoading: loadingDistribuciones } = useDistribuciones(fechaInicio, fechaFin);

  const isLoading = loadingGenerales || loadingCitas || loadingIngresos || loadingMedicos || loadingSucursales || loadingPacientes || loadingDistribuciones;

  // Función para refrescar datos
  const handleRefresh = () => {
    loadEstadisticasGenerales();
    toast.success('Datos actualizados');
  };

  // Función para exportar
  const handleExportar = () => {
    // Aquí podrías implementar exportación de PDF/Excel
    toast.success('Reporte exportado (funcionalidad en desarrollo)');
  };

  return (
    <div className="h-full p-6 space-y-6">
      <SupabaseIndicator />

      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Reportes y Estadísticas</h1>
          <p className="text-sm text-gray-500">Análisis completo del desempeño</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7dias">Últimos 7 días</SelectItem>
              <SelectItem value="30dias">Últimos 30 días</SelectItem>
              <SelectItem value="90dias">Últimos 90 días</SelectItem>
              <SelectItem value="mesActual">Mes actual</SelectItem>
              <SelectItem value="mesAnterior">Mes anterior</SelectItem>
              <SelectItem value="1ano">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="size-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExportar}>
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Pacientes</p>
                  <p className="text-2xl mt-1">{estadisticasGenerales?.totalPacientes || 0}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="size-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Citas</p>
                  <p className="text-2xl mt-1">{estadisticasGenerales?.totalCitas || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatearPorcentaje(estadisticasGenerales?.tasaAsistencia || 0)} completadas
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="size-5 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Citas Completadas</p>
                  <p className="text-2xl mt-1 text-green-600">{estadisticasGenerales?.citasCompletadas || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatearPorcentaje(estadisticasGenerales?.tasaAsistencia || 0)} tasa
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="size-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ingresos Totales</p>
                  <p className="text-2xl mt-1 text-green-600">
                    {formatearMoneda(estadisticasGenerales?.totalIngresos || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Período seleccionado
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="size-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendiente Cobro</p>
                  <p className="text-2xl mt-1 text-red-600">
                    {formatearMoneda(estadisticasGenerales?.totalPendienteCobro || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por cobrar
                  </p>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="size-5 text-red-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs de reportes */}
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="medicos">Por Médico</TabsTrigger>
              <TabsTrigger value="sucursales">Por Sucursal</TabsTrigger>
              <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
              <TabsTrigger value="financiero">Financiero</TabsTrigger>
            </TabsList>

            {/* Tab: General */}
            <TabsContent value="general" className="space-y-4">
              {/* Gráfico de citas por día */}
              <Card className="p-6">
                <h3 className="mb-4">Citas por Día</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={citasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha" 
                      tickFormatter={formatearFechaCorta}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatearFechaCorta(value as string)}
                    />
                    <Legend />
                    <Bar dataKey="completadas" name="Completadas" fill="#10b981" />
                    <Bar dataKey="canceladas" name="Canceladas" fill="#ef4444" />
                    <Bar dataKey="pendientes" name="Pendientes" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de ingresos por día */}
              <Card className="p-6">
                <h3 className="mb-4">Ingresos por Día</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ingresosPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha" 
                      tickFormatter={formatearFechaCorta}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      labelFormatter={(value) => formatearFechaCorta(value as string)}
                      formatter={(value: number) => formatearMoneda(value)}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="pagado" name="Pagado" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="pendiente" name="Pendiente" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Métricas adicionales */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Promedio citas/día</p>
                      <p className="text-2xl mt-1">
                        {estadisticasGenerales?.promedioConsultaPorDia.toFixed(1) || 0}
                      </p>
                    </div>
                    <Activity className="size-8 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tasa de asistencia</p>
                      <p className="text-2xl mt-1 text-green-600">
                        {formatearPorcentaje(estadisticasGenerales?.tasaAsistencia || 0)}
                      </p>
                    </div>
                    <CheckCircle className="size-8 text-green-600" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tasa de cancelación</p>
                      <p className="text-2xl mt-1 text-red-600">
                        {formatearPorcentaje(estadisticasGenerales?.tasaCancelacion || 0)}
                      </p>
                    </div>
                    <XCircle className="size-8 text-red-600" />
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Por Médico */}
            <TabsContent value="medicos" className="space-y-4">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médico</TableHead>
                      <TableHead className="text-right">Total Citas</TableHead>
                      <TableHead className="text-right">Completadas</TableHead>
                      <TableHead className="text-right">Tasa Asistencia</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Recaudado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estadisticasPorMedico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No hay datos para mostrar
                        </TableCell>
                      </TableRow>
                    ) : (
                      estadisticasPorMedico.map((medico) => (
                        <TableRow key={medico.idMedico}>
                          <TableCell>{medico.medico}</TableCell>
                          <TableCell className="text-right">{medico.totalCitas}</TableCell>
                          <TableCell className="text-right">{medico.citasCompletadas}</TableCell>
                          <TableCell className="text-right">
                            <span className={medico.tasaAsistencia >= 80 ? 'text-green-600' : medico.tasaAsistencia >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                              {formatearPorcentaje(medico.tasaAsistencia)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{formatearMoneda(medico.totalIngresos)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatearMoneda(medico.ingresosRecaudados)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tab: Por Sucursal */}
            <TabsContent value="sucursales" className="space-y-4">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sucursal</TableHead>
                      <TableHead className="text-right">Médicos</TableHead>
                      <TableHead className="text-right">Total Citas</TableHead>
                      <TableHead className="text-right">Completadas</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Recaudado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estadisticasPorSucursal.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No hay datos para mostrar
                        </TableCell>
                      </TableRow>
                    ) : (
                      estadisticasPorSucursal.map((sucursal) => (
                        <TableRow key={sucursal.idSucursal}>
                          <TableCell className="flex items-center gap-2">
                            <Building2 className="size-4 text-gray-400" />
                            {sucursal.sucursal}
                          </TableCell>
                          <TableCell className="text-right">{sucursal.numeroMedicos}</TableCell>
                          <TableCell className="text-right">{sucursal.totalCitas}</TableCell>
                          <TableCell className="text-right">{sucursal.citasCompletadas}</TableCell>
                          <TableCell className="text-right">{formatearMoneda(sucursal.totalIngresos)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatearMoneda(sucursal.ingresosRecaudados)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tab: Pacientes */}
            <TabsContent value="pacientes" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Select value={ordenPacientes} onValueChange={(value: 'citas' | 'gastos') => setOrdenPacientes(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citas">Ordenar por Citas</SelectItem>
                    <SelectItem value="gastos">Ordenar por Gastos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Identificación</TableHead>
                      <TableHead className="text-right">Total Citas</TableHead>
                      <TableHead className="text-right">Total Gastado</TableHead>
                      <TableHead>Última Cita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPacientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No hay datos para mostrar
                        </TableCell>
                      </TableRow>
                    ) : (
                      topPacientes.map((paciente, index) => (
                        <TableRow key={paciente.idPaciente}>
                          <TableCell className="font-semibold">{index + 1}</TableCell>
                          <TableCell>{paciente.paciente}</TableCell>
                          <TableCell>{paciente.identificacion}</TableCell>
                          <TableCell className="text-right">{paciente.totalCitas}</TableCell>
                          <TableCell className="text-right text-green-600">{formatearMoneda(paciente.totalGastado)}</TableCell>
                          <TableCell>{new Date(paciente.ultimaCita).toLocaleDateString('es-ES')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tab: Financiero */}
            <TabsContent value="financiero" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Distribución por estado de pago */}
                <Card className="p-6">
                  <h3 className="mb-4">Distribución por Estado de Pago</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={distribucionEstadoPago}
                        dataKey="cantidad"
                        nameKey="estado"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.estado}: ${formatearPorcentaje(entry.porcentaje)}`}
                      >
                        {distribucionEstadoPago.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name, props) => [value, props.payload.estado]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {distribucionEstadoPago.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORES_GRAFICO[index] }} />
                          {item.estado}
                        </span>
                        <span>{formatearMoneda(item.monto)}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Distribución por forma de pago */}
                <Card className="p-6">
                  <h3 className="mb-4">Distribución por Forma de Pago</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={distribucionFormaPago}
                        dataKey="monto"
                        nameKey="forma"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.forma}: ${formatearPorcentaje(entry.porcentaje)}`}
                      >
                        {distribucionFormaPago.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatearMoneda(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {distribucionFormaPago.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORES_GRAFICO[index] }} />
                          {item.forma}
                        </span>
                        <span>{formatearMoneda(item.monto)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Resumen financiero */}
              <Card className="p-6">
                <h3 className="mb-4">Resumen Financiero</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Ingresos</p>
                    <p className="text-2xl text-green-600 mt-1">
                      {formatearMoneda(estadisticasGenerales?.totalIngresos || 0)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Recaudado</p>
                    <p className="text-2xl text-blue-600 mt-1">
                      {formatearMoneda((estadisticasGenerales?.totalIngresos || 0) - (estadisticasGenerales?.totalPendienteCobro || 0))}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pendiente de Cobro</p>
                    <p className="text-2xl text-red-600 mt-1">
                      {formatearMoneda(estadisticasGenerales?.totalPendienteCobro || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
