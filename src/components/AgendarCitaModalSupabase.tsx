// Modal para agendar citas integrado con Supabase
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { usePacientes } from '../hooks/usePacientes';
import { useHorarios } from '../hooks/useCitas';
import { Plus, Search } from 'lucide-react';
import { getAllPacientes } from '../lib/pacientesService';
import { getAsignacionesCompletasByUsuario, getSucursalesByCompania, getMedicosBySucursal, type AsignacionCompleta } from '../lib/authService';
import { createCita, updateCita, generarHorariosDisponibles, type CitaCompleta } from '../lib/citasService';
import { updatePaciente } from '../lib/pacientesService'; // Import updatePaciente
import { consultarCedulaRegistroCivil } from '../lib/registroCivilService'; // Import automatic ID lookup
import { Pencil, Edit, Loader2 } from 'lucide-react'; // Import icons

interface AgendarCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCitaAgendada: () => void;
  idUsuarioActual: number | null;
  citaEditar?: CitaCompleta | null;
  tipoUsuario?: string;
}

export function AgendarCitaModalSupabase({ isOpen, onClose, onCitaAgendada, idUsuarioActual, citaEditar, tipoUsuario }: AgendarCitaModalProps) {
  const [step, setStep] = useState<'paciente' | 'detalles' | 'nuevoPaciente'>('paciente');
  const modoEdicion = !!citaEditar;
  const esSecretaria = tipoUsuario === 'secretaria';

  // Paso 1: Seleccin de paciente
  const [searchPaciente, setSearchPaciente] = useState('');
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [pacientes, setPacientes] = useState<any[]>([]);

  // Estado para nuevo paciente
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    fecha_nacimiento: '',
    sexo: 'M',
    telefono: '',
    email: '',
    direccion: '',
    id_sucursal: null as number | null,
    nombre_sucursal: '' // Para mostrar el nombre
  });

  // Paso 2: Detalles de la cita
  const [selectedAsignacion, setSelectedAsignacion] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [tipoCita, setTipoCita] = useState<'consulta' | 'control' | 'emergencia' | 'primera_vez'>('consulta');
  const [motivoConsulta, setMotivoConsulta] = useState('');

  const [asignaciones, setAsignaciones] = useState<AsignacionCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCedula, setIsSearchingCedula] = useState(false); // Estado para loading de cédula

  // Estados específicos para SECRETARIA
  const [sucursalSecretaria, setSucursalSecretaria] = useState('');
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<any[]>([]);
  const [medicosDisponibles, setMedicosDisponibles] = useState<AsignacionCompleta[]>([]);

  // Estado para edición de paciente
  const [isEditingPatient, setIsEditingPatient] = useState(false);

  // Cargar pacientes
  useEffect(() => {
    if (isOpen) {
      loadPacientes();
    }
  }, [isOpen]);

  // Pre-llenar datos cuando se edita
  useEffect(() => {
    if (isOpen && citaEditar) {
      // Si estamos en modo edición, ir directamente a detalles
      setStep('detalles');
      setSelectedPacienteId(citaEditar.id_paciente.toString());
      setSelectedAsignacion(citaEditar.id_usuario_sucursal.toString());
      setFecha(citaEditar.fecha_cita);
      setHoraInicio(citaEditar.hora_inicio.substring(0, 5));
      setDuracion(citaEditar.duracion_minutos.toString());
      setTipoCita(citaEditar.tipo_cita);
      setMotivoConsulta(citaEditar.motivo_consulta);

      // Si es secretaria, establecer la sucursal y cargar médicos
      if (esSecretaria && citaEditar.usuario_sucursal?.sucursal?.id_sucursal) {
        const idSucursal = citaEditar.usuario_sucursal.sucursal.id_sucursal.toString();
        setSucursalSecretaria(idSucursal);

        // Cargar médicos de esa sucursal para que estén disponibles en el selector
        const cargarMedicos = async () => {
          const medicos = await getMedicosBySucursal(citaEditar.usuario_sucursal.sucursal.id_sucursal);
          setMedicosDisponibles(medicos);
          setAsignaciones(medicos);
        };
        cargarMedicos();
      }
    }
  }, [isOpen, citaEditar, esSecretaria]);

  // Auto-llenar sucursal cuando se abre formulario nuevo paciente
  useEffect(() => {
    if (step === 'nuevoPaciente' && asignaciones.length > 0) {
      // Obtener la sucursal activa desde localStorage
      const sucursalId = localStorage.getItem('currentSucursalId');

      if (sucursalId) {
        const asignacionActiva = asignaciones.find(
          a => a.id_sucursal === parseInt(sucursalId)
        );

        if (asignacionActiva) {
          setNuevoPaciente(prev => ({
            ...prev,
            id_sucursal: asignacionActiva.id_sucursal,
            nombre_sucursal: `${asignacionActiva.compania.nombre} - ${asignacionActiva.sucursal.nombre}`
          }));
          console.log('✅ Auto-llenada sucursal para nuevo paciente:', asignacionActiva.sucursal.nombre);
        }
      }
    }
  }, [step, asignaciones]);

  const loadPacientes = async () => {
    // Obtener id_compania desde localStorage para filtrar
    const companiaId = localStorage.getItem('currentCompaniaId');
    if (companiaId) {
      const { getPacientesByCompania } = await import('../lib/pacientesService');
      const data = await getPacientesByCompania(parseInt(companiaId));
      setPacientes(data);
    } else {
      const data = await getAllPacientes();
      setPacientes(data);
    }
  };

  const loadAsignaciones = async () => {
    if (!idUsuarioActual) return;
    const data = await getAsignacionesCompletasByUsuario(idUsuarioActual);

    // Filtrar solo la asignación de la sucursal actual
    const sucursalId = localStorage.getItem('currentSucursalId');
    const asignacionActual = sucursalId
      ? data.filter(a => a.id_sucursal === parseInt(sucursalId))
      : data;

    setAsignaciones(asignacionActual);

    // Seleccionar automáticamente la asignación de la sucursal actual
    if (asignacionActual.length > 0 && !selectedAsignacion) {
      setSelectedAsignacion(asignacionActual[0].id_usuario_sucursal.toString());
      console.log('✅ Auto-seleccionada sucursal actual:', asignacionActual[0].sucursal.nombre);
    }
  };

  // FUNCIONES PARA SECRETARIA
  const loadSucursales = async () => {
    const companiaId = localStorage.getItem('currentCompaniaId');
    if (companiaId) {
      console.log('📍 Cargando sucursales para secretaria...');
      const data = await getSucursalesByCompania(parseInt(companiaId));
      setSucursalesDisponibles(data);
      console.log('✅ Sucursales cargadas:', data.length);

      // Auto-seleccionar la primera sucursal
      if (data.length > 0 && !modoEdicion) {
        const primeraSucursal = (data as any)[0].id_sucursal.toString();
        setSucursalSecretaria(primeraSucursal);
        console.log('✅ Auto-seleccionada primera sucursal:', (data as any)[0].nombre);

        // Cargar médicos de la primera sucursal
        const medicos = await getMedicosBySucursal((data as any)[0].id_sucursal);
        console.log('✅ Médicos cargados automáticamente:', medicos.length);
        setMedicosDisponibles(medicos);
        setAsignaciones(medicos);
      }
    }
  };

  const handleSucursalChange = async (sucursalId: string) => {
    console.log('🔄 Cambiando sucursal:', sucursalId);
    setSucursalSecretaria(sucursalId);
    setSelectedAsignacion(''); // Reset médico
    setFecha(''); // Reset fecha
    setHoraInicio(''); // Reset hora
    setMedicosDisponibles([]); // Reset médicos

    // Cargar médicos de la sucursal seleccionada
    const medicos = await getMedicosBySucursal(parseInt(sucursalId));
    console.log('✅ Médicos cargados:', medicos.length);
    setMedicosDisponibles(medicos);
    setAsignaciones(medicos); // Para que funcione el hook de horarios
  };

  // Cargar sucursales cuando es secretaria y abre el modal
  useEffect(() => {
    if (isOpen && esSecretaria && step === 'detalles') {
      loadSucursales();
    } else if (isOpen && !esSecretaria) {
      // Si NO es secretaria, cargar asignaciones normalmente
      if (idUsuarioActual) {
        loadAsignaciones();
      }
    }
  }, [isOpen, esSecretaria, step, idUsuarioActual]);

  // Hook de horarios para la asignación seleccionada
  const idAsignacionNum = selectedAsignacion ? parseInt(selectedAsignacion) : null;
  console.log('🎯 AgendarCitaModal - selectedAsignacion:', selectedAsignacion);
  console.log('🎯 AgendarCitaModal - idAsignacionNum:', idAsignacionNum);
  const { diasSemana, precio, verificarDisponibilidadHorario } = useHorarios(idAsignacionNum);

  console.log('💰 AgendarCitaModal - Precio recibido del hook:', precio);
  console.log('📅 AgendarCitaModal - Días de semana recibidos:', diasSemana.length);

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(paciente => {
    const searchLower = searchPaciente.toLowerCase();
    return (
      paciente.nombres.toLowerCase().includes(searchLower) ||
      paciente.apellidos.toLowerCase().includes(searchLower) ||
      paciente.cedula.includes(searchLower)
    );
  });

  // Calcular hora fin
  const calcularHoraFin = (inicio: string, duracionMin: string) => {
    if (!inicio || !duracionMin) return '';

    const [horas, minutos] = inicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + parseInt(duracionMin);

    const horasFin = Math.floor(totalMinutos / 60);
    const minutosFin = totalMinutos % 60;

    return `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
  };

  // Validar disponibilidad del día
  const isDiaDisponible = (fechaSeleccionada: string) => {
    if (!fechaSeleccionada || diasSemana.length === 0) return false;

    const fecha = new Date(fechaSeleccionada + 'T00:00:00');
    const diaSemanaNumero = fecha.getDay(); // 0=domingo, 1=lunes, 2=martes...

    console.log('🔍 Verificando disponibilidad:', {
      fechaSeleccionada,
      diaSemanaNumero,
      diasDisponibles: diasSemana.map(d => d.dia_semana),
      diasSemanaCompleto: diasSemana
    });

    // Comparar números con números
    return diasSemana.some(d => d.dia_semana === diaSemanaNumero);
  };

  // Obtener horarios disponibles para el día seleccionado
  const getHorariosDisponibles = () => {
    if (!fecha || diasSemana.length === 0) return [];

    const fechaDate = new Date(fecha + 'T00:00:00');
    const diaSemanaNumero = fechaDate.getDay(); // 0=domingo, 1=lunes, 2=martes...

    const diaConfig = diasSemana.find(d => d.dia_semana === diaSemanaNumero);
    if (!diaConfig) return [];

    // Usar la duración configurada en lugar de 15 minutos fijos
    const duracionConsulta = diaConfig.duracion_consulta || 30;
    console.log('⏱️ Duración de consulta configurada:', duracionConsulta, 'minutos');

    return generarHorariosDisponibles(diaConfig.hora_inicio, diaConfig.hora_fin, duracionConsulta);
  };

  const horariosDisponibles = getHorariosDisponibles();

  // Función para generar el rango de horario (ej: "8:00 - 8:30")
  const generarRangoHorario = (horaInicio: string, duracionMinutos: number): string => {
    const horaFin = calcularHoraFin(horaInicio, duracionMinutos.toString());
    return `${horaInicio} - ${horaFin}`;
  };

  // Obtener la duración configurada para el día seleccionado
  const getDuracionConfigurada = (): number => {
    if (!fecha || diasSemana.length === 0) return 30;

    const fechaDate = new Date(fecha + 'T00:00:00');
    const diaSemanaNumero = fechaDate.getDay();

    const diaConfig = diasSemana.find(d => d.dia_semana === diaSemanaNumero);
    return diaConfig?.duracion_consulta || 30;
  };

  // Consultar datos de registro civil al perder foco en cédula
  const handleBlurCedula = async () => {
    const cedula = nuevoPaciente.cedula;
    if (!cedula || cedula.length < 10) return;

    setIsSearchingCedula(true);
    try {
      const datos = await consultarCedulaRegistroCivil(cedula);
      if (datos) {
        setNuevoPaciente(prev => ({
          ...prev,
          nombres: datos.nombres || prev.nombres,
          apellidos: datos.apellidos || prev.apellidos,
          fecha_nacimiento: datos.fecha_nacimiento || prev.fecha_nacimiento,
          sexo: datos.sexo,
          direccion: datos.direccion || prev.direccion
        }));
        toast.success('Datos encontrados y cargados');
      }
    } catch (error) {
      console.error('Error al consultar cédula:', error);
    } finally {
      setIsSearchingCedula(false);
    }
  };

  // Preparar edición de paciente
  const handleEditPaciente = () => {
    const pacienteData = citaEditar?.paciente || pacientes.find(p => p.id_paciente.toString() === selectedPacienteId);

    if (pacienteData) {
      setNuevoPaciente({
        nombres: pacienteData.nombres,
        apellidos: pacienteData.apellidos,
        cedula: pacienteData.cedula,
        fecha_nacimiento: pacienteData.fecha_nacimiento || '',
        sexo: pacienteData.sexo,
        telefono: pacienteData.telefono || '',
        email: pacienteData.email || '',
        direccion: pacienteData.direccion || '',
        id_sucursal: null,
        nombre_sucursal: ''
      });
      setIsEditingPatient(true);
      setStep('nuevoPaciente');
    }
  };

  // Crear o Actualizar paciente
  const handleCrearPaciente = async () => {
    if (!nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.cedula) {
      toast.error('Complete los campos obligatorios (Nombres, Apellidos, Cédula)');
      return;
    }

    setIsLoading(true);

    try {
      // Obtener id_compania desde localStorage
      const companiaId = localStorage.getItem('currentCompaniaId');
      if (!companiaId) {
        toast.error('Error: No se pudo obtener la compañía actual');
        setIsLoading(false);
        return;
      }

      // Importar la función directamente
      const { createPaciente } = await import('../lib/pacientesService');

      let resultado = null;

      if (isEditingPatient && selectedPacienteId) {
        // ACTUALIZAR PACIENTE
        const success = await updatePaciente(parseInt(selectedPacienteId), {
          nombres: nuevoPaciente.nombres,
          apellidos: nuevoPaciente.apellidos,
          cedula: nuevoPaciente.cedula,
          fecha_nacimiento: nuevoPaciente.fecha_nacimiento,
          sexo: nuevoPaciente.sexo as 'M' | 'F' | 'Otro',
          telefono: nuevoPaciente.telefono || null,
          email: nuevoPaciente.email || null,
          direccion: nuevoPaciente.direccion || null,
        });

        if (success) {
          toast.success('Paciente actualizado exitosamente');
          // Retornar a detalles
          await loadPacientes(); // Recargar lista
          setStep('detalles');
          setIsEditingPatient(false);
          return; // Salir, no necesitamos hacer lo de abajo
        } else {
          toast.error('Error al actualizar el paciente');
        }
      } else {
        // CREAR PACIENTE
        const pacienteCreado = await createPaciente({
          id_compania: parseInt(companiaId),
          nombres: nuevoPaciente.nombres,
          apellidos: nuevoPaciente.apellidos,
          cedula: nuevoPaciente.cedula,
          fecha_nacimiento: nuevoPaciente.fecha_nacimiento || new Date().toISOString().split('T')[0],
          sexo: nuevoPaciente.sexo as 'M' | 'F' | 'Otro',
          telefono: nuevoPaciente.telefono || null,
          email: nuevoPaciente.email || null,
          direccion: nuevoPaciente.direccion || null,
          fecha_registro: new Date().toISOString().split('T')[0]
        });

        if (pacienteCreado) {
          resultado = pacienteCreado;
          toast.success('Paciente creado exitosamente');

          // Recargar lista de pacientes
          await loadPacientes();

          // Seleccionar automáticamente el nuevo paciente
          setSelectedPacienteId(pacienteCreado.id_paciente.toString());

          // Limpiar formulario y volver
          setNuevoPaciente({
            nombres: '',
            apellidos: '',
            cedula: '',
            fecha_nacimiento: '',
            sexo: 'M',
            telefono: '',
            email: '',
            direccion: '',
            id_sucursal: null,
            nombre_sucursal: ''
          });

          // Si se creó, usualmente volvemos a selección o vamos a detalles?
          // El flujo original iba a 'paciente' (selección), podemos mantenerlo o ir a detalles
          setStep('paciente');
        } else {
          toast.error('Error al crear el paciente');
        }
      }
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      toast.error('Error al guardar el paciente');
    }

    setIsLoading(false);
  };

  // Manejar siguiente paso
  const handleNextStep = () => {
    if (!selectedPacienteId) {
      toast.error('Por favor seleccione un paciente');
      return;
    }
    setStep('detalles');
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!selectedAsignacion || !fecha || !horaInicio || !motivoConsulta) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    const horaFin = calcularHoraFin(horaInicio, duracion);

    // Verificar disponibilidad (solo si no estamos editando o si cambió el horario)
    if (!modoEdicion ||
      (citaEditar && (citaEditar.fecha_cita !== fecha || citaEditar.hora_inicio !== horaInicio))) {
      const disponible = await verificarDisponibilidadHorario(fecha, horaInicio, horaFin);

      if (!disponible) {
        toast.error('El horario seleccionado no está disponible');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (modoEdicion && citaEditar) {
        // MODO EDICIÓN
        console.log('✏️ Actualizando cita ID:', citaEditar.id_cita);

        const updates = {
          fecha_cita: fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          duracion_minutos: parseInt(duracion),
          tipo_cita: tipoCita,
          motivo_consulta: motivoConsulta,
        };

        const resultado = await updateCita(citaEditar.id_cita, updates);

        if (resultado) {
          toast.success('Cita modificada exitosamente');
          onCitaAgendada();
          handleClose();
        } else {
          toast.error('Error al modificar la cita');
        }
      } else {
        // MODO CREACIÓN
        // Obtener id_sucursal de la asignación seleccionada
        const asignacionSeleccionada = asignaciones.find(
          a => a.id_usuario_sucursal === parseInt(selectedAsignacion)
        );

        if (!asignacionSeleccionada) {
          toast.error('Error: No se encontró la asignación seleccionada');
          setIsLoading(false);
          return;
        }

        // Obtener id_consultorio desde los días de semana configurados
        const fechaDate = new Date(fecha + 'T00:00:00');
        const diaSemana = fechaDate.getDay();

        console.log('🔍 Buscando consultorio:', {
          fechaSeleccionada: fecha,
          diaSemanaCalculado: diaSemana,
          diasSemanaDisponibles: diasSemana,
          totalDias: diasSemana.length
        });

        const diaConfig = diasSemana.find(d => d.dia_semana === diaSemana);

        console.log('📍 Configuración encontrada:', diaConfig);

        if (!diaConfig) {
          toast.error('No se encontró configuración del consultorio para este día');
          setIsLoading(false);
          return;
        }

        if (!diaConfig.id_consultorio) {
          console.error('❌ ERROR: diaConfig.id_consultorio es NULL o undefined');
          toast.error('Error: No hay consultorio asignado para este día');
          setIsLoading(false);
          return;
        }

        console.log('📋 Datos de la cita a crear:', {
          id_paciente: parseInt(selectedPacienteId),
          id_usuario_sucursal: parseInt(selectedAsignacion),
          id_sucursal: asignacionSeleccionada.id_sucursal,
          id_consultorio: diaConfig.id_consultorio,
          fecha_cita: fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          duracion_minutos: parseInt(duracion),
          tipo_cita: tipoCita,
          motivo_consulta: motivoConsulta,
          estado_cita: 'agendada',
          precio_cita: precio
        });

        const nuevaCita = await createCita({
          id_paciente: parseInt(selectedPacienteId),
          id_usuario_sucursal: parseInt(selectedAsignacion),
          id_sucursal: asignacionSeleccionada.id_sucursal,
          id_consultorio: diaConfig.id_consultorio,
          fecha_cita: fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          duracion_minutos: parseInt(duracion),
          tipo_cita: tipoCita,
          motivo_consulta: motivoConsulta,
          estado_cita: 'agendada',
          precio_cita: precio
        });

        if (nuevaCita) {
          toast.success('Cita agendada exitosamente');
          onCitaAgendada();
          handleClose();
        } else {
          toast.error('Error al agendar la cita');
        }
      }
    } catch (error) {
      console.error('Error al procesar cita:', error);
      toast.error(modoEdicion ? 'Error al modificar la cita' : 'Error al agendar la cita');
    }

    setIsLoading(false);
  };

  // Cerrar modal y resetear
  const handleClose = () => {
    setStep('paciente');
    setSearchPaciente('');
    setSelectedPacienteId('');
    setSelectedAsignacion('');
    setFecha('');
    setHoraInicio('');
    setDuracion('30');
    setTipoCita('consulta');
    setMotivoConsulta('');
    setNuevoPaciente({
      nombres: '',
      apellidos: '',
      cedula: '',
      fecha_nacimiento: '',
      sexo: 'M',
      telefono: '',
      email: '',
      direccion: '',
      id_sucursal: null,
      nombre_sucursal: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'paciente' && 'Seleccionar Paciente'}
            {step === 'nuevoPaciente' && (isEditingPatient ? 'Editar Datos del Paciente' : 'Registrar Nuevo Paciente')}
            {step === 'detalles' && (modoEdicion ? 'Modificar Cita' : 'Detalles de la Cita')}
          </DialogTitle>
          <DialogDescription>
            {step === 'paciente' && 'Busque y seleccione el paciente para la cita'}
            {step === 'nuevoPaciente' && 'Complete los datos del nuevo paciente'}
            {step === 'detalles' && (modoEdicion ? 'Modifique los datos de la cita médica' : 'Complete la información de la cita médica')}
          </DialogDescription>
        </DialogHeader>

        {step === 'paciente' ? (
          <div className="space-y-4">
            {/* Buscador y Botón Nuevo Paciente */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={searchPaciente}
                  onChange={(e) => setSearchPaciente(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setIsEditingPatient(false);
                  setStep('nuevoPaciente');
                }}
                className="bg-gray-900 hover:bg-gray-800 whitespace-nowrap"
              >
                <Plus className="size-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>

            {/* Lista de pacientes */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pacientesFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchPaciente ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </div>
              )}

              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id_paciente}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPacienteId === paciente.id_paciente.toString()
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => setSelectedPacienteId(paciente.id_paciente.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {paciente.nombres} {paciente.apellidos}
                      </p>
                      <p className="text-sm text-gray-500">
                        {paciente.cedula} • {paciente.telefono || 'Sin teléfono'}
                      </p>
                    </div>
                    {selectedPacienteId === paciente.id_paciente.toString() && (
                      <div className="text-blue-600">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : step === 'nuevoPaciente' ? (
          <div className="space-y-4">
            {/* Formulario Nuevo Paciente */}
            <div className="grid grid-cols-2 gap-4">
              {/* Campo Sucursal (solo lectura) */}
              <div className="space-y-2 col-span-2">
                <Label>Sucursal *</Label>
                <Input
                  value={nuevoPaciente.nombre_sucursal}
                  disabled
                  className="bg-gray-50 text-gray-600"
                  placeholder="Cargando sucursal..."
                />
                <p className="text-xs text-gray-500">Se asignará automáticamente a su sucursal actual</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Cédula *</Label>
                  {isSearchingCedula && <span className="text-xs text-blue-600 flex items-center"><Loader2 className="size-3 animate-spin mr-1" /> Buscando...</span>}
                </div>
                <Input
                  value={nuevoPaciente.cedula}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, cedula: e.target.value })}
                  onBlur={handleBlurCedula}
                  placeholder="0000000000"
                />
              </div>

              <div className="space-y-2">
                <Label>Nombres *</Label>
                <Input
                  value={nuevoPaciente.nombres}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombres: e.target.value })}
                  placeholder="Nombres"
                />
              </div>

              <div className="space-y-2">
                <Label>Apellidos *</Label>
                <Input
                  value={nuevoPaciente.apellidos}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellidos: e.target.value })}
                  placeholder="Apellidos"
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={nuevoPaciente.fecha_nacimiento}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, fecha_nacimiento: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select
                  value={nuevoPaciente.sexo}
                  onValueChange={(value: string) => setNuevoPaciente({ ...nuevoPaciente, sexo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={nuevoPaciente.telefono}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                  placeholder="0999999999"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={nuevoPaciente.email}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })}
                  placeholder="paciente@email.com"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Dirección</Label>
                <Input
                  value={nuevoPaciente.direccion}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, direccion: e.target.value })}
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header con Paciente y Botón Editar */}
            <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Paciente</p>
                <p className="font-medium text-gray-900">
                  {(() => {
                    const pacienteActual = pacientes.find(p => p.id_paciente.toString() === selectedPacienteId);
                    if (pacienteActual) {
                      return `${pacienteActual.nombres} ${pacienteActual.apellidos}`;
                    }
                    return citaEditar?.paciente
                      ? `${citaEditar.paciente.nombres} ${citaEditar.paciente.apellidos}`
                      : '';
                  })()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleEditPaciente} className="h-8 w-8 p-0">
                <Pencil className="size-4 text-gray-500 hover:text-blue-600" />
              </Button>
            </div>

            {/* Sucursal - DIFERENTE PARA SECRETARIA */}
            {esSecretaria ? (
              <>
                {/* Selector de Sucursal para Secretaria */}
                <div className="space-y-2">
                  <Label>Sucursal *</Label>
                  <Select
                    value={sucursalSecretaria}
                    onValueChange={handleSucursalChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      {sucursalesDisponibles.map((suc) => (
                        <SelectItem key={suc.id_sucursal} value={suc.id_sucursal.toString()}>
                          {suc.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {modoEdicion ? 'La sucursal no puede modificarse' : 'Seleccione la sucursal donde se realizará la cita'}
                  </p>
                </div>

                {/* Selector de Médico para Secretaria */}
                {sucursalSecretaria && (
                  <div className="space-y-2">
                    <Label>Médico *</Label>
                    <Select
                      value={selectedAsignacion}
                      onValueChange={setSelectedAsignacion}
                      disabled={!sucursalSecretaria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione médico" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicosDisponibles.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">
                            No hay médicos disponibles en esta sucursal
                          </div>
                        ) : (
                          medicosDisponibles.map((medico: any) => (
                            <SelectItem
                              key={medico.id_usuario_sucursal}
                              value={medico.id_usuario_sucursal.toString()}
                            >
                              Dr. {medico.usuario.nombre} {medico.usuario.apellido} - {medico.especialidad}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {modoEdicion ? 'El médico no puede modificarse' : 'Seleccione el médico para la cita'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Campo de sucursal deshabilitado para médicos */
              <div className="space-y-2">
                <Label>Sucursal *</Label>
                <Input
                  value={asignaciones.length > 0 ? `${asignaciones[0].compania.nombre} - ${asignaciones[0].sucursal.nombre}` : 'Cargando...'}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500">
                  {modoEdicion ? 'La sucursal no puede modificarse' : 'Se usará automáticamente su sucursal actual'}
                </p>
              </div>
            )}

            {/* Fecha */}
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setHoraInicio(''); // Reset hora cuando cambia la fecha
                }}
                min={new Date().toISOString().split('T')[0]}
              />
              {fecha && !isDiaDisponible(fecha) && (
                <p className="text-xs text-red-500">
                  Este día no tiene horario de atención configurado
                </p>
              )}
            </div>

            {/* Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de Inicio *</Label>
                <Select
                  value={horaInicio}
                  onValueChange={setHoraInicio}
                  disabled={!fecha || !isDiaDisponible(fecha)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponibles.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {generarRangoHorario(hora, getDuracionConfigurada())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duración (minutos) *</Label>
                <Select value={duracion} onValueChange={setDuracion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hora Fin (calculada) */}
            {horaInicio && (
              <div className="text-sm text-gray-600">
                Hora de finalización: <span className="font-semibold">{calcularHoraFin(horaInicio, duracion)}</span>
              </div>
            )}

            {/* Tipo de Cita */}
            <div className="space-y-2">
              <Label>Tipo de Cita *</Label>
              <Select value={tipoCita} onValueChange={(value: any) => setTipoCita(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="control">Control</SelectItem>
                  <SelectItem value="primera_vez">Primera Vez</SelectItem>
                  <SelectItem value="emergencia">Emergencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label>Motivo de Consulta *</Label>
              <Textarea
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                placeholder="Describa brevemente el motivo de la consulta"
                rows={3}
              />
            </div>

            {/* Precio */}
            {selectedAsignacion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm">
                  <span className="text-gray-600">Precio de consulta:</span>{' '}
                  <span className="font-semibold text-blue-700">${precio.toFixed(2)}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {/* Botón Atrás */}
          {step === 'detalles' && !modoEdicion && (
            <Button variant="outline" onClick={() => setStep('paciente')}>
              Atrás
            </Button>
          )}
          {step === 'nuevoPaciente' && (
            <Button variant="outline" onClick={() => setStep('paciente')}>
              Atrás
            </Button>
          )}

          {/* Botón Cancelar */}
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          {/* Botones de acción según paso */}
          {step === 'paciente' && (
            <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700">
              Siguiente
            </Button>
          )}

          {step === 'nuevoPaciente' && (
            <Button
              onClick={handleCrearPaciente}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : (isEditingPatient ? 'Actualizar Paciente' : 'Guardar Paciente')}
            </Button>
          )}

          {step === 'detalles' && (
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading
                ? (modoEdicion ? 'Modificando...' : 'Agendando...')
                : (modoEdicion ? 'Modificar Cita' : 'Agendar Cita')
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}