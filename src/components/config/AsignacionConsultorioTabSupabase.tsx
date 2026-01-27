// Tab de gestión de Asignaciones de Consultorio (Horarios) con Supabase
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Loader2, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { useAsignacionesConsultorio, formatearDiaSemana, useUsuarioSucursales, useConsultorios } from '../../hooks/useConfiguraciones';
import type { AsignacionConsultorio } from '../../lib/configuracionesService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const DIAS_SEMANA = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 0, nombre: 'Domingo' }
];

export function AsignacionConsultorioTabSupabase() {
  const { asignaciones, isLoading, agregarAsignacion, actualizarAsignacion, eliminarAsignacion } = useAsignacionesConsultorio();
  const { asignaciones: usuariosSucursales } = useUsuarioSucursales();
  const { consultorios } = useConsultorios();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [asignacionActual, setAsignacionActual] = useState<AsignacionConsultorio | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [asignacionAEliminar, setAsignacionAEliminar] = useState<AsignacionConsultorio | null>(null);
  const [consultoriosFiltrados, setConsultoriosFiltrados] = useState<typeof consultorios>([]);

  const [formData, setFormData] = useState({
    id_usuario_sucursal: 0,
    id_consultorio: 0,
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fin: '17:00',
    duracion_consulta: 30,
    estado: 'activo'
  });

  // Filtrar consultorios cuando cambia el médico seleccionado
  useEffect(() => {
    if (formData.id_usuario_sucursal) {
      // Buscar la asignación usuario-sucursal seleccionada
      const usuarioSucursal = usuariosSucursales.find(
        us => us.id_usuario_sucursal === formData.id_usuario_sucursal
      );

      if (usuarioSucursal) {
        // Filtrar consultorios que pertenecen a la misma sucursal
        const consultoriosDeLaSucursal = consultorios.filter(
          c => c.id_sucursal === usuarioSucursal.id_sucursal
        );
        setConsultoriosFiltrados(consultoriosDeLaSucursal);

        // Si el consultorio seleccionado no está en la lista filtrada, resetear
        const consultorioValido = consultoriosDeLaSucursal.find(
          c => c.id_consultorio === formData.id_consultorio
        );
        if (!consultorioValido && consultoriosDeLaSucursal.length > 0) {
          setFormData(prev => ({ ...prev, id_consultorio: consultoriosDeLaSucursal[0].id_consultorio }));
        } else if (consultoriosDeLaSucursal.length === 0) {
          setFormData(prev => ({ ...prev, id_consultorio: 0 }));
        }
      } else {
        setConsultoriosFiltrados([]);
        setFormData(prev => ({ ...prev, id_consultorio: 0 }));
      }
    } else {
      setConsultoriosFiltrados([]);
      setFormData(prev => ({ ...prev, id_consultorio: 0 }));
    }
  }, [formData.id_usuario_sucursal, usuariosSucursales, consultorios]);

  const handleNuevo = () => {
    setFormData({
      id_usuario_sucursal: usuariosSucursales[0]?.id_usuario_sucursal || 0,
      id_consultorio: consultorios[0]?.id_consultorio || 0,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fin: '17:00',
      duracion_consulta: 30,
      estado: 'activo'
    });
    setIsEditing(false);
    setAsignacionActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (asignacion: AsignacionConsultorio) => {
    setFormData({
      id_usuario_sucursal: asignacion.id_usuario_sucursal,
      id_consultorio: asignacion.id_consultorio,
      dia_semana: asignacion.dia_semana, // Ya es número, no necesita conversión
      hora_inicio: asignacion.hora_inicio,
      hora_fin: asignacion.hora_fin,
      duracion_consulta: asignacion.duracion_consulta || 30,
      estado: asignacion.estado
    });
    setIsEditing(true);
    setAsignacionActual(asignacion);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.id_usuario_sucursal || !formData.id_consultorio) {
      toast.error('Debe seleccionar un médico y un consultorio');
      return;
    }

    if (!formData.hora_inicio || !formData.hora_fin) {
      toast.error('Debe especificar hora de inicio y fin');
      return;
    }

    // Validar duración de consulta
    if (!formData.duracion_consulta || formData.duracion_consulta <= 0 || formData.duracion_consulta > 480) {
      toast.error('La duración debe estar entre 1 y 480 minutos (8 horas)');
      return;
    }
    
    const datos = {
      id_usuario_sucursal: formData.id_usuario_sucursal,
      id_consultorio: formData.id_consultorio,
      dia_semana: formData.dia_semana, // Ya es número, guardarlo directo
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      duracion_consulta: formData.duracion_consulta,
      estado: formData.estado
    };

    console.log('📋 Guardando horario:', datos);

    if (isEditing && asignacionActual) {
      const success = await actualizarAsignacion(asignacionActual.id_asignacion, datos);
      if (success) {
        toast.success('Horario actualizado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar el horario');
      }
    } else {
      const nueva = await agregarAsignacion(datos);
      if (nueva) {
        toast.success('Horario creado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear el horario');
      }
    }
  };

  const handleEliminarClick = (asignacion: AsignacionConsultorio) => {
    setAsignacionAEliminar(asignacion);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!asignacionAEliminar) return;

    const success = await eliminarAsignacion(asignacionAEliminar.id_asignacion);
    if (success) {
      toast.success('Horario eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setAsignacionAEliminar(null);
    } else {
      toast.error('Error al eliminar el horario. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <CalendarClock className="size-5" />
            Horarios y Asignaciones de Consultorio
          </h2>
          <p className="text-sm text-gray-600">Define horarios de atención por médico y consultorio</p>
        </div>
        <Button onClick={handleNuevo} disabled={usuariosSucursales.length === 0 || consultorios.length === 0}>
          <Plus className="size-4 mr-2" />
          Nuevo Horario
        </Button>
      </div>

      {(usuariosSucursales.length === 0 || consultorios.length === 0) && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Debes tener usuarios asignados a sucursales y consultorios registrados antes de crear horarios.
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead>Consultorio</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Día</TableHead>
                <TableHead>Hora Inicio</TableHead>
                <TableHead>Hora Fin</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asignaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No hay asignaciones de horario registradas
                  </TableCell>
                </TableRow>
              ) : (
                asignaciones.map((asignacion, index) => (
                  <TableRow key={asignacion.id_asignacion || `asignacion-${index}`}>
                    <TableCell className="font-semibold">
                      Dr. {asignacion.usuario_sucursal?.usuario?.nombre} {asignacion.usuario_sucursal?.usuario?.apellido}
                    </TableCell>
                    <TableCell>{asignacion.consultorio?.nombre}</TableCell>
                    <TableCell>{asignacion.usuario_sucursal?.sucursal?.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatearDiaSemana(asignacion.dia_semana)}
                      </Badge>
                    </TableCell>
                    <TableCell>{asignacion.hora_inicio}</TableCell>
                    <TableCell>{asignacion.hora_fin}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {asignacion.duracion_consulta || 30} min
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={asignacion.estado === 'activo' ? 'default' : 'secondary'}>
                        {asignacion.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditar(asignacion)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarClick(asignacion)}>
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog: Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos del horario' : 'Define un horario de atención'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Médico *</Label>
              <Select
                value={formData.id_usuario_sucursal.toString()}
                onValueChange={(value) => setFormData({ ...formData, id_usuario_sucursal: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usuariosSucursales
                    .filter((us) => us.usuario?.tipo_usuario === 'medico')
                    .map((us) => (
                      <SelectItem key={us.id_usuario_sucursal} value={us.id_usuario_sucursal.toString()}>
                        Dr. {us.usuario?.nombre} {us.usuario?.apellido} - {us.sucursal?.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consultorio *</Label>
              <Select
                value={formData.id_consultorio.toString()}
                onValueChange={(value) => setFormData({ ...formData, id_consultorio: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {consultoriosFiltrados.map((consultorio) => (
                    <SelectItem key={consultorio.id_consultorio} value={consultorio.id_consultorio.toString()}>
                      {consultorio.nombre} ({consultorio.sucursal?.nombre})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Día de la semana *</Label>
              <Select
                value={formData.dia_semana.toString()}
                onValueChange={(value) => setFormData({ ...formData, dia_semana: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((dia) => (
                    <SelectItem key={dia.valor} value={dia.valor.toString()}>
                      {dia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Inicio *</Label>
                <Input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Hora Fin *</Label>
                <Input
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duración de la Consulta (minutos) *</Label>
              <Input
                type="number"
                min="5"
                max="480"
                step="5"
                placeholder="30"
                value={formData.duracion_consulta}
                onChange={(e) => setFormData({ ...formData, duracion_consulta: parseInt(e.target.value) || 30 })}
              />
              <p className="text-xs text-gray-500">
                Tiempo estimado por consulta. Valores comunes: 15, 30, 45, 60 minutos
              </p>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el horario del Dr. {asignacionAEliminar?.usuario_sucursal?.usuario?.nombre} en {asignacionAEliminar?.consultorio?.nombre}.
              Esta acción no se puede deshacer y puede fallar si existen registros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarConfirmar} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}