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
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Compania {
  id_compania: number;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
}

export function CompaniaTab() {
  const [companias, setCompanias] = useState<Compania[]>([
    {
      id_compania: 1,
      nombre: "Hospital Atlas",
      ruc: "1792485932001",
      direccion: "Av. Principal 123, Quito",
      telefono: "02-2345678",
      email: "info@hospitalatlas.com"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCompania, setEditingCompania] = useState<Compania | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Compania, 'id_compania'>>({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const handleOpenDialog = (compania?: Compania) => {
    if (compania) {
      setEditingCompania(compania);
      setFormData({
        nombre: compania.nombre,
        ruc: compania.ruc,
        direccion: compania.direccion,
        telefono: compania.telefono,
        email: compania.email
      });
    } else {
      setEditingCompania(null);
      setFormData({
        nombre: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCompania(null);
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.ruc || !formData.email) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (editingCompania) {
      setCompanias(prev => prev.map(c => 
        c.id_compania === editingCompania.id_compania 
          ? { ...formData, id_compania: editingCompania.id_compania }
          : c
      ));
      toast.success('Compañía actualizada correctamente');
    } else {
      const newId = Math.max(...companias.map(c => c.id_compania), 0) + 1;
      setCompanias(prev => [...prev, { ...formData, id_compania: newId }]);
      toast.success('Compañía creada correctamente');
    }

    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deletingId) {
      setCompanias(prev => prev.filter(c => c.id_compania !== deletingId));
      toast.success('Compañía eliminada correctamente');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id_compania' as keyof Compania,
      mobileLabel: 'ID',
      hideOnMobile: true
    },
    {
      header: 'Nombre',
      accessor: 'nombre' as keyof Compania,
      mobileLabel: 'Nombre'
    },
    {
      header: 'RUC/NIT',
      accessor: 'ruc' as keyof Compania,
      mobileLabel: 'RUC'
    },
    {
      header: 'Dirección',
      accessor: 'direccion' as keyof Compania,
      mobileLabel: 'Dirección'
    },
    {
      header: 'Teléfono',
      accessor: 'telefono' as keyof Compania,
      mobileLabel: 'Teléfono'
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Compania,
      mobileLabel: 'Email'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg md:text-xl">Compañías</CardTitle>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nueva Compañía</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          data={companias}
          columns={columns}
          keyExtractor={(item) => item.id_compania}
          actions={(compania) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(compania)}
              >
                <Pencil className="size-4" />
                <span className="hidden sm:inline ml-2">Editar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(compania.id_compania)}
              >
                <Trash2 className="size-4 text-red-600" />
                <span className="hidden sm:inline ml-2 text-red-600">Eliminar</span>
              </Button>
            </>
          )}
          emptyMessage="No hay compañías registradas"
        />
      </CardContent>

      {/* Dialog para Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompania ? 'Editar Compañía' : 'Nueva Compañía'}
            </DialogTitle>
            <DialogDescription>
              Complete los datos de la compañía. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Hospital Atlas"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ruc">RUC/NIT *</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="Ej: 1792485932001"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: Av. Principal 123, Quito"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej: 02-2345678"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: info@hospital.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {editingCompania ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la compañía y todas sus sucursales asociadas.
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
