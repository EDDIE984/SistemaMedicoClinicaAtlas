// Vista de Cobros y Pagos integrada con Supabase
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
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Search, X, FileText, Plus, Trash2, RefreshCw, Download, DollarSign, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { SupabaseIndicator } from './SupabaseIndicator';
import { toast } from 'sonner';
import { useCobros, calcularTotalCargo, calcularTotalPagado, obtenerEstadoPago, formatearMoneda, getColorEstadoPago, exportarCargosCSV } from '../hooks/useCobros';
import type { CargoCompleto, FormaPago, EstadoPago } from '../lib/cobrosService';

export function CargosViewSupabase() {
  // Obtener ID del usuario actual
  const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      setIdUsuarioActual(parseInt(userId));
    }
  }, []);

  // Hook de cobros
  const { cargos, isLoading, loadCargos, agregarPago, agregarCargoAdicional, agregarDescuento, estadisticas } = useCobros(null); // null para ver todos los cobros

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [medicoFilter, setMedicoFilter] = useState('todos');
  const [sucursalFilter, setSucursalFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState<EstadoPago | 'todos'>('pendiente');

  // Estados de diálogos
  const [isRegistrarPagoDialogOpen, setIsRegistrarPagoDialogOpen] = useState(false);
  const [isFacturaDialogOpen, setIsFacturaDialogOpen] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState<CargoCompleto | null>(null);

  // Formulario de pago
  const [formPago, setFormPago] = useState({
    monto: '',
    forma_pago: 'efectivo' as FormaPago,
    referencia_pago: '',
    notas: ''
  });

  // Formularios de cargo adicional y descuento
  const [cargoAdicionalForm, setCargoAdicionalForm] = useState({
    descripcion: '',
    monto: ''
  });

  const [descuentoForm, setDescuentoForm] = useState({
    descripcion: '',
    monto: '',
    porcentaje: ''
  });

  // Obtener listas únicas para filtros
  const medicosUnicos = Array.from(
    new Set(
      cargos.map(c => `Dr. ${c.usuario_sucursal.usuario.nombre} ${c.usuario_sucursal.usuario.apellido}`)
    )
  ).sort();

  const sucursalesUnicas = Array.from(
    new Set(cargos.map(c => c.usuario_sucursal.sucursal.nombre))
  ).sort();

  // Aplicar filtros
  const cargosFiltrados = cargos.filter(cargo => {
    const pacienteNombre = `${cargo.paciente.nombres} ${cargo.paciente.apellidos}`.toLowerCase();
    const medicoNombre = `Dr. ${cargo.usuario_sucursal.usuario.nombre} ${cargo.usuario_sucursal.usuario.apellido}`.toLowerCase();
    const motivoConsulta = cargo.motivo_consulta.toLowerCase();

    const matchSearch = searchTerm === '' ||
      pacienteNombre.includes(searchTerm.toLowerCase()) ||
      medicoNombre.includes(searchTerm.toLowerCase()) ||
      motivoConsulta.includes(searchTerm.toLowerCase());

    const medicoCompleto = `Dr. ${cargo.usuario_sucursal.usuario.nombre} ${cargo.usuario_sucursal.usuario.apellido}`;
    const matchMedico = medicoFilter === 'todos' || medicoCompleto === medicoFilter;

    const matchSucursal = sucursalFilter === 'todos' || cargo.usuario_sucursal.sucursal.nombre === sucursalFilter;

    const estadoActual = obtenerEstadoPago(cargo);
    const matchEstado = estadoFilter === 'todos' || estadoActual === estadoFilter;

    return matchSearch && matchMedico && matchSucursal && matchEstado;
  });

  // Manejar registro de pago
  const handleRegistrarPago = (cargo: CargoCompleto) => {
    setCargoSeleccionado(cargo);
    const { total } = calcularTotalCargo(cargo);
    const totalPagado = calcularTotalPagado(cargo);
    const saldoPendiente = total - totalPagado;
    setFormPago({
      ...formPago,
      monto: saldoPendiente.toFixed(2)
    });
    setIsRegistrarPagoDialogOpen(true);
  };

  const confirmarPago = async () => {
    if (!cargoSeleccionado) return;

    const monto = parseFloat(formPago.monto);

    if (isNaN(monto) || monto <= 0) {
      toast.error('Por favor ingrese un monto válido');
      return;
    }

    const pago = {
      id_cita: cargoSeleccionado.id_cita,
      monto: monto,
      forma_pago: formPago.forma_pago,
      estado_pago: 'pagado' as EstadoPago,
      fecha_pago: new Date().toISOString(),
      referencia_pago: formPago.referencia_pago || null,
      notas: formPago.notas || null
    };

    const resultado = await agregarPago(pago);

    if (resultado) {
      toast.success('Pago registrado exitosamente');
      setIsRegistrarPagoDialogOpen(false);
      setFormPago({
        monto: '',
        forma_pago: 'efectivo',
        referencia_pago: '',
        notas: ''
      });
    } else {
      toast.error('Error al registrar el pago');
    }
  };

  // Manejar facturación completa
  const handleFacturar = (cargo: CargoCompleto) => {
    setCargoSeleccionado(cargo);
    setIsFacturaDialogOpen(true);
  };

  const agregarCargoAdicionalACita = async () => {
    if (!cargoSeleccionado) return;

    const monto = parseFloat(cargoAdicionalForm.monto);

    if (!cargoAdicionalForm.descripcion || isNaN(monto) || monto <= 0) {
      toast.error('Por favor complete los campos correctamente');
      return;
    }

    const resultado = await agregarCargoAdicional({
      id_cita: cargoSeleccionado.id_cita,
      descripcion: cargoAdicionalForm.descripcion,
      monto: monto
    });

    if (resultado) {
      toast.success('Cargo adicional agregado');
      setCargoAdicionalForm({ descripcion: '', monto: '' });
    } else {
      toast.error('Error al agregar cargo adicional');
    }
  };

  const agregarDescuentoACita = async () => {
    if (!cargoSeleccionado) return;

    const monto = parseFloat(descuentoForm.monto);

    if (!descuentoForm.descripcion || isNaN(monto) || monto <= 0) {
      toast.error('Por favor complete los campos correctamente');
      return;
    }

    const resultado = await agregarDescuento({
      id_cita: cargoSeleccionado.id_cita,
      descripcion: descuentoForm.descripcion,
      monto: monto,
      porcentaje: descuentoForm.porcentaje ? parseFloat(descuentoForm.porcentaje) : null
    });

    if (resultado) {
      toast.success('Descuento aplicado');
      setDescuentoForm({ descripcion: '', monto: '', porcentaje: '' });
    } else {
      toast.error('Error al aplicar descuento');
    }
  };

  // Limpiar filtros
  const handleRemoveFilters = () => {
    setSearchTerm('');
    setMedicoFilter('todos');
    setSucursalFilter('todos');
    setEstadoFilter('todos');
  };

  // Exportar a CSV
  const handleExportar = () => {
    exportarCargosCSV(cargosFiltrados);
    toast.success('Reporte exportado exitosamente');
  };

  return (
    <div className="h-full p-6 space-y-6">
      <SupabaseIndicator />

      {/* Header con título y botones */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Cobros y Pagos</h1>
          <p className="text-sm text-gray-500">Gestión de facturación y cobros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCargos}>
            <RefreshCw className="size-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExportar}>
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cargos</p>
              <p className="text-2xl mt-1">{estadisticas.totalCargos}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="size-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pagado</p>
              <p className="text-2xl mt-1 text-green-600">
                {formatearMoneda(estadisticas.totalPagado)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {estadisticas.numeroPagados} cargos
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
              <p className="text-sm text-gray-500">Pendiente</p>
              <p className="text-2xl mt-1 text-red-600">
                {formatearMoneda(estadisticas.totalPendiente)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {estadisticas.numeroPendientes} cargos
              </p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="size-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Pagos Parciales</p>
              <p className="text-2xl mt-1 text-yellow-600">
                {formatearMoneda(estadisticas.totalParcial)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {estadisticas.numeroParciales} cargos
              </p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <TrendingUp className="size-5 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Buscar por paciente, médico o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={medicoFilter} onValueChange={setMedicoFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los médicos</SelectItem>
              {medicosUnicos.map(medico => (
                <SelectItem key={medico} value={medico}>{medico}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sucursalFilter} onValueChange={setSucursalFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las sucursales</SelectItem>
              {sucursalesUnicas.map(sucursal => (
                <SelectItem key={sucursal} value={sucursal}>{sucursal}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={estadoFilter} onValueChange={(value: string) => setEstadoFilter(value as EstadoPago | 'todos')}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchTerm || medicoFilter !== 'todos' || sucursalFilter !== 'todos' || estadoFilter !== 'pendiente') && (
          <div className="mt-3 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRemoveFilters}>
              <X className="size-4 mr-2" />
              Limpiar filtros
            </Button>
            <span className="text-sm text-gray-500">
              {cargosFiltrados.length} resultado(s)
            </span>
          </div>
        )}
      </Card>

      {/* Tabla de cargos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Acciones</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Adicionales</TableHead>
                <TableHead className="text-right">Descuentos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No se encontraron cargos
                  </TableCell>
                </TableRow>
              ) : (
                cargosFiltrados.map((cargo) => {
                  const { subtotal, totalAdicionales, totalDescuentos, total } = calcularTotalCargo(cargo);
                  const totalPagado = calcularTotalPagado(cargo);
                  const estadoPago = obtenerEstadoPago(cargo);

                  return (
                    <TableRow key={cargo.id_cita}>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {estadoPago !== 'pagado' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRegistrarPago(cargo)}
                              >
                                <DollarSign className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFacturar(cargo)}
                              >
                                <FileText className="size-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(cargo.fecha).toLocaleDateString('es-ES')}</div>
                          <div className="text-xs text-gray-500">{cargo.hora_inicio}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{cargo.paciente.nombres} {cargo.paciente.apellidos}</div>
                          <div className="text-xs text-gray-500">{cargo.paciente.cedula}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        Dr. {cargo.usuario_sucursal.usuario.nombre} {cargo.usuario_sucursal.usuario.apellido}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cargo.usuario_sucursal.sucursal.nombre}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatearMoneda(subtotal)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {totalAdicionales > 0 ? (
                          <span className="text-blue-600">+{formatearMoneda(totalAdicionales)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {totalDescuentos > 0 ? (
                          <span className="text-green-600">-{formatearMoneda(totalDescuentos)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatearMoneda(total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatearMoneda(totalPagado)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={estadoPago === 'pagado' ? 'default' : estadoPago === 'parcial' ? 'secondary' : 'destructive'}
                        >
                          {estadoPago.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog: Registrar Pago */}
      <Dialog open={isRegistrarPagoDialogOpen} onOpenChange={setIsRegistrarPagoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              {cargoSeleccionado && `${cargoSeleccionado.paciente.nombres} ${cargoSeleccionado.paciente.apellidos}`}
            </DialogDescription>
          </DialogHeader>

          {cargoSeleccionado && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total del cargo:</span>
                  <span className="font-semibold">{formatearMoneda(calcularTotalCargo(cargoSeleccionado).total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ya pagado:</span>
                  <span className="text-green-600">{formatearMoneda(calcularTotalPagado(cargoSeleccionado))}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span>Saldo pendiente:</span>
                  <span className="font-semibold text-red-600">
                    {formatearMoneda(calcularTotalCargo(cargoSeleccionado).total - calcularTotalPagado(cargoSeleccionado))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monto a pagar</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formPago.monto}
                  onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de pago</Label>
                <Select
                  value={formPago.forma_pago}
                  onValueChange={(value: string) => setFormPago({ ...formPago, forma_pago: value as FormaPago })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="seguro">Seguro</SelectItem>
                    <SelectItem value="cortesia">Cortesía</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Referencia (opcional)</Label>
                <Input
                  value={formPago.referencia_pago}
                  onChange={(e) => setFormPago({ ...formPago, referencia_pago: e.target.value })}
                  placeholder="Número de transacción, cheque, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={formPago.notas}
                  onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrarPagoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarPago} className="bg-blue-600 hover:bg-blue-700">
              <DollarSign className="size-4 mr-2" />
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Facturación Completa */}
      <Dialog open={isFacturaDialogOpen} onOpenChange={setIsFacturaDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Facturación</DialogTitle>
            {cargoSeleccionado && (
              <DialogDescription>
                {cargoSeleccionado.paciente.nombres} {cargoSeleccionado.paciente.apellidos} - 
                {new Date(cargoSeleccionado.fecha).toLocaleDateString('es-ES')}
              </DialogDescription>
            )}
          </DialogHeader>

          {cargoSeleccionado && (
            <div className="space-y-6">
              {/* Desglose de costos */}
              <div className="space-y-3">
                <h3 className="font-semibold">Desglose de Costos</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Consulta base:</span>
                    <span>{formatearMoneda(cargoSeleccionado.precio)}</span>
                  </div>

                  {cargoSeleccionado.cargos_adicionales && cargoSeleccionado.cargos_adicionales.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mt-2 mb-1">Cargos adicionales:</div>
                      {cargoSeleccionado.cargos_adicionales.map((adicional) => (
                        <div key={adicional.id_cargo_adicional} className="flex justify-between text-sm">
                          <span className="text-gray-600">• {adicional.descripcion}</span>
                          <span className="text-blue-600">+{formatearMoneda(adicional.monto)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cargoSeleccionado.descuentos && cargoSeleccionado.descuentos.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mt-2 mb-1">Descuentos:</div>
                      {cargoSeleccionado.descuentos.map((descuento) => (
                        <div key={descuento.id_descuento} className="flex justify-between text-sm">
                          <span className="text-gray-600">• {descuento.descripcion}</span>
                          <span className="text-green-600">-{formatearMoneda(descuento.monto)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatearMoneda(calcularTotalCargo(cargoSeleccionado).total)}</span>
                  </div>
                </div>
              </div>

              {/* Agregar cargo adicional */}
              <div className="space-y-3">
                <h3 className="font-semibold">Agregar Cargo Adicional</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Descripción"
                    value={cargoAdicionalForm.descripcion}
                    onChange={(e) => setCargoAdicionalForm({ ...cargoAdicionalForm, descripcion: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Monto"
                    value={cargoAdicionalForm.monto}
                    onChange={(e) => setCargoAdicionalForm({ ...cargoAdicionalForm, monto: e.target.value })}
                    className="w-32"
                  />
                  <Button onClick={agregarCargoAdicionalACita} variant="outline">
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Agregar descuento */}
              <div className="space-y-3">
                <h3 className="font-semibold">Aplicar Descuento</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Descripción"
                    value={descuentoForm.descripcion}
                    onChange={(e) => setDescuentoForm({ ...descuentoForm, descripcion: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Monto"
                    value={descuentoForm.monto}
                    onChange={(e) => setDescuentoForm({ ...descuentoForm, monto: e.target.value })}
                    className="w-32"
                  />
                  <Button onClick={agregarDescuentoACita} variant="outline">
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Historial de pagos */}
              <div className="space-y-3">
                <h3 className="font-semibold">Historial de Pagos</h3>
                {cargoSeleccionado.pagos && cargoSeleccionado.pagos.length > 0 ? (
                  <div className="space-y-2">
                    {cargoSeleccionado.pagos.map((pago) => (
                      <div key={pago.id_pago} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{formatearMoneda(pago.monto)}</div>
                            <div className="text-gray-600">
                              {new Date(pago.fecha_pago).toLocaleDateString('es-ES')} - {pago.forma_pago}
                            </div>
                            {pago.referencia_pago && (
                              <div className="text-xs text-gray-500">Ref: {pago.referencia_pago}</div>
                            )}
                          </div>
                          <Badge variant="default">Pagado</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay pagos registrados</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFacturaDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
