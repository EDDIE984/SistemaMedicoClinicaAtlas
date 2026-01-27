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
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PrecioBase {
  id_precio_base: number;
  id_compania: number;
  especialidad: string;
  precio_base: number;
  descripcion: string;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta: string;
  estado: 'activo' | 'inactivo';
}

export function PrecioBaseTab() {
  const [preciosBase, setPreciosBase] = useState<PrecioBase[]>([
    {
      id_precio_base: 1,
      id_compania: 1,
      especialidad: "Cardiología",
      precio_base: 50.00,
      descripcion: "Consulta cardiológica estándar",
      fecha_vigencia_desde: "2025-01-01",
      fecha_vigencia_hasta: "2025-12-31",
      estado: "activo"
    },
    {
      id_precio_base: 2,
      id_compania: 1,
      especialidad: "Pediatría",
      precio_base: 35.00,
      descripcion: "Consulta pediátrica estándar",
      fecha_vigencia_desde: "2025-01-01",
      fecha_vigencia_hasta: "2025-12-31",
      estado: "activo"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPrecio, setEditingPrecio] = useState<PrecioBase | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<PrecioBase, 'id_precio_base'>>({
    id_compania: 1,
    especialidad: '',
    precio_base: 0,
    descripcion: '',
    fecha_vigencia_desde: new Date().toISOString().split('T')[0],
    fecha_vigencia_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    estado: 'activo'
  });

  // Mock data
  const companias = [
    { id: 1, nombre: "Hospital Atlas" }
  ];

  const especialidades = [
    "Cardiología",
    "Pediatría",
    "Medicina General",
    "Ginecología",
    "Traumatología",
    "Dermatología"
  ];

  const handleOpenDialog = (precio?: PrecioBase) => {
    if (precio) {
      setEditingPrecio(precio);
      setFormData({
        id_compania: precio.id_compania,
        especialidad: precio.especialidad,
        precio_base: precio.precio_base,
        descripcion: precio.descripcion,
        fecha_vigencia_desde: precio.fecha_vigencia_desde,
        fecha_vigencia_hasta: precio.fecha_vigencia_hasta,
        estado: precio.estado
      });
    } else {
      setEditingPrecio(null);
      setFormData({
        id_compania: 1,
        especialidad: '',
        precio_base: 0,
        descripcion: '',
        fecha_vigencia_desde: new Date().toISOString().split('T')[0],
        fecha_vigencia_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        estado: 'activo'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrecio(null);
  };

  const handleSave = () => {
    if (!formData.especialidad || formData.precio_base <= 0) {
      toast.error('Por favor complete los campos obligatorios correctamente');
      return;
    }

    if (formData.fecha_vigencia_desde >= formData.fecha_vigencia_hasta) {
      toast.error('La fecha de inicio debe ser menor a la fecha de fin');
      return;
    }

    if (editingPrecio) {
      setPreciosBase(prev => prev.map(p => 
        p.id_precio_base === editingPrecio.id_precio_base 
          ? { ...formData, id_precio_base: editingPrecio.id_precio_base }
          : p
      ));
      toast.success('Precio base actualizado correctamente');
    } else {
      const newId = Math.max(...preciosBase.map(p => p.id_precio_base), 0) + 1;
      setPreciosBase(prev => [...prev, { ...formData, id_precio_base: newId }]);
      toast.success('Precio base creado correctamente');
    }

    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deletingId) {
      setPreciosBase(prev => prev.filter(p => p.id_precio_base !== deletingId));
      toast.success('Precio base eliminado correctamente');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getCompaniaNombre = (id: number) => {
    return companias.find(c => c.id === id)?.nombre || 'N/A';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Precios Base por Especialidad</CardTitle>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="size-4 mr-2" />
          Nuevo Precio Base
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Vigencia Desde</TableHead>
                <TableHead>Vigencia Hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preciosBase.map(precio => (
                <TableRow key={precio.id_precio_base}>
                  <TableCell>{precio.id_precio_base}</TableCell>
                  <TableCell>{getCompaniaNombre(precio.id_compania)}</TableCell>
                  <TableCell>{precio.especialidad}</TableCell>
                  <TableCell>${precio.precio_base.toFixed(2)}</TableCell>
                  <TableCell className="max-w-xs truncate">{precio.descripcion}</TableCell>
                  <TableCell>{precio.fecha_vigencia_desde}</TableCell>
                  <TableCell>{precio.fecha_vigencia_hasta}</TableCell>
                  <TableCell>
                    <Badge variant={precio.estado === 'activo' ? 'default' : 'secondary'}>
                      {precio.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(precio)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(precio.id_precio_base)}
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
              {editingPrecio ? 'Editar Precio Base' : 'Nuevo Precio Base'}
            </DialogTitle>
            <DialogDescription>
              Configure el precio base para una especialidad. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_compania">Compañía *</Label>
                <Select
                  value={formData.id_compania.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_compania: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companias.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="precio_base">Precio Base * ($)</Label>
              <Input
                id="precio_base"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_base}
                onChange={(e) => setFormData({ ...formData, precio_base: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 50.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Consulta cardiológica estándar"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha_vigencia_desde">Vigencia Desde *</Label>
                <Input
                  id="fecha_vigencia_desde"
                  type="date"
                  value={formData.fecha_vigencia_desde}
                  onChange={(e) => setFormData({ ...formData, fecha_vigencia_desde: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fecha_vigencia_hasta">Vigencia Hasta *</Label>
                <Input
                  id="fecha_vigencia_hasta"
                  type="date"
                  value={formData.fecha_vigencia_hasta}
                  onChange={(e) => setFormData({ ...formData, fecha_vigencia_hasta: e.target.value })}
                />
              </div>
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

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingPrecio ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el precio base y puede afectar los precios de usuario asociados.
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
