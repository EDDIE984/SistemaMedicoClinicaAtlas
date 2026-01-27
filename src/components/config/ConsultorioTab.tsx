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
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  sucursales, 
  type Consultorio, 
  type EstadoConsultorio 
} from '../../data/mockData';
import { contarAsignacionesAfectadas } from '../../utils/consultorioSync';
import { useConfig } from '../../contexts/ConfigContext';

export function ConsultorioTab() {
  const { consultorios, asignaciones, updateConsultorio, addConsultorio, deleteConsultorio } = useConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [editingConsultorio, setEditingConsultorio] = useState<Consultorio | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingSave, setPendingSave] = useState<{ data: any; editing: Consultorio | null } | null>(null);
  
  const [formData, setFormData] = useState<Omit<Consultorio, 'id_consultorio' | 'fecha_creacion'>>({
    id_sucursal: 1,
    nombre: '',
    numero: '',
    piso: '',
    descripcion: '',
    capacidad: 3,
    equipamiento: '',
    estado: 'activo'
  });

  const handleOpenDialog = (consultorio?: Consultorio) => {
    if (consultorio) {
      setEditingConsultorio(consultorio);
      setFormData({
        id_sucursal: consultorio.id_sucursal,
        nombre: consultorio.nombre,
        numero: consultorio.numero,
        piso: consultorio.piso,
        descripcion: consultorio.descripcion,
        capacidad: consultorio.capacidad,
        equipamiento: consultorio.equipamiento,
        estado: consultorio.estado
      });
    } else {
      setEditingConsultorio(null);
      setFormData({
        id_sucursal: 1,
        nombre: '',
        numero: '',
        piso: '',
        descripcion: '',
        capacidad: 3,
        equipamiento: '',
        estado: 'activo'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.numero || !formData.id_sucursal) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    // Verificar si es una edición y si el estado cambió
    if (editingConsultorio && editingConsultorio.estado !== formData.estado) {
      const asignacionesAfectadas = contarAsignacionesAfectadas(
        editingConsultorio.id_consultorio,
        asignaciones
      );

      // Si hay asignaciones activas y el estado está cambiando a mantenimiento o inactivo
      if (asignacionesAfectadas > 0 && formData.estado !== 'activo') {
        setPendingSave({ data: formData, editing: editingConsultorio });
        setIsWarningDialogOpen(true);
        return;
      }
    }

    // Guardar sin advertencia
    executeSave(formData, editingConsultorio);
  };

  const executeSave = (data: typeof formData, editing: Consultorio | null) => {
    if (editing) {
      updateConsultorio({
        ...data, 
        id_consultorio: editing.id_consultorio,
        fecha_creacion: editing.fecha_creacion
      });
      
      // Mostrar mensaje apropiado según el cambio de estado
      if (editing.estado !== data.estado) {
        if (data.estado === 'mantenimiento') {
          toast.success('Consultorio actualizado y asignaciones desactivadas');
        } else if (data.estado === 'activo' && editing.estado === 'mantenimiento') {
          toast.success('Consultorio actualizado y asignaciones reactivadas');
        } else {
          toast.success('Consultorio actualizado correctamente');
        }
      } else {
        toast.success('Consultorio actualizado correctamente');
      }
    } else {
      const newId = Math.max(...consultorios.map(c => c.id_consultorio), 0) + 1;
      const newConsultorio: Consultorio = {
        ...data,
        id_consultorio: newId,
        fecha_creacion: new Date().toISOString().split('T')[0]
      };
      addConsultorio(newConsultorio);
      toast.success('Consultorio creado correctamente');
    }

    setIsDialogOpen(false);
    setEditingConsultorio(null);
  };

  const confirmSaveWithWarning = () => {
    if (pendingSave) {
      executeSave(pendingSave.data, pendingSave.editing);
      setIsWarningDialogOpen(false);
      setPendingSave(null);
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteConsultorio(deletingId);
      toast.success('Consultorio eliminado correctamente');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getSucursalNombre = (id: number) => {
    return sucursales.find(s => s.id_sucursal === id)?.nombre || 'N/A';
  };

  const getEstadoBadge = (estado: EstadoConsultorio) => {
    const variants = {
      activo: 'default',
      inactivo: 'secondary',
      mantenimiento: 'destructive'
    };
    return (
      <Badge variant={variants[estado] as any}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const columns = [
    { header: 'ID', accessor: 'id_consultorio' as keyof Consultorio, hideOnMobile: true },
    { header: 'Nombre', accessor: 'nombre' as keyof Consultorio },
    { 
      header: 'Sucursal', 
      accessor: (item: Consultorio) => getSucursalNombre(item.id_sucursal),
      mobileLabel: 'Sucursal'
    },
    { header: 'Número', accessor: 'numero' as keyof Consultorio },
    { header: 'Piso', accessor: 'piso' as keyof Consultorio, hideOnMobile: true },
    { header: 'Capacidad', accessor: (item: Consultorio) => `${item.capacidad} personas` },
    { 
      header: 'Estado', 
      accessor: (item: Consultorio) => getEstadoBadge(item.estado)
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg md:text-xl">Consultorios</CardTitle>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nuevo Consultorio</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          data={consultorios}
          columns={columns}
          keyExtractor={(item) => item.id_consultorio}
          actions={(consultorio) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(consultorio)}
              >
                <Pencil className="size-4" />
                <span className="hidden sm:inline ml-2">Editar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(consultorio.id_consultorio)}
              >
                <Trash2 className="size-4 text-red-600" />
                <span className="hidden sm:inline ml-2 text-red-600">Eliminar</span>
              </Button>
            </>
          )}
          emptyMessage="No hay consultorios registrados"
        />
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConsultorio ? 'Editar Consultorio' : 'Nuevo Consultorio'}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del consultorio. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_sucursal">Sucursal *</Label>
                <Select
                  value={formData.id_sucursal.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_sucursal: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Consultorio 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ej: 101"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="piso">Piso</Label>
                <Input
                  id="piso"
                  value={formData.piso}
                  onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                  placeholder="Ej: 1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="capacidad">Capacidad (personas)</Label>
                <Input
                  id="capacidad"
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 1 })}
                  placeholder="Ej: 3"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Breve descripción del consultorio"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipamiento">Equipamiento</Label>
              <Textarea
                id="equipamiento"
                value={formData.equipamiento}
                onChange={(e) => setFormData({ ...formData, equipamiento: e.target.value })}
                placeholder="Ej: Camilla, Tensiómetro, ECG, Estetoscopio"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: EstadoConsultorio) => setFormData({ ...formData, estado: value })}
              >
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {editingConsultorio ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el consultorio y todas sus asignaciones asociadas.
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

      <AlertDialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Advertencia</AlertDialogTitle>
            <AlertDialogDescription>
              El consultorio tiene asignaciones activas. Cambiar su estado a <strong>{formData.estado}</strong> desactivará estas asignaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setIsWarningDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSaveWithWarning} 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}