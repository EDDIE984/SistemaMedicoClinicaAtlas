// Vista de Pacientes integrada con Supabase
import { useState, useEffect } from 'react';
import { usePacientes, useSignosVitales, calcularIMC, calcularEdad, getIniciales } from '../hooks/usePacientes';
import type { Paciente, SignoVital, ArchivoMedico } from '../lib/pacientesService';
import { getArchivosByPaciente, createArchivoMedico, deleteArchivoMedico, getAntecedentesByPaciente, saveAntecedente } from '../lib/pacientesService';
import { getCitasByPaciente, formatearFecha, formatearHora, getColorEstado, marcarCitaCompletada, type CitaCompleta } from '../lib/citasService';
import { crearConsultaMedica, getConsultaMedicaByCita, type ConsultaMedica } from '../lib/consultasService.ts';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  User,
  Search,
  Activity,
  Ruler,
  Weight,
  Thermometer,
  Heart,
  Wind,
  Droplet,
  Plus,
  FileText,
  Calendar,
  Loader2,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { AntecedentesView } from './AntecedentesView';
import { ArchivosMedicosSection } from './ArchivosMedicosSection';
import { SupabaseIndicator } from './SupabaseIndicator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "./ui/utils";

// Helper para formatear el sexo
const formatearSexo = (sexo: 'M' | 'F' | 'Otro'): string => {
  switch (sexo) {
    case 'M': return 'Masculino';
    case 'F': return 'Femenino';
    case 'Otro': return 'Otro';
    default: return sexo;
  }
};

interface PacientesViewProps {
  currentUser?: { email: string } | null;
  pacienteIdInicial?: string | null;
  citaIdInicial?: number | null;
  onConsultaCompletada?: () => void;
}

export function PacientesViewSupabase({
  currentUser,
  pacienteIdInicial,
  citaIdInicial,
  onConsultaCompletada
}: PacientesViewProps) {
  // Obtener id_compania desde localStorage
  const [idCompania, setIdCompania] = useState<number | null>(null);

  useEffect(() => {
    const companiaId = localStorage.getItem('currentCompaniaId');
    if (companiaId) {
      setIdCompania(parseInt(companiaId));
    }
  }, [currentUser]);

  const { pacientes, isLoading, buscarPacientes, crearPaciente, clearPacientes } = usePacientes(idCompania || undefined, { initialLoad: false });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isSignosVitalesDialogOpen, setIsSignosVitalesDialogOpen] = useState(false);
  const [isConsultaDialogOpen, setIsConsultaDialogOpen] = useState(false);
  const [isSavingConsulta, setIsSavingConsulta] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);


  // Estado para citas del paciente seleccionado
  const [citasPaciente, setCitasPaciente] = useState<CitaCompleta[]>([]);
  const [isLoadingCitas, setIsLoadingCitas] = useState(false);

  // Estado para consultas médicas indexadas por id_cita
  const [consultasPorCita, setConsultasPorCita] = useState<Record<number, ConsultaMedica>>({});

  // Estado para controlar qué citas están expandidas en el historial
  const [citasExpandidas, setCitasExpandidas] = useState<Set<number>>(new Set());

  // Estado para controlar el índice de signos vitales visible para cada paciente
  const [signosVitalesIndex, setSignosVitalesIndex] = useState<Record<number, number>>({});

  // Estado para antecedentes del paciente seleccionado
  const [antecedentesData, setAntecedentesData] = useState<any>(null);
  const [isLoadingAntecedentes, setIsLoadingAntecedentes] = useState(false);

  // Hook para signos vitales del paciente seleccionado
  const { signosVitales, guardarSignoVital } = useSignosVitales(selectedPatientId);

  // Formulario de nuevo paciente
  const [newPatient, setNewPatient] = useState({
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: 'M' as 'M' | 'F' | 'Otro',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  // Formulario de signos vitales
  const [signosVitalesForm, setSignosVitalesForm] = useState({
    estatura_cm: '',
    peso_kg: '',
    temperatura_c: '',
    frecuencia_respiratoria: '',
    frecuencia_cardiaca: '',
    presion_sistolica: '',
    presion_diastolica: '',
    saturacion_oxigeno: '',
    notas: ''
  });

  // Formulario de consulta médica
  const [consultaForm, setConsultaForm] = useState({
    motivo_consulta: '',
    historial_clinico: '',
    receta_medica: '',
    pedido_examenes: ''
  });

  // Sucursal seleccionada para crear la consulta
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null);
  const [sucursales, setSucursales] = useState<any[]>([]);

  // Efecto de búsqueda automática REMOVIDO para usar botón manual
  // useEffect(() => {... }, [searchTerm]);

  // Expandir automáticamente el paciente cuando se inicia desde la agenda
  useEffect(() => {
    if (pacienteIdInicial) {
      const pacienteId = parseInt(pacienteIdInicial);
      if (!isNaN(pacienteId)) {
        setExpandedPatientId(pacienteId);
        setSelectedPatientId(pacienteId);
      }
    }
  }, [pacienteIdInicial]);

  // Inicializar configuración del usuario (crear asignación de sucursal si no existe)
  useEffect(() => {
    const inicializarConfiguracion = async () => {
      if (!currentUser) return;

      try {
        // Obtener el usuario de Supabase
        const { data: usuarioData } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('email', currentUser.email)
          .single() as any;

        if (!usuarioData) return;

        // Verificar si tiene asignación de sucursal activa
        const { data: asignacionData } = await supabase
          .from('usuario_sucursal')
          .select('*')
          .eq('id_usuario', usuarioData.id_usuario)
          .eq('estado', 'activo')
          .single() as any;

        if (!asignacionData) {
          // Buscar o crear sucursal predeterminada
          let { data: sucursalData } = await supabase
            .from('sucursal')
            .select('*')
            .eq('estado', 'activo')
            .limit(1)
            .single() as any;

          if (!sucursalData) {
            const { data: nuevaSucursal } = await supabase
              .from('sucursal')
              .insert({
                nombre: 'Sucursal Principal',
                direccion: 'Dirección por configurar',
                telefono: '',
                email: '',
                es_principal: true,
                estado: 'activo'
              } as any)
              .select()
              .single() as any;

            sucursalData = nuevaSucursal;
          }

          if (sucursalData) {
            // Crear asignación de usuario-sucursal
            const { data: nuevaAsignacion } = await supabase
              .from('usuario_sucursal')
              .insert({
                id_usuario: usuarioData.id_usuario,
                id_sucursal: sucursalData.id_sucursal,
                especialidad: 'Medicina General',
                estado: 'activo'
              } as any)
              .select()
              .single() as any;

            if (nuevaAsignacion) {
              // Crear precio predeterminado
              await supabase
                .from('precio_usuario_sucursal')
                .insert({
                  id_usuario_sucursal: nuevaAsignacion.id_usuario_sucursal,
                  precio_consulta: 50.00,
                  duracion_consulta: 30,
                  estado: 'activo'
                } as any);
            }
          }
        }
      } catch (error) {
        // Silenciar errores de configuración inicial
      }
    };

    inicializarConfiguracion();
  }, [currentUser]);

  // Cargar antecedentes del paciente seleccionado
  useEffect(() => {
    const cargarAntecedentes = async () => {
      if (!selectedPatientId) {
        setAntecedentesData(null);
        return;
      }

      setIsLoadingAntecedentes(true);
      try {
        const antecedentes = await getAntecedentesByPaciente(selectedPatientId);
        setAntecedentesData(antecedentes);
      } catch (error) {
        console.error('Error al cargar antecedentes:', error);
      } finally {
        setIsLoadingAntecedentes(false);
      }
    };

    cargarAntecedentes();
  }, [selectedPatientId]);

  // Cargar sucursales disponibles
  useEffect(() => {
    const cargarSucursales = async () => {
      const { data, error } = await supabase
        .from('sucursal')
        .select('id_sucursal, nombre, direccion, estado')
        .eq('estado', 'activo')
        .order('nombre', { ascending: true }) as any;

      if (error) {
        console.error('Error al cargar sucursales:', error);
        toast.error('Error al cargar sucursales');
      } else if (data) {
        console.log('Sucursales cargadas:', data);
        setSucursales(data);
        // Seleccionar la primera sucursal por defecto
        if (data.length > 0) {
          setSucursalSeleccionada(data[0].id_sucursal);
        }
      }
    };

    cargarSucursales();
  }, []);

  // Cargar citas del paciente seleccionado
  useEffect(() => {
    const cargarCitas = async () => {
      if (selectedPatientId) {
        setIsLoadingCitas(true);
        const citas = await getCitasByPaciente(selectedPatientId);
        setCitasPaciente(citas);

        // Cargar consultas médicas para cada cita
        const consultasMap: Record<number, ConsultaMedica> = {};
        for (const cita of citas) {
          const consulta = await getConsultaMedicaByCita(cita.id_cita);
          if (consulta) {
            consultasMap[cita.id_cita] = consulta;
          }
        }
        setConsultasPorCita(consultasMap);

        setIsLoadingCitas(false);
      } else {
        setCitasPaciente([]);
        setConsultasPorCita({});
      }
    };

    cargarCitas();
  }, [selectedPatientId]);

  // Pacientes filtrados
  const pacientesFiltrados = searchTerm
    ? pacientes
    : pacientes;

  // Toggle expansión de paciente
  const handleToggleExpand = (id: number) => {
    if (expandedPatientId === id) {
      setExpandedPatientId(null);
      setSelectedPatientId(null);
    } else {
      setExpandedPatientId(id);
      setSelectedPatientId(id);
    }
  };

  // Crear nuevo paciente
  const handleCreatePatient = async () => {
    if (!newPatient.nombres || !newPatient.apellidos || !newPatient.cedula) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (!idCompania) {
      toast.error('Error: No se pudo obtener la compañía actual');
      return;
    }

    try {
      const nuevoPaciente = await crearPaciente({
        ...newPatient,
        id_compania: idCompania,
        email: newPatient.email || null,
        telefono: newPatient.telefono || null,
        direccion: newPatient.direccion || null,
        fecha_registro: new Date().toISOString().split('T')[0],
        estado: 'activo'
      });

      if (nuevoPaciente) {
        toast.success('Paciente creado exitosamente');
        setIsNewPatientDialogOpen(false);
        setNewPatient({
          nombres: '',
          apellidos: '',
          fecha_nacimiento: '',
          sexo: 'M',
          cedula: '',
          email: '',
          telefono: '',
          direccion: '',
        });
      } else {
        toast.error('Error al crear paciente');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'CEDULA_DUPLICADA') {
        toast.error(`Ya existe un paciente con la cédula ${newPatient.cedula} en esta compañía. Buscando paciente existente...`, {
          duration: 5000
        });
        setIsNewPatientDialogOpen(false);
        // Buscar el paciente automáticamente
        await buscarPacientes(newPatient.cedula);
      } else {
        toast.error('Error al crear paciente');
      }
    }
  };

  // Guardar signos vitales
  const handleSaveSignosVitales = async () => {
    if (!selectedPatientId) {
      toast.error('No hay paciente seleccionado');
      return;
    }

    // Validar y limpiar todos los valores numéricos para evitar overflow
    const validarNumero = (valor: string | undefined, esDecimal: boolean = false): number | null => {
      if (!valor || valor.trim() === '') return null;
      const num = esDecimal ? parseFloat(valor) : parseInt(valor);
      if (isNaN(num)) return null;
      // Limitar a 999.99 máximo (NUMERIC(5,2))
      return Math.min(999.99, Math.max(-999.99, Math.round(num * 100) / 100));
    };

    const peso = validarNumero(signosVitalesForm.peso_kg, true);
    const estatura = validarNumero(signosVitalesForm.estatura_cm, true);

    const signoVital: Omit<SignoVital, 'id_signo_vital' | 'created_at'> = {
      id_paciente: selectedPatientId,
      fecha_registro: new Date().toISOString(),
      estatura_cm: estatura,
      peso_kg: peso,
      imc: estatura && peso ? calcularIMC(peso, estatura) : null,
      temperatura_c: validarNumero(signosVitalesForm.temperatura_c, true),
      frecuencia_respiratoria: validarNumero(signosVitalesForm.frecuencia_respiratoria, false),
      frecuencia_cardiaca: validarNumero(signosVitalesForm.frecuencia_cardiaca, false),
      presion_sistolica: validarNumero(signosVitalesForm.presion_sistolica, false),
      presion_diastolica: validarNumero(signosVitalesForm.presion_diastolica, false),
      saturacion_oxigeno: validarNumero(signosVitalesForm.saturacion_oxigeno, true),
      notas: signosVitalesForm.notas || null
    };

    // Debug: Verificar valores antes de enviar
    console.log('Valores de signos vitales a guardar:', signoVital);

    const resultado = await guardarSignoVital(signoVital);

    if (resultado) {
      toast.success('Signos vitales guardados exitosamente');
      setIsSignosVitalesDialogOpen(false);
      // Limpiar formulario
      setSignosVitalesForm({
        estatura_cm: '',
        peso_kg: '',
        temperatura_c: '',
        frecuencia_respiratoria: '',
        frecuencia_cardiaca: '',
        presion_sistolica: '',
        presion_diastolica: '',
        saturacion_oxigeno: '',
        notas: ''
      });
    } else {
      toast.error('Error al guardar signos vitales');
    }
  };

  // Obtener signo vital actual de un paciente según el índice
  const getSignoVitalActual = (pacienteId: number): SignoVital | null => {
    if (pacienteId === selectedPatientId && signosVitales.length > 0) {
      const index = signosVitalesIndex[pacienteId] || 0;
      return signosVitales[index] || signosVitales[0];
    }
    return null;
  };

  // Navegar entre signos vitales
  const navegarSignosVitales = (pacienteId: number, direccion: 'prev' | 'next') => {
    const currentIndex = signosVitalesIndex[pacienteId] || 0;
    const maxIndex = signosVitales.length - 1;

    if (direccion === 'prev' && currentIndex > 0) {
      setSignosVitalesIndex({ ...signosVitalesIndex, [pacienteId]: currentIndex - 1 });
    } else if (direccion === 'next' && currentIndex < maxIndex) {
      setSignosVitalesIndex({ ...signosVitalesIndex, [pacienteId]: currentIndex + 1 });
    }
  };

  // Abrir diálogo de consulta
  const handleAbrirConsulta = () => {
    if (!selectedPatientId) {
      toast.error('No hay paciente seleccionado');
      return;
    }
    // Resetear formulario y seleccionar primera sucursal por defecto
    setConsultaForm({
      motivo_consulta: '',
      historial_clinico: '',
      receta_medica: '',
      pedido_examenes: ''
    });
    if (sucursales.length > 0) {
      setSucursalSeleccionada(sucursales[0].id_sucursal);
    }
    setIsConsultaDialogOpen(true);
  };

  // Guardar o actualizar antecedentes del paciente
  const handleActualizarAntecedentes = async (pacienteIdStr: string, seccion: string, datos: any) => {
    const pacienteId = parseInt(pacienteIdStr);

    if (!pacienteId) {
      toast.error('ID de paciente inválido');
      return;
    }

    // Mapeo de claves a nombres legibles para mensajes
    const nombresLegibles: Record<string, string> = {
      esquemaVacunacion: 'Esquema de Vacunación',
      alergias: 'Alergias',
      antecedentesPatologicos: 'Antecedentes Patológicos',
      antecedentesNoPatologicos: 'Antecedentes No Patológicos',
      antecedentesHeredofamiliares: 'Antecedentes Heredofamiliares',
      antecedentesGineco: 'Antecedentes Gineco-Obstétricos',
      antecedentesperinatales: 'Antecedentes Perinatales',
      antecedentesPostnatales: 'Antecedentes Postnatales',
      antecedentesPsiquiatricos: 'Antecedentes Psiquiátricos',
      vacunas: 'Vacunas',
      medicamentos: 'Medicamentos Activos',
      dietaNutriologica: 'Dieta Nutriológica'
    };

    const nombreLegible = nombresLegibles[seccion] || seccion;

    try {
      console.log('💾 Guardando antecedente:', { pacienteId, seccion, datos });

      // Guardar usando la nueva API de kv_store
      const success = await saveAntecedente(pacienteId, seccion, datos);

      if (success) {
        toast.success(`${nombreLegible} guardado correctamente`);
        // Recargar antecedentes
        await recargarAntecedentes(pacienteId);
      } else {
        toast.error('Error al guardar antecedente');
      }
    } catch (error) {
      console.error('❌ Error al guardar antecedente:', error);
      toast.error('Error al guardar los datos');
    }
  };

  // Función auxiliar para recargar antecedentes
  const recargarAntecedentes = async (pacienteId: number) => {
    try {
      const antecedentes = await getAntecedentesByPaciente(pacienteId);
      setAntecedentesData(antecedentes);
    } catch (error) {
      console.error('Error al recargar antecedentes:', error);
    }
  };

  // Guardar consulta médica
  const handleGuardarConsulta = async () => {
    if (!selectedPatientId || !currentUser) {
      toast.error('No hay paciente o usuario seleccionado');
      return;
    }

    // Validar que el motivo de consulta esté completo
    if (!consultaForm.motivo_consulta.trim()) {
      toast.error('El motivo de consulta es obligatorio');
      return;
    }

    // Validar que al menos un campo adicional esté completo
    if (!consultaForm.historial_clinico && !consultaForm.receta_medica && !consultaForm.pedido_examenes) {
      toast.error('Por favor, complete al menos un campo adicional (historial, receta o exámenes)');
      return;
    }

    // Validar que haya una sucursal seleccionada
    if (!sucursalSeleccionada) {
      toast.error('Por favor, seleccione una sucursal');
      return;
    }

    setIsSavingConsulta(true);

    try {
      console.log('Iniciando guardado de consulta...');

      // Obtener el ID del usuario actual desde Supabase
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuario')
        .select('id_usuario, nombre, apellido')
        .eq('email', currentUser.email)
        .single() as any;

      if (usuarioError || !usuarioData) {
        console.error('Error al obtener usuario:', usuarioError);
        toast.error('No se pudo obtener información del usuario');
        setIsSavingConsulta(false);
        return;
      }

      console.log('Usuario obtenido:', usuarioData);

      let idCitaParaConsulta = citaIdInicial;

      // Si no viene desde la agenda, crear una cita automática con la sucursal seleccionada
      if (!idCitaParaConsulta) {
        console.log('No hay cita previa, creando cita automática...');

        // Buscar o crear asignación del usuario con la sucursal seleccionada
        let { data: asignacionData, error: errorBusqueda } = await supabase
          .from('usuario_sucursal')
          .select('id_usuario_sucursal')
          .eq('id_usuario', usuarioData.id_usuario)
          .eq('id_sucursal', sucursalSeleccionada)
          .eq('estado', 'activo')
          .maybeSingle() as any;

        console.log('Búsqueda de asignación:', { asignacionData, errorBusqueda });

        // Si no existe asignación, crearla automáticamente
        if (!asignacionData) {
          console.log('Creando nueva asignación usuario-sucursal...');

          const { data: nuevaAsignacion, error: errorAsignacion } = await supabase
            .from('usuario_sucursal')
            .insert({
              id_usuario: usuarioData.id_usuario,
              id_sucursal: sucursalSeleccionada,
              especialidad: 'Medicina General',
              estado: 'activo'
            } as any)
            .select()
            .single() as any;

          if (errorAsignacion || !nuevaAsignacion) {
            console.error('Error al crear asignación:', errorAsignacion);
            toast.error('Error al crear asignación de sucursal: ' + (errorAsignacion?.message || 'desconocido'));
            setIsSavingConsulta(false);
            return;
          }

          console.log('Asignación creada:', nuevaAsignacion);

          // Crear precio predeterminado
          const { error: errorPrecio } = await supabase
            .from('precio_usuario_sucursal')
            .insert({
              id_usuario_sucursal: nuevaAsignacion.id_usuario_sucursal,
              precio_consulta: 50.00,
              duracion_consulta: 30,
              estado: 'activo'
            } as any);

          if (errorPrecio) {
            console.error('Error al crear precio:', errorPrecio);
          }

          asignacionData = nuevaAsignacion;
        }

        // Obtener precio de consulta
        const { data: precioData } = await supabase
          .from('precio_usuario_sucursal')
          .select('precio_consulta, duracion_consulta')
          .eq('id_usuario_sucursal', asignacionData!.id_usuario_sucursal)
          .eq('estado', 'activo')
          .single() as any;

        const precioConsulta = precioData?.precio_consulta || 50;
        const duracionConsulta = precioData?.duracion_consulta || 30;

        console.log('Precio obtenido:', { precioConsulta, duracionConsulta });

        // Crear cita automática
        const ahora = new Date();
        const horaFin = new Date(ahora.getTime() + duracionConsulta * 60000);

        const citaData = {
          id_paciente: selectedPatientId,
          id_usuario_sucursal: asignacionData!.id_usuario_sucursal,
          id_sucursal: sucursalSeleccionada,
          fecha_cita: ahora.toISOString().split('T')[0],
          hora_inicio: ahora.toTimeString().split(' ')[0].substring(0, 5),
          hora_fin: horaFin.toTimeString().split(' ')[0].substring(0, 5),
          duracion_minutos: duracionConsulta,
          tipo_cita: 'consulta',
          motivo_consulta: consultaForm.motivo_consulta,
          estado_cita: 'atendida',
          precio_cita: precioConsulta,
          consulta_realizada: true
        };

        console.log('Creando cita con datos:', citaData);

        const { data: citaCreada, error: citaError } = await supabase
          .from('cita')
          .insert(citaData as any)
          .select()
          .single() as any;

        if (citaError || !citaCreada) {
          console.error('Error al crear cita:', citaError);
          toast.error('Error al crear registro de consulta: ' + (citaError?.message || 'desconocido'));
          setIsSavingConsulta(false);
          return;
        }

        console.log('Cita creada exitosamente:', citaCreada);
        idCitaParaConsulta = citaCreada.id_cita;
      }

      if (!idCitaParaConsulta) {
        toast.error('Error: No se pudo obtener el ID de la cita');
        setIsSavingConsulta(false);
        return;
      }

      const nuevaConsulta = await crearConsultaMedica({
        id_cita: idCitaParaConsulta,
        id_paciente: selectedPatientId,
        id_usuario: usuarioData.id_usuario,
        historial_clinico: consultaForm.historial_clinico || null,
        diagnostico: null,
        receta_medica: consultaForm.receta_medica || null,
        pedido_examenes: consultaForm.pedido_examenes || null,
        observaciones: null
      });

      if (nuevaConsulta) {
        // Recargar las citas del paciente
        const citasActualizadas = await getCitasByPaciente(selectedPatientId);
        setCitasPaciente(citasActualizadas);

        // Recargar consultas
        const consultasMap: Record<number, ConsultaMedica> = {};
        for (const cita of citasActualizadas) {
          const consulta = await getConsultaMedicaByCita(cita.id_cita);
          if (consulta) {
            consultasMap[cita.id_cita] = consulta;
          }
        }
        setConsultasPorCita(consultasMap);

        toast.success('Consulta guardada exitosamente');
        setIsConsultaDialogOpen(false);

        // Limpiar formulario
        setConsultaForm({
          motivo_consulta: '',
          historial_clinico: '',
          receta_medica: '',
          pedido_examenes: ''
        });

        // Llamar callback si existe
        if (onConsultaCompletada) {
          onConsultaCompletada();
        }
      } else {
        toast.error('Error al guardar la consulta');
      }
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      toast.error('Error inesperado al guardar la consulta');
    } finally {
      setIsSavingConsulta(false);
    }
  };

  const pacienteSeleccionado = selectedPatientId ? pacientes.find((p: Paciente) => p.id_paciente === selectedPatientId) : null;
  const signoActual = selectedPatientId ? getSignoVitalActual(selectedPatientId) : null;
  const currentIndex = selectedPatientId ? (signosVitalesIndex[selectedPatientId] || 0) : 0;

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <SupabaseIndicator />

      {/* Top Bar: Buscador y Nuevo Paciente */}
      <div className="flex gap-4 items-center max-w-2xl mx-auto w-full">
        <Button
          variant="outline"
          className="flex-1 justify-start h-12 text-lg text-muted-foreground"
          onClick={() => {
            setSearchTerm('');
            clearPacientes(); // Limpiar resultados anteriores
            setIsSearchDialogOpen(true);
          }}
        >
          <Search className="mr-2 h-5 w-5" />
          {selectedPatientId && pacienteSeleccionado
            ? `Paciente seleccionado: ${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}`
            : "Click para buscar paciente..."}
        </Button>

        <Button
          onClick={() => setIsNewPatientDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
        >
          <Plus className="size-5 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedPatientId && pacienteSeleccionado ? (
          <div className="h-full flex gap-4 overflow-y-auto">
            {/* Columna 1: Datos del Paciente (Card) */}
            <div className="w-1/3 min-w-[350px] space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-16">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                        {getIniciales(pacienteSeleccionado.nombres, pacienteSeleccionado.apellidos)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {calcularEdad(pacienteSeleccionado.fecha_nacimiento)} años • {formatearSexo(pacienteSeleccionado.sexo)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {pacienteSeleccionado.cedula}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAbrirConsulta}
                          className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                          title="Iniciar Consulta"
                        >
                          <Plus className="size-5 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información de contacto */}
                  <div className="space-y-3 text-sm">
                    {pacienteSeleccionado.email && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="size-4" />
                        <span className="truncate">{pacienteSeleccionado.email}</span>
                      </div>
                    )}
                    {pacienteSeleccionado.telefono && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="size-4" />
                        <span>{pacienteSeleccionado.telefono}</span>
                      </div>
                    )}
                    {pacienteSeleccionado.direccion && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="size-4" />
                        <span className="truncate">{pacienteSeleccionado.direccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Signos Vitales */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Signos Vitales</h4>
                      <div className="flex items-center gap-1">
                        {signosVitales.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navegarSignosVitales(selectedPatientId, 'prev')}
                              disabled={currentIndex === 0}
                              className="h-7 w-7 p-0"
                            >
                              <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                              {currentIndex + 1} / {signosVitales.length}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navegarSignosVitales(selectedPatientId, 'next')}
                              disabled={currentIndex === signosVitales.length - 1}
                              className="h-7 w-7 p-0"
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-4"
                      onClick={() => {
                        setSelectedPatientId(pacienteSeleccionado.id_paciente);
                        setIsSignosVitalesDialogOpen(true);
                      }}
                    >
                      <Plus className="size-4 mr-2" />
                      Registrar Signos Vitales
                    </Button>

                    {signoActual ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="size-3" />
                          <span>
                            {new Date(signoActual.fecha_registro).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })} - {new Date(signoActual.fecha_registro).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                          <div className="flex items-center gap-2">
                            <Ruler className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Estatura</p>
                              <p className="text-sm font-medium">{signoActual.estatura_cm || '-'} {signoActual.estatura_cm ? 'cm' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Weight className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Peso</p>
                              <p className="text-sm font-medium">{signoActual.peso_kg || '-'} {signoActual.peso_kg ? 'kg' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">IMC</p>
                              <p className="text-sm font-medium">{signoActual.imc || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Temp.</p>
                              <p className="text-sm font-medium">{signoActual.temperatura_c || '-'} {signoActual.temperatura_c ? '°C' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">F. Resp.</p>
                              <p className="text-sm font-medium">{signoActual.frecuencia_respiratoria || '-'} {signoActual.frecuencia_respiratoria ? 'rpm' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">F. Card.</p>
                              <p className="text-sm font-medium">{signoActual.frecuencia_cardiaca || '-'} {signoActual.frecuencia_cardiaca ? 'bpm' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <Activity className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Presión Arterial</p>
                              <p className="text-sm font-medium">
                                {signoActual.presion_sistolica && signoActual.presion_diastolica
                                  ? `${signoActual.presion_sistolica}/${signoActual.presion_diastolica}`
                                  : '-'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <Droplet className="size-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Sat. Oxígeno</p>
                              <p className="text-sm font-medium">{signoActual.saturacion_oxigeno || '-'}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed text-gray-500 text-sm">
                        No hay signos vitales registrados
                      </div>
                    )}
                  </div>

                  {/* Archivos Médicos */}
                  <div className="border-t pt-4">
                    <ArchivosMedicosSection pacienteId={selectedPatientId} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna 2: Antecedentes */}
            <div className="flex-1 min-w-[300px]">
              {isLoadingAntecedentes ? (
                <Card className="p-8 flex items-center justify-center h-full">
                  <Loader2 className="size-6 animate-spin text-blue-600" />
                </Card>
              ) : (
                <AntecedentesView
                  pacienteId={selectedPatientId.toString()}
                  pacienteNombre={`${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}`}
                  antecedentes={antecedentesData}
                  onActualizarAntecedentes={handleActualizarAntecedentes}
                />
              )}
            </div>

            {/* Columna 3: Historial de Citas */}
            <div className="w-1/3 min-w-[300px] space-y-4">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="size-5 text-blue-600" />
                    Historial de Citas
                  </h3>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pr-2">
                  {isLoadingCitas ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-blue-600" />
                    </div>
                  ) : citasPaciente.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No hay citas registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {citasPaciente.map((cita: CitaCompleta) => {
                        const colorEstado = getColorEstado(cita.estado_cita);
                        const consulta = consultasPorCita[cita.id_cita];
                        const tieneConsulta = !!consulta;
                        const estaExpandida = citasExpandidas.has(cita.id_cita);

                        return (
                          <Card key={cita.id_cita} className="border-l-4" style={{ borderLeftColor: colorEstado === 'blue' ? '#3b82f6' : colorEstado === 'green' ? '#10b981' : colorEstado === 'red' ? '#ef4444' : '#f59e0b' }}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="size-4 text-gray-500" />
                                    <span className="text-sm">
                                      {new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="size-4 text-gray-500" />
                                    <span className="text-sm">
                                      {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={cita.estado_cita === 'atendida' ? 'default' : cita.estado_cita === 'cancelada' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {cita.estado_cita}
                                  </Badge>
                                  {tieneConsulta && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                      <FileText className="size-3 mr-1" />
                                      Consulta
                                    </Badge>
                                  )}
                                  {tieneConsulta && consulta.historial_clinico && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const nuevasExpandidas = new Set(citasExpandidas);
                                        if (estaExpandida) {
                                          nuevasExpandidas.delete(cita.id_cita);
                                        } else {
                                          nuevasExpandidas.add(cita.id_cita);
                                        }
                                        setCitasExpandidas(nuevasExpandidas);
                                      }}
                                      className="h-6 w-6 p-0"
                                      title={estaExpandida ? "Ocultar historial clínico" : "Ver historial clínico"}
                                    >
                                      {estaExpandida ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t text-sm text-gray-600">
                                <p className="font-medium">{cita.usuario_sucursal.usuario.nombre} {cita.usuario_sucursal.usuario.apellido}</p>
                                {cita.usuario_sucursal.especialidad && (
                                  <p className="text-xs text-gray-500">{cita.usuario_sucursal.especialidad}</p>
                                )}
                              </div>

                              {/* Motivo de Consulta */}
                              {cita.motivo_consulta && (
                                <div className="pt-2 border-t text-xs">
                                  <p className="font-medium text-gray-700 mb-1">Motivo de Consulta:</p>
                                  <p className="text-gray-600 line-clamp-2">{cita.motivo_consulta}</p>
                                </div>
                              )}

                              {/* Receta Médica */}
                              {tieneConsulta && consulta.receta_medica && (
                                <div className="pt-2 border-t text-xs">
                                  <p className="font-medium text-green-700 mb-1 flex items-center gap-1">
                                    <FileText className="size-3" />
                                    Receta Médica:
                                  </p>
                                  <p className="text-gray-600 whitespace-pre-wrap bg-green-50 p-2 rounded line-clamp-3">{consulta.receta_medica}</p>
                                </div>
                              )}

                              {tieneConsulta && estaExpandida && consulta.historial_clinico && (
                                <div className="pt-2 border-t text-xs">
                                  <p className="font-medium text-gray-700 mb-1">Historial Clínico:</p>
                                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">{consulta.historial_clinico}</p>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                                <span>Precio: ${cita.precio_cita}</span>
                                {cita.estado_pago && (
                                  <Badge variant="outline" className="text-xs">
                                    {cita.estado_pago}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <div className="p-6 bg-gray-50 rounded-full mb-6">
              <Search className="size-16 text-gray-300" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Busque un paciente para comenzar</h3>
            <p className="text-gray-500 max-w-md text-center">
              Haga clic en la barra de búsqueda superior para encontrar un paciente por nombre o número de cédula, o registre uno nuevo.
            </p>
          </div>
        )}
      </div>

      {/* Dialog: Buscar Paciente */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Buscar Paciente</DialogTitle>
            <DialogDescription>
              Ingrese el nombre, apellido o cédula del paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 my-2">
            <Input
              placeholder="Ej: Juan Perez o 1712345678"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  buscarPacientes(searchTerm);
                }
              }}
              autoFocus
            />
            <Button onClick={() => buscarPacientes(searchTerm)} disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              <span className="ml-2">Buscar</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <Loader2 className="size-6 animate-spin mr-2" /> Buscando...
              </div>
            ) : pacientes.length > 0 ? (
              pacientes.map((paciente: Paciente) => (
                <div
                  key={paciente.id_paciente}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer border transition-colors"
                  onClick={() => {
                    setSelectedPatientId(paciente.id_paciente);
                    setIsSearchDialogOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getIniciales(paciente.nombres, paciente.apellidos)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{paciente.nombres} {paciente.apellidos}</p>
                    <p className="text-xs text-gray-500">CI: {paciente.cedula} • {calcularEdad(paciente.fecha_nacimiento)} años</p>
                  </div>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>
              ))
            ) : searchTerm && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron pacientes con "{searchTerm}"
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Ingrese un término para buscar
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSearchDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nuevo Paciente */}
      <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Complete los datos del nuevo paciente
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                value={newPatient.nombres}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, nombres: e.target.value })}
                placeholder="Nombres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input
                id="apellidos"
                value={newPatient.apellidos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, apellidos: e.target.value })}
                placeholder="Apellidos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula/ID *</Label>
              <Input
                id="cedula"
                value={newPatient.cedula}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, cedula: e.target.value })}
                placeholder="0000000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={newPatient.fecha_nacimiento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, fecha_nacimiento: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select
                value={newPatient.sexo}
                onValueChange={(value: string) => setNewPatient({ ...newPatient, sexo: value as 'M' | 'F' | 'Otro' })}
              >
                <SelectTrigger>
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
                value={newPatient.telefono}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, telefono: e.target.value })}
                placeholder="0999999999"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={newPatient.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, email: e.target.value })}
                placeholder="paciente@email.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={newPatient.direccion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPatient({ ...newPatient, direccion: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePatient} className="bg-blue-600 hover:bg-blue-700">
              Registrar Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Signos Vitales */}
      <Dialog open={isSignosVitalesDialogOpen} onOpenChange={setIsSignosVitalesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Signos Vitales</DialogTitle>
            <DialogDescription>
              {selectedPatientId && pacientes.find((p: Paciente) => p.id_paciente === selectedPatientId)
                ? `Paciente: ${pacientes.find((p: Paciente) => p.id_paciente === selectedPatientId)!.nombres} ${pacientes.find((p: Paciente) => p.id_paciente === selectedPatientId)!.apellidos}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Estatura (cm)</Label>
              <Input
                type="number"
                step="0.1"
                max="999.99"
                value={signosVitalesForm.estatura_cm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, estatura_cm: e.target.value })}
                placeholder="170.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                max="999.99"
                value={signosVitalesForm.peso_kg}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, peso_kg: e.target.value })}
                placeholder="70.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Temperatura (°C)</Label>
              <Input
                type="number"
                step="0.1"
                max="999.99"
                value={signosVitalesForm.temperatura_c}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, temperatura_c: e.target.value })}
                placeholder="36.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Frec. Respiratoria</Label>
              <Input
                type="number"
                max="999"
                value={signosVitalesForm.frecuencia_respiratoria}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, frecuencia_respiratoria: e.target.value })}
                placeholder="18"
              />
            </div>

            <div className="space-y-2">
              <Label>Frec. Cardíaca (bpm)</Label>
              <Input
                type="number"
                max="999"
                value={signosVitalesForm.frecuencia_cardiaca}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, frecuencia_cardiaca: e.target.value })}
                placeholder="75"
              />
            </div>

            <div className="space-y-2">
              <Label>Saturación O2(%)</Label>
              <Input
                type="number"
                step="0.1"
                max="100"
                value={signosVitalesForm.saturacion_oxigeno}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, saturacion_oxigeno: e.target.value })}
                placeholder="98"
              />
            </div>

            <div className="space-y-2">
              <Label>Presión Sistólica</Label>
              <Input
                type="number"
                max="999"
                value={signosVitalesForm.presion_sistolica}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, presion_sistolica: e.target.value })}
                placeholder="120"
              />
            </div>

            <div className="space-y-2">
              <Label>Presión Diastólica</Label>
              <Input
                type="number"
                max="999"
                value={signosVitalesForm.presion_diastolica}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignosVitalesForm({ ...signosVitalesForm, presion_diastolica: e.target.value })}
                placeholder="80"
              />
            </div>


          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignosVitalesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSignosVitales} className="bg-blue-600 hover:bg-blue-700">
              Guardar Signos Vitales
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Nueva Consulta */}
      <Dialog open={isConsultaDialogOpen} onOpenChange={setIsConsultaDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Nueva Consulta - {pacientes.find((p: Paciente) => p.id_paciente === selectedPatientId)?.nombres} {pacientes.find((p: Paciente) => p.id_paciente === selectedPatientId)?.apellidos}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selector de Sucursal */}
            <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label htmlFor="sucursalConsulta" className="font-medium text-blue-900">
                Sucursal * {sucursales.length > 0 && <span className="font-normal text-blue-700">({sucursales.length} disponibles)</span>}
              </Label>
              <Select
                value={sucursalSeleccionada?.toString() || ''}
                onValueChange={(value: string) => {
                  console.log('Sucursal seleccionada:', value);
                  setSucursalSeleccionada(parseInt(value));
                }}
              >
                <SelectTrigger className="bg-white w-full" id="sucursalConsulta">
                  <SelectValue placeholder="Seleccione una sucursal..." />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100] max-w-[700px]">
                  {sucursales.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay sucursales disponibles</div>
                  ) : (
                    sucursales.map((sucursal: any) => (
                      <SelectItem key={sucursal.id_sucursal} value={sucursal.id_sucursal.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{sucursal.nombre}</span>
                          {sucursal.direccion && <span className="text-xs text-gray-500">{sucursal.direccion}</span>}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-700 flex items-center gap-1">
                📍 Selecciona la sucursal donde se registrará la consulta
              </p>
            </div>

            {/* Motivo de Consulta */}
            <div className="space-y-2">
              <Label htmlFor="motivoConsulta" className="text-sm">Motivo de Consulta *</Label>
              <Textarea
                id="motivoConsulta"
                value={consultaForm.motivo_consulta}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConsultaForm({ ...consultaForm, motivo_consulta: e.target.value })}
                placeholder="¿Por qué acude el paciente a consulta?..."
                className="min-h-[80px] text-sm"
              />
            </div>

            {/* Historial Clínico */}
            <div className="space-y-2">
              <Label htmlFor="historialClinico" className="text-sm">Historial Clínico</Label>
              <Textarea
                id="historialClinico"
                value={consultaForm.historial_clinico}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConsultaForm({ ...consultaForm, historial_clinico: e.target.value })}
                placeholder="Diagnóstico, observaciones médicas..."
                className="min-h-[100px] text-sm"
              />
            </div>

            {/* Receta Médica */}
            <div className="space-y-2">
              <Label htmlFor="recetaMedica" className="text-sm">Receta Médica</Label>
              <Textarea
                id="recetaMedica"
                value={consultaForm.receta_medica}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConsultaForm({ ...consultaForm, receta_medica: e.target.value })}
                placeholder="Medicamentos y dosis..."
                className="min-h-[100px] text-sm"
              />
            </div>

            {/* Pedido de Exámenes */}
            <div className="space-y-2">
              <Label htmlFor="pedidoExamenes" className="text-sm">Pedido de Exámenes</Label>
              <Textarea
                id="pedidoExamenes"
                value={consultaForm.pedido_examenes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConsultaForm({ ...consultaForm, pedido_examenes: e.target.value })}
                placeholder="Exámenes solicitados..."
                className="min-h-[100px] text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConsultaDialogOpen(false)}
              disabled={isSavingConsulta}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarConsulta}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSavingConsulta}
            >
              {isSavingConsulta ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Consulta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}