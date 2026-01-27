import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Pencil, Trash2, Plus, Star, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { type UsuarioSucursal, sucursales } from '../../data/mockData';
import { useConfig } from '../../contexts/ConfigContext';
import { contarAsignacionesAfectadasUsuarioSucursal } from '../../utils/usuarioSync';

// Lista de especialidades
const especialidades = [
  'Cardiología',
  'Pediatría',
  'Medicina General',
  'Administración',
  'Enfermería'
];

export function UsuarioSucursalTab() {
  const { usuarios, usuariosSucursales, asignaciones, updateUsuarioSucursal, addUsuarioSucursal, deleteUsuarioSucursal } = useConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<UsuarioSucursal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<UsuarioSucursal, 'id_usuario_sucursal'>>({
    id_usuario: 0,
    id_sucursal: 0,
    especialidad: '',
    es_sucursal_principal: false,
    fecha_asignacion: new Date().toISOString().split('T')[0],
    estado: 'activo'
  });

  const handleOpenDialog = (asignacion?: UsuarioSucursal) => {
    if (asignacion) {
      setEditingAsignacion(asignacion);
      setFormData({
        id_usuario: asignacion.id_usuario,
        id_sucursal: asignacion.id_sucursal,
        especialidad: asignacion.especialidad,
        es_sucursal_principal: asignacion.es_sucursal_principal,
        fecha_asignacion: asignacion.fecha_asignacion,
        estado: asignacion.estado
      });
    } else {
      setEditingAsignacion(null);
      setFormData({
        id_usuario: 0,
        id_sucursal: 0,
        especialidad: '',
        es_sucursal_principal: false,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        estado: 'activo'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAsignacion(null);
  };

  const handleSave = () => {
    if (!formData.id_usuario || !formData.id_sucursal || !formData.especialidad) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (editingAsignacion) {
      updateUsuarioSucursal(editingAsignacion.id_usuario_sucursal, formData);
      toast.success('Asignación actualizada correctamente');
    } else {
      addUsuarioSucursal(formData);
      toast.success('Asignación creada correctamente');
    }

    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deletingId) {
      const asignacionesAfectadas = contarAsignacionesAfectadasUsuarioSucursal(deletingId, asignaciones);
      if (asignacionesAfectadas > 0) {
        toast.error(`No se puede eliminar esta asignación ya que tiene ${asignacionesAfectadas} asignaciones de horarios asociadas.`);
        setIsDeleteDialogOpen(false);
        setDeletingId(null);
        return;
      }
      deleteUsuarioSucursal(deletingId);
      toast.success('Asignación eliminada correctamente');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getUsuarioNombre = (id: number) => {
    const usuario = usuarios.find(u => u.id_usuario === id);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'N/A';
  };

  const getSucursalNombre = (id: number) => {
    return sucursales.find(s => s.id_sucursal === id)?.nombre || 'N/A';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Asignaciones Usuario-Sucursal</CardTitle>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="size-4 mr-2" />
          Nueva Asignación
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Fecha Asignación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosSucursales.map(asignacion => (
                <TableRow key={asignacion.id_usuario_sucursal}>
                  <TableCell>{asignacion.id_usuario_sucursal}</TableCell>
                  <TableCell>{getUsuarioNombre(asignacion.id_usuario)}</TableCell>
                  <TableCell>{getSucursalNombre(asignacion.id_sucursal)}</TableCell>
                  <TableCell>{asignacion.especialidad}</TableCell>
                  <TableCell>
                    {asignacion.es_sucursal_principal && (
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </TableCell>
                  <TableCell>{asignacion.fecha_asignacion}</TableCell>
                  <TableCell>
                    <Badge variant={asignacion.estado === 'activo' ? 'default' : 'secondary'}>
                      {asignacion.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(asignacion)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(asignacion.id_usuario_sucursal)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAsignacion ? 'Editar Asignación' : 'Nueva Asignación'}
            </DialogTitle>
            <DialogDescription>
              Asigne un usuario a una sucursal con su especialidad. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_usuario">Usuario *</Label>
                <Select
                  value={formData.id_usuario.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_usuario: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map(u => (
                      <SelectItem key={u.id_usuario} value={u.id_usuario.toString()}>
                        {u.nombre} {u.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_sucursal">Sucursal *</Label>
                <Select
                  value={formData.id_sucursal.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_sucursal: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursales.map(s => (
                      <SelectItem key={s.id_sucursal} value={s.id_sucursal.toString()}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="especialidad">Especialidad *</Label>
              <Select
                value={formData.especialidad}
                onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map(esp => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="es_sucursal_principal"
                checked={formData.es_sucursal_principal}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, es_sucursal_principal: checked as boolean })
                }
              />
              <Label
                htmlFor="es_sucursal_principal"
                className="text-sm cursor-pointer"
              >
                Es sucursal principal para este usuario
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha_asignacion">Fecha de Asignación *</Label>
                <Input
                  id="fecha_asignacion"
                  type="date"
                  value={formData.fecha_asignacion}
                  onChange={(e) => setFormData({ ...formData, fecha_asignacion: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'activo' | 'inactivo') => setFormData({ ...formData, estado: value })}
                >
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingAsignacion ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la asignación y todos sus horarios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}