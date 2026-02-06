import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, Mail, Calendar, Clock, MapPin, Stethoscope, XCircle } from 'lucide-react';
import type { CitaCompleta } from '../lib/citasService';
import { calcularEdad } from '../lib/pacientesService';

interface DetalleCitaDialogProps {
    isOpen: boolean;
    onClose: () => void;
    cita: CitaCompleta | null;
    onIniciarConsulta: (cita: CitaCompleta) => void;
    onModificar: (cita: CitaCompleta) => void;
    onCancelar: (cita: CitaCompleta) => void;
}

export function DetalleCitaDialog({
    isOpen,
    onClose,
    cita,
    onIniciarConsulta,
    onModificar,
    onCancelar
}: DetalleCitaDialogProps) {
    if (!cita) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-80 p-4 gap-0">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3 border-b">
                        <div>
                            <h3 className="font-semibold text-sm">
                                {cita.paciente.nombres} {cita.paciente.apellidos}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {cita.paciente.fecha_nacimiento && `${calcularEdad(cita.paciente.fecha_nacimiento)} años`}
                            </p>
                        </div>
                        <Badge
                            variant={cita.estado_cita === 'cancelada' ? 'destructive' : cita.consulta_realizada ? 'default' : 'secondary'}
                            className="text-xs"
                        >
                            {cita.estado_cita === 'cancelada' ? 'Cancelada' : cita.consulta_realizada ? 'Completada' : 'Programada'}
                        </Badge>
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-2 text-xs">
                        {cita.paciente.telefono && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="size-3" />
                                <span>{cita.paciente.telefono}</span>
                            </div>
                        )}
                        {cita.paciente.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="size-3" />
                                <span className="truncate">{cita.paciente.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="size-3" />
                            <span>
                                {new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="size-3" />
                            <span>{cita.hora_inicio.substring(0, 5)} - {cita.hora_fin.substring(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="size-3" />
                            <span>{cita.usuario_sucursal.sucursal.nombre}</span>
                        </div>
                    </div>

                    {/* Motivo de consulta */}
                    {cita.motivo_consulta && (
                        <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-gray-700 mb-1">Motivo de consulta:</p>
                            <p className="text-xs text-gray-600">{cita.motivo_consulta}</p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    {!cita.consulta_realizada && cita.estado_cita !== 'cancelada' && (
                        <div className="space-y-2 pt-3 border-t">
                            <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                                onClick={() => {
                                    onClose();
                                    onIniciarConsulta(cita);
                                }}
                            >
                                <Stethoscope className="size-3 mr-1" />
                                Iniciar cita
                            </Button>
                            <Button
                                size="sm"
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white h-8 text-xs"
                                onClick={() => {
                                    onClose();
                                    onModificar(cita);
                                }}
                            >
                                <Calendar className="size-3 mr-1" />
                                Modificar cita
                            </Button>
                            <Button
                                size="sm"
                                className="w-full bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                                onClick={() => {
                                    onClose();
                                    onCancelar(cita);
                                }}
                            >
                                <XCircle className="size-3 mr-1" />
                                Cancelar cita
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
