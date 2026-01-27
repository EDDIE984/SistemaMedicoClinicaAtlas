import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar, Clock, User } from 'lucide-react';
import { 
  modificarCita, 
  getSlotsDisponibles,
  getUsuarioByEmail,
  type Cita, 
  type Paciente 
} from '../data/mockData';
import { toast } from 'sonner';

interface CitaConDetalles extends Cita {
  paciente: Paciente;
  sucursalNombre: string;
  colorSucursal: string;
}

interface ModificarCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cita: CitaConDetalles | null;
  onCitaModificada: () => void;
}

export function ModificarCitaModal({
  isOpen,
  onClose,
  cita,
  onCitaModificada
}: ModificarCitaModalProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cita && isOpen) {
      setFechaSeleccionada(cita.fecha_cita);
      setHoraSeleccionada(cita.hora_inicio);
    }
  }, [cita, isOpen]);

  useEffect(() => {
    if (fechaSeleccionada && cita) {
      const slots = getSlotsDisponibles(cita.id_usuario_sucursal, fechaSeleccionada);
      // Si la fecha es la misma que la original, incluir la hora actual como disponible
      if (fechaSeleccionada === cita.fecha_cita && !slots.includes(cita.hora_inicio)) {
        slots.push(cita.hora_inicio);
        slots.sort();
      }
      setSlotsDisponibles(slots);
    }
  }, [fechaSeleccionada, cita]);

  const handleModificar = async () => {
    if (!cita) return;

    if (!fechaSeleccionada || !horaSeleccionada) {
      toast.error('Por favor selecciona fecha y hora');
      return;
    }

    // Verificar si cambió algo
    if (fechaSeleccionada === cita.fecha_cita && horaSeleccionada === cita.hora_inicio) {
      toast.error('Debe cambiar la fecha o la hora para modificar');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener usuario actual
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      let idUsuario = 1;
      
      if (currentUserEmail) {
        const usuario = getUsuarioByEmail(currentUserEmail);
        if (usuario) {
          idUsuario = usuario.id_usuario;
        }
      }

      // Calcular hora fin
      const [hora, minutos] = horaSeleccionada.split(':').map(Number);
      const totalMinutos = hora * 60 + minutos + cita.duracion_minutos;
      const horaFin = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;

      const result = modificarCita(
        cita.id_cita,
        fechaSeleccionada,
        horaSeleccionada,
        horaFin,
        cita.duracion_minutos,
        idUsuario
      );

      if (result.success) {
        toast.success(result.message);
        onCitaModificada();
        handleClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al modificar la cita');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFechaSeleccionada('');
    setHoraSeleccionada('');
    setSlotsDisponibles([]);
    onClose();
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const getFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  if (!cita) return null;

  if (cita.estado_cita === 'cancelada' || cita.estado_cita === 'atendida') {
    return null;
  }

  const pacienteNombre = `${cita.paciente.nombres} ${cita.paciente.apellidos}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="size-6 text-blue-600" />
            </div>
            <DialogTitle>Modificar Cita</DialogTitle>
          </div>
          <DialogDescription>
            Cambia la fecha y/u hora de la cita. Se verificará automáticamente la disponibilidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información del paciente */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-gray-900">
              <User className="size-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p>{pacienteNombre}</p>
              </div>
            </div>
          </div>

          {/* Cita actual */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">📅 Cita Actual</p>
            <p className="text-gray-900">
              {formatFecha(cita.fecha_cita)} - {cita.hora_inicio} a {cita.hora_fin}
            </p>
          </div>

          {/* Nueva fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha">
              Nueva Fecha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => {
                setFechaSeleccionada(e.target.value);
                setHoraSeleccionada('');
              }}
              min={getFechaMinima()}
              className="cursor-pointer"
            />
          </div>

          {/* Nueva hora */}
          <div className="space-y-2">
            <Label htmlFor="hora">
              Nueva Hora <span className="text-red-500">*</span>
            </Label>
            {!fechaSeleccionada ? (
              <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                Primero selecciona una fecha
              </p>
            ) : slotsDisponibles.length === 0 ? (
              <p className="text-sm text-orange-600 p-3 bg-orange-50 rounded-lg border border-orange-200">
                ⚠️ No hay horarios disponibles para esta fecha
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {slotsDisponibles.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setHoraSeleccionada(slot)}
                    className={`p-2 rounded-lg border-2 text-sm transition-all ${
                      horaSeleccionada === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <Clock className="size-3 inline mr-1" />
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vista previa de la nueva cita */}
          {fechaSeleccionada && horaSeleccionada && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-2">✅ Nueva Cita</p>
              <p className="text-gray-900">
                {formatFecha(fechaSeleccionada)} - {horaSeleccionada}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Duración: {cita.duracion_minutos} minutos
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleModificar}
            disabled={isSubmitting || !fechaSeleccionada || !horaSeleccionada || slotsDisponibles.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Modificando...' : 'Confirmar Modificación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
