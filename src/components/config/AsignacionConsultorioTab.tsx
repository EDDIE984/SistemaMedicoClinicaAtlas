import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Pencil, Trash2, Plus, Table as TableIcon, CalendarDays, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { 
  sucursales,
  usuariosSucursales,
  usuarios,
  type AsignacionConsultorio,
  type DiaSemana
} from '../../data/mockData';
import { validarConsultorioDisponible, validarConflictoHorarioConsultorio } from '../../utils/consultorioSync';
import { useConfig } from '../../contexts/ConfigContext';

export function AsignacionConsultorioTab() {
  const { consultorios, asignaciones, addAsignacion, updateAsignacion, deleteAsignacion } = useConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<AsignacionConsultorio | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'tabla' | 'calendario'>('tabla');
  
  // Estados para filtros
  const [filtroSucursal, setFiltroSucursal] = useState<string>('all');
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>('all');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('all');
  const [filtroDia, setFiltroDia] = useState<string>('all');
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  
  const [formData, setFormData] = useState<Omit<AsignacionConsultorio, 'id_asignacion'>>({
    id_consultorio: 1,
    id_usuario_sucursal: 1,
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fin: '17:00',
    es_asignacion_fija: true,
    fecha_vigencia_desde: new Date().toISOString().split('T')[0],
    fecha_vigencia_hasta: null,
    estado: 'activo'
  });

  const diasSemana = [
    { value: 1, label: 'Lunes', short: 'Lun' },
    { value: 2, label: 'Martes', short: 'Mar' },
    { value: 3, label: 'Miércoles', short: 'Mié' },
    { value: 4, label: 'Jueves', short: 'Jue' },
    { value: 5, label: 'Viernes', short: 'Vie' },
    { value: 6, label: 'Sábado', short: 'Sáb' },
    { value: 7, label: 'Domingo', short: 'Dom' }
  ];

  const horasDelDia = Array.from({ length: 15 }, (_, i) => {
    const hora = i + 6; // Empieza a las 6 AM
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  const handleOpenDialog = (asignacion?: AsignacionConsultorio) => {
    if (asignacion) {
      setEditingAsignacion(asignacion);
      setFormData({
        id_consultorio: asignacion.id_consultorio,
        id_usuario_sucursal: asignacion.id_usuario_sucursal,
        dia_semana: asignacion.dia_semana,
        hora_inicio: asignacion.hora_inicio,
        hora_fin: asignacion.hora_fin,
        es_asignacion_fija: asignacion.es_asignacion_fija,
        fecha_vigencia_desde: asignacion.fecha_vigencia_desde,
        fecha_vigencia_hasta: asignacion.fecha_vigencia_hasta,
        estado: asignacion.estado
      });
    } else {
      setEditingAsignacion(null);
      setFormData({
        id_consultorio: 1,
        id_usuario_sucursal: 1,
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fin: '17:00',
        es_asignacion_fija: true,
        fecha_vigencia_desde: new Date().toISOString().split('T')[0],
        fecha_vigencia_hasta: null,
        estado: 'activo'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.id_consultorio || !formData.id_usuario_sucursal || !formData.dia_semana) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    // Validar estado del consultorio
    const consultorio = consultorios.find(c => c.id_consultorio === formData.id_consultorio);
    if (!consultorio) {
      toast.error('Consultorio no encontrado');
      return;
    }

    if (consultorio.estado === 'mantenimiento') {
      toast.error('No se puede asignar un consultorio que está en mantenimiento');
      return;
    }

    if (consultorio.estado !== 'activo') {
      toast.error('Solo se pueden asignar consultorios activos');
      return;
    }

    // Validar conflicto de horario en el mismo consultorio, mismo día
    const validacion = validarConflictoHorarioConsultorio(
      formData.id_consultorio,
      formData.dia_semana,
      formData.hora_inicio,
      formData.hora_fin,
      asignaciones,
      editingAsignacion?.id_asignacion || null
    );

    if (!validacion.disponible) {
      if (validacion.conflicto) {
        const usuarioConflicto = getUsuarioNombre(validacion.conflicto.id_usuario_sucursal);
        toast.error(
          `${validacion.mensaje}. Este horario está asignado a: ${usuarioConflicto}`,
          { duration: 5000 }
        );
      } else {
        toast.error(validacion.mensaje);
      }
      return;
    }

    if (editingAsignacion) {
      updateAsignacion({
        ...formData,
        id_asignacion: editingAsignacion.id_asignacion
      });
      toast.success('Asignación actualizada correctamente');
    } else {
      const newId = Math.max(...asignaciones.map(a => a.id_asignacion), 0) + 1;
      const newAsignacion: AsignacionConsultorio = {
        ...formData,
        id_asignacion: newId
      };
      addAsignacion(newAsignacion);
      toast.success('Asignación creada correctamente');
    }

    setIsDialogOpen(false);
    setEditingAsignacion(null);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteAsignacion(deletingId);
      toast.success('Asignación eliminada correctamente');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getConsultorioNombre = (id: number) => {
    const consultorio = consultorios.find(c => c.id_consultorio === id);
    return consultorio ? `${consultorio.nombre} (${consultorio.numero})` : 'N/A';
  };

  const getSucursalNombre = (id_consultorio: number) => {
    const consultorio = consultorios.find(c => c.id_consultorio === id_consultorio);
    if (!consultorio) return 'N/A';
    
    const sucursal = sucursales.find(s => s.id_sucursal === consultorio.id_sucursal);
    return sucursal?.nombre || 'N/A';
  };

  const getUsuarioNombre = (id_usuario_sucursal: number) => {
    const usuarioSucursal = usuariosSucursales.find(us => us.id_usuario_sucursal === id_usuario_sucursal);
    if (!usuarioSucursal) return 'N/A';
    
    const usuario = usuarios.find(u => u.id_usuario === usuarioSucursal.id_usuario);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'N/A';
  };

  const getUsuarioEspecialidad = (id_usuario_sucursal: number) => {
    const usuarioSucursal = usuariosSucursales.find(us => us.id_usuario_sucursal === id_usuario_sucursal);
    return usuarioSucursal?.especialidad || '';
  };

  const getDiaNombre = (dia: DiaSemana) => {
    return diasSemana.find(d => d.value === dia)?.label || '';
  };

  // Función para aplicar filtros
  const asignacionesFiltradas = asignaciones.filter(asignacion => {
    // Filtro por sucursal
    if (filtroSucursal !== 'all') {
      const consultorio = consultorios.find(c => c.id_consultorio === asignacion.id_consultorio);
      if (!consultorio || consultorio.id_sucursal !== parseInt(filtroSucursal)) {
        return false;
      }
    }

    // Filtro por consultorio
    if (filtroConsultorio !== 'all' && asignacion.id_consultorio !== parseInt(filtroConsultorio)) {
      return false;
    }

    // Filtro por usuario (buscar por id_usuario en vez de id_usuario_sucursal)
    if (filtroUsuario !== 'all') {
      const usuarioSucursal = usuariosSucursales.find(us => us.id_usuario_sucursal === asignacion.id_usuario_sucursal);
      if (!usuarioSucursal || usuarioSucursal.id_usuario !== parseInt(filtroUsuario)) {
        return false;
      }
    }

    // Filtro por día
    if (filtroDia !== 'all' && asignacion.dia_semana !== parseInt(filtroDia)) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado !== 'all' && asignacion.estado !== filtroEstado) {
      return false;
    }

    return true;
  });

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroSucursal('all');
    setFiltroConsultorio('all');
    setFiltroUsuario('all');
    setFiltroDia('all');
    setFiltroEstado('all');
  };

  // Obtener lista única de usuarios que tienen asignaciones
  const getUsuariosUnicos = () => {
    const usuariosConAsignaciones = new Set<number>();
    asignaciones.forEach(asignacion => {
      const usuarioSucursal = usuariosSucursales.find(us => us.id_usuario_sucursal === asignacion.id_usuario_sucursal);
      if (usuarioSucursal) {
        usuariosConAsignaciones.add(usuarioSucursal.id_usuario);
      }
    });
    
    return Array.from(usuariosConAsignaciones).map(id_usuario => {
      const usuario = usuarios.find(u => u.id_usuario === id_usuario);
      return usuario;
    }).filter(Boolean);
  };

  // Obtener consultorios filtrados por sucursal y consultorio
  const consultoriosFiltrados = consultorios.filter(c => {
    // Filtro por sucursal
    if (filtroSucursal !== 'all' && c.id_sucursal !== parseInt(filtroSucursal)) {
      return false;
    }
    
    // Filtro por consultorio
    if (filtroConsultorio !== 'all' && c.id_consultorio !== parseInt(filtroConsultorio)) {
      return false;
    }
    
    return true;
  });

  // Manejador para cambio de sucursal (resetear consultorio si es necesario)
  const handleSucursalChange = (value: string) => {
    setFiltroSucursal(value);
    
    // Si el consultorio seleccionado no pertenece a la nueva sucursal, resetearlo
    if (filtroConsultorio !== 'all') {
      const consultorioActual = consultorios.find(c => c.id_consultorio === parseInt(filtroConsultorio));
      if (value !== 'all' && consultorioActual && consultorioActual.id_sucursal !== parseInt(value)) {
        setFiltroConsultorio('all');
      }
    }
  };

  // Función para verificar si un consultorio tiene asignación en un día/hora específicos
  const getAsignacionEnHorario = (consultorioId: number, dia: number, hora: string) => {
    return asignacionesFiltradas.find(asig => {
      if (asig.id_consultorio !== consultorioId || asig.dia_semana !== dia) return false;
      
      const horaActual = parseInt(hora.split(':')[0]);
      const horaInicio = parseInt(asig.hora_inicio.split(':')[0]);
      const horaFin = parseInt(asig.hora_fin.split(':')[0]);
      
      return horaActual >= horaInicio && horaActual < horaFin;
    });
  };

  const columns = [
    { header: 'ID', accessor: 'id_asignacion' as keyof AsignacionConsultorio, hideOnMobile: true },
    { 
      header: 'Usuario', 
      accessor: (item: AsignacionConsultorio) => getUsuarioNombre(item.id_usuario_sucursal),
      mobileLabel: 'Usuario'
    },
    { 
      header: 'Sucursal', 
      accessor: (item: AsignacionConsultorio) => getSucursalNombre(item.id_consultorio),
      mobileLabel: 'Sucursal'
    },
    { 
      header: 'Consultorio', 
      accessor: (item: AsignacionConsultorio) => getConsultorioNombre(item.id_consultorio)
    },
    { 
      header: 'Día', 
      accessor: (item: AsignacionConsultorio) => getDiaNombre(item.dia_semana)
    },
    { 
      header: 'Horario', 
      accessor: (item: AsignacionConsultorio) => `${item.hora_inicio} - ${item.hora_fin}`
    },
    { 
      header: 'Tipo', 
      accessor: (item: AsignacionConsultorio) => item.es_asignacion_fija ? 'Fija' : 'Temporal',
      hideOnMobile: true
    },
    { 
      header: 'Estado', 
      accessor: (item: AsignacionConsultorio) => (
        <Badge variant={item.estado === 'activo' ? 'default' : 'secondary'}>
          {item.estado}
        </Badge>
      )
    }
  ];

  // Componente de Vista de Calendario
  const VistaCalendario = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Vista de Calendario</h4>
            <p className="text-sm text-blue-700">
              Los bloques de color indican horarios ocupados. Las celdas en blanco representan horarios disponibles para nuevas asignaciones.
            </p>
          </div>
        </div>
      </div>

      {consultoriosFiltrados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay consultorios para mostrar
        </div>
      ) : (
        <div className="space-y-6">
          {consultoriosFiltrados.map(consultorio => (
            <Card key={consultorio.id_consultorio}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{consultorio.nombre} ({consultorio.numero})</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getSucursalNombre(consultorio.id_consultorio)}
                    </p>
                  </div>
                  <Badge variant={consultorio.estado === 'activo' ? 'default' : 'secondary'}>
                    {consultorio.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700 sticky left-0 z-10">
                          Hora
                        </th>
                        {diasSemana.map(dia => (
                          <th key={dia.value} className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700">
                            <div className="hidden sm:block">{dia.label}</div>
                            <div className="sm:hidden">{dia.short}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {horasDelDia.map(hora => (
                        <tr key={hora}>
                          <td className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700 text-center sticky left-0 z-10">
                            {hora}
                          </td>
                          {diasSemana.map(dia => {
                            const asignacion = getAsignacionEnHorario(consultorio.id_consultorio, dia.value, hora);
                            
                            if (asignacion) {
                              return (
                                <td 
                                  key={dia.value} 
                                  className="border border-gray-300 bg-blue-100 p-2 cursor-pointer hover:bg-blue-200 transition-colors"
                                  onClick={() => handleOpenDialog(asignacion)}
                                  title="Clic para editar"
                                >
                                  <div className="text-xs">
                                    <div className="font-medium text-blue-900 truncate">
                                      {getUsuarioNombre(asignacion.id_usuario_sucursal)}
                                    </div>
                                    <div className="text-blue-700 text-[10px] truncate">
                                      {getUsuarioEspecialidad(asignacion.id_usuario_sucursal)}
                                    </div>
                                    <div className="text-blue-600 text-[10px] mt-0.5">
                                      {asignacion.hora_inicio} - {asignacion.hora_fin}
                                    </div>
                                  </div>
                                </td>
                              );
                            }
                            
                            return (
                              <td 
                                key={dia.value} 
                                className="border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <div className="h-12"></div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg md:text-xl">Horarios y Asignaciones de Consultorio</CardTitle>
          <p className="text-sm text-gray-600">
            Asigna médicos a consultorios específicos con horarios definidos. Los horarios del consultorio se calculan sumando todas las asignaciones activas.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2 flex-shrink-0">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nueva Asignación</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Filtros</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={limpiarFiltros}
                className="text-xs"
              >
                Limpiar filtros
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Filtro por Sucursal */}
              <div className="grid gap-1.5">
                <Label htmlFor="filtro-sucursal" className="text-xs">Sucursal</Label>
                <Select value={filtroSucursal} onValueChange={handleSucursalChange}>
                  <SelectTrigger id="filtro-sucursal" className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {sucursales.map(s => (
                      <SelectItem key={s.id_sucursal} value={s.id_sucursal.toString()}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Consultorio */}
              <div className="grid gap-1.5">
                <Label htmlFor="filtro-consultorio" className="text-xs">Consultorio</Label>
                <Select value={filtroConsultorio} onValueChange={setFiltroConsultorio}>
                  <SelectTrigger id="filtro-consultorio" className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {consultoriosFiltrados.map(c => (
                      <SelectItem key={c.id_consultorio} value={c.id_consultorio.toString()}>
                        {c.nombre} ({c.numero})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Usuario */}
              <div className="grid gap-1.5">
                <Label htmlFor="filtro-usuario" className="text-xs">Usuario</Label>
                <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                  <SelectTrigger id="filtro-usuario" className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {getUsuariosUnicos().map(u => (
                      <SelectItem key={u.id_usuario} value={u.id_usuario.toString()}>
                        {u.nombre} {u.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Día */}
              <div className="grid gap-1.5">
                <Label htmlFor="filtro-dia" className="text-xs">Día</Label>
                <Select value={filtroDia} onValueChange={setFiltroDia}>
                  <SelectTrigger id="filtro-dia" className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {diasSemana.map(d => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Estado */}
              <div className="grid gap-1.5">
                <Label htmlFor="filtro-estado" className="text-xs">Estado</Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger id="filtro-estado" className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-xs text-gray-600">
              Mostrando {asignacionesFiltradas.length} de {asignaciones.length} asignaciones
            </div>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as 'tabla' | 'calendario')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="tabla" className="gap-2">
              <TableIcon className="size-4" />
              <span>Vista Tabla</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="gap-2">
              <CalendarDays className="size-4" />
              <span>Vista Calendario</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tabla">
            <ResponsiveTable
              data={asignacionesFiltradas}
              columns={columns}
              keyExtractor={(item) => item.id_asignacion}
              actions={(asignacion) => (
                <>
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
                    onClick={() => openDeleteDialog(asignacion.id_asignacion)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </>
              )}
              emptyMessage="No hay asignaciones registradas"
            />
          </TabsContent>

          <TabsContent value="calendario">
            <VistaCalendario />
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAsignacion ? 'Editar Asignación' : 'Nueva Asignación'}
            </DialogTitle>
            <DialogDescription>
              Asigna un consultorio a un usuario en horarios específicos
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_usuario_sucursal">Usuario - Sucursal *</Label>
                <Select
                  value={formData.id_usuario_sucursal.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_usuario_sucursal: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosSucursales.filter(us => us.estado === 'activo').map(us => {
                      const usuario = usuarios.find(u => u.id_usuario === us.id_usuario);
                      return (
                        <SelectItem key={us.id_usuario_sucursal} value={us.id_usuario_sucursal.toString()}>
                          {usuario ? `${usuario.nombre} ${usuario.apellido} - ${us.especialidad}` : `ID: ${us.id_usuario_sucursal}`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_consultorio">Consultorio *</Label>
                <Select
                  value={formData.id_consultorio.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_consultorio: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.filter(c => c.estado === 'activo').map(c => (
                      <SelectItem key={c.id_consultorio} value={c.id_consultorio.toString()}>
                        {c.nombre} ({c.numero})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dia_semana">Día de la Semana *</Label>
                <Select
                  value={formData.dia_semana.toString()}
                  onValueChange={(value) => setFormData({ ...formData, dia_semana: parseInt(value) as DiaSemana })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map(d => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hora_inicio">Hora Inicio *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hora_fin">Hora Fin *</Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="es_asignacion_fija"
                checked={formData.es_asignacion_fija}
                onCheckedChange={(checked) => setFormData({ ...formData, es_asignacion_fija: checked as boolean })}
              />
              <Label htmlFor="es_asignacion_fija" className="cursor-pointer">
                Asignación fija (permanente)
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha_vigencia_desde">Fecha Vigencia Desde *</Label>
                <Input
                  id="fecha_vigencia_desde"
                  type="date"
                  value={formData.fecha_vigencia_desde}
                  onChange={(e) => setFormData({ ...formData, fecha_vigencia_desde: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fecha_vigencia_hasta">Fecha Vigencia Hasta</Label>
                <Input
                  id="fecha_vigencia_hasta"
                  type="date"
                  value={formData.fecha_vigencia_hasta || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_vigencia_hasta: e.target.value || null })}
                  placeholder="Dejar vacío para indefinido"
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {editingAsignacion ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la asignación del consultorio.
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