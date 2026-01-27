// Tab de gestión de Sucursales con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useSucursales, useCompanias } from '../../hooks/useConfiguraciones';
import type { Sucursal } from '../../lib/configuracionesService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function SucursalTabSupabase() {
  const { sucursales, isLoading, agregarSucursal, actualizarSucursal, eliminarSucursal } = useSucursales();
  const { companias } = useCompanias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sucursalActual, setSucursalActual] = useState<Sucursal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sucursalAEliminar, setSucursalAEliminar] = useState<Sucursal | null>(null);

  const [formData, setFormData] = useState({
    id_compania: 0,
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'activo'
  });

  const handleNuevo = () => {
    setFormData({
      id_compania: companias[0]?.id_compania || 0,
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: 'activo'
    });
    setIsEditing(false);
    setSucursalActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (sucursal: Sucursal) => {
    setFormData({
      id_compania: sucursal.id_compania,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion || '',
      telefono: sucursal.telefono || '',
      email: sucursal.email || '',
      estado: sucursal.estado
    });
    setIsEditing(true);
    setSucursalActual(sucursal);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.id_compania) {
      toast.error('Debe seleccionar una compañía');
      return;
    }

    const datos = {
      id_compania: formData.id_compania,
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim() || null,
      telefono: formData.telefono.trim() || null,
      email: formData.email.trim() || null,
      estado: formData.estado
    };

    if (isEditing && sucursalActual) {
      const success = await actualizarSucursal(sucursalActual.id_sucursal, datos);
      if (success) {
        toast.success('Sucursal actualizada exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar la sucursal');
      }
    } else {
      const nueva = await agregarSucursal(datos);
      if (nueva) {
        toast.success('Sucursal creada exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear la sucursal');
      }
    }
  };

  const handleEliminarClick = (sucursal: Sucursal) => {
    setSucursalAEliminar(sucursal);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!sucursalAEliminar) return;

    const success = await eliminarSucursal(sucursalAEliminar.id_sucursal);
    if (success) {
      toast.success('Sucursal eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSucursalAEliminar(null);
    } else {
      toast.error('Error al eliminar la sucursal. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <MapPin className="size-5" />
            Gestión de Sucursales
          </h2>
          <p className="text-sm text-gray-600">Administra las sucursales de las compañías</p>
        </div>
        <Button onClick={handleNuevo} disabled={companias.length === 0}>
          <Plus className="size-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {companias.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Primero debes crear al menos una compañía antes de agregar sucursales.
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
                <TableHead>Compañía</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sucursales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay sucursales registradas
                  </TableCell>
                </TableRow>
              ) : (
                sucursales.map((sucursal, index) => (
                  <TableRow key={sucursal.id_sucursal || `sucursal-${index}`}>
                    <TableCell className="font-semibold">{sucursal.nombre}</TableCell>
                    <TableCell>{sucursal.compania?.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate">{sucursal.direccion || '-'}</TableCell>
                    <TableCell>{sucursal.telefono || '-'}</TableCell>
                    <TableCell>{sucursal.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={sucursal.estado === 'activo' ? 'default' : 'secondary'}>
                        {sucursal.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditar(sucursal)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarClick(sucursal)}>
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
            <DialogTitle>{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos de la sucursal' : 'Ingresa los datos de la nueva sucursal'}
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
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre de la sucursal"
              />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección física"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Teléfono"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>
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
              Esta acción eliminará la sucursal "{sucursalAEliminar?.nombre}".
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
