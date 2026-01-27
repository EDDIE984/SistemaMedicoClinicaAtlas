import { useState, useEffect } from 'react';
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
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Plus, User, Search, Clock, AlertCircle } from 'lucide-react';
import {
  getUsuarioByEmail,
  getAsignacionesByUsuario,
  getSucursalById,
  getSlotsDisponibles,
  getPrecioUsuarioSucursal,
  getDiaSemana,
  pacientes,
  addPaciente,
  addCita,
  asignacionesConsultorio,
  consultorios,
  type Paciente,
  type TipoCita,
  type Sexo
} from '../data/mockData';

interface AgendarCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCitaCreada: () => void;
  currentUser?: {
    email: string;
  } | null;
}

export function AgendarCitaModal({
  isOpen,
  onClose,
  onCitaCreada,
  currentUser
}: AgendarCitaModalProps) {
  const [step, setStep] = useState<'paciente' | 'cita'>('paciente');
  const [isNewPatient, setIsNewPatient] = useState(false);
  
  // Datos del usuario y sus asignaciones
  const [userAsignaciones, setUserAsignaciones] = useState<any[]>([]);
  const [hasValidAsignaciones, setHasValidAsignaciones] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  
  // Filtro de búsqueda de pacientes
  const [searchPaciente, setSearchPaciente] = useState('');
  
  // Slots disponibles
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  
  // Datos del paciente
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [newPaciente, setNewPaciente] = useState<Omit<Paciente, 'id_paciente' | 'id_compania' | 'fecha_registro' | 'estado'>>({
    nombres: '',
    apellidos: '',
    numero_identificacion: '',
    fecha_nacimiento: '',
    sexo: 'M' as Sexo,
    email: '',
    telefono: '',
    direccion: '',
    ciudad: 'Quito',
    provincia: 'Pichincha'
  });

  // Datos de la cita
  const [citaData, setCitaData] = useState({
    id_usuario_sucursal: '',
    fecha_cita: '',
    hora_inicio: '',
    duracion_minutos: 30,
    tipo_cita: 'consulta' as TipoCita,
    motivo_consulta: '',
    precio_cita: 50.00
  });

  useEffect(() => {
    if (currentUser?.email) {
      const usuario = getUsuarioByEmail(currentUser.email);
      if (usuario) {
        // 1️⃣ VALIDAR QUE EL USUARIO ESTÉ ACTIVO
        if (usuario.estado !== 'activo') {
          setHasValidAsignaciones(false);
          setValidationMessage('⚠️ Tu usuario está inactivo. No puedes agendar citas. Contacta al administrador.');
          setUserAsignaciones([]);
          toast.error('Usuario inactivo. No puedes agendar citas.', { duration: 5000 });
          return;
        }

        const asignaciones = getAsignacionesByUsuario(usuario.id_usuario);
        
        // 2️⃣ VALIDAR QUE TENGA ASIGNACIONES ACTIVAS
        if (asignaciones.length === 0) {
          setHasValidAsignaciones(false);
          setValidationMessage('⚠️ No tienes asignaciones a ninguna sucursal. Contacta al administrador.');
          setUserAsignaciones([]);
          toast.error('No tienes asignaciones activas para agendar citas.', { duration: 5000 });
          return;
        }

        // 3️⃣ VALIDAR QUE TENGA ASIGNACIONES DE CONSULTORIO ACTIVAS
        const asignacionesConConsultorios = asignaciones.filter(asig => {
          // Buscar si tiene asignaciones de consultorio activas
          const tieneConsultorios = asignacionesConsultorio.some(ac => 
            ac.id_usuario_sucursal === asig.id_usuario_sucursal && 
            ac.estado === 'activo'
          );
          return tieneConsultorios;
        });

        if (asignacionesConConsultorios.length === 0) {
          setHasValidAsignaciones(false);
          setValidationMessage('⚠️ No tienes consultorios asignados. Contacta al administrador para que te asignen un consultorio.');
          setUserAsignaciones([]);
          toast.error('No tienes consultorios asignados para agendar citas.', { duration: 5000 });
          return;
        }

        // 4️⃣ VALIDAR QUE LOS CONSULTORIOS ESTÉN DISPONIBLES (ACTIVOS)
        const asignacionesConConsultoriosDisponibles = asignacionesConConsultorios.filter(asig => {
          // Obtener los consultorios asignados a esta asignación
          const consultoriosAsignados = asignacionesConsultorio.filter(ac => 
            ac.id_usuario_sucursal === asig.id_usuario_sucursal && 
            ac.estado === 'activo'
          );
          
          // Verificar que al menos uno de los consultorios esté activo
          const tieneConsultorioActivo = consultoriosAsignados.some(ca => {
            const consultorio = consultorios.find(c => c.id_consultorio === ca.id_consultorio);
            return consultorio && consultorio.estado === 'activo';
          });
          
          return tieneConsultorioActivo;
        });

        if (asignacionesConConsultoriosDisponibles.length === 0) {
          setHasValidAsignaciones(false);
          setValidationMessage('⚠️ Todos tus consultorios asignados están inactivos o en mantenimiento. Contacta al administrador.');
          setUserAsignaciones([]);
          toast.error('No hay consultorios disponibles para agendar citas.', { duration: 5000 });
          return;
        }

        // ✅ TODO CORRECTO - Cargar asignaciones con información de sucursal
        const asignacionesConSucursal = asignacionesConConsultoriosDisponibles.map(asig => ({
          ...asig,
          sucursal: getSucursalById(asig.id_sucursal)
        }));
        
        setUserAsignaciones(asignacionesConSucursal);
        setHasValidAsignaciones(true);
        setValidationMessage('');
      }
    }
  }, [currentUser]);

  // Calcular slots disponibles cuando cambia la fecha o sucursal
  useEffect(() => {
    if (citaData.id_usuario_sucursal && citaData.fecha_cita) {
      const slots = getSlotsDisponibles(
        parseInt(citaData.id_usuario_sucursal),
        citaData.fecha_cita
      );
      setSlotsDisponibles(slots);
      
      // Limpiar la hora seleccionada si ya no está disponible
      if (citaData.hora_inicio && !slots.includes(citaData.hora_inicio)) {
        setCitaData(prev => ({ ...prev, hora_inicio: '' }));
      }
      
      // Obtener día de la semana
      const diaSemana = getDiaSemana(citaData.fecha_cita);
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      if (slots.length === 0) {
        const diaTexto = diasSemana[diaSemana === 7 ? 0 : diaSemana];
        toast.info(`No hay horarios disponibles para ${diaTexto}`);
      }
    } else {
      setSlotsDisponibles([]);
    }
  }, [citaData.id_usuario_sucursal, citaData.fecha_cita]);

  const handlePacienteNext = () => {
    if (!isNewPatient && !selectedPacienteId) {
      toast.error('Por favor selecciona un paciente');
      return;
    }

    if (isNewPatient) {
      if (!newPaciente.nombres || !newPaciente.apellidos || !newPaciente.numero_identificacion) {
        toast.error('Por favor completa los campos obligatorios del paciente');
        return;
      }
    }

    setStep('cita');
  };

  const handleSubmit = () => {
    // Validaciones
    if (!citaData.id_usuario_sucursal) {
      toast.error('Por favor selecciona una sucursal');
      return;
    }
    if (!citaData.fecha_cita || !citaData.hora_inicio) {
      toast.error('Por favor completa la fecha y hora de la cita');
      return;
    }
    if (!citaData.motivo_consulta) {
      toast.error('Por favor ingresa el motivo de la consulta');
      return;
    }

    try {
      let pacienteId = parseInt(selectedPacienteId);

      // Si es nuevo paciente, crearlo primero
      if (isNewPatient) {
        const nuevoPaciente = addPaciente({
          ...newPaciente,
          id_compania: 1 // Hospital Atlas
        });
        pacienteId = nuevoPaciente.id_paciente;
      }

      // Calcular hora fin
      const [hora, minutos] = citaData.hora_inicio.split(':').map(Number);
      const totalMinutos = hora * 60 + minutos + citaData.duracion_minutos;
      const horaFin = Math.floor(totalMinutos / 60);
      const minutosFin = totalMinutos % 60;
      const hora_fin = `${horaFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;

      // Obtener id_sucursal del id_usuario_sucursal
      const asignacion = userAsignaciones.find(
        a => a.id_usuario_sucursal.toString() === citaData.id_usuario_sucursal
      );

      // Crear cita
      const nuevaCita = addCita({
        id_paciente: pacienteId,
        id_usuario_sucursal: parseInt(citaData.id_usuario_sucursal),
        id_sucursal: asignacion.id_sucursal,
        fecha_cita: citaData.fecha_cita,
        hora_inicio: citaData.hora_inicio,
        hora_fin,
        duracion_minutos: citaData.duracion_minutos,
        tipo_cita: citaData.tipo_cita,
        motivo_consulta: citaData.motivo_consulta,
        estado_cita: 'agendada',
        precio_cita: citaData.precio_cita,
        forma_pago: 'efectivo',
        estado_pago: 'pendiente',
        notas_cita: null,
        cancelada_por: null,
        motivo_cancelacion: null,
        fecha_creacion: new Date().toISOString(),
        fecha_modificacion: new Date().toISOString(),
        recordatorio_enviado: false,
        confirmacion_paciente: false
      });

      toast.success('Cita agendada exitosamente');
      onCitaCreada();
      handleClose();
    } catch (error) {
      toast.error('Error al agendar la cita');
      console.error(error);
    }
  };

  const handleClose = () => {
    setStep('paciente');
    setIsNewPatient(false);
    setSelectedPacienteId('');
    setSearchPaciente('');
    setSlotsDisponibles([]);
    setNewPaciente({
      nombres: '',
      apellidos: '',
      numero_identificacion: '',
      fecha_nacimiento: '',
      sexo: 'M',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: 'Quito',
      provincia: 'Pichincha'
    });
    setCitaData({
      id_usuario_sucursal: '',
      fecha_cita: '',
      hora_inicio: '',
      duracion_minutos: 30,
      tipo_cita: 'consulta',
      motivo_consulta: '',
      precio_cita: 50.00
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'paciente' ? 'Seleccionar Paciente' : 'Datos de la Cita'}
          </DialogTitle>
          <DialogDescription>
            {step === 'paciente'
              ? 'Selecciona un paciente existente o registra uno nuevo'
              : 'Completa los detalles de la cita médica'}
          </DialogDescription>
        </DialogHeader>

        {step === 'paciente' ? (
          <div className="space-y-4">
            {/* Mensaje de advertencia si no hay asignaciones válidas */}
            {!hasValidAsignaciones && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800">{validationMessage}</p>
                </div>
              </div>
            )}

            {/* Toggle Paciente Nuevo/Existente */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!isNewPatient ? 'default' : 'outline'}
                onClick={() => setIsNewPatient(false)}
                className="flex-1"
                disabled={!hasValidAsignaciones}
              >
                <User className="size-4 mr-2" />
                Paciente Existente
              </Button>
              <Button
                type="button"
                variant={isNewPatient ? 'default' : 'outline'}
                onClick={() => setIsNewPatient(true)}
                className="flex-1"
                disabled={!hasValidAsignaciones}
              >
                <Plus className="size-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>

            {!isNewPatient ? (
              <div className="space-y-3">
                <Label>Buscar y Seleccionar Paciente *</Label>
                
                {/* Campo de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="searchPaciente"
                    value={searchPaciente}
                    onChange={(e) => setSearchPaciente(e.target.value)}
                    placeholder="Buscar por cédula, nombres o apellidos..."
                    className="pl-10"
                  />
                </div>

                {/* Selector de paciente */}
                <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
                  <SelectTrigger id="paciente">
                    <SelectValue placeholder="Seleccione un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes
                      .filter(paciente => {
                        const searchLower = searchPaciente.toLowerCase();
                        return (
                          paciente.nombres.toLowerCase().includes(searchLower) ||
                          paciente.apellidos.toLowerCase().includes(searchLower) ||
                          paciente.numero_identificacion.includes(searchPaciente)
                        );
                      })
                      .map((paciente) => (
                        <SelectItem
                          key={paciente.id_paciente}
                          value={paciente.id_paciente.toString()}
                        >
                          <div className="flex flex-col">
                            <span>{paciente.nombres} {paciente.apellidos}</span>
                            <span className="text-xs text-gray-500">Cédula: {paciente.numero_identificacion}</span>
                          </div>
                        </SelectItem>
                      ))}
                    {pacientes.filter(paciente => {
                      const searchLower = searchPaciente.toLowerCase();
                      return (
                        paciente.nombres.toLowerCase().includes(searchLower) ||
                        paciente.apellidos.toLowerCase().includes(searchLower) ||
                        paciente.numero_identificacion.includes(searchPaciente)
                      );
                    }).length === 0 && searchPaciente && (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No se encontraron pacientes
                      </div>
                    )}
                  </SelectContent>
                </Select>
                
                {/* Información del paciente seleccionado */}
                {selectedPacienteId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {(() => {
                      const paciente = pacientes.find(p => p.id_paciente.toString() === selectedPacienteId);
                      if (!paciente) return null;
                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre completo:</span>
                            <span>{paciente.nombres} {paciente.apellidos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cédula:</span>
                            <span>{paciente.numero_identificacion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Teléfono:</span>
                            <span>{paciente.telefono}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{paciente.email}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres *</Label>
                    <Input
                      id="nombres"
                      value={newPaciente.nombres}
                      onChange={(e) => setNewPaciente({ ...newPaciente, nombres: e.target.value })}
                      placeholder="Nombres del paciente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={newPaciente.apellidos}
                      onChange={(e) => setNewPaciente({ ...newPaciente, apellidos: e.target.value })}
                      placeholder="Apellidos del paciente"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="identificacion">Número de Identificación *</Label>
                    <Input
                      id="identificacion"
                      value={newPaciente.numero_identificacion}
                      onChange={(e) => setNewPaciente({ ...newPaciente, numero_identificacion: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={newPaciente.fecha_nacimiento}
                      onChange={(e) => setNewPaciente({ ...newPaciente, fecha_nacimiento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select
                      value={newPaciente.sexo}
                      onValueChange={(value: Sexo) => setNewPaciente({ ...newPaciente, sexo: value })}
                    >
                      <SelectTrigger id="sexo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={newPaciente.telefono}
                      onChange={(e) => setNewPaciente({ ...newPaciente, telefono: e.target.value })}
                      placeholder="0991234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPaciente.email}
                    onChange={(e) => setNewPaciente({ ...newPaciente, email: e.target.value })}
                    placeholder="paciente@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={newPaciente.direccion}
                    onChange={(e) => setNewPaciente({ ...newPaciente, direccion: e.target.value })}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={newPaciente.ciudad}
                      onChange={(e) => setNewPaciente({ ...newPaciente, ciudad: e.target.value })}
                      placeholder="Quito"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia</Label>
                    <Input
                      id="provincia"
                      value={newPaciente.provincia}
                      onChange={(e) => setNewPaciente({ ...newPaciente, provincia: e.target.value })}
                      placeholder="Pichincha"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sucursal">Sucursal *</Label>
              <Select
                value={citaData.id_usuario_sucursal}
                onValueChange={(value: string) => setCitaData({ ...citaData, id_usuario_sucursal: value })}
              >
                <SelectTrigger id="sucursal">
                  <SelectValue placeholder="Seleccione una sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {userAsignaciones.map((asignacion) => (
                    <SelectItem
                      key={asignacion.id_usuario_sucursal}
                      value={asignacion.id_usuario_sucursal.toString()}
                    >
                      {asignacion.sucursal?.nombre} - {asignacion.especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_cita">Fecha de la Cita *</Label>
                <Input
                  id="fecha_cita"
                  type="date"
                  value={citaData.fecha_cita}
                  onChange={(e) => setCitaData({ ...citaData, fecha_cita: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de Inicio *</Label>
                <Select
                  value={citaData.hora_inicio}
                  onValueChange={(value: string) => setCitaData({ ...citaData, hora_inicio: value })}
                >
                  <SelectTrigger id="hora_inicio">
                    <SelectValue placeholder="Seleccione una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {slotsDisponibles.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Select
                  value={citaData.duracion_minutos.toString()}
                  onValueChange={(value: string) => setCitaData({ ...citaData, duracion_minutos: parseInt(value) })}
                >
                  <SelectTrigger id="duracion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_cita">Tipo de Cita</Label>
                <Select
                  value={citaData.tipo_cita}
                  onValueChange={(value: TipoCita) => setCitaData({ ...citaData, tipo_cita: value })}
                >
                  <SelectTrigger id="tipo_cita">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="emergencia">Emergencia</SelectItem>
                    <SelectItem value="primera_vez">Primera Vez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de Consulta *</Label>
              <Textarea
                id="motivo"
                value={citaData.motivo_consulta}
                onChange={(e) => setCitaData({ ...citaData, motivo_consulta: e.target.value })}
                placeholder="Describa el motivo de la consulta..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio de la Cita (USD)</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={citaData.precio_cita}
                onChange={(e) => setCitaData({ ...citaData, precio_cita: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'paciente' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handlePacienteNext} disabled={!hasValidAsignaciones}>
                Siguiente
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('paciente')}>
                Atrás
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                Agendar Cita
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}