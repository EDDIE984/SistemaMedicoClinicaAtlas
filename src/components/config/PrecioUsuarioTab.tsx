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

interface PrecioUsuario {
  id_precio: number;
  id_usuario_sucursal: number;
  id_precio_base: number | null;
  precio_consulta: number;
  precio_control: number;
  precio_emergencia: number;
  tipo_ajuste: 'ninguno' | 'porcentaje' | 'monto_fijo';
  valor_ajuste: number;
  duracion_consulta: number;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta: string;
  estado: 'activo' | 'inactivo';
}

export function PrecioUsuarioTab() {
  const [preciosUsuario, setPreciosUsuario] = useState<PrecioUsuario[]>([
    {
      id_precio: 1,
      id_usuario_sucursal: 1,
      id_precio_base: 1,
      precio_consulta: 65.00,
      precio_control: 45.00,
      precio_emergencia: 100.00,
      tipo_ajuste: "porcentaje",
      valor_ajuste: 30,
      duracion_consulta: 30,
      fecha_vigencia_desde: "2025-01-01",
      fecha_vigencia_hasta: "2025-12-31",
      estado: "activo"
    },
    {
      id_precio: 2,
      id_usuario_sucursal: 2,
      id_precio_base: 1,
      precio_consulta: 55.00,
      precio_control: 40.00,
      precio_emergencia: 90.00,
      tipo_ajuste: "porcentaje",
      valor_ajuste: 10,
      duracion_consulta: 30,
      fecha_vigencia_desde: "2025-01-01",
      fecha_vigencia_hasta: "2025-12-31",
      estado: "activo"
    },
    {
      id_precio: 3,
      id_usuario_sucursal: 3,
      id_precio_base: 1,
      precio_consulta: 50.00,
      precio_control: 35.00,
      precio_emergencia: 80.00,
      tipo_ajuste: "ninguno",
      valor_ajuste: 0,
      duracion_consulta: 30,
      fecha_vigencia_desde: "2025-01-01",
      fecha_vigencia_hasta: "2025-12-31",
      estado: "activo"
    },
    {
      id_precio: 4,
      id_usuario_sucursal: 4,
      id_precio_base: 2,
      precio_consulta: 40.00,
      precio_control: 30.00,
      precio_emergencia: 70.00,
      tipo_ajuste: "monto_fijo",
      valor_ajuste: 5,
      duracion_consulta: 20,
      fecha_vigencia_desde: "2025-01-01",
      fecha_vigencia_hasta: "2025-12-31",
      estado: "activo"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPrecio, setEditingPrecio] = useState<PrecioUsuario | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<PrecioUsuario, 'id_precio'>>({
    id_usuario_sucursal: 0,
    id_precio_base: null,
    precio_consulta: 0,
    precio_control: 0,
    precio_emergencia: 0,
    tipo_ajuste: 'ninguno',
    valor_ajuste: 0,
    duracion_consulta: 30,
    fecha_vigencia_desde: new Date().toISOString().split('T')[0],
    fecha_vigencia_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    estado: 'activo'
  });

  // Mock data
  const asignaciones = [
    { id: 1, nombre: "Juan Yepez - Sucursal Norte - Cardiología" },
    { id: 2, nombre: "Juan Yepez - Sucursal Sur - Cardiología" },
    { id: 3, nombre: "María López - Sucursal Norte - Cardiología" },
    { id: 4, nombre: "Carlos Ramírez - Sucursal Sur - Pediatría" }
  ];

  const preciosBase = [
    { id: 1, nombre: "Cardiología - $50.00" },
    { id: 2, nombre: "Pediatría - $35.00" }
  ];

  const handleOpenDialog = (precio?: PrecioUsuario) => {
    if (precio) {
      setEditingPrecio(precio);
      setFormData({
        id_usuario_sucursal: precio.id_usuario_sucursal,
        id_precio_base: precio.id_precio_base,
        precio_consulta: precio.precio_consulta,
        precio_control: precio.precio_control,
        precio_emergencia: precio.precio_emergencia,
        tipo_ajuste: precio.tipo_ajuste,
        valor_ajuste: precio.valor_ajuste,
        duracion_consulta: precio.duracion_consulta,
        fecha_vigencia_desde: precio.fecha_vigencia_desde,
        fecha_vigencia_hasta: precio.fecha_vigencia_hasta,
        estado: precio.estado
      });
    } else {
      setEditingPrecio(null);
      setFormData({
        id_usuario_sucursal: 0,
        id_precio_base: null,
        precio_consulta: 0,
        precio_control: 0,
        precio_emergencia: 0,
        tipo_ajuste: 'ninguno',
        valor_ajuste: 0,
        duracion_consulta: 30,
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
    if (!formData.id_usuario_sucursal || formData.precio_consulta <= 0) {
      toast.error('Por favor complete los campos obligatorios correctamente');
      return;
    }

    if (formData.fecha_vigencia_desde >= formData.fecha_vigencia_hasta) {
      toast.error('La fecha de inicio debe ser menor a la fecha de fin');
      return;
    }

    if (editingPrecio) {
      setPreciosUsuario(prev => prev.map(p => 
        p.id_precio === editingPrecio.id_precio 
          ? { ...formData, id_precio: editingPrecio.id_precio }
          : p
      ));
      toast.success('Precio de usuario actualizado correctamente');
    } else {
      const newId = Math.max(...preciosUsuario.map(p => p.id_precio), 0) + 1;
      setPreciosUsuario(prev => [...prev, { ...formData, id_precio: newId }]);
      toast.success('Precio de usuario creado correctamente');
    }

    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deletingId) {
      setPreciosUsuario(prev => prev.filter(p => p.id_precio !== deletingId));
      toast.success('Precio de usuario eliminado correctamente');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getAsignacionNombre = (id: number) => {
    return asignaciones.find(a => a.id === id)?.nombre || 'N/A';
  };

  const getPrecioBaseNombre = (id: number | null) => {
    if (!id) return 'Sin precio base';
    return preciosBase.find(p => p.id === id)?.nombre || 'N/A';
  };

  const getTipoAjusteBadge = (tipo: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ninguno: { variant: 'secondary', label: 'Sin Ajuste' },
      porcentaje: { variant: 'default', label: 'Porcentaje' },
      monto_fijo: { variant: 'outline', label: 'Monto Fijo' }
    };
    const config = variants[tipo] || variants.ninguno;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    { header: 'ID', accessor: 'id_precio' as keyof PrecioUsuario, hideOnMobile: true },
    { 
      header: 'Usuario-Sucursal', 
      accessor: (item: PrecioUsuario) => getAsignacionNombre(item.id_usuario_sucursal),
      mobileLabel: 'Usuario'
    },
    { 
      header: 'Consulta', 
      accessor: (item: PrecioUsuario) => `$${item.precio_consulta.toFixed(2)}`
    },
    { 
      header: 'Control', 
      accessor: (item: PrecioUsuario) => `$${item.precio_control.toFixed(2)}`,
      hideOnMobile: true
    },
    { 
      header: 'Emergencia', 
      accessor: (item: PrecioUsuario) => `$${item.precio_emergencia.toFixed(2)}`,
      hideOnMobile: true
    },
    { 
      header: 'Ajuste', 
      accessor: (item: PrecioUsuario) => (
        <div className="flex flex-col gap-1">
          {getTipoAjusteBadge(item.tipo_ajuste)}
          {item.tipo_ajuste !== 'ninguno' && (
            <span className="text-xs text-gray-500">
              {item.tipo_ajuste === 'porcentaje' ? `${item.valor_ajuste}%` : `$${item.valor_ajuste}`}
            </span>
          )}
        </div>
      ),
      hideOnMobile: true
    },
    { 
      header: 'Duración', 
      accessor: (item: PrecioUsuario) => `${item.duracion_consulta} min`,
      hideOnMobile: true
    },
    { 
      header: 'Estado', 
      accessor: (item: PrecioUsuario) => (
        <Badge variant={item.estado === 'activo' ? 'default' : 'secondary'}>
          {item.estado}
        </Badge>
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg md:text-xl">Precios por Usuario-Sucursal</CardTitle>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nuevo Precio</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          data={preciosUsuario}
          columns={columns}
          keyExtractor={(item) => item.id_precio}
          actions={(precio) => (
            <>
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
                onClick={() => openDeleteDialog(precio.id_precio)}
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </>
          )}
          emptyMessage="No hay precios de usuario registrados"
        />
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrecio ? 'Editar Precio Usuario' : 'Nuevo Precio Usuario'}
            </DialogTitle>
            <DialogDescription>
              Configure los precios personalizados para un usuario en una sucursal. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_usuario_sucursal">Usuario - Sucursal *</Label>
                <Select
                  value={formData.id_usuario_sucursal.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_usuario_sucursal: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una asignación" />
                  </SelectTrigger>
                  <SelectContent>
                    {asignaciones.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_precio_base">Precio Base (opcional)</Label>
                <Select
                  value={formData.id_precio_base?.toString() || 'null'}
                  onValueChange={(value) => setFormData({ ...formData, id_precio_base: value === 'null' ? null : parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin precio base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sin precio base</SelectItem>
                    {preciosBase.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="precio_consulta">Precio Consulta * ($)</Label>
                <Input
                  id="precio_consulta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_consulta}
                  onChange={(e) => setFormData({ ...formData, precio_consulta: parseFloat(e.target.value) || 0 })}
                  placeholder="Ej: 65.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="precio_control">Precio Control ($)</Label>
                <Input
                  id="precio_control"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_control}
                  onChange={(e) => setFormData({ ...formData, precio_control: parseFloat(e.target.value) || 0 })}
                  placeholder="Ej: 45.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="precio_emergencia">Precio Emergencia ($)</Label>
                <Input
                  id="precio_emergencia"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_emergencia}
                  onChange={(e) => setFormData({ ...formData, precio_emergencia: parseFloat(e.target.value) || 0 })}
                  placeholder="Ej: 100.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipo_ajuste">Tipo de Ajuste</Label>
                <Select
                  value={formData.tipo_ajuste}
                  onValueChange={(value: any) => setFormData({ ...formData, tipo_ajuste: value })}
                >
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

              <div className="grid gap-2">
                <Label htmlFor="valor_ajuste">
                  Valor Ajuste {formData.tipo_ajuste === 'porcentaje' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="valor_ajuste"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_ajuste}
                  onChange={(e) => setFormData({ ...formData, valor_ajuste: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.tipo_ajuste === 'porcentaje' ? 'Ej: 30' : 'Ej: 5.00'}
                  disabled={formData.tipo_ajuste === 'ninguno'}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duracion_consulta">Duración (minutos) *</Label>
                <Input
                  id="duracion_consulta"
                  type="number"
                  min="1"
                  value={formData.duracion_consulta}
                  onChange={(e) => setFormData({ ...formData, duracion_consulta: parseInt(e.target.value) || 30 })}
                  placeholder="Ej: 30"
                />
              </div>
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
              Esta acción no se puede deshacer. Se eliminará el precio de usuario permanentemente.
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