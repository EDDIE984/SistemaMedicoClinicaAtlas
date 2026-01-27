import { useState } from 'react';
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
import { Textarea } from './ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { cancelarCita } from '../lib/citasService';
import type { CitaCompleta } from '../lib/citasService';
import { toast } from 'sonner';

interface CancelarCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cita: CitaCompleta | null;
  onCitaCancelada: () => void;
}

export function CancelarCitaModalSupabase({
  isOpen,
  onClose,
  cita,
  onCitaCancelada
}: CancelarCitaModalProps) {
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelar = async () => {
    if (!cita) return;
    
    if (!motivoCancelacion.trim()) {
      toast.error('Por favor ingresa el motivo de cancelación');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener usuario actual del ID almacenado en localStorage
      const currentUserId = localStorage.getItem('currentUserId');
      const idUsuario = currentUserId ? parseInt(currentUserId) : 1;

      const success = await cancelarCita(cita.id_cita, idUsuario, motivoCancelacion);

      if (success) {
        toast.success('Cita cancelada exitosamente');
        setMotivoCancelacion('');
        onCitaCancelada();
        onClose();
      } else {
        toast.error('Error al cancelar la cita');
      }
    } catch (error) {
      toast.error('Error al procesar la cancelación');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMotivoCancelacion('');
    onClose();
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };

  if (!cita) return null;

  // No permitir cancelar citas ya canceladas
  if (cita.estado_cita === 'cancelada') {
    return null;
  }

  const pacienteNombre = `${cita.paciente.nombres} ${cita.paciente.apellidos}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <DialogTitle>Cancelar Cita</DialogTitle>
          </div>
          <DialogDescription>
            Esta acción cancelará la cita y se registrará en el historial del paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de la cita */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm text-gray-500">Paciente</p>
              <p className="text-gray-900">{pacienteNombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha y Hora</p>
              <p className="text-gray-900">
                {formatFecha(cita.fecha_cita)} - {cita.hora_inicio}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Motivo de consulta</p>
              <p className="text-gray-900">{cita.motivo_consulta}</p>
            </div>
          </div>

          {/* Motivo de cancelación */}
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo de cancelación <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivo"
              placeholder="Ej: Paciente solicitó reprogramación, Emergencia médica, Paciente no puede asistir..."
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Este motivo quedará registrado en el historial de la cita
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Volver
          </Button>
          <Button
            type="button"
            onClick={handleCancelar}
            disabled={isSubmitting || !motivoCancelacion.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
