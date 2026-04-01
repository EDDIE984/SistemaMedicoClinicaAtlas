import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Loader2, Clock, Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from './ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from './ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { usePlanificacionHorario, getMedicosSuplentesYRespaldoBySucursal } from '../hooks/useConfiguraciones';
import { useConsultorios, useSucursales } from '../hooks/useConfiguraciones';
import type { PlanificacionHorario } from '../hooks/useConfiguraciones';
import type { UsuarioSucursal } from '../lib/configuracionesService';
import { getDuracionByUsuarioSucursal } from '../lib/configuracionesService';

// ========================================
// UTILIDADES DE SEMANA
// ========================================

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay(); // 0=domingo
  // Ajustar al lunes (si domingo, retroceder 6; si otro día, retroceder (day-1))
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function formatWeekLabel(start: Date, end: Date): string {
  const dStart = start.getDate();
  const mStart = MESES[start.getMonth()];
  const dEnd = end.getDate();
  const mEnd = MESES[end.getMonth()];
  const year = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `Semana del ${DIAS_LABEL[0]} ${dStart} al ${DIAS_LABEL[6]} ${dEnd} ${mEnd} ${year}`;
  }
  return `Semana del ${DIAS_LABEL[0]} ${dStart} ${mStart} al ${DIAS_LABEL[6]} ${dEnd} ${mEnd} ${year}`;
}

// Día de la semana para una fecha concreta (1=Lunes...7=Domingo)
function getDiaSemana(date: Date): number {
  const day = date.getDay(); // 0=Dom
  return day === 0 ? 7 : day;
}

// ========================================
// INTERFACES LOCALES
// ========================================

interface BloqueForm {
  hora_inicio: string;
  hora_fin: string;
  id_consultorio: string;
  duracion_consulta: string;
  estado: 'activo' | 'inactivo';
}

const BLOQUE_FORM_VACIO: BloqueForm = {
  hora_inicio: '08:00',
  hora_fin: '12:00',
  id_consultorio: '',
  duracion_consulta: '30',
  estado: 'activo',
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function PlanificacionHorarioView() {
  // Filtros
  const [idSucursalSeleccionada, setIdSucursalSeleccionada] = useState<string>('');
  const [idUsuarioSucursalSeleccionado, setIdUsuarioSucursalSeleccionado] = useState<string>('');
  const [medicosSuplentes, setMedicosSuplentes] = useState<UsuarioSucursal[]>([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);

  // Semana activa
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekRange(new Date()).start);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fechaInicioStr = toLocalDateString(weekStart);
  const fechaFinStr = toLocalDateString(weekEnd);

  // Datos
  const { sucursales } = useSucursales();
  const { consultorios } = useConsultorios();
  const consultoriosFiltrados = consultorios.filter(
    c => c.id_sucursal === Number(idSucursalSeleccionada) && c.estado === 'activo'
  );

  const { planificaciones, isLoading, agregarPlanificacion, actualizarPlanificacion, eliminarPlanificacion } =
    usePlanificacionHorario(
      idUsuarioSucursalSeleccionado ? Number(idUsuarioSucursalSeleccionado) : undefined,
      idUsuarioSucursalSeleccionado ? fechaInicioStr : undefined,
      idUsuarioSucursalSeleccionado ? fechaFinStr : undefined
    );

  // Duración del médico seleccionado (desde precio_usuario_sucursal)
  const [duracionMedico, setDuracionMedico] = useState<number>(30);

  // Dialog bloque
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [diaSemanaActivo, setDiaSemanaActivo] = useState<number>(1);
  const [bloqueEditando, setBloqueEditando] = useState<PlanificacionHorario | null>(null);
  const [form, setForm] = useState<BloqueForm>(BLOQUE_FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  // AlertDialog eliminar
  const [alertAbierto, setAlertAbierto] = useState(false);
  const [bloqueAEliminar, setBloqueAEliminar] = useState<PlanificacionHorario | null>(null);

  // Cargar médicos al seleccionar sucursal
  useEffect(() => {
    if (!idSucursalSeleccionada) {
      setMedicosSuplentes([]);
      setIdUsuarioSucursalSeleccionado('');
      return;
    }
    setLoadingMedicos(true);
    setIdUsuarioSucursalSeleccionado('');
    getMedicosSuplentesYRespaldoBySucursal(Number(idSucursalSeleccionada)).then(data => {
      setMedicosSuplentes(data);
      setLoadingMedicos(false);
    });
  }, [idSucursalSeleccionada]);

  // Cargar duración del médico al seleccionarlo
  useEffect(() => {
    if (!idUsuarioSucursalSeleccionado) {
      setDuracionMedico(30);
      return;
    }
    getDuracionByUsuarioSucursal(Number(idUsuarioSucursalSeleccionado)).then(duracion => {
      setDuracionMedico(duracion ?? 30);
    });
  }, [idUsuarioSucursalSeleccionado]);

  // Navegación de semana
  function irSemanaAnterior() {
    const prev = new Date(weekStart);
    prev.setDate(weekStart.getDate() - 7);
    setWeekStart(prev);
  }
  function irSemanaSiguiente() {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + 7);
    setWeekStart(next);
  }
  function irASemana(dateStr: string) {
    if (!dateStr) return;
    const { start } = getWeekRange(new Date(dateStr + 'T12:00:00'));
    setWeekStart(start);
  }

  // Abrir dialog nuevo bloque
  function abrirNuevoBloque(diaSemana: number) {
    setDiaSemanaActivo(diaSemana);
    setBloqueEditando(null);
    setForm({ ...BLOQUE_FORM_VACIO, duracion_consulta: String(duracionMedico) });
    setDialogAbierto(true);
  }

  // Abrir dialog editar bloque
  function abrirEditarBloque(bloque: PlanificacionHorario) {
    setDiaSemanaActivo(bloque.dia_semana);
    setBloqueEditando(bloque);
    setForm({
      hora_inicio: bloque.hora_inicio.substring(0, 5),
      hora_fin: bloque.hora_fin.substring(0, 5),
      id_consultorio: String(bloque.id_consultorio),
      duracion_consulta: String(bloque.duracion_consulta),
      estado: bloque.estado,
    });
    setDialogAbierto(true);
  }

  // Guardar bloque
  async function handleGuardar() {
    if (!form.hora_inicio || !form.hora_fin || !form.id_consultorio) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    const duracion = Number(form.duracion_consulta);
    if (form.hora_fin <= form.hora_inicio) {
      toast.error('La hora de fin debe ser mayor a la hora de inicio');
      return;
    }
    setGuardando(true);
    try {
      if (bloqueEditando) {
        const ok = await actualizarPlanificacion(bloqueEditando.id_planificacion, {
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          id_consultorio: Number(form.id_consultorio),
          duracion_consulta: duracion,
          estado: form.estado,
        });
        if (ok) {
          toast.success('Bloque actualizado correctamente');
          setDialogAbierto(false);
        } else {
          toast.error('No se pudo actualizar el bloque');
        }
      } else {
        const nuevo = await agregarPlanificacion({
          id_usuario_sucursal: Number(idUsuarioSucursalSeleccionado),
          id_consultorio: Number(form.id_consultorio),
          fecha_inicio: fechaInicioStr,
          fecha_fin: fechaFinStr,
          dia_semana: diaSemanaActivo,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          duracion_consulta: duracion,
          estado: form.estado,
        });
        if (nuevo) {
          toast.success('Bloque agregado correctamente');
          setDialogAbierto(false);
        } else {
          toast.error('No se pudo agregar el bloque');
        }
      }
    } finally {
      setGuardando(false);
    }
  }

  // Eliminar bloque
  function confirmarEliminar(bloque: PlanificacionHorario) {
    setBloqueAEliminar(bloque);
    setAlertAbierto(true);
  }
  async function handleEliminar() {
    if (!bloqueAEliminar) return;
    const ok = await eliminarPlanificacion(bloqueAEliminar.id_planificacion);
    if (ok) {
      toast.success('Bloque eliminado');
    } else {
      toast.error('No se pudo eliminar el bloque');
    }
    setAlertAbierto(false);
    setBloqueAEliminar(null);
  }

  // Obtener bloques de un día (dia_semana 1-7)
  function bloquesDelDia(diaSemana: number): PlanificacionHorario[] {
    return planificaciones
      .filter(p => p.dia_semana === diaSemana)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }

  // Fecha de cada columna
  function fechaDelDia(diaSemana: number): Date {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + (diaSemana - 1));
    return d;
  }

  const medicoSeleccionado = medicosSuplentes.find(
    m => String(m.id_usuario_sucursal) === idUsuarioSucursalSeleccionado
  );
  const tienePlanificacion = planificaciones.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <CalendarDays className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planificación de Horarios</h1>
          <p className="text-sm text-gray-500">Médicos Suplentes y Respaldo</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Sucursal */}
            <div className="space-y-1">
              <Label>Sucursal</Label>
              <Select
                value={idSucursalSeleccionada}
                onValueChange={setIdSucursalSeleccionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sucursal..." />
                </SelectTrigger>
                <SelectContent>
                  {sucursales.filter(s => s.estado === 'activo').map(s => (
                    <SelectItem key={s.id_sucursal} value={String(s.id_sucursal)}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Médico */}
            <div className="space-y-1">
              <Label>Médico Suplente / Respaldo</Label>
              <Select
                value={idUsuarioSucursalSeleccionado}
                onValueChange={setIdUsuarioSucursalSeleccionado}
                disabled={!idSucursalSeleccionada || loadingMedicos}
              >
                <SelectTrigger>
                  {loadingMedicos
                    ? <span className="flex items-center gap-2 text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Cargando...</span>
                    : <SelectValue placeholder={idSucursalSeleccionada ? 'Seleccionar médico...' : 'Selecciona una sucursal primero'} />
                  }
                </SelectTrigger>
                <SelectContent>
                  {medicosSuplentes.map(m => (
                    <SelectItem key={m.id_usuario_sucursal} value={String(m.id_usuario_sucursal)}>
                      {m.usuario
                        ? `${m.usuario.nombre} ${m.usuario.apellido}`
                        : `Usuario #${m.id_usuario}`
                      } — {m.cargo}{m.especialidad_data ? ` — ${m.especialidad_data.nombre}` : ''}
                    </SelectItem>
                  ))}
                  {medicosSuplentes.length === 0 && !loadingMedicos && idSucursalSeleccionada && (
                    <SelectItem value="__none__" disabled>
                      No hay médicos suplentes o respaldo en esta sucursal
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Ir a fecha */}
            <div className="space-y-1">
              <Label>Ir a semana</Label>
              <Input
                type="date"
                onChange={e => irASemana(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Navegador de semana */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={irSemanaAnterior}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {formatWeekLabel(weekStart, weekEnd)}
              </span>
              {idUsuarioSucursalSeleccionado && (
                <Badge variant={tienePlanificacion ? 'default' : 'secondary'}>
                  {tienePlanificacion ? 'Con planificación' : 'Sin planificación'}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={irSemanaSiguiente}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info médico seleccionado */}
      {medicoSeleccionado && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span>
            <strong>
              {medicoSeleccionado.usuario
                ? `${medicoSeleccionado.usuario.nombre} ${medicoSeleccionado.usuario.apellido}`
                : `Usuario #${medicoSeleccionado.id_usuario}`
              }
            </strong>
            {' '}·{' '}{medicoSeleccionado.cargo}
            {medicoSeleccionado.especialidad_data && ` · ${medicoSeleccionado.especialidad_data.nombre}`}
          </span>
        </div>
      )}

      {/* Grilla semanal */}
      {!idUsuarioSucursalSeleccionado ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Selecciona una sucursal y un médico para ver su planificación semanal</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(dia => {
            const fecha = fechaDelDia(dia);
            const bloques = bloquesDelDia(dia);
            const esHoy = toLocalDateString(fecha) === toLocalDateString(new Date());
            return (
              <div key={dia} className="flex flex-col gap-2">
                {/* Cabecera día */}
                <div className={`text-center rounded-lg py-2 px-1 ${esHoy ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <p className="text-xs font-semibold">{DIAS_LABEL[dia - 1]}</p>
                  <p className="text-lg font-bold leading-none">{fecha.getDate()}</p>
                  <p className="text-xs opacity-70">{MESES[fecha.getMonth()]}</p>
                </div>

                {/* Bloques del día */}
                {bloques.map(bloque => (
                  <Card key={bloque.id_planificacion} className="border border-blue-100 bg-blue-50/50">
                    <CardContent className="p-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-800">
                        <Clock className="h-3 w-3" />
                        {bloque.hora_inicio.substring(0, 5)} – {bloque.hora_fin.substring(0, 5)}
                      </div>
                      {bloque.consultorio && (
                        <p className="text-xs text-gray-600 truncate">
                          {[bloque.consultorio.nombre, bloque.consultorio.piso ? `Piso ${bloque.consultorio.piso}` : null, bloque.consultorio.numero ? `Número ${bloque.consultorio.numero}` : null].filter(Boolean).join(' - ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">{bloque.duracion_consulta} min</p>
                      <Badge
                        variant={bloque.estado === 'activo' ? 'default' : 'secondary'}
                        className="text-xs px-1 py-0"
                      >
                        {bloque.estado}
                      </Badge>
                      <div className="flex gap-1 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                          onClick={() => abrirEditarBloque(bloque)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          onClick={() => confirmarEliminar(bloque)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Botón agregar */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-dashed text-gray-400 hover:text-blue-600 hover:border-blue-400"
                  onClick={() => abrirNuevoBloque(dia)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog crear/editar bloque */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bloqueEditando ? 'Editar bloque' : 'Agregar bloque'} — {DIAS_FULL[diaSemanaActivo - 1]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Hora inicio <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Hora fin <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  value={form.hora_fin}
                  onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Consultorio <span className="text-red-500">*</span></Label>
              <Select
                value={form.id_consultorio}
                onValueChange={v => setForm(f => ({ ...f, id_consultorio: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar consultorio..." />
                </SelectTrigger>
                <SelectContent>
                  {consultoriosFiltrados.map(c => (
                    <SelectItem key={c.id_consultorio} value={String(c.id_consultorio)}>
                      {[c.nombre, c.piso ? `Piso ${c.piso}` : null, c.numero ? `Número ${c.numero}` : null].filter(Boolean).join(' - ')}
                    </SelectItem>
                  ))}
                  {consultoriosFiltrados.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No hay consultorios activos en esta sucursal
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Duración por consulta (minutos)</Label>
              <Input
                type="number"
                value={form.duracion_consulta}
                disabled
                className="bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">La duración se define en la configuración de precios del médico</p>
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v: 'activo' | 'inactivo') => setForm(f => ({ ...f, estado: v }))}
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
            <Button variant="outline" onClick={() => setDialogAbierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={guardando}>
              {guardando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {bloqueEditando ? 'Guardar cambios' : 'Agregar bloque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog eliminar */}
      <AlertDialog open={alertAbierto} onOpenChange={setAlertAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar bloque?</AlertDialogTitle>
            <AlertDialogDescription>
              {bloqueAEliminar && (
                <>
                  Se eliminará el bloque{' '}
                  <strong>
                    {bloqueAEliminar.hora_inicio.substring(0, 5)} – {bloqueAEliminar.hora_fin.substring(0, 5)}
                  </strong>{' '}
                  del <strong>{DIAS_FULL[bloqueAEliminar.dia_semana - 1]}</strong>{' '}
                  {fechaDelDia(bloqueAEliminar.dia_semana).getDate()}{' '}
                  {MESES[fechaDelDia(bloqueAEliminar.dia_semana).getMonth()]}.
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
