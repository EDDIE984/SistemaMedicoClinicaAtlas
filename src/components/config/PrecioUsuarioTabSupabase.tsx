// Tab de gestión de Precios por Usuario con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { usePreciosUsuario, useUsuarioSucursales, formatearMoneda } from '../../hooks/useConfiguraciones';
import type { PrecioUsuario } from '../../lib/configuracionesService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function PrecioUsuarioTabSupabase() {
  const { preciosUsuario, isLoading, agregarPrecioUsuario, actualizarPrecioUsuario, eliminarPrecioUsuario } = usePreciosUsuario();
  const { asignaciones: usuariosSucursales } = useUsuarioSucursales();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [precioActual, setPrecioActual] = useState<PrecioUsuario | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [precioAEliminar, setPrecioAEliminar] = useState<PrecioUsuario | null>(null);

  const [formData, setFormData] = useState({
    id_usuario_sucursal: 0,
    precio_consulta: 0,
    precio_control: 0,
    precio_emergencia: 0,
    tipo_ajuste: 'ninguno',
    valor_ajuste: 0,
    estado: 'activo'
  });

  const handleNuevo = () => {
    setFormData({
      id_usuario_sucursal: usuariosSucursales[0]?.id_usuario_sucursal || 0,
      precio_consulta: 0,
      precio_control: 0,
      precio_emergencia: 0,
      tipo_ajuste: 'ninguno',
      valor_ajuste: 0,
      estado: 'activo'
    });
    setIsEditing(false);
    setPrecioActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (precio: PrecioUsuario) => {
    setFormData({
      id_usuario_sucursal: precio.id_usuario_sucursal,
      precio_consulta: precio.precio_consulta,
      precio_control: precio.precio_control,
      precio_emergencia: precio.precio_emergencia,
      tipo_ajuste: precio.tipo_ajuste,
      valor_ajuste: precio.valor_ajuste,
      estado: precio.estado
    });
    setIsEditing(true);
    setPrecioActual(precio);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.id_usuario_sucursal) {
      toast.error('Debe seleccionar un usuario');
      return;
    }

    if (formData.precio_consulta < 0 || formData.precio_control < 0 || formData.precio_emergencia < 0) {
      toast.error('Los precios no pueden ser negativos');
      return;
    }

    const datos = {
      id_usuario_sucursal: formData.id_usuario_sucursal,
      precio_consulta: formData.precio_consulta,
      precio_control: formData.precio_control,
      precio_emergencia: formData.precio_emergencia,
      tipo_ajuste: formData.tipo_ajuste,
      valor_ajuste: formData.valor_ajuste,
      estado: formData.estado
    };

    if (isEditing && precioActual) {
      const success = await actualizarPrecioUsuario(precioActual.id_precio, datos);
      if (success) {
        toast.success('Precio de usuario actualizado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar el precio de usuario');
      }
    } else {
      const nuevo = await agregarPrecioUsuario(datos);
      if (nuevo) {
        toast.success('Precio de usuario creado exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear el precio de usuario');
      }
    }
  };

  const handleEliminarClick = (precio: PrecioUsuario) => {
    setPrecioAEliminar(precio);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!precioAEliminar) return;

    const success = await eliminarPrecioUsuario(precioAEliminar.id_precio);
    if (success) {
      toast.success('Precio de usuario eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setPrecioAEliminar(null);
    } else {
      toast.error('Error al eliminar el precio de usuario. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <DollarSign className="size-5" />
            Precios por Usuario
          </h2>
          <p className="text-sm text-gray-600">Define precios específicos por usuario/médico</p>
        </div>
        <Button onClick={handleNuevo} disabled={usuariosSucursales.length === 0}>
          <Plus className="size-4 mr-2" />
          Nuevo Precio Usuario
        </Button>
      </div>

      {usuariosSucursales.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Primero debes asignar usuarios a sucursales antes de definir precios específicos.
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
                <TableHead className="text-right">Consulta</TableHead>
                <TableHead className="text-right">Control</TableHead>
                <TableHead className="text-right">Emergencia</TableHead>
                <TableHead>Ajuste</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preciosUsuario.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No hay precios por usuario registrados
                  </TableCell>
                </TableRow>
              ) : (
                preciosUsuario.map((precio, index) => (
                  <TableRow key={precio.id_precio || `precio-${index}`}>
                    <TableCell className="font-semibold">
                      {precio.usuario_sucursal?.usuario?.nombre} {precio.usuario_sucursal?.usuario?.apellido}
                    </TableCell>
                    <TableCell>{precio.usuario_sucursal?.sucursal?.nombre}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearMoneda(precio.precio_consulta)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearMoneda(precio.precio_control)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearMoneda(precio.precio_emergencia)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {precio.tipo_ajuste}: {precio.valor_ajuste}%
                      </Badge>
                    </TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Precio de Usuario' : 'Nuevo Precio de Usuario'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos del precio personalizado' : 'Define precios específicos para un usuario'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario *</Label>
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
                        {us.usuario?.nombre} {us.usuario?.apellido} - {us.sucursal?.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Ajuste</Label>
                <Select value={formData.tipo_ajuste} onValueChange={(value) => setFormData({ ...formData, tipo_ajuste: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Sin Ajuste</SelectItem>
                    <SelectItem value="porcentaje">Porcentaje</SelectItem>
                    <SelectItem value="monto_fijo">Monto Fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor de Ajuste (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_ajuste}
                  onChange={(e) => setFormData({ ...formData, valor_ajuste: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
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
              Esta acción eliminará el precio personalizado de {precioAEliminar?.usuario_sucursal?.usuario?.nombre} {precioAEliminar?.usuario_sucursal?.usuario?.apellido}.
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