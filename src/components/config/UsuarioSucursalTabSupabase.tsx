// Tab de gestión de Asignaciones Usuario-Sucursal con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Loader2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { useUsuarioSucursales, useUsuarios, useSucursales } from '../../hooks/useConfiguraciones';
import type { UsuarioSucursal } from '../../lib/configuracionesService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function UsuarioSucursalTabSupabase() {
  const { asignaciones, isLoading, agregarAsignacion, actualizarAsignacion, eliminarAsignacion } = useUsuarioSucursales();
  const { usuarios } = useUsuarios();
  const { sucursales } = useSucursales();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [asignacionActual, setAsignacionActual] = useState<UsuarioSucursal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [asignacionAEliminar, setAsignacionAEliminar] = useState<UsuarioSucursal | null>(null);

  const [formData, setFormData] = useState({
    id_usuario: 0,
    id_sucursal: 0,
    especialidad: '',
    cargo: '',
    estado: 'activo'
  });

  const handleNuevo = () => {
    setFormData({
      id_usuario: usuarios[0]?.id_usuario || 0,
      id_sucursal: sucursales[0]?.id_sucursal || 0,
      especialidad: '',
      cargo: '',
      estado: 'activo'
    });
    setIsEditing(false);
    setAsignacionActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (asignacion: UsuarioSucursal) => {
    setFormData({
      id_usuario: asignacion.id_usuario,
      id_sucursal: asignacion.id_sucursal,
      especialidad: asignacion.especialidad || '',
      cargo: asignacion.cargo || '',
      estado: asignacion.estado
    });
    setIsEditing(true);
    setAsignacionActual(asignacion);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.id_usuario || !formData.id_sucursal) {
      toast.error('Debe seleccionar un usuario y una sucursal');
      return;
    }

    const datos = {
      id_usuario: formData.id_usuario,
      id_sucursal: formData.id_sucursal,
      especialidad: formData.especialidad.trim() || null,
      cargo: formData.cargo.trim() || null,
      estado: formData.estado
    };

    if (isEditing && asignacionActual) {
      const success = await actualizarAsignacion(asignacionActual.id_usuario_sucursal, datos);
      if (success) {
        toast.success('Asignación actualizada exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar la asignación');
      }
    } else {
      const nueva = await agregarAsignacion(datos);
      if (nueva) {
        toast.success('Asignación creada exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear la asignación');
      }
    }
  };

  const handleEliminarClick = (asignacion: UsuarioSucursal) => {
    setAsignacionAEliminar(asignacion);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!asignacionAEliminar) return;

    const success = await eliminarAsignacion(asignacionAEliminar.id_usuario_sucursal);
    if (success) {
      toast.success('Asignación eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setAsignacionAEliminar(null);
    } else {
      toast.error('Error al eliminar la asignación. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <UserCog className="size-5" />
            Asignaciones Usuario-Sucursal
          </h2>
          <p className="text-sm text-gray-600">Asigna usuarios a sucursales con especialidad</p>
        </div>
        <Button onClick={handleNuevo} disabled={usuarios.length === 0 || sucursales.length === 0}>
          <Plus className="size-4 mr-2" />
          Nueva Asignación
        </Button>
      </div>

      {(usuarios.length === 0 || sucursales.length === 0) && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Debes tener usuarios y sucursales registrados antes de crear asignaciones.
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
                <TableHead>Usuario</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asignaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay asignaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                asignaciones.map((asignacion, index) => (
                  <TableRow key={asignacion.id_usuario_sucursal || `asignacion-${index}`}>
                    <TableCell className="font-semibold">
                      {asignacion.usuario?.nombre} {asignacion.usuario?.apellido}
                    </TableCell>
                    <TableCell>{asignacion.sucursal?.nombre}</TableCell>
                    <TableCell>{asignacion.sucursal?.compania?.nombre}</TableCell>
                    <TableCell>{asignacion.especialidad || '-'}</TableCell>
                    <TableCell>{asignacion.cargo || '-'}</TableCell>
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
            <DialogTitle>{isEditing ? 'Editar Asignación' : 'Nueva Asignación'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos de la asignación' : 'Asigna un usuario a una sucursal'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario *</Label>
              <Select
                value={formData.id_usuario.toString()}
                onValueChange={(value) => setFormData({ ...formData, id_usuario: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                      {usuario.nombre} {usuario.apellido} ({usuario.tipo_usuario})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                placeholder="Ej: Pediatría, Medicina General"
              />
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ej: Médico, Recepcionista"
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
              Esta acción eliminará la asignación de {asignacionAEliminar?.usuario?.nombre} {asignacionAEliminar?.usuario?.apellido} a {asignacionAEliminar?.sucursal?.nombre}.
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