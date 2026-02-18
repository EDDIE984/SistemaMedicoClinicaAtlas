// Tab de gestión de Especialidades con Supabase
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Pencil, Trash2, Loader2, Stethoscope } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useEspecialidades } from '../../hooks/useConfiguraciones';
import type { Especialidad } from '../../lib/configuracionesService';
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

export function EspecialidadTabSupabase() {
    const { especialidades, isLoading, agregarEspecialidad, actualizarEspecialidad, eliminarEspecialidad } = useEspecialidades();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [especialidadActual, setEspecialidadActual] = useState<Especialidad | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [especialidadAEliminar, setEspecialidadAEliminar] = useState<Especialidad | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        estado: 'activo'
    });

    const handleNuevo = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            estado: 'activo'
        });
        setIsEditing(false);
        setEspecialidadActual(null);
        setIsDialogOpen(true);
    };

    const handleEditar = (especialidad: Especialidad) => {
        setFormData({
            nombre: especialidad.nombre,
            descripcion: especialidad.descripcion || '',
            estado: especialidad.estado
        });
        setIsEditing(true);
        setEspecialidadActual(especialidad);
        setIsDialogOpen(true);
    };

    const handleGuardar = async () => {
        if (!formData.nombre.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        const datos = {
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            estado: formData.estado
        };

        if (isEditing && especialidadActual) {
            const success = await actualizarEspecialidad(especialidadActual.id_especialidad, datos);
            if (success) {
                toast.success('Especialidad actualizada exitosamente');
                setIsDialogOpen(false);
            } else {
                toast.error('Error al actualizar la especialidad');
            }
        } else {
            const nueva = await agregarEspecialidad(datos);
            if (nueva) {
                toast.success('Especialidad creada exitosamente');
                setIsDialogOpen(false);
            } else {
                toast.error('Error al crear la especialidad');
            }
        }
    };

    const handleEliminarClick = (especialidad: Especialidad) => {
        setEspecialidadAEliminar(especialidad);
        setIsDeleteDialogOpen(true);
    };

    const handleEliminarConfirmar = async () => {
        if (!especialidadAEliminar) return;

        const success = await eliminarEspecialidad(especialidadAEliminar.id_especialidad);
        if (success) {
            toast.success('Especialidad eliminada exitosamente');
            setIsDeleteDialogOpen(false);
            setEspecialidadAEliminar(null);
        } else {
            toast.error('Error al eliminar la especialidad. Puede tener registros asociados.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="flex items-center gap-2">
                        <Stethoscope className="size-5" />
                        Gestión de Especialidades
                    </h2>
                    <p className="text-sm text-gray-600">Administra las especialidades médicas del sistema</p>
                </div>
                <Button onClick={handleNuevo}>
                    <Plus className="size-4 mr-2" />
                    Nueva Especialidad
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
                                <TableHead>Descripción</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {especialidades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                        No hay especialidades registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                especialidades.map((especialidad, index) => (
                                    <TableRow key={especialidad.id_especialidad || `especialidad-${index}`}>
                                        <TableCell className="font-semibold">{especialidad.nombre}</TableCell>
                                        <TableCell className="max-w-xs truncate">{especialidad.descripcion || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={especialidad.estado === 'activo' ? 'default' : 'secondary'}>
                                                {especialidad.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => handleEditar(especialidad)}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleEliminarClick(especialidad)}>
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
                        <DialogTitle>{isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Modifica los datos de la especialidad' : 'Ingresa los datos de la nueva especialidad'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Cardiología, Pediatría..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Descripción breve de la especialidad"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={formData.estado} onValueChange={(value: string) => setFormData({ ...formData, estado: value })}>
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
                            Esta acción eliminará la especialidad "{especialidadAEliminar?.nombre}".
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
