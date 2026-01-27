import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
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
import { Label } from './ui/label';
import { Search, X, FileText, Plus, Trash2, RefreshCw, Download, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  citas, 
  pacientes, 
  usuarios, 
  usuariosSucursales,
  sucursales,
  type FormaPago,
  type EstadoPago 
} from '../data/mockData';
import { toast } from 'sonner';

interface Cargo {
  id: string;
  id_cita: number;
  fecha: Date;
  paciente: string;
  medico: string;
  sucursal: string;
  tipoPago: FormaPago;
  motivoConsulta: string;
  estado: EstadoPago;
  subtotal: number;
  descuento: number;
  pagoCobrado: number;
  total: number;
}

interface CargoAdicional {
  id: string;
  descripcion: string;
  valor: number;
}

// Función para convertir citas en cargos
const generarCargosDesdeCitas = (): Cargo[] => {
  return citas
    .filter(cita => cita.consulta_realizada === true)
    .map(cita => {
      const paciente = pacientes.find(p => p.id_paciente === cita.id_paciente);
      const usuarioSucursal = usuariosSucursales.find(us => us.id_usuario_sucursal === cita.id_usuario_sucursal);
      const usuario = usuarioSucursal ? usuarios.find(u => u.id_usuario === usuarioSucursal.id_usuario) : null;
      const sucursal = sucursales.find(s => s.id_sucursal === cita.id_sucursal);
      
      const pagoCobrado = cita.estado_pago === 'pagado' ? cita.precio_cita : 
                         cita.estado_pago === 'parcial' ? cita.precio_cita * 0.5 : 0;

      return {
        id: `cargo-${cita.id_cita}`,
        id_cita: cita.id_cita,
        fecha: new Date(cita.fecha_cita + 'T' + cita.hora_inicio),
        paciente: paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente Desconocido',
        medico: usuario ? `Dr. ${usuario.nombre} ${usuario.apellido}` : 'Médico Desconocido',
        sucursal: sucursal?.nombre || 'Sin sucursal',
        tipoPago: cita.forma_pago,
        motivoConsulta: cita.motivo_consulta,
        estado: cita.estado_pago,
        subtotal: cita.precio_cita,
        descuento: 0,
        pagoCobrado: pagoCobrado,
        total: cita.precio_cita,
      };
    });
};

export function CargosView() {
  const [cargos, setCargos] = useState<Cargo[]>(() => generarCargosDesdeCitas());
  const [searchTerm, setSearchTerm] = useState('');
  const [medicoFilter, setMedicoFilter] = useState('todos');
  const [sucursalFilter, setSucursalFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('pendiente'); // Por defecto mostrar solo pendientes
  const [metricsFilter, setMetricsFilter] = useState('7dias');
  
  // Estados para edición de estado de pago
  const [isEditEstadoDialogOpen, setIsEditEstadoDialogOpen] = useState(false);
  const [cargoEditando, setCargoEditando] = useState<Cargo | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPago>('pendiente');
  const [nuevoPrecio, setNuevoPrecio] = useState(''); // Estado para editar el valor
  
  // Estados para el diálogo de facturación
  const [isFacturaDialogOpen, setIsFacturaDialogOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [cargosAdicionales, setCargosAdicionales] = useState<CargoAdicional[]>([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoValor, setNuevoValor] = useState('');
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  // Recargar cargos automáticamente cada 2 segundos
  useEffect(() => {
    const intervalId = setInterval(() => {
      const nuevosCargos = generarCargosDesdeCitas();
      setCargos(nuevosCargos);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // Función para recargar cargos manualmente
  const recargarCargos = () => {
    const nuevosCargos = generarCargosDesdeCitas();
    setCargos(nuevosCargos);
    toast.success('Cargos actualizados');
  };

  // Obtener listas únicas para filtros
  const medicosUnicos = Array.from(new Set(cargos.map(c => c.medico))).sort();
  const sucursalesUnicas = Array.from(new Set(cargos.map(c => c.sucursal))).sort();

  // Aplicar filtros
  const cargosFiltrados = cargos.filter(cargo => {
    const matchSearch = searchTerm === '' || 
      cargo.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.motivoConsulta.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchMedico = medicoFilter === 'todos' || cargo.medico === medicoFilter;
    const matchSucursal = sucursalFilter === 'todos' || cargo.sucursal === sucursalFilter;
    const matchEstado = estadoFilter === 'todos' || cargo.estado === estadoFilter;

    return matchSearch && matchMedico && matchSucursal && matchEstado;
  }).sort((a, b) => {
    // Ordenar primero por fecha (más reciente primero)
    const fechaCompare = b.fecha.getTime() - a.fecha.getTime();
    if (fechaCompare !== 0) return fechaCompare;
    
    // Si las fechas son iguales, ordenar por médico (alfabéticamente)
    return a.medico.localeCompare(b.medico);
  });

  // Calcular métricas basadas en cargos filtrados
  const numeroCargos = cargosFiltrados.length;
  const pagosCobrados = cargosFiltrados.reduce((sum, cargo) => sum + cargo.pagoCobrado, 0);
  const totalCargos = cargosFiltrados.reduce((sum, cargo) => sum + cargo.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleRemoveFilters = () => {
    setSearchTerm('');
    setMedicoFilter('todos');
    setSucursalFilter('todos');
    setEstadoFilter('todos');
    setMetricsFilter('7dias');
  };

  // Función para exportar a Excel (CSV)
  const exportarAExcel = () => {
    const headers = ['Fecha', 'Paciente', 'Médico', 'Sucursal', 'Tipo Pago', 'Motivo', 'Estado', 'Subtotal', 'Descuento', 'Cobrado', 'Total'];
    
    const rows = cargosFiltrados.map(cargo => [
      formatDate(cargo.fecha),
      cargo.paciente,
      cargo.medico,
      cargo.sucursal,
      cargo.tipoPago,
      cargo.motivoConsulta,
      cargo.estado.toUpperCase(),
      cargo.subtotal.toFixed(2),
      cargo.descuento.toFixed(2),
      cargo.pagoCobrado.toFixed(2),
      cargo.total.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cargos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Reporte exportado exitosamente');
  };

  // Editar estado de pago
  const handleEditarEstado = (cargo: Cargo) => {
    setCargoEditando(cargo);
    setNuevoEstado(cargo.estado);
    setNuevoPrecio(cargo.total.toString());
    setIsEditEstadoDialogOpen(true);
  };

  const confirmarCambioEstado = () => {
    if (!cargoEditando) return;

    // Validar que el precio sea válido
    const precioNuevo = parseFloat(nuevoPrecio);
    if (isNaN(precioNuevo) || precioNuevo < 0) {
      toast.error('Por favor ingrese un precio válido');
      return;
    }

    // Encontrar y actualizar la cita correspondiente
    const cita = citas.find(c => c.id_cita === cargoEditando.id_cita);
    if (cita) {
      cita.estado_pago = nuevoEstado;
      cita.precio_cita = precioNuevo; // Actualizar el precio
      cita.fecha_modificacion = new Date().toISOString();

      // Recargar cargos
      const nuevosCargos = generarCargosDesdeCitas();
      setCargos(nuevosCargos);
      
      toast.success(`Estado de pago actualizado a ${nuevoEstado.toUpperCase()} y precio actualizado a ${formatCurrency(precioNuevo)}`);
    }

    setIsEditEstadoDialogOpen(false);
    setCargoEditando(null);
  };

  const handleOpenFactura = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setCargosAdicionales([]);
    setIsFacturaDialogOpen(true);
  };

  const handleAgregarCargoAdicional = () => {
    if (!nuevaDescripcion || !nuevoValor) return;

    const nuevoCargoAdicional: CargoAdicional = {
      id: Date.now().toString(),
      descripcion: nuevaDescripcion,
      valor: parseFloat(nuevoValor),
    };

    setCargosAdicionales([...cargosAdicionales, nuevoCargoAdicional]);
    setNuevaDescripcion('');
    setNuevoValor('');
  };

  const handleEliminarCargoAdicional = (id: string) => {
    setCargosAdicionales(cargosAdicionales.filter((cargo) => cargo.id !== id));
  };

  const calcularTotalFactura = () => {
    if (!selectedCargo) return 0;
    const totalAdicionales = cargosAdicionales.reduce((sum, cargo) => sum + cargo.valor, 0);
    return selectedCargo.total + totalAdicionales;
  };

  const handleFacturar = () => {
    setShowConfirmacion(true);
  };

  const confirmarFacturacion = () => {
    setShowConfirmacion(false);
    setIsFacturaDialogOpen(false);
    setSelectedCargo(null);
    setCargosAdicionales([]);
    toast.success('Factura procesada exitosamente');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2">Cobros</h1>
          <p className="text-gray-600">Gestiona los cobros y pagos de las consultas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportarAExcel}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={cargosFiltrados.length === 0}
          >
            <Download className="size-4" />
            Exportar Excel
          </Button>
          <Button 
            onClick={recargarCargos}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar paciente, médico o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Médico */}
          <Select value={medicoFilter} onValueChange={setMedicoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los médicos</SelectItem>
              {medicosUnicos.map(medico => (
                <SelectItem key={medico} value={medico}>{medico}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sucursal */}
          <Select value={sucursalFilter} onValueChange={setSucursalFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las sucursales</SelectItem>
              {sucursalesUnicas.map(sucursal => (
                <SelectItem key={sucursal} value={sucursal}>{sucursal}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Estado */}
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
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

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{numeroCargos}</div>
            <div className="text-xs text-blue-600 uppercase tracking-wide">Consultas Realizadas</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{formatCurrency(pagosCobrados)}</div>
            <div className="text-xs text-cyan-600 uppercase tracking-wide">Cobros</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{formatCurrency(totalCargos)}</div>
            <div className="text-xs text-purple-600 uppercase tracking-wide">Total</div>
          </div>
        </Card>
      </div>

      {/* Tabla */}
      <TooltipProvider>
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[100px]">ACCIONES</TableHead>
                  <TableHead className="w-[90px]">FECHA</TableHead>
                  <TableHead className="w-[150px]">PACIENTE</TableHead>
                  <TableHead className="w-[130px]">MÉDICO</TableHead>
                  <TableHead className="w-[100px]">TIPO PAGO</TableHead>
                  <TableHead className="w-[150px]">MOTIVO</TableHead>
                  <TableHead className="w-[90px]">ESTADO</TableHead>
                  <TableHead className="text-right w-[100px]">SUBTOTAL</TableHead>
                  <TableHead className="text-right w-[90px]">DESC.</TableHead>
                  <TableHead className="text-right w-[100px]">COBRADO</TableHead>
                  <TableHead className="text-right w-[100px]">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      {searchTerm || medicoFilter !== 'todos' || sucursalFilter !== 'todos' || estadoFilter !== 'todos' 
                        ? 'No se encontraron cobros con los filtros aplicados.' 
                        : 'No hay consultas realizadas con cobros.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  cargosFiltrados.map((cargo) => (
                    <TableRow key={cargo.id} className="hover:bg-gray-50">
                      <TableCell className="text-center py-2">
                        <div className="flex gap-1 justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenFactura(cargo)}
                                className="h-8 w-8"
                              >
                                <FileText className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Facturar</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditarEstado(cargo)}
                                className="h-8 w-8"
                              >
                                <Edit className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar Estado</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm">{formatDate(cargo.fecha)}</TableCell>
                      <TableCell className="py-2 text-sm">{cargo.paciente}</TableCell>
                      <TableCell className="py-2 text-sm">{cargo.medico}</TableCell>
                      <TableCell className="py-2 text-sm capitalize">{cargo.tipoPago}</TableCell>
                      <TableCell className="py-2 text-sm">{cargo.motivoConsulta}</TableCell>
                      <TableCell className="py-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded whitespace-nowrap ${
                            cargo.estado === 'pagado'
                              ? 'bg-green-100 text-green-800'
                              : cargo.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : cargo.estado === 'parcial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {cargo.estado.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-2 text-sm">{formatCurrency(cargo.subtotal)}</TableCell>
                      <TableCell className="text-right py-2 text-sm">{formatCurrency(cargo.descuento)}</TableCell>
                      <TableCell className="text-right py-2 text-sm">{formatCurrency(cargo.pagoCobrado)}</TableCell>
                      <TableCell className="text-right py-2 text-sm">{formatCurrency(cargo.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </TooltipProvider>

      {/* Dialog para editar estado de pago */}
      <Dialog open={isEditEstadoDialogOpen} onOpenChange={setIsEditEstadoDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Editar Estado de Pago</DialogTitle>
            <DialogDescription>
              Cambia el estado de pago del cargo de {cargoEditando?.paciente}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="p-4 bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Paciente:</span>
                  <span className="font-medium">{cargoEditando?.paciente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{formatCurrency(cargoEditando?.total || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado Actual:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    cargoEditando?.estado === 'pagado'
                      ? 'bg-green-100 text-green-800'
                      : cargoEditando?.estado === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {cargoEditando?.estado.toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="nuevoEstado">Nuevo Estado</Label>
              <Select value={nuevoEstado} onValueChange={(value: EstadoPago) => setNuevoEstado(value)}>
                <SelectTrigger id="nuevoEstado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="parcial">Pago Parcial</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nuevoPrecio">Precio de la Consulta</Label>
              <Input
                id="nuevoPrecio"
                type="number"
                step="0.01"
                min="0"
                value={nuevoPrecio}
                onChange={(e) => setNuevoPrecio(e.target.value)}
                placeholder="0.00"
                className="text-right"
              />
              <p className="text-xs text-gray-500">💡 Modifica el precio si es necesario antes de guardar</p>
            </div>

            {nuevoEstado === 'parcial' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p>💡 El pago parcial se calculará como el 50% del total</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEstadoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarCambioEstado}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para facturación */}
      <Dialog open={isFacturaDialogOpen} onOpenChange={setIsFacturaDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Factura</DialogTitle>
            <DialogDescription>Revisa y agrega cargos adicionales a la factura.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Información del cargo principal */}
            <Card className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Paciente</Label>
                  <p>{selectedCargo?.paciente}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Médico</Label>
                  <p>{selectedCargo?.medico}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Fecha</Label>
                  <p>{selectedCargo ? formatDate(selectedCargo.fecha) : ''}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tipo de Pago</Label>
                  <p className="capitalize">{selectedCargo?.tipoPago}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Motivo de Consulta</Label>
                  <p>{selectedCargo?.motivoConsulta}</p>
                </div>
              </div>
            </Card>

            {/* Desglose de consulta */}
            <div className="space-y-2">
              <Label>Desglose de Consulta</Label>
              <Card className="p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm">{formatCurrency(selectedCargo?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Descuento:</span>
                  <span className="text-sm text-red-600">-{formatCurrency(selectedCargo?.descuento || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Total Consulta:</span>
                  <span>{formatCurrency(selectedCargo?.total || 0)}</span>
                </div>
              </Card>
            </div>

            {/* Cargos adicionales */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Cargos Adicionales</Label>
              </div>

              {/* Formulario para agregar cargo */}
              <Card className="p-3">
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Descripción del cargo"
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Valor"
                    className="w-32"
                    value={nuevoValor}
                    onChange={(e) => setNuevoValor(e.target.value)}
                  />
                  <Button
                    onClick={handleAgregarCargoAdicional}
                    disabled={!nuevaDescripcion || !nuevoValor}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* Lista de cargos adicionales */}
                {cargosAdicionales.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    {cargosAdicionales.map((cargo) => (
                      <div
                        key={cargo.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{cargo.descripcion}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{formatCurrency(cargo.valor)}</span>
                          <Button
                            onClick={() => handleEliminarCargoAdicional(cargo.id)}
                            size="icon"
                            variant="ghost"
                            className="size-8"
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Total de la factura */}
            <Card className="p-4 bg-blue-50">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total a Facturar:</span>
                <span className="text-2xl">{formatCurrency(calcularTotalFactura())}</span>
              </div>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFacturaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFacturar} disabled={!selectedCargo}>
              Facturar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de facturación */}
      <AlertDialog open={showConfirmacion} onOpenChange={setShowConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Facturación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas facturar este cargo por {selectedCargo ? formatCurrency(calcularTotalFactura()) : '$0.00'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmacion(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmarFacturacion}>
              Confirmar Facturación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}