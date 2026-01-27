// Tab de gestión de Compañías con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Pencil, Trash2, Loader2, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useCompanias } from '../../hooks/useConfiguraciones';
import type { Compania } from '../../lib/configuracionesService';
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

export function CompaniaTabSupabase() {
  const { companias, isLoading, agregarCompania, actualizarCompania, eliminarCompania } = useCompanias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companiaActual, setCompaniaActual] = useState<Compania | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companiaAEliminar, setCompaniaAEliminar] = useState<Compania | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    logo_url: '',
    estado: 'activo'
  });

  const handleNuevo = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      logo_url: '',
      estado: 'activo'
    });
    setIsEditing(false);
    setCompaniaActual(null);
    setIsDialogOpen(true);
  };

  const handleEditar = (compania: Compania) => {
    setFormData({
      nombre: compania.nombre,
      direccion: compania.direccion || '',
      telefono: compania.telefono || '',
      email: compania.email || '',
      logo_url: compania.logo_url || '',
      estado: compania.estado
    });
    setIsEditing(true);
    setCompaniaActual(compania);
    setIsDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const datos = {
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim() || null,
      telefono: formData.telefono.trim() || null,
      email: formData.email.trim() || null,
      logo_url: formData.logo_url.trim() || null,
      estado: formData.estado
    };

    if (isEditing && companiaActual) {
      const success = await actualizarCompania(companiaActual.id_compania, datos);
      if (success) {
        toast.success('Compañía actualizada exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar la compañía');
      }
    } else {
      const nueva = await agregarCompania(datos);
      if (nueva) {
        toast.success('Compañía creada exitosamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear la compañía');
      }
    }
  };

  const handleEliminarClick = (compania: Compania) => {
    setCompaniaAEliminar(compania);
    setIsDeleteDialogOpen(true);
  };

  const handleEliminarConfirmar = async () => {
    if (!companiaAEliminar) return;

    const success = await eliminarCompania(companiaAEliminar.id_compania);
    if (success) {
      toast.success('Compañía eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setCompaniaAEliminar(null);
    } else {
      toast.error('Error al eliminar la compañía. Puede tener registros asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <Building2 className="size-5" />
            Gestión de Compañías
          </h2>
          <p className="text-sm text-gray-600">Administra las compañías del sistema</p>
        </div>
        <Button onClick={handleNuevo}>
          <Plus className="size-4 mr-2" />
          Nueva Compañía
        </Button>
      </div>

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
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay compañías registradas
                  </TableCell>
                </TableRow>
              ) : (
                companias.map((compania, index) => (
                  <TableRow key={compania.id_compania || `compania-${index}`}>
                    <TableCell className="font-semibold">{compania.nombre}</TableCell>
                    <TableCell>{compania.telefono || '-'}</TableCell>
                    <TableCell>{compania.email || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{compania.direccion || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={compania.estado === 'activo' ? 'default' : 'secondary'}>
                        {compania.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditar(compania)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarClick(compania)}>
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
            <DialogTitle>{isEditing ? 'Editar Compañía' : 'Nueva Compañía'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos de la compañía' : 'Ingresa los datos de la nueva compañía'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre de la compañía"
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
              <Label>Logo URL (opcional)</Label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
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
              Esta acción eliminará la compañía "{companiaAEliminar?.nombre}".
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
