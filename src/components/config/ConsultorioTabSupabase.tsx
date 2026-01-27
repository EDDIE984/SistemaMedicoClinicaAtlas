// Tab de gestión de Consultorios con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Loader2, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useConsultorios, useSucursales } from '../../hooks/useConfiguraciones';
import type { Consultorio } from '../../lib/configuracionesService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function ConsultorioTabSupabase() {
  const { consultorios, isLoading, agregarConsultorio, actualizarConsultorio, eliminarConsultorio } = useConsultorios();
  const { sucursales } = useSucursales();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [consultorioActual, setConsultorioActual] = useState<Consultorio | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [consultorioAEliminar, setConsultorioAEliminar] = useState<Consultorio | null>(null);

  const [formData, setFormData] = useState({
    id_sucursal: 0,
    nombre: '',
    numero: '',
    piso: '',
    capacidad: 1,
    equipamiento: '',
    estado: 'activo'
  });

  const handleNuevo = () => {
    setFormData({
      id_sucursal: sucursales[0]?.id_sucursal || 0,
      nombre: '',
      numero: '',
      piso: '',
      capacidad: 1,
      equipamiento: '',
      estado: 'activo'
    });
    setIsEditing(false);
    setConsultorioActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (consultorio: Consultorio) => {
    setFormData({
      id_sucursal: consultorio.id_sucursal,
      nombre: consultorio.nombre,
      numero: consultorio.numero || '',
      piso: consultorio.piso || '',
      capacidad: consultorio.capacidad || 1,
      equipamiento: consultorio.equipamiento || '',
      estado: consultorio.estado
    });
    setIsEditing(true);
    setConsultorioActual(consultorio);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.id_sucursal) {
      toast.error('Debe seleccionar una sucursal');
      return;
    }

    const datos = {
      id_sucursal: formData.id_sucursal,
      nombre: formData.nombre.trim(),
      numero: formData.numero.trim() || null,
      piso: formData.piso.trim() || null,
      capacidad: formData.capacidad,
      equipamiento: formData.equipamiento.trim() || null,
      estado: formData.estado
    };

    if (isEditing && consultorioActual) {
      const success = await actualizarConsultorio(consultorioActual.id_consultorio, datos);
      if (success) {
        toast.success('Consultorio actualizado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar el consultorio');
      }
    } else {
      const nuevo = await agregarConsultorio(datos);
      if (nuevo) {
        toast.success('Consultorio creado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear el consultorio');
      }
    }
  };

  const handleEliminarClick = (consultorio: Consultorio) => {
    setConsultorioAEliminar(consultorio);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!consultorioAEliminar) return;

    const success = await eliminarConsultorio(consultorioAEliminar.id_consultorio);
    if (success) {
      toast.success('Consultorio eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setConsultorioAEliminar(null);
    } else {
      toast.error('Error al eliminar el consultorio. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <DoorOpen className="size-5" />
            Gestión de Consultorios
          </h2>
          <p className="text-sm text-gray-600">Administra los consultorios de cada sucursal</p>
        </div>
        <Button onClick={handleNuevo} disabled={sucursales.length === 0}>
          <Plus className="size-4 mr-2" />
          Nuevo Consultorio
        </Button>
      </div>

      {sucursales.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Primero debes crear al menos una sucursal antes de agregar consultorios.
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
                <TableHead>Nombre</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultorios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay consultorios registrados
                  </TableCell>
                </TableRow>
              ) : (
                consultorios.map((consultorio, index) => (
                  <TableRow key={consultorio.id_consultorio || `consultorio-${index}`}>
                    <TableCell className="font-semibold">{consultorio.nombre}</TableCell>
                    <TableCell>{consultorio.sucursal?.nombre}</TableCell>
                    <TableCell>{consultorio.numero || '-'}</TableCell>
                    <TableCell>{consultorio.piso || '-'}</TableCell>
                    <TableCell>{consultorio.capacidad || 1} persona{consultorio.capacidad !== 1 ? 's' : ''}</TableCell>
                    <TableCell>
                      <Badge variant={consultorio.estado === 'activo' ? 'default' : consultorio.estado === 'inactivo' ? 'secondary' : 'destructive'}>
                        {consultorio.estado === 'activo' ? 'Activo' : consultorio.estado === 'inactivo' ? 'Inactivo' : 'Mantenimiento'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditar(consultorio)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarClick(consultorio)}>
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
            <DialogTitle>{isEditing ? 'Editar Consultorio' : 'Nuevo Consultorio'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos del consultorio' : 'Ingresa los datos del nuevo consultorio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sucursal *</Label>
              <Select
                value={formData.id_sucursal.toString()}
                onValueChange={(value) => setFormData({ ...formData, id_sucursal: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sucursales.map((sucursal) => (
                    <SelectItem key={sucursal.id_sucursal} value={sucursal.id_sucursal.toString()}>
                      {sucursal.nombre} ({sucursal.compania?.nombre})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Consultorio A"
                />
              </div>

              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ej: 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Piso</Label>
                <Input
                  value={formData.piso}
                  onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                  placeholder="Ej: Planta Baja"
                />
              </div>

              <div className="space-y-2">
                <Label>Capacidad (personas)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 1 })}
                  placeholder="Ej: 3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Equipamiento</Label>
              <Textarea
                value={formData.equipamiento}
                onChange={(e) => setFormData({ ...formData, equipamiento: e.target.value })}
                placeholder="Ej: Camilla, Tensiómetro, ECG, Estetoscopio"
                rows={3}
              />
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
                  <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
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
              Esta acción eliminará el consultorio "{consultorioAEliminar?.nombre}".
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