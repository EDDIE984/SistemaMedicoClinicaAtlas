// Tab de gestión de Precios Base con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { usePreciosBase, useCompanias, formatearMoneda } from '../../hooks/useConfiguraciones';
import type { PrecioBase } from '../../lib/configuracionesService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function PrecioBaseTabSupabase() {
  const { preciosBase, isLoading, agregarPrecioBase, actualizarPrecioBase, eliminarPrecioBase } = usePreciosBase();
  const { companias } = useCompanias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [precioActual, setPrecioActual] = useState<PrecioBase | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [precioAEliminar, setPrecioAEliminar] = useState<PrecioBase | null>(null);

  const [formData, setFormData] = useState({
    id_compania: 0,
    especialidad: '',
    precio_consulta: 0,
    precio_control: 0,
    precio_emergencia: 0,
    estado: 'activo'
  });

  const handleNuevo = () => {
    setFormData({
      id_compania: companias[0]?.id_compania || 0,
      especialidad: '',
      precio_consulta: 0,
      precio_control: 0,
      precio_emergencia: 0,
      estado: 'activo'
    });
    setIsEditing(false);
    setPrecioActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (precio: PrecioBase) => {
    setFormData({
      id_compania: precio.id_compania,
      especialidad: precio.especialidad,
      precio_consulta: precio.precio_consulta,
      precio_control: precio.precio_control,
      precio_emergencia: precio.precio_emergencia,
      estado: precio.estado
    });
    setIsEditing(true);
    setPrecioActual(precio);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.especialidad.trim()) {
      toast.error('La especialidad es requerida');
      return;
    }

    if (!formData.id_compania) {
      toast.error('Debe seleccionar una compañía');
      return;
    }

    if (formData.precio_consulta < 0 || formData.precio_control < 0 || formData.precio_emergencia < 0) {
      toast.error('Los precios no pueden ser negativos');
      return;
    }

    const datos = {
      id_compania: formData.id_compania,
      especialidad: formData.especialidad.trim(),
      precio_consulta: formData.precio_consulta,
      precio_control: formData.precio_control,
      precio_emergencia: formData.precio_emergencia,
      estado: formData.estado
    };

    if (isEditing && precioActual) {
      const success = await actualizarPrecioBase(precioActual.id_precio_base, datos);
      if (success) {
        toast.success('Precio base actualizado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar el precio base');
      }
    } else {
      const nuevo = await agregarPrecioBase(datos);
      if (nuevo) {
        toast.success('Precio base creado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear el precio base');
      }
    }
  };

  const handleEliminarClick = (precio: PrecioBase) => {
    setPrecioAEliminar(precio);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!precioAEliminar) return;

    const success = await eliminarPrecioBase(precioAEliminar.id_precio_base);
    if (success) {
      toast.success('Precio base eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setPrecioAEliminar(null);
    } else {
      toast.error('Error al eliminar el precio base. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <Tag className="size-5" />
            Precios Base por Especialidad
          </h2>
          <p className="text-sm text-gray-600">Define los precios base por especialidad</p>
        </div>
        <Button onClick={handleNuevo} disabled={companias.length === 0}>
          <Plus className="size-4 mr-2" />
          Nuevo Precio Base
        </Button>
      </div>

      {companias.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Primero debes crear al menos una compañía antes de agregar precios base.
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
                <TableHead>Especialidad</TableHead>
                <TableHead className="text-right">Consulta</TableHead>
                <TableHead className="text-right">Control</TableHead>
                <TableHead className="text-right">Emergencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preciosBase.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay precios base registrados
                  </TableCell>
                </TableRow>
              ) : (
                preciosBase.map((precio, index) => (
                  <TableRow key={precio.id_precio_base || `precio-${index}`}>
                    <TableCell className="font-semibold">{precio.especialidad}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearMoneda(precio.precio_consulta)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearMoneda(precio.precio_control)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearMoneda(precio.precio_emergencia)}</TableCell>
                    <TableCell>
                      <Badge variant={precio.estado === 'activo' ? 'default' : 'secondary'}>
                        {precio.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditar(precio)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarClick(precio)}>
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
            <DialogTitle>{isEditing ? 'Editar Precio Base' : 'Nuevo Precio Base'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos del precio base' : 'Define precios base para una especialidad'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Compañía *</Label>
              <Select
                value={formData.id_compania.toString()}
                onValueChange={(value) => setFormData({ ...formData, id_compania: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companias.map((compania) => (
                    <SelectItem key={compania.id_compania} value={compania.id_compania.toString()}>
                      {compania.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Especialidad *</Label>
              <Input
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                placeholder="Ej: Pediatría, Cardiología"
              />
            </div>

            <div className="space-y-2">
              <Label>Precio Consulta *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_consulta}
                onChange={(e) => setFormData({ ...formData, precio_consulta: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Precio Control *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_control}
                onChange={(e) => setFormData({ ...formData, precio_control: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Precio Emergencia *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_emergencia}
                onChange={(e) => setFormData({ ...formData, precio_emergencia: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
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
              Esta acción eliminará el precio base para la especialidad "{precioAEliminar?.especialidad}".
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