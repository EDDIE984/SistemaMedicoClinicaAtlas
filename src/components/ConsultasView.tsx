import { useState } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Plus, Clock } from 'lucide-react';
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
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Consulta {
  id: string;
  fecha: string;
  hora: string;
  doctor: string;
  motivo: string;
  diagnostico: string;
}

interface ConsultasViewProps {
  patientName: string;
  currentUser: {name: string; email: string} | null;
}

const mockConsultasIniciadas: Consulta[] = [
  {
    id: '1',
    fecha: '09 NOV 2025',
    hora: '11:21AM',
    doctor: 'Dr. Soporte',
    motivo: 'Dolor De Estómago',
    diagnostico: 'Gastroenteritis y colitis de origen no especificado.',
  },
];

export function ConsultasView({ patientName, currentUser }: ConsultasViewProps) {
  const [verCanceladas, setVerCanceladas] = useState(false);
  const [consultasAgendadas, setConsultasAgendadas] = useState<Consulta[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');

  // Generar horas disponibles (8:00 AM - 6:00 PM cada hora)
  const horasDisponibles = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];

  const handleNuevaConsulta = () => {
    if (!motivoConsulta.trim() || !fechaConsulta || !horaSeleccionada) {
      return;
    }

    const fecha = new Date(fechaConsulta + 'T00:00:00');
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase().replace('.', '');

    const nuevaConsulta: Consulta = {
      id: Date.now().toString(),
      fecha: fechaFormateada,
      hora: horaSeleccionada,
      doctor: currentUser?.name || 'Dr. Usuario',
      motivo: motivoConsulta,
      diagnostico: 'Pendiente de consulta',
    };

    setConsultasAgendadas([...consultasAgendadas, nuevaConsulta]);
    setIsDialogOpen(false);
    setMotivoConsulta('');
    setFechaConsulta('');
    setHoraSeleccionada('');
  };

  return (
    <div className="space-y-6">
      {/* Botón Nueva Consulta */}
      <Button className="w-full" size="lg" onClick={() => setIsDialogOpen(true)}>
        <Plus className="size-5 mr-2" />
        Nueva Consulta
      </Button>

      {/* Diálogo Nueva Consulta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Consulta</DialogTitle>
            <DialogDescription>
              Agenda una nueva consulta para {patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la Consulta</Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo de la consulta..."
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaConsulta}
                onChange={(e) => {
                  setFechaConsulta(e.target.value);
                  setHoraSeleccionada(''); // Reset hora cuando cambia fecha
                }}
              />
            </div>

            {/* Mostrar horas disponibles solo si hay fecha seleccionada */}
            {fechaConsulta && (
              <div className="space-y-2">
                <Label>Hora Disponible</Label>
                <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto p-2 border rounded-md">
                  {horasDisponibles.map((hora) => (
                    <Button
                      key={hora}
                      type="button"
                      variant={horaSeleccionada === hora ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setHoraSeleccionada(hora)}
                    >
                      <Clock className="size-4 mr-1" />
                      {hora}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Doctor Asignado</Label>
              <Input
                value={currentUser?.name || 'Dr. Usuario'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNuevaConsulta} disabled={!motivoConsulta.trim() || !fechaConsulta || !horaSeleccionada}>
              Agendar Consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONSULTAS AGENDADAS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-600">CONSULTAS AGENDADAS</h2>
          <div className="flex items-center gap-2">
            <Switch
              checked={verCanceladas}
              onCheckedChange={setVerCanceladas}
            />
            <span className="text-sm text-gray-600">Ver citas canceladas</span>
          </div>
        </div>

        {consultasAgendadas.length === 0 ? (
          <div className="text-gray-500 py-4">
            <p>Aun no hay citas agendadas.</p>
            <p>
              Utiliza la{' '}
              <a href="#" className="text-blue-600 hover:underline">
                agenda
              </a>{' '}
              para calendarizarla
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultasAgendadas.map((consulta) => (
              <ConsultaCard key={consulta.id} consulta={consulta} />
            ))}
          </div>
        )}
      </div>

      {/* CONSULTAS INICIADAS */}
      <div>
        <h2 className="text-gray-600 mb-4">CONSULTAS INICIADAS</h2>
        {mockConsultasIniciadas.length === 0 ? (
          <div className="text-gray-500 py-4">
            <p>No hay consultas iniciadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockConsultasIniciadas.map((consulta) => (
              <ConsultaCard key={consulta.id} consulta={consulta} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsultaCard({ consulta }: { consulta: Consulta }) {
  const [dia, mes, anio] = consulta.fecha.split(' ');

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex">
        {/* Fecha con barra lateral azul */}
        <div className="flex flex-col items-center justify-center bg-gray-50 px-6 py-4 border-l-4 border-blue-500">
          <div className="text-4xl font-bold text-gray-900">{dia}</div>
          <div className="text-sm font-semibold text-gray-600 uppercase">{mes}</div>
          <div className="text-sm text-gray-500">{anio}</div>
        </div>

        {/* Contenido de la consulta */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm text-gray-600">{consulta.doctor}</div>
            <div className="text-sm text-blue-600 font-semibold">{consulta.hora}</div>
          </div>
          <h3 className="text-gray-900 mb-1">{consulta.motivo}</h3>
          <p className="text-sm text-gray-500">{consulta.diagnostico}</p>
        </div>
      </div>
    </div>
  );
}