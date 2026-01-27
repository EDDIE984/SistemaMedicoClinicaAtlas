import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveTable } from './ResponsiveTable';
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
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Sucursal {
  id_sucursal: number;
  id_compania: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario_atencion: string;
  estado: 'activo' | 'inactivo';
}

export function SucursalTab() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([
    {
      id_sucursal: 1,
      id_compania: 1,
      nombre: "Sucursal Norte",
      direccion: "Av. 6 de Diciembre N45-123",
      telefono: "02-2345679",
      email: "norte@hospitalatlas.com",
      horario_atencion: "Lun-Vie 7:00-19:00",
      estado: "activo"
    },
    {
      id_sucursal: 2,
      id_compania: 1,
      nombre: "Sucursal Sur",
      direccion: "Av. Mariscal Sucre S23-456",
      telefono: "02-2345680",
      email: "sur@hospitalatlas.com",
      horario_atencion: "Lun-Sáb 8:00-18:00",
      estado: "activo"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Sucursal, 'id_sucursal'>>({
    id_compania: 1,
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    horario_atencion: '',
    estado: 'activo'
  });

  const companias = [{ id: 1, nombre: "Hospital Atlas" }];

  const handleOpenDialog = (sucursal?: Sucursal) => {
    if (sucursal) {
      setEditingSucursal(sucursal);
      setFormData({
        id_compania: sucursal.id_compania,
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        email: sucursal.email,
        horario_atencion: sucursal.horario_atencion,
        estado: sucursal.estado
      });
    } else {
      setEditingSucursal(null);
      setFormData({
        id_compania: 1,
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        horario_atencion: '',
        estado: 'activo'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.id_compania) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (editingSucursal) {
      setSucursales(prev => prev.map(s => 
        s.id_sucursal === editingSucursal.id_sucursal 
          ? { ...formData, id_sucursal: editingSucursal.id_sucursal }
          : s
      ));
      toast.success('Sucursal actualizada correctamente');
    } else {
      const newId = Math.max(...sucursales.map(s => s.id_sucursal), 0) + 1;
      setSucursales(prev => [...prev, { ...formData, id_sucursal: newId }]);
      toast.success('Sucursal creada correctamente');
    }

    setIsDialogOpen(false);
    setEditingSucursal(null);
  };

  const handleDelete = () => {
    if (deletingId) {
      setSucursales(prev => prev.filter(s => s.id_sucursal !== deletingId));
      toast.success('Sucursal eliminada correctamente');
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

  const columns = [
    { header: 'ID', accessor: 'id_sucursal' as keyof Sucursal, hideOnMobile: true },
    { header: 'Nombre', accessor: 'nombre' as keyof Sucursal },
    { 
      header: 'Compañía', 
      accessor: (item: Sucursal) => getCompaniaNombre(item.id_compania),
      mobileLabel: 'Compañía'
    },
    { header: 'Dirección', accessor: 'direccion' as keyof Sucursal },
    { header: 'Teléfono', accessor: 'telefono' as keyof Sucursal },
    { header: 'Horario', accessor: 'horario_atencion' as keyof Sucursal },
    { 
      header: 'Estado', 
      accessor: (item: Sucursal) => (
        <Badge variant={item.estado === 'activo' ? 'default' : 'secondary'}>
          {item.estado}
        </Badge>
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg md:text-xl">Sucursales</CardTitle>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nueva Sucursal</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          data={sucursales}
          columns={columns}
          keyExtractor={(item) => item.id_sucursal}
          actions={(sucursal) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(sucursal)}
              >
                <Pencil className="size-4" />
                <span className="hidden sm:inline ml-2">Editar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(sucursal.id_sucursal)}
              >
                <Trash2 className="size-4 text-red-600" />
                <span className="hidden sm:inline ml-2 text-red-600">Eliminar</span>
              </Button>
            </>
          )}
          emptyMessage="No hay sucursales registradas"
        />
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </DialogTitle>
            <DialogDescription>
              Complete los datos de la sucursal. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Sucursal Norte"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: Av. 6 de Diciembre N45-123"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej: 02-2345679"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: norte@hospital.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="horario_atencion">Horario de Atención</Label>
              <Input
                id="horario_atencion"
                value={formData.horario_atencion}
                onChange={(e) => setFormData({ ...formData, horario_atencion: e.target.value })}
                placeholder="Ej: Lunes a Viernes 7:00-19:00"
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {editingSucursal ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la sucursal y todas sus asignaciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setDeletingId(null)} className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
