import { AntecedentesView } from './AntecedentesView';
import { useState, useEffect } from 'react';
import { marcarConsultaRealizada, getPacienteById, addCita, getPrecioUsuarioSucursal, getAsignacionesByUsuario, getUsuarioByEmail } from '../data/mockData';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronUp, Mail, Phone, MapPin, CreditCard, User, Search, Activity, Ruler, Weight, Thermometer, Heart, Wind, Droplet, Upload, File, X, Plus, FileText, ClipboardList, Calendar, ChevronLeft, ChevronRight, Eye, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
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

interface SignosVitales {
  estatura: string;
  peso: string;
  imc: string;
  temperatura: string;
  frecuenciaRespiratoria: string;
  frecuenciaCardiaca: string;
  presionSistolica: string;
  presionDiastolica: string;
  saturacionOxigeno: string;
  grasaCorporal: string;
  masaMuscular: string;
  perimetroCefalico: string;
  fecha: string;
  hora: string;
}

interface Archivo {
  id: string;
  nombre: string;
  fecha: string;
  descripcion: string;
  url?: string; // URL para Supabase Storage en el futuro
  tipo?: string; // tipo MIME del archivo
}

interface Consulta {
  id: string;
  fecha: string;
  hora: string;
  signosVitales?: SignosVitales;
  historialClinico: string;
  recetaMedica: string;
  pedidoExamenes: string;
}

interface Patient {
  id: string;
  foto: string;
  nombre: string;
  fechaNacimiento: string;
  sexo: string;
  cedula: string;
  correo: string;
  telefono: string;
  direccion: string;
  historialSignosVitales: SignosVitales[];
  archivos: Archivo[];
  consultas: Consulta[];
  antecedentes?: {
    esquemaVacunacion?: {
      selectedVaccines: string[];
      hasOtherVaccines: boolean | null;
    };
    alergias?: string[];
    antecedentesPatologicos?: Record<string, string>;
    antecedentesNoPatologicos?: Record<string, string>;
    antecedentesHeredofamiliares?: Record<string, string>;
    antecedentesGineco?: Record<string, any>;
    antecedentesperinatales?: Record<string, any>;
    antecedentesPostnatales?: Record<string, any>;
    antecedentesPsiquiatricos?: Record<string, string>;
    vacunas?: string[];
    medicamentos?: string[];
    dietaNutriologica?: Record<string, any>;
  };
}

// Datos de ejemplo
const mockPatients: Patient[] = [
  {
    id: '1',
    foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    nombre: 'Pedro Antonio García Mora',
    fechaNacimiento: '1985-05-15',
    sexo: 'Masculino',
    cedula: '1708123456',
    correo: 'pedro.garcia@email.com',
    telefono: '0991234567',
    direccion: 'Calle Flores 123, Quito',
    historialSignosVitales: [
      {
        estatura: '1.75 m',
        peso: '70 kg',
        imc: '22.9',
        temperatura: '36.5 °C',
        frecuenciaRespiratoria: '18 rpm',
        frecuenciaCardiaca: '72 bpm',
        presionSistolica: '120 mmHg',
        presionDiastolica: '80 mmHg',
        saturacionOxigeno: '98%',
        grasaCorporal: '18%',
        masaMuscular: '57.4 kg',
        perimetroCefalico: '56 cm',
        fecha: '2024-03-15',
        hora: '10:30',
      },
      {
        estatura: '1.75 m',
        peso: '68 kg',
        imc: '22.2',
        temperatura: '36.3 °C',
        frecuenciaRespiratoria: '16 rpm',
        frecuenciaCardiaca: '70 bpm',
        presionSistolica: '118 mmHg',
        presionDiastolica: '78 mmHg',
        saturacionOxigeno: '98%',
        grasaCorporal: '19%',
        masaMuscular: '55.1 kg',
        perimetroCefalico: '56 cm',
        fecha: '2024-01-15',
        hora: '09:00',
      },
    ],
    archivos: [
      { id: '1', nombre: 'Historia_Clínica.pdf', fecha: '2024-01-15', descripcion: 'Historia clínica completa del paciente' },
      { id: '2', nombre: 'Resultados_Lab.pdf', fecha: '2024-03-10', descripcion: 'Resultados de laboratorio - Hemograma completo' },
    ],
    consultas: [
      {
        id: '1',
        fecha: '2024-01-15',
        hora: '09:00',
        signosVitales: {
          estatura: '1.75 m',
          peso: '68 kg',
          imc: '22.2',
          temperatura: '36.3 °C',
          frecuenciaRespiratoria: '16 rpm',
          frecuenciaCardiaca: '70 bpm',
          presionSistolica: '118 mmHg',
          presionDiastolica: '78 mmHg',
          saturacionOxigeno: '98%',
          grasaCorporal: '19%',
          masaMuscular: '55.1 kg',
          perimetroCefalico: '56 cm',
          fecha: '2024-01-15',
          hora: '09:00',
        },
        historialClinico: 'Paciente presenta leve dolor de cabeza. Se recomienda reposo.',
        recetaMedica: 'Paracetamol 500mg cada 8 horas por 3 días',
        pedidoExamenes: 'Hemograma completo, perfil lipídico',
      },
    ],
  },
  {
    id: '2',
    foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    nombre: 'María Fernanda Rodríguez Silva',
    fechaNacimiento: '1990-08-22',
    sexo: 'Femenino',
    cedula: '1709234567',
    correo: 'maria.rodriguez@email.com',
    telefono: '0982345678',
    direccion: 'Av. América 456, Quito',
    historialSignosVitales: [
      {
        estatura: '1.65 m',
        peso: '58 kg',
        imc: '21.3',
        temperatura: '36.4 °C',
        frecuenciaRespiratoria: '16 rpm',
        frecuenciaCardiaca: '70 bpm',
        presionSistolica: '115 mmHg',
        presionDiastolica: '75 mmHg',
        saturacionOxigeno: '98%',
        grasaCorporal: '20%',
        masaMuscular: '46.4 kg',
        perimetroCefalico: '54 cm',
        fecha: '2024-02-20',
        hora: '14:00',
      },
    ],
    archivos: [],
    consultas: [],
  },
  {
    id: '3',
    foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    nombre: 'Carlos Andrés Martínez López',
    fechaNacimiento: '2015-03-10',
    sexo: 'Masculino',
    cedula: '1710345678',
    correo: 'carlos.martinez@email.com',
    telefono: '0973456789',
    direccion: 'Calle Guayaquil 789, Quito',
    historialSignosVitales: [
      {
        estatura: '1.45 m',
        peso: '40 kg',
        imc: '19.0',
        temperatura: '36.6 °C',
        frecuenciaRespiratoria: '20 rpm',
        frecuenciaCardiaca: '85 bpm',
        presionSistolica: '100 mmHg',
        presionDiastolica: '65 mmHg',
        saturacionOxigeno: '99%',
        grasaCorporal: '15%',
        masaMuscular: '34 kg',
        perimetroCefalico: '52 cm',
        fecha: '2024-03-01',
        hora: '11:15',
      },
    ],
    archivos: [],
    consultas: [],
  },
  {
    id: '4',
    foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    nombre: 'Ana María Pérez Vargas',
    fechaNacimiento: '1978-11-05',
    sexo: 'Femenino',
    cedula: '1711456789',
    correo: 'ana.perez@email.com',
    telefono: '0964567890',
    direccion: 'Av. Ecuador 101, Quito',
    historialSignosVitales: [
      {
        estatura: '1.62 m',
        peso: '65 kg',
        imc: '24.8',
        temperatura: '36.4 °C',
        frecuenciaRespiratoria: '17 rpm',
        frecuenciaCardiaca: '68 bpm',
        presionSistolica: '115 mmHg',
        presionDiastolica: '75 mmHg',
        saturacionOxigeno: '99%',
        grasaCorporal: '25%',
        masaMuscular: '48.8 kg',
        perimetroCefalico: '54 cm',
        fecha: '2024-03-01',
        hora: '11:15',
      },
    ],
    archivos: [],
    consultas: [],
  },
];

function PatientCard({ 
  patient, 
  isExpanded, 
  onToggle, 
  onIniciarConsulta,
  onAgregarSignosVitales,
  onAgregarArchivo
}: { 
  patient: Patient; 
  isExpanded: boolean;
  onToggle: () => void;
  onIniciarConsulta: () => void;
  onAgregarSignosVitales: () => void;
  onAgregarArchivo: (archivo: Archivo) => void;
}) {
  const [currentSignosIndex, setCurrentSignosIndex] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [nuevoArchivo, setNuevoArchivo] = useState({ nombre: '', descripcion: '' });
  const [filtroArchivos, setFiltroArchivos] = useState('');
  const [archivoVisualizando, setArchivoVisualizando] = useState<Archivo | null>(null);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (fecha: string, hora: string) => {
    const date = new Date(fecha);
    return `${date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} - ${hora}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentSignos = patient.historialSignosVitales[currentSignosIndex];
  const hasHistorialSignos = patient.historialSignosVitales.length > 0;

  return (
    <>
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardHeader 
          className="cursor-pointer p-4"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src={patient.foto} alt={patient.nombre} />
              <AvatarFallback>{getInitials(patient.nombre)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-gray-900">{patient.nombre}</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  {formatDate(patient.fechaNacimiento)} • {calculateAge(patient.fechaNacimiento)} años
                </p>
                {isExpanded && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onIniciarConsulta();
                    }}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                    title="Iniciar Consulta"
                  >
                    <Plus className="size-4 text-blue-600" />
                  </Button>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronUp className="size-5 text-gray-400" />
              ) : (
                <ChevronDown className="size-5 text-gray-400" />
              )}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 px-4 pb-4 space-y-4">
            <div className="border-t pt-4 space-y-3">
              {/* Información Básica */}
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-gray-400" />
                <span className="text-gray-600">Sexo:</span>
                <span className="text-gray-900">{patient.sexo}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="size-4 text-gray-400" />
                <span className="text-gray-600">Cédula:</span>
                <span className="text-gray-900">{patient.cedula}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-gray-400" />
                <span className="text-gray-600">Correo:</span>
                <span className="text-gray-900 text-xs">{patient.correo}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-gray-400" />
                <span className="text-gray-600">Teléfono:</span>
                <span className="text-gray-900">{patient.telefono}</span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="size-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600">Dirección:</span>
                <span className="text-gray-900 flex-1">{patient.direccion}</span>
              </div>
            </div>

            {/* Signos Vitales */}
            {hasHistorialSignos && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-gray-900">Signos Vitales</h4>
                  <div className="flex items-center gap-2">
                    {patient.historialSignosVitales.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentSignosIndex(Math.max(0, currentSignosIndex - 1))}
                          disabled={currentSignosIndex === 0}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <span className="text-xs text-gray-500">
                          {currentSignosIndex + 1} / {patient.historialSignosVitales.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentSignosIndex(Math.min(patient.historialSignosVitales.length - 1, currentSignosIndex + 1))}
                          disabled={currentSignosIndex === patient.historialSignosVitales.length - 1}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Botón para agregar nuevos signos vitales */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-3"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onAgregarSignosVitales();
                  }}
                >
                  <Plus className="size-4 mr-2" />
                  Agregar Signos Vitales
                </Button>

                {/* Fecha de los signos vitales */}
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <Calendar className="size-3" />
                  <span>{formatDateTime(currentSignos.fecha, currentSignos.hora)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Estatura</p>
                      <p className="text-sm text-gray-900">{currentSignos.estatura}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Peso</p>
                      <p className="text-sm text-gray-900">{currentSignos.peso}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">IMC</p>
                      <p className="text-sm text-gray-900">{currentSignos.imc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Temperatura</p>
                      <p className="text-sm text-gray-900">{currentSignos.temperatura}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Freq. Respiratoria</p>
                      <p className="text-sm text-gray-900">{currentSignos.frecuenciaRespiratoria}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Freq. Cardíaca</p>
                      <p className="text-sm text-gray-900">{currentSignos.frecuenciaCardiaca}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Sistólica/Diastólica</p>
                      <p className="text-sm text-gray-900">{currentSignos.presionSistolica}/{currentSignos.presionDiastolica}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Sat. Oxígeno</p>
                      <p className="text-sm text-gray-900">{currentSignos.saturacionOxigeno}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">% Grasa Corporal</p>
                      <p className="text-sm text-gray-900">{currentSignos.grasaCorporal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Masa Muscular</p>
                      <p className="text-sm text-gray-900">{currentSignos.masaMuscular}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Perímetro Cefálico</p>
                      <p className="text-sm text-gray-900">{currentSignos.perimetroCefalico}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Archivos Adjuntos */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-gray-900">Archivos Adjuntos ({patient.archivos.length})</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload className="size-4 mr-2" />
                  Subir
                </Button>
              </div>

              {/* Filtro de búsqueda */}
              {patient.archivos.length > 0 && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-3 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={filtroArchivos}
                    onChange={(e) => setFiltroArchivos(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              )}
              
              {/* Archivos existentes */}
              <div className="space-y-2 mb-3">
                {patient.archivos.length === 0 && (
                  <p className="text-center py-4 text-gray-500 text-sm">No hay archivos adjuntos</p>
                )}

                {patient.archivos.filter(archivo => {
                  const searchTerm = filtroArchivos.toLowerCase();
                  return archivo.nombre.toLowerCase().includes(searchTerm) ||
                         archivo.descripcion.toLowerCase().includes(searchTerm) ||
                         archivo.fecha.includes(searchTerm);
                }).length === 0 && patient.archivos.length > 0 && (
                  <p className="text-center py-4 text-gray-500 text-sm">No se encontraron archivos</p>
                )}

                {patient.archivos
                  .filter(archivo => {
                    const searchTerm = filtroArchivos.toLowerCase();
                    return archivo.nombre.toLowerCase().includes(searchTerm) ||
                           archivo.descripcion.toLowerCase().includes(searchTerm) ||
                           archivo.fecha.includes(searchTerm);
                  })
                  .map((archivo) => (
                    <div key={archivo.id} className="p-3 bg-gray-50 rounded border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <File className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 block truncate" title={archivo.nombre}>
                              {archivo.nombre}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Calendar className="size-3" />
                              <span>{archivo.fecha}</span>
                            </div>
                            {archivo.descripcion && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{archivo.descripcion}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setArchivoVisualizando(archivo)}
                            className="h-7 w-7 p-0 hover:bg-blue-100"
                            title="Ver archivo"
                          >
                            <Eye className="size-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-100"
                            title="Eliminar archivo"
                          >
                            <X className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dialog para subir archivo */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subir Archivo</DialogTitle>
            <DialogDescription>
              El archivo se guardará con formato: {patient.cedula}-{patient.nombre.replace(/\s+/g, '-')}-YYYY-MM-DD-descripcion.ext
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              <p className="font-medium mb-1">ℹ️ Formato automático de nombres</p>
              <p className="text-xs">Los archivos se guardarán con metadata estructurada para facilitar la búsqueda en Supabase Storage.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreArchivo">Nombre del Archivo Original</Label>
              <Input
                id="nombreArchivo"
                placeholder="ejemplo.pdf"
                value={nuevoArchivo.nombre}
                onChange={(e) => setNuevoArchivo({ ...nuevoArchivo, nombre: e.target.value })}
              />
              <p className="text-xs text-gray-500">Incluye la extensión (ej: .pdf, .jpg, .png)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcionArchivo">Descripción</Label>
              <Textarea
                id="descripcionArchivo"
                placeholder="Historia clínica completa del paciente..."
                value={nuevoArchivo.descripcion}
                onChange={(e) => setNuevoArchivo({ ...nuevoArchivo, descripcion: e.target.value })}
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500">
                Esta descripción se incluirá en el nombre del archivo
              </p>
            </div>

            {/* Vista previa del nombre generado */}
            {nuevoArchivo.nombre && nuevoArchivo.descripcion && (() => {
              const fecha = new Date().toISOString().split('T')[0];
              const extension = nuevoArchivo.nombre.split('.').pop() || 'pdf';
              const nombreLimpio = patient.nombre.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
              const descripcionLimpia = nuevoArchivo.descripcion.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 50);
              const nombreGenerado = `${patient.cedula}-${nombreLimpio}-${fecha}-${descripcionLimpia}.${extension}`;
              
              return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <Label className="text-xs text-green-900 block mb-1">Vista previa del nombre:</Label>
                  <p className="text-sm text-green-900 font-mono break-all">
                    {nombreGenerado}
                  </p>
                </div>
              );
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (!nuevoArchivo.nombre.trim() || !nuevoArchivo.descripcion.trim()) {
                alert('Por favor completa todos los campos');
                return;
              }

              // Generar nombre del archivo con formato: cedula-nombre-fecha-descripcion.extension
              const fecha = new Date().toISOString().split('T')[0];
              const extension = nuevoArchivo.nombre.split('.').pop() || 'pdf';
              const nombreLimpio = patient.nombre.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
              const descripcionLimpia = nuevoArchivo.descripcion.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 50);
              const nombreGenerado = `${patient.cedula}-${nombreLimpio}-${fecha}-${descripcionLimpia}.${extension}`;

              // Crear objeto archivo
              const nuevoArchivoObj: Archivo = {
                id: Date.now().toString(),
                nombre: nombreGenerado,
                fecha: fecha,
                descripcion: nuevoArchivo.descripcion
              };

              // Llamar al callback para agregar el archivo
              onAgregarArchivo(nuevoArchivoObj);

              // TODO: Aquí se subirá el archivo físico a Supabase Storage en el futuro
              // const { data, error } = await supabase.storage
              //   .from('archivos-pacientes')
              //   .upload(`${patient.id}/${nombreGenerado}`, file);

              setIsUploadDialogOpen(false);
              setNuevoArchivo({ nombre: '', descripcion: '' });
            }} className="bg-blue-600 hover:bg-blue-700">
              Subir Archivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar archivo (PDF) */}
      <Dialog open={archivoVisualizando !== null} onOpenChange={(open: boolean) => !open && setArchivoVisualizando(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm">{archivoVisualizando?.nombre}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="size-3" />
              <span className="text-xs">{archivoVisualizando?.fecha}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Descripción del archivo */}
            {archivoVisualizando?.descripcion && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <Label className="text-xs text-gray-700 block mb-1">Descripción:</Label>
                <p className="text-sm text-gray-900">{archivoVisualizando.descripcion}</p>
              </div>
            )}

            {/* Visualizador de PDF (placeholder) */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-50">
              <File className="size-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">Visualizador de PDF</p>
              <p className="text-xs text-gray-500 mb-4">
                En producción, aquí se mostrará el PDF desde Supabase Storage
              </p>
              <div className="bg-white border rounded p-4 text-left">
                <p className="text-xs text-gray-600 mb-1"><strong>Archivo:</strong> {archivoVisualizando?.nombre}</p>
                <p className="text-xs text-gray-600"><strong>Tipo:</strong> {archivoVisualizando?.tipo || 'application/pdf'}</p>
                {archivoVisualizando?.url && (
                  <p className="text-xs text-gray-600 mt-1"><strong>URL:</strong> {archivoVisualizando.url}</p>
                )}
              </div>
              
              {/* Nota técnica */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-left">
                <p className="text-xs text-yellow-900">
                  <strong>💡 Para implementar en Supabase:</strong><br/>
                  1. Crear bucket en Supabase Storage<br/>
                  2. Subir archivo: <code className="bg-yellow-100 px-1">supabase.storage.from(&apos;archivos-pacientes&apos;).upload(nombreArchivo, file)</code><br/>
                  3. Obtener URL: <code className="bg-yellow-100 px-1">supabase.storage.from(&apos;archivos-pacientes&apos;).getPublicUrl(nombreArchivo)</code><br/>
                  4. Renderizar: <code className="bg-yellow-100 px-1">&lt;iframe src=&#123;url&#125; className=&quot;w-full h-96&quot; /&gt;</code>
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setArchivoVisualizando(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente de Historial de Citas
function HistorialCitasView({ patient }: { patient: Patient }) {
  const formatDateTime = (fecha: string, hora: string) => {
    const date = new Date(fecha);
    return `${date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} - ${hora}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Historial de Consultas</h2>
        <Badge variant="secondary">{patient.consultas.length} consultas</Badge>
      </div>

      {patient.consultas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="size-12 mx-auto mb-2 text-gray-300" />
          <p>No hay consultas registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patient.consultas.map((consulta) => (
            <Card key={consulta.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 space-y-3">
                {/* Fecha y Hora */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-gray-400" />
                  <span className="text-gray-900">{formatDateTime(consulta.fecha, consulta.hora)}</span>
                </div>

                {/* Signos Vitales - Solo mostrar si existen */}
                {consulta.signosVitales && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Activity className="size-4" />
                      Signos Vitales
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-blue-700">Peso:</span>
                        <span className="text-blue-900 ml-1">{consulta.signosVitales.peso}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Temp:</span>
                        <span className="text-blue-900 ml-1">{consulta.signosVitales.temperatura}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">FC:</span>
                        <span className="text-blue-900 ml-1">{consulta.signosVitales.frecuenciaCardiaca}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">PA:</span>
                        <span className="text-blue-900 ml-1">{consulta.signosVitales.presionSistolica}/{consulta.signosVitales.presionDiastolica}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historial Clínico */}
                {consulta.historialClinico && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <FileText className="size-4" />
                      Historial Clínico
                    </h4>
                    <p className="text-sm text-gray-700">{consulta.historialClinico}</p>
                  </div>
                )}

                {/* Receta Médica */}
                {consulta.recetaMedica && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-900 mb-1 flex items-center gap-2">
                      <FileText className="size-4" />
                      Receta Médica
                    </h4>
                    <p className="text-sm text-green-700">{consulta.recetaMedica}</p>
                  </div>
                )}

                {/* Pedido de Exámenes */}
                {consulta.pedidoExamenes && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-purple-900 mb-1 flex items-center gap-2">
                      <ClipboardList className="size-4" />
                      Pedido de Exámenes
                    </h4>
                    <p className="text-sm text-purple-700">{consulta.pedidoExamenes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function PacientesView({ 
  currentUser,
  pacienteIdInicial,
  citaIdInicial,
  onConsultaCompletada
}: { 
  currentUser?: { email: string } | null;
  pacienteIdInicial?: string | null;
  citaIdInicial?: number | null;
  onConsultaCompletada?: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isConsultaDialogOpen, setIsConsultaDialogOpen] = useState(false);
  const [isSignosVitalesDialogOpen, setIsSignosVitalesDialogOpen] = useState(false);

  // Efecto para manejar la navegación desde Agenda
  useEffect(() => {
    if (pacienteIdInicial) {
      // Obtener el paciente de mockData usando el ID
      const pacienteIdNumerico = parseInt(pacienteIdInicial);
      const pacienteMockData = getPacienteById(pacienteIdNumerico);
      
      if (pacienteMockData) {
        // Usar la cédula para filtrar (es única y garantiza que solo aparezca un paciente)
        setSearchTerm(pacienteMockData.numero_identificacion);
      }
    }
  }, [pacienteIdInicial]);

  const [newPatient, setNewPatient] = useState({
    nombre: '',
    fechaNacimiento: '',
    sexo: '',
    cedula: '',
    correo: '',
    telefono: '',
    direccion: '',
  });

  // Estado para signos vitales editables
  const [signosVitalesForm, setSignosVitalesForm] = useState({
    estatura: '',
    peso: '',
    temperatura: '',
    frecuenciaRespiratoria: '',
    frecuenciaCardiaca: '',
    presionSistolica: '',
    presionDiastolica: '',
    saturacionOxigeno: '',
    grasaCorporal: '',
    masaMuscular: '',
    perimetroCefalico: '',
  });

  const [historialClinicoForm, setHistorialClinicoForm] = useState('');
  const [recetaMedicaForm, setRecetaMedicaForm] = useState('');
  const [pedidoExamenesForm, setPedidoExamenesForm] = useState('');

  const calcularIMC = (peso: string, estatura: string) => {
    const pesoNum = parseFloat(peso);
    const estaturaNum = parseFloat(estatura);
    if (pesoNum && estaturaNum) {
      const imc = pesoNum / (estaturaNum * estaturaNum);
      return imc.toFixed(1);
    }
    return '';
  };

  const handleCreatePatient = () => {
    if (!newPatient.nombre.trim() || !newPatient.cedula.trim()) {
      return;
    }

    const patient: Patient = {
      id: Date.now().toString(),
      foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPatient.nombre}`,
      ...newPatient,
      historialSignosVitales: [],
      archivos: [],
      consultas: [],
    };

    setPatients([patient, ...patients]);
    setIsNewPatientDialogOpen(false);
    setNewPatient({
      nombre: '',
      fechaNacimiento: '',
      sexo: '',
      cedula: '',
      correo: '',
      telefono: '',
      direccion: '',
    });
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.nombre.toLowerCase().includes(searchLower) ||
      patient.cedula.includes(searchLower) ||
      patient.correo.toLowerCase().includes(searchLower) ||
      patient.telefono.includes(searchLower)
    );
  });

  const handleTogglePatient = (patientId: string) => {
    if (expandedPatientId === patientId) {
      setExpandedPatientId(null);
    } else {
      setExpandedPatientId(patientId);
    }
  };

  const selectedPatient = expandedPatientId 
    ? patients.find(p => p.id === expandedPatientId) 
    : null;

  const handleIniciarConsulta = () => {
    setIsConsultaDialogOpen(true);
    // Limpiar formularios
    setHistorialClinicoForm('');
    setRecetaMedicaForm('');
    setPedidoExamenesForm('');
  };

  const handleAgregarSignosVitales = () => {
    setIsSignosVitalesDialogOpen(true);
    // Limpiar formulario de signos vitales
    setSignosVitalesForm({
      estatura: '',
      peso: '',
      temperatura: '',
      frecuenciaRespiratoria: '',
      frecuenciaCardiaca: '',
      presionSistolica: '',
      presionDiastolica: '',
      saturacionOxigeno: '',
      grasaCorporal: '',
      masaMuscular: '',
      perimetroCefalico: '',
    });
  };

  const handleGuardarSignosVitales = () => {
    if (!selectedPatient) return;

    const now = new Date();
    const imc = calcularIMC(signosVitalesForm.peso, signosVitalesForm.estatura);

    const nuevosSignosVitales: SignosVitales = {
      estatura: signosVitalesForm.estatura ? `${signosVitalesForm.estatura} m` : '',
      peso: signosVitalesForm.peso ? `${signosVitalesForm.peso} kg` : '',
      imc: imc,
      temperatura: signosVitalesForm.temperatura ? `${signosVitalesForm.temperatura} °C` : '',
      frecuenciaRespiratoria: signosVitalesForm.frecuenciaRespiratoria ? `${signosVitalesForm.frecuenciaRespiratoria} rpm` : '',
      frecuenciaCardiaca: signosVitalesForm.frecuenciaCardiaca ? `${signosVitalesForm.frecuenciaCardiaca} bpm` : '',
      presionSistolica: signosVitalesForm.presionSistolica ? `${signosVitalesForm.presionSistolica} mmHg` : '',
      presionDiastolica: signosVitalesForm.presionDiastolica ? `${signosVitalesForm.presionDiastolica} mmHg` : '',
      saturacionOxigeno: signosVitalesForm.saturacionOxigeno ? `${signosVitalesForm.saturacionOxigeno}%` : '',
      grasaCorporal: signosVitalesForm.grasaCorporal ? `${signosVitalesForm.grasaCorporal}%` : '',
      masaMuscular: signosVitalesForm.masaMuscular ? `${signosVitalesForm.masaMuscular} kg` : '',
      perimetroCefalico: signosVitalesForm.perimetroCefalico ? `${signosVitalesForm.perimetroCefalico} cm` : '',
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0].substring(0, 5),
    };

    // Actualizar paciente con nuevos signos vitales
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        return {
          ...patient,
          historialSignosVitales: [nuevosSignosVitales, ...patient.historialSignosVitales],
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    
    // IMPORTANTE: Actualizar también mockPatients para persistir los datos
    const patientIndex = mockPatients.findIndex(p => p.id === selectedPatient.id);
    if (patientIndex !== -1) {
      mockPatients[patientIndex] = {
        ...mockPatients[patientIndex],
        historialSignosVitales: [nuevosSignosVitales, ...mockPatients[patientIndex].historialSignosVitales],
      };
    }
    
    setIsSignosVitalesDialogOpen(false);
  };

  const handleGuardarConsulta = () => {
    if (!selectedPatient) return;

    const now = new Date();
    const fechaActual = now.toISOString().split('T')[0];

    // Buscar si hay signos vitales registrados en la fecha actual
    const signosVitalesHoy = selectedPatient.historialSignosVitales.find(
      signos => signos.fecha === fechaActual
    );

    // Crear nueva consulta
    const nuevaConsulta: Consulta = {
      id: Date.now().toString(),
      fecha: fechaActual,
      hora: now.toTimeString().split(' ')[0].substring(0, 5),
      signosVitales: signosVitalesHoy, // Será undefined si no hay signos vitales de hoy
      historialClinico: historialClinicoForm,
      recetaMedica: recetaMedicaForm,
      pedidoExamenes: pedidoExamenesForm,
    };

    // Actualizar paciente con nueva consulta
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        return {
          ...patient,
          consultas: [nuevaConsulta, ...patient.consultas],
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    
    // IMPORTANTE: Actualizar también mockPatients para persistir los datos
    const patientIndex = mockPatients.findIndex(p => p.id === selectedPatient.id);
    if (patientIndex !== -1) {
      mockPatients[patientIndex] = {
        ...mockPatients[patientIndex],
        consultas: [nuevaConsulta, ...mockPatients[patientIndex].consultas],
      };
    }
    
    setIsConsultaDialogOpen(false);
    
    // Marcar la cita como realizada si viene desde Agenda
    if (citaIdInicial) {
      marcarConsultaRealizada(citaIdInicial);
      toast.success('Consulta guardada. Cargo generado automáticamente en la pestaña Cargos.');
    } else {
      // Si NO viene desde Agenda, crear una cita automáticamente
      try {
        // Obtener información del usuario actual
        const usuario = currentUser ? getUsuarioByEmail(currentUser.email) : null;
        
        if (usuario) {
          // Obtener asignaciones del usuario (sucursal y especialidad)
          const asignaciones = getAsignacionesByUsuario(usuario.id_usuario);
          
          if (asignaciones.length > 0) {
            // Usar la primera asignación activa (sucursal principal)
            const asignacionPrincipal = asignaciones.find(a => a.es_sucursal_principal) || asignaciones[0];
            
            // Obtener precio de la consulta
            const precioCita = getPrecioUsuarioSucursal(asignacionPrincipal.id_usuario_sucursal, 'consulta');
            
            // Buscar el paciente en mockData para obtener su id_paciente real
            const pacienteReal = getPacienteById(parseInt(selectedPatient.id));
            
            if (pacienteReal) {
              // Crear la cita en el sistema
              const horaActual = now.toTimeString().split(' ')[0].substring(0, 5);
              const horaFin = new Date(now.getTime() + 30 * 60000).toTimeString().split(' ')[0].substring(0, 5);
              
              const nuevaCita = addCita({
                id_paciente: pacienteReal.id_paciente,
                id_usuario_sucursal: asignacionPrincipal.id_usuario_sucursal,
                id_sucursal: asignacionPrincipal.id_sucursal,
                fecha_cita: fechaActual,
                hora_inicio: horaActual,
                hora_fin: horaFin,
                duracion_minutos: 30,
                tipo_cita: 'consulta',
                motivo_consulta: historialClinicoForm ? historialClinicoForm.substring(0, 100) : 'Consulta directa',
                estado_cita: 'atendida',
                precio_cita: precioCita,
                forma_pago: 'efectivo',
                estado_pago: 'pendiente',
                notas_cita: null,
                cancelada_por: null,
                motivo_cancelacion: null,
                fecha_creacion: now.toISOString(),
                fecha_modificacion: now.toISOString(),
                recordatorio_enviado: false,
                confirmacion_paciente: false,
                consulta_realizada: true
              });
              
              toast.success('Consulta guardada. Cargo generado automáticamente en la pestaña Cargos.');
            } else {
              toast.success('Consulta guardada exitosamente.');
            }
          } else {
            toast.success('Consulta guardada exitosamente.');
          }
        } else {
          toast.success('Consulta guardada exitosamente.');
        }
      } catch (error) {
        console.error('Error al crear cita automática:', error);
        toast.success('Consulta guardada exitosamente.');
      }
    }
    
    // Notificar que la consulta fue completada
    if (onConsultaCompletada) {
      onConsultaCompletada();
    }
  };

  const handleAgregarArchivo = (archivo: Archivo) => {
    if (!selectedPatient) return;

    // Actualizar paciente con nuevo archivo
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        return {
          ...patient,
          archivos: [...patient.archivos, archivo],
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    
    // IMPORTANTE: Actualizar también mockPatients para persistir los datos
    const patientIndex = mockPatients.findIndex(p => p.id === selectedPatient.id);
    if (patientIndex !== -1) {
      mockPatients[patientIndex] = {
        ...mockPatients[patientIndex],
        archivos: [...mockPatients[patientIndex].archivos, archivo],
      };
    }
  };

  // Función para actualizar antecedentes del paciente
  const handleActualizarAntecedentes = (patientId: string, seccion: string, datos: any) => {
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          antecedentes: {
            ...patient.antecedentes,
            [seccion]: datos,
          },
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    
    // IMPORTANTE: Actualizar también mockPatients para persistir los datos
    const patientIndex = mockPatients.findIndex(p => p.id === patientId);
    if (patientIndex !== -1) {
      mockPatients[patientIndex] = {
        ...mockPatients[patientIndex],
        antecedentes: {
          ...mockPatients[patientIndex].antecedentes,
          [seccion]: datos,
        },
      };
    }
  };

  // Obtener fecha actual formateada
  const getFechaActual = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Gestión de Pacientes</h1>
        <p className="text-gray-600">Administra la información de tus pacientes</p>
      </div>

      {/* Botón Nuevo Paciente */}
      <div className="flex justify-end">
        <Button onClick={() => setIsNewPatientDialogOpen(true)} size="sm">
          <Plus className="size-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, cédula, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Dynamic Column Layout */}
      <div className={`grid gap-6 items-start ${expandedPatientId ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-1'}`}>
        {/* Primera Columna - Lista de Pacientes con Datos */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Lista de Pacientes</h2>
            </div>
            <div className="space-y-0">
              {filteredPatients.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No se encontraron pacientes
                </p>
              ) : (
                filteredPatients
                  .filter(patient => !expandedPatientId || patient.id === expandedPatientId)
                  .map((patient) => (
                    <PatientCard 
                      key={patient.id} 
                      patient={patient}
                      isExpanded={expandedPatientId === patient.id}
                      onToggle={() => handleTogglePatient(patient.id)}
                      onIniciarConsulta={handleIniciarConsulta}
                      onAgregarSignosVitales={handleAgregarSignosVitales}
                      onAgregarArchivo={handleAgregarArchivo}
                    />
                  ))
              )}
            </div>
            
            {/* Botón para volver a ver todos los pacientes */}
            {expandedPatientId && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => handleTogglePatient(expandedPatientId)}
              >
                Ver Todos los Pacientes
              </Button>
            )}
          </Card>
        </div>

        {/* Segunda Columna - ANTECEDENTES */}
        {expandedPatientId && selectedPatient && (
          <div className="lg:col-span-1">
            <Card className="p-4">
              <AntecedentesView 
                pacienteId={selectedPatient.id}
                pacienteNombre={selectedPatient.nombre}
                antecedentes={selectedPatient.antecedentes}
                onActualizarAntecedentes={handleActualizarAntecedentes}
              />
            </Card>
          </div>
        )}

        {/* Tercera Columna - HISTORIAL DE CONSULTAS */}
        {expandedPatientId && selectedPatient && (
          <div className="lg:col-span-1">
            <Card className="p-4">
              <HistorialCitasView patient={selectedPatient} />
            </Card>
          </div>
        )}
      </div>

      {/* Dialog para crear un nuevo paciente */}
      <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre completo"
                value={newPatient.nombre}
                onChange={(e) => setNewPatient({ ...newPatient, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={newPatient.fechaNacimiento}
                onChange={(e) => setNewPatient({ ...newPatient, fechaNacimiento: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select
                value={newPatient.sexo}
                onValueChange={(value: string) => setNewPatient({ ...newPatient, sexo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el sexo">{newPatient.sexo}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                placeholder="Número de cédula"
                value={newPatient.cedula}
                onChange={(e) => setNewPatient({ ...newPatient, cedula: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newPatient.correo}
                onChange={(e) => setNewPatient({ ...newPatient, correo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="+57 300 123 4567"
                value={newPatient.telefono}
                onChange={(e) => setNewPatient({ ...newPatient, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Dirección completa"
                value={newPatient.direccion}
                onChange={(e) => setNewPatient({ ...newPatient, direccion: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePatient}>
              Crear Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Agregar Signos Vitales (Independiente) */}
      <Dialog open={isSignosVitalesDialogOpen} onOpenChange={setIsSignosVitalesDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Signos Vitales - {selectedPatient?.nombre}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span className="capitalize">{getFechaActual()}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
            <Label className="text-sm text-gray-900">Signos Vitales</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="estatura" className="text-xs">Estatura (m)</Label>
                <Input
                  id="estatura"
                  type="number"
                  step="0.01"
                  placeholder="1.75"
                  value={signosVitalesForm.estatura}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, estatura: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="peso" className="text-xs">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={signosVitalesForm.peso}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, peso: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="temperatura" className="text-xs">Temp. (°C)</Label>
                <Input
                  id="temperatura"
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={signosVitalesForm.temperatura}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, temperatura: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="frecuenciaRespiratoria" className="text-xs">FR (rpm)</Label>
                <Input
                  id="frecuenciaRespiratoria"
                  type="number"
                  placeholder="18"
                  value={signosVitalesForm.frecuenciaRespiratoria}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, frecuenciaRespiratoria: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="frecuenciaCardiaca" className="text-xs">FC (bpm)</Label>
                <Input
                  id="frecuenciaCardiaca"
                  type="number"
                  placeholder="72"
                  value={signosVitalesForm.frecuenciaCardiaca}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, frecuenciaCardiaca: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="saturacionOxigeno" className="text-xs">Saturación O2 (%)</Label>
                <Input
                  id="saturacionOxigeno"
                  type="number"
                  placeholder="98"
                  value={signosVitalesForm.saturacionOxigeno}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, saturacionOxigeno: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="presionSistolica" className="text-xs">Sistólica</Label>
                <Input
                  id="presionSistolica"
                  type="number"
                  placeholder="120"
                  value={signosVitalesForm.presionSistolica}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, presionSistolica: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="presionDiastolica" className="text-xs">Diastólica</Label>
                <Input
                  id="presionDiastolica"
                  type="number"
                  placeholder="80"
                  value={signosVitalesForm.presionDiastolica}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, presionDiastolica: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="grasaCorporal" className="text-xs">Grasa (%)</Label>
                <Input
                  id="grasaCorporal"
                  type="number"
                  step="0.1"
                  placeholder="18"
                  value={signosVitalesForm.grasaCorporal}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, grasaCorporal: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="masaMuscular" className="text-xs">Masa Musc. (kg)</Label>
                <Input
                  id="masaMuscular"
                  type="number"
                  step="0.1"
                  placeholder="57.4"
                  value={signosVitalesForm.masaMuscular}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, masaMuscular: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="perimetroCefalico" className="text-xs">Perímetro Cefálico (cm)</Label>
                <Input
                  id="perimetroCefalico"
                  type="number"
                  step="0.1"
                  placeholder="56"
                  value={signosVitalesForm.perimetroCefalico}
                  onChange={(e) => setSignosVitalesForm({ ...signosVitalesForm, perimetroCefalico: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignosVitalesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarSignosVitales} className="bg-blue-600 hover:bg-blue-700">
              Guardar Signos Vitales
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Nueva Consulta (SIN signos vitales) */}
      <Dialog open={isConsultaDialogOpen} onOpenChange={setIsConsultaDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Consulta - {selectedPatient?.nombre}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span className="capitalize">{getFechaActual()}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Historial Clínico */}
            <div className="space-y-2">
              <Label htmlFor="historialClinico" className="text-sm text-gray-900">Historial Clínico</Label>
              <Textarea
                id="historialClinico"
                value={historialClinicoForm}
                onChange={(e) => setHistorialClinicoForm(e.target.value)}
                placeholder="Motivo de consulta, diagnóstico, observaciones..."
                className="min-h-[100px] text-sm"
              />
            </div>

            {/* Receta Médica */}
            <div className="space-y-2">
              <Label htmlFor="recetaMedica" className="text-sm text-gray-900">Receta Médica</Label>
              <Textarea
                id="recetaMedica"
                value={recetaMedicaForm}
                onChange={(e) => setRecetaMedicaForm(e.target.value)}
                placeholder="Medicamentos y dosis..."
                className="min-h-[100px] text-sm"
              />
            </div>

            {/* Pedido de Exámenes */}
            <div className="space-y-2">
              <Label htmlFor="pedidoExamenes" className="text-sm text-gray-900">Pedido de Exámenes</Label>
              <Textarea
                id="pedidoExamenes"
                value={pedidoExamenesForm}
                onChange={(e) => setPedidoExamenesForm(e.target.value)}
                placeholder="Exámenes solicitados..."
                className="min-h-[100px] text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsultaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarConsulta} className="bg-blue-600 hover:bg-blue-700">
              Guardar Consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}