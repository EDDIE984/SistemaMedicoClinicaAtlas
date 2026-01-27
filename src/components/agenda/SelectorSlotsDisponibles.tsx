import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { obtenerSlotsDisponibles, type SlotDisponible, type Slot } from '../../lib/slotsService';
import { toast } from 'sonner';

interface SelectorSlotsDisponiblesProps {
  onSlotSeleccionado?: (slot: {
    idAsignacion: number;
    medico: string;
    consultorio: string;
    horaInicio: string;
    horaFin: string;
    fecha: string;
  }) => void;
}

export function SelectorSlotsDisponibles({ onSlotSeleccionado }: SelectorSlotsDisponiblesProps) {
  const [fecha, setFecha] = useState<string>('');
  const [slotsData, setSlotsData] = useState<SlotDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [diaSemana, setDiaSemana] = useState<string>('');
  const [slotSeleccionado, setSlotSeleccionado] = useState<{
    idAsignacion: number;
    horaInicio: string;
  } | null>(null);

  // Establecer fecha mínima como hoy
  const fechaMinima = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (fecha) {
      buscarSlots();
    }
  }, [fecha]);

  const buscarSlots = async () => {
    if (!fecha) {
      setError('Por favor selecciona una fecha');
      return;
    }

    setLoading(true);
    setError('');
    setSlotsData([]);
    setSlotSeleccionado(null);

    try {
      const respuesta = await obtenerSlotsDisponibles(fecha);
      
      if (respuesta.slots_disponibles.length === 0) {
        setError(respuesta.mensaje || 'No hay horarios disponibles para esta fecha');
      } else {
        setSlotsData(respuesta.slots_disponibles);
        setDiaSemana(respuesta.dia_semana);
      }
    } catch (err: any) {
      console.error('Error al buscar slots:', err);
      setError(err.message || 'Error al buscar horarios disponibles');
      toast.error('Error al buscar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarSlot = (
    idAsignacion: number,
    medico: string,
    consultorio: string,
    slot: Slot
  ) => {
    setSlotSeleccionado({
      idAsignacion,
      horaInicio: slot.hora_inicio
    });

    if (onSlotSeleccionado) {
      onSlotSeleccionado({
        idAsignacion,
        medico,
        consultorio,
        horaInicio: slot.hora_inicio,
        horaFin: slot.hora_fin,
        fecha
      });
    }

    toast.success(`Slot seleccionado: ${slot.hora_inicio} - ${slot.hora_fin}`);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Fecha */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            <h3>Selecciona una fecha para ver disponibilidad</h3>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="fecha">Fecha de la cita</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={fechaMinima}
              />
            </div>
            
            <Button 
              onClick={buscarSlots}
              disabled={!fecha || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar Horarios'
              )}
            </Button>
          </div>

          {diaSemana && (
            <div className="text-sm text-gray-600">
              Día de la semana: <span className="font-semibold capitalize">{diaSemana}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Mensaje de Error */}
      {error && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">No hay disponibilidad</p>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Listado de Horarios Disponibles */}
      {!loading && slotsData.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2">
            <Clock className="size-5 text-blue-600" />
            Horarios Disponibles ({slotsData.length} {slotsData.length === 1 ? 'médico' : 'médicos'})
          </h3>

          {slotsData.map((horario) => (
            <Card key={horario.id_asignacion} className="p-4">
              {/* Información del Médico y Consultorio */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-gray-500" />
                      <span className="font-semibold">{horario.medico.nombre_completo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="size-4" />
                      <span>{horario.consultorio.nombre} - {horario.sucursal.nombre}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Horario: {horario.horario_general.hora_inicio} - {horario.horario_general.hora_fin}
                      {' '}({horario.horario_general.duracion_consulta} min por cita)
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={horario.slots_disponibles > 0 ? 'default' : 'secondary'}>
                      {horario.slots_disponibles} disponibles
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {horario.slots_ocupados} ocupados
                    </p>
                  </div>
                </div>
              </div>

              {/* Slots Disponibles */}
              {horario.slots.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold mb-3">Selecciona un horario:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {horario.slots.map((slot, index) => (
                      <Button
                        key={`${horario.id_asignacion}-${slot.hora_inicio}-${index}`}
                        variant={
                          slotSeleccionado?.idAsignacion === horario.id_asignacion &&
                          slotSeleccionado?.horaInicio === slot.hora_inicio
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSeleccionarSlot(
                          horario.id_asignacion,
                          horario.medico.nombre_completo,
                          horario.consultorio.nombre,
                          slot
                        )}
                      >
                        {slot.hora_inicio}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Todos los slots están ocupados
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Slot Seleccionado */}
      {slotSeleccionado && slotsData.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="font-semibold text-green-800">Slot seleccionado</p>
              <p className="text-sm text-green-700">
                {fecha} a las {slotSeleccionado.horaInicio}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
