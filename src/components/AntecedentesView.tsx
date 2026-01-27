import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, X, Save } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface VaccinationGroup {
  age: string;
  vaccines: string[];
}

const vaccinationSchedule: VaccinationGroup[] = [
  {
    age: 'Nacimiento',
    vaccines: ['BCG', '1a Hepatitis B'],
  },
  {
    age: '2 meses',
    vaccines: ['1a Pentavalente Acelular', '2a Hepatitis B', '1a Rotavirus', '1a Neumococo'],
  },
  {
    age: '4 meses',
    vaccines: ['2a Pentavalente Acelular', '2a Rotavirus', '2a Neumococo'],
  },
  {
    age: '6 meses',
    vaccines: ['3a Pentavalente Acelular', '3a Hepatitis B', '3a Rotavirus', '1a Anti Influenza (en temporada de frio)'],
  },
  {
    age: '7 meses',
    vaccines: ['2a Anti Influenza (en temporada de frio)'],
  },
  {
    age: '12 meses',
    vaccines: ['1a SRP', '3a Neumococo'],
  },
  {
    age: '18 meses',
    vaccines: ['4a Pentavalente Acelular'],
  },
  {
    age: '2 años',
    vaccines: ['Influenza Refuerzo Anual (oct-ene)'],
  },
  {
    age: '3 años',
    vaccines: ['Influenza Refuerzo Anual (oct-ene)'],
  },
  {
    age: '4 años',
    vaccines: ['DPT', 'Influenza Refuerzo Anual (oct-ene)'],
  },
  {
    age: '5 años',
    vaccines: ['Influenza Refuerzo Anual (oct-ene)', 'VOP/OPV (Sabin, pollo oral) en 1a y 2a Semana Nal. de Salud (después de 2 previas de Pentavalente Acelular)'],
  },
  {
    age: '6 años',
    vaccines: ['2a SRP'],
  },
  {
    age: '11 años / 5to primaria',
    vaccines: ['VPH'],
  },
];

interface AntecedentesViewProps {
  pacienteId: string;
  pacienteNombre: string;
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
  onActualizarAntecedentes?: (pacienteId: string, seccion: string, datos: any) => void;
}

export function AntecedentesView({ pacienteId, pacienteNombre, antecedentes, onActualizarAntecedentes }: AntecedentesViewProps) {
  const [selectedVaccines, setSelectedVaccines] = useState<Set<string>>(
    new Set(antecedentes?.esquemaVacunacion?.selectedVaccines || [])
  );
  const [hasOtherVaccines, setHasOtherVaccines] = useState<boolean | null>(
    antecedentes?.esquemaVacunacion?.hasOtherVaccines ?? null
  );
  const [alergias, setAlergias] = useState<string[]>(
    antecedentes?.alergias || []
  );
  const [nuevaAlergia, setNuevaAlergia] = useState('');
  
  // Estados para Vacunas
  const [vacunas, setVacunas] = useState<string[]>(
    antecedentes?.vacunas || []
  );
  const [nuevaVacuna, setNuevaVacuna] = useState('');
  
  // Estados para Medicamentos Activos
  const [medicamentos, setMedicamentos] = useState<string[]>(
    antecedentes?.medicamentos || []
  );
  const [nuevoMedicamento, setNuevoMedicamento] = useState('');
  
  // Estados para Antecedentes Patológicos
  const [antecedentesPatologicos, setAntecedentesPatologicos] = useState<Record<string, string>>(
    antecedentes?.antecedentesPatologicos || {
      hospitalizacion: '',
      cirugias: '',
      diabetes: '',
      tiroideas: '',
      hipertension: '',
      cardiopatias: '',
      traumatismos: '',
      cancer: '',
      tuberculosis: '',
      transfusiones: '',
      respiratorias: '',
      gastrointestinales: '',
      ets: '',
      renalCronica: '',
      otros: '',
    }
  );

  // Estados para Antecedentes No Patológicos
  const [antecedentesNoPatologicos, setAntecedentesNoPatologicos] = useState<Record<string, string>>(
    antecedentes?.antecedentesNoPatologicos || {
      actividadFisica: '',
      tabaquismo: '',
      alcoholismo: '',
      drogas: '',
      vacunaReciente: '',
      otros: '',
    }
  );

  // Estados para Antecedentes Heredofamiliares
  const [antecedentesHeredofamiliares, setAntecedentesHeredofamiliares] = useState<Record<string, string>>(
    antecedentes?.antecedentesHeredofamiliares || {
      diabetes: '',
      cardiopatias: '',
      hipertension: '',
      tiroideas: '',
      renalCronica: '',
      otros: '',
    }
  );

  // Estados para Antecedentes Gineco-Obstétricos
  const [antecedentesGineco, setAntecedentesGineco] = useState(
    antecedentes?.antecedentesGineco || {
      primeraMenstruacion: '',
      ultimaMenstruacion: '',
      caracteristicasMenstruacion: '',
      embarazos: '',
      cancerCervico: '',
      cancerUterino: '',
      cancerMama: '',
      actividadSexual: '',
      metodoPlanificacion: '',
      terapiaHormonal: '',
      ultimoPapanicolau: '',
      ultimaMastografia: '',
      otros: '',
    }
  );

  // Estados para Antecedentes Perinatales
  const [antecedentesperinatales, setAntecedentesperinatales] = useState(
    antecedentes?.antecedentesperinatales || {
      ultimoCicloMenstrual: '',
      duracionCiclo: '',
      ultimoMetodoAnticonceptivo: '',
      concepcionAsistida: '',
      fechaProbableParto: '',
      fppFinal: '',
      notasEmbarazo: '',
    }
  );

  // Estados para Antecedentes Postnatales
  const [antecedentesPostnatales, setAntecedentesPostnatales] = useState(
    antecedentes?.antecedentesPostnatales || {
      detallesParto: '',
      nombreBebe: '',
      pesoNacer: '',
      saludBebe: '',
      alimentacionBebe: '',
      estadoEmocional: '',
    }
  );

  // Estados para Antecedentes Psiquiátricos
  const [antecedentesPsiquiatricos, setAntecedentesPsiquiatricos] = useState(
    antecedentes?.antecedentesPsiquiatricos || {
      historiaFamiliar: '',
      concienciaEnfermedad: '',
      areasAfectadas: '',
      tratamientos: '',
      apoyoGrupoFamiliar: '',
      grupoFamiliar: '',
      aspectosVidaSocial: '',
      aspectosVidaLaboral: '',
      relacionAutoridad: '',
      controlImpulsos: '',
      manejoFrustracion: '',
    }
  );

  // Estados para Dieta Nutriológica
  const [dietaNutriologica, setDietaNutriologica] = useState(
    antecedentes?.dietaNutriologica || {
      desayuno: null as boolean | null,
      colacionManana: null as boolean | null,
      comida: null as boolean | null,
      colacionTarde: null as boolean | null,
      cena: null as boolean | null,
      alimentosPreparadosCasa: null as boolean | null,
      nivelApetito: '' as 'excesivo' | 'bueno' | 'regular' | 'poco' | 'nulo' | '',
      presenciaHambreSaciedad: null as boolean | null,
      vasosAguaDia: '' as '1-menos' | '2-3' | '4-mas' | '',
      preferenciasAlimentos: '',
      malestaresPorAlimentos: null as boolean | null,
      medicamentosComplementos: null as boolean | null,
      otrasDietas: null as boolean | null,
      pesoIdeal: '',
    }
  );

  // Efecto para actualizar los estados cuando cambian los antecedentes cargados
  useEffect(() => {
    if (antecedentes) {
      // Actualizar esquema de vacunación
      if (antecedentes.esquemaVacunacion) {
        setSelectedVaccines(new Set(antecedentes.esquemaVacunacion.selectedVaccines || []));
        setHasOtherVaccines(antecedentes.esquemaVacunacion.hasOtherVaccines ?? null);
      }
      
      // Actualizar alergias
      if (antecedentes.alergias) {
        setAlergias(antecedentes.alergias);
      }
      
      // Actualizar vacunas
      if (antecedentes.vacunas) {
        setVacunas(antecedentes.vacunas);
      }
      
      // Actualizar medicamentos
      if (antecedentes.medicamentos) {
        setMedicamentos(antecedentes.medicamentos);
      }
      
      // Actualizar antecedentes patológicos
      if (antecedentes.antecedentesPatologicos) {
        setAntecedentesPatologicos(antecedentes.antecedentesPatologicos);
      }
      
      // Actualizar antecedentes no patológicos
      if (antecedentes.antecedentesNoPatologicos) {
        setAntecedentesNoPatologicos(antecedentes.antecedentesNoPatologicos);
      }
      
      // Actualizar antecedentes heredofamiliares
      if (antecedentes.antecedentesHeredofamiliares) {
        setAntecedentesHeredofamiliares(antecedentes.antecedentesHeredofamiliares);
      }
      
      // Actualizar antecedentes gineco-obstétricos
      if (antecedentes.antecedentesGineco) {
        setAntecedentesGineco(antecedentes.antecedentesGineco);
      }
      
      // Actualizar antecedentes perinatales
      if (antecedentes.antecedentesperinatales) {
        setAntecedentesperinatales(antecedentes.antecedentesperinatales);
      }
      
      // Actualizar antecedentes postnatales
      if (antecedentes.antecedentesPostnatales) {
        setAntecedentesPostnatales(antecedentes.antecedentesPostnatales);
      }
      
      // Actualizar antecedentes psiquiátricos
      if (antecedentes.antecedentesPsiquiatricos) {
        setAntecedentesPsiquiatricos(antecedentes.antecedentesPsiquiatricos);
      }
      
      // Actualizar dieta nutriológica
      if (antecedentes.dietaNutriologica) {
        setDietaNutriologica(antecedentes.dietaNutriologica);
      }
    }
  }, [antecedentes]);

  const handleVaccineToggle = (vaccine: string) => {
    const newSelected = new Set(selectedVaccines);
    if (newSelected.has(vaccine)) {
      newSelected.delete(vaccine);
    } else {
      newSelected.add(vaccine);
    }
    setSelectedVaccines(newSelected);
  };

  const handleAddAlergia = () => {
    if (nuevaAlergia.trim()) {
      setAlergias([...alergias, nuevaAlergia.trim()]);
      setNuevaAlergia('');
    }
  };

  const handleRemoveAlergia = (index: number) => {
    setAlergias(alergias.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddAlergia();
    }
  };

  // Funciones para Vacunas
  const handleAddVacuna = () => {
    if (nuevaVacuna.trim()) {
      setVacunas([...vacunas, nuevaVacuna.trim()]);
      setNuevaVacuna('');
    }
  };

  const handleRemoveVacuna = (index: number) => {
    setVacunas(vacunas.filter((_, i) => i !== index));
  };

  const handleKeyPressVacuna = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddVacuna();
    }
  };

  // Funciones para Medicamentos
  const handleAddMedicamento = () => {
    if (nuevoMedicamento.trim()) {
      setMedicamentos([...medicamentos, nuevoMedicamento.trim()]);
      setNuevoMedicamento('');
    }
  };

  const handleRemoveMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleKeyPressMedicamento = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddMedicamento();
    }
  };

  // Funciones para guardar cada sección
  const handleGuardarEsquemaVacunacion = () => {
    const datos = {
      selectedVaccines: Array.from(selectedVaccines),
      hasOtherVaccines
    };
    onActualizarAntecedentes?.(pacienteId, 'esquemaVacunacion', datos);
  };

  const handleGuardarAlergias = () => {
    onActualizarAntecedentes?.(pacienteId, 'alergias', alergias);
  };

  const handleGuardarAntecedentesPatologicos = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesPatologicos', antecedentesPatologicos);
  };

  const handleGuardarAntecedentesNoPatologicos = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesNoPatologicos', antecedentesNoPatologicos);
  };

  const handleGuardarAntecedentesHeredofamiliares = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesHeredofamiliares', antecedentesHeredofamiliares);
  };

  const handleGuardarAntecedentesGineco = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesGineco', antecedentesGineco);
  };

  const handleGuardarAntecedentesperinatales = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesperinatales', antecedentesperinatales);
  };

  const handleGuardarAntecedentesPostnatales = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesPostnatales', antecedentesPostnatales);
  };

  const handleGuardarAntecedentesPsiquiatricos = () => {
    onActualizarAntecedentes?.(pacienteId, 'antecedentesPsiquiatricos', antecedentesPsiquiatricos);
  };

  const handleGuardarVacunas = () => {
    onActualizarAntecedentes?.(pacienteId, 'vacunas', vacunas);
  };

  const handleGuardarMedicamentos = () => {
    onActualizarAntecedentes?.(pacienteId, 'medicamentos', medicamentos);
  };

  const handleGuardarDietaNutriologica = () => {
    onActualizarAntecedentes?.(pacienteId, 'dietaNutriologica', dietaNutriologica);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-gray-900">ANTECEDENTES</h2>
        <p className="text-sm text-gray-500">Paciente: {pacienteNombre}</p>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {/* Esquema de Vacunación */}
        <AccordionItem value="esquema-vacunacion" className="border rounded-lg px-4 bg-blue-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Esquema de Vacunación</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {vaccinationSchedule.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <h4 className="text-gray-700">{group.age}</h4>
                  <div className="space-y-2 pl-4">
                    {group.vaccines.map((vaccine, vaccineIndex) => {
                      const vaccineId = `${group.age}-${vaccineIndex}`;
                      return (
                        <div key={vaccineId} className="flex items-start gap-2">
                          <Checkbox
                            id={vaccineId}
                            checked={selectedVaccines.has(vaccineId)}
                            onCheckedChange={() => handleVaccineToggle(vaccineId)}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={vaccineId}
                            className="text-sm text-gray-700 cursor-pointer leading-tight"
                          >
                            {vaccine}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Otras Vacunas */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Label className="text-gray-700">Otras Vacunas</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="otras-si"
                        checked={hasOtherVaccines === true}
                        onCheckedChange={() => setHasOtherVaccines(true)}
                      />
                      <Label htmlFor="otras-si" className="text-sm cursor-pointer">
                        Sí
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="otras-no"
                        checked={hasOtherVaccines === false}
                        onCheckedChange={() => setHasOtherVaccines(false)}
                      />
                      <Label htmlFor="otras-no" className="text-sm cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarEsquemaVacunacion}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Alergias */}
        <AccordionItem value="alergias" className="border rounded-lg px-4 bg-red-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Alergias</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Campo para agregar nueva alergia */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Escribir alergia..."
                  value={nuevaAlergia}
                  onChange={(e) => setNuevaAlergia(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddAlergia}
                  disabled={!nuevaAlergia.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="size-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {/* Listado de alergias */}
              {alergias.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Alergias registradas:</Label>
                  <div className="space-y-2">
                    {alergias.map((alergia, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">{alergia}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveAlergia(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">No hay alergias registradas</p>
              )}

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAlergias}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes Patológicos */}
        <AccordionItem value="antecedentes-patologicos" className="border rounded-lg px-4 bg-orange-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes Patológicos</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Hospitalización Previa */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Hospitalización Previa</Label>
                <RadioGroup
                  value={antecedentesPatologicos.hospitalizacion}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, hospitalizacion: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="hosp-si" />
                    <Label htmlFor="hosp-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hosp-no" />
                    <Label htmlFor="hosp-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cirugías Previas */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cirugías Previas</Label>
                <RadioGroup
                  value={antecedentesPatologicos.cirugias}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, cirugias: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cirug-si" />
                    <Label htmlFor="cirug-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cirug-no" />
                    <Label htmlFor="cirug-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Diabetes */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Diabetes</Label>
                <RadioGroup
                  value={antecedentesPatologicos.diabetes}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, diabetes: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="diab-si" />
                    <Label htmlFor="diab-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="diab-no" />
                    <Label htmlFor="diab-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Enfermedades Tiroideas */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Enfermedades Tiroideas</Label>
                <RadioGroup
                  value={antecedentesPatologicos.tiroideas}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, tiroideas: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="tiro-si" />
                    <Label htmlFor="tiro-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tiro-no" />
                    <Label htmlFor="tiro-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Hipertensión Arterial */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Hipertensión Arterial</Label>
                <RadioGroup
                  value={antecedentesPatologicos.hipertension}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, hipertension: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="hiper-si" />
                    <Label htmlFor="hiper-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hiper-no" />
                    <Label htmlFor="hiper-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cardiopatias */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cardiopatias</Label>
                <RadioGroup
                  value={antecedentesPatologicos.cardiopatias}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, cardiopatias: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cardio-si" />
                    <Label htmlFor="cardio-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cardio-no" />
                    <Label htmlFor="cardio-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Traumatismos */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Traumatismos</Label>
                <RadioGroup
                  value={antecedentesPatologicos.traumatismos}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, traumatismos: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="trauma-si" />
                    <Label htmlFor="trauma-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="trauma-no" />
                    <Label htmlFor="trauma-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cáncer */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cáncer</Label>
                <RadioGroup
                  value={antecedentesPatologicos.cancer}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, cancer: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cancer-si" />
                    <Label htmlFor="cancer-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cancer-no" />
                    <Label htmlFor="cancer-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tuberculosis */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Tuberculosis</Label>
                <RadioGroup
                  value={antecedentesPatologicos.tuberculosis}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, tuberculosis: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="tuber-si" />
                    <Label htmlFor="tuber-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tuber-no" />
                    <Label htmlFor="tuber-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Transfusiones */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Transfusiones</Label>
                <RadioGroup
                  value={antecedentesPatologicos.transfusiones}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, transfusiones: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="transf-si" />
                    <Label htmlFor="transf-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="transf-no" />
                    <Label htmlFor="transf-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Patologías Respiratorias */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Patologías Respiratorias</Label>
                <RadioGroup
                  value={antecedentesPatologicos.respiratorias}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, respiratorias: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="resp-si" />
                    <Label htmlFor="resp-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="resp-no" />
                    <Label htmlFor="resp-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Patologías Gastrointestinales */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Patologías Gastrointestinales</Label>
                <RadioGroup
                  value={antecedentesPatologicos.gastrointestinales}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, gastrointestinales: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="gastro-si" />
                    <Label htmlFor="gastro-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="gastro-no" />
                    <Label htmlFor="gastro-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Enfermedades de Transmisión Sexual */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Enfermedades de Transmisión Sexual</Label>
                <RadioGroup
                  value={antecedentesPatologicos.ets}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, ets: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="ets-si" />
                    <Label htmlFor="ets-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ets-no" />
                    <Label htmlFor="ets-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Enfermedad Renal Crónica */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Enfermedad Renal Crónica</Label>
                <RadioGroup
                  value={antecedentesPatologicos.renalCronica}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, renalCronica: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="renal-si" />
                    <Label htmlFor="renal-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="renal-no" />
                    <Label htmlFor="renal-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Otros */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm text-gray-700">Otros</Label>
                <RadioGroup
                  value={antecedentesPatologicos.otros}
                  onValueChange={(value: string) => 
                    setAntecedentesPatologicos({ ...antecedentesPatologicos, otros: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="otros-si" />
                    <Label htmlFor="otros-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="otros-no" />
                    <Label htmlFor="otros-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesPatologicos}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes No Patológicos */}
        <AccordionItem value="antecedentes-no-patologicos" className="border rounded-lg px-4 bg-green-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes No Patológicos</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Actividad Física */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Actividad Física</Label>
                <RadioGroup
                  value={antecedentesNoPatologicos.actividadFisica}
                  onValueChange={(value: string) => 
                    setAntecedentesNoPatologicos({ ...antecedentesNoPatologicos, actividadFisica: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="act-fisica-si" />
                    <Label htmlFor="act-fisica-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="act-fisica-no" />
                    <Label htmlFor="act-fisica-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tabaquismo */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Tabaquismo</Label>
                <RadioGroup
                  value={antecedentesNoPatologicos.tabaquismo}
                  onValueChange={(value: string) => 
                    setAntecedentesNoPatologicos({ ...antecedentesNoPatologicos, tabaquismo: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="tabaco-si" />
                    <Label htmlFor="tabaco-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tabaco-no" />
                    <Label htmlFor="tabaco-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Alcoholismo */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Alcoholismo</Label>
                <RadioGroup
                  value={antecedentesNoPatologicos.alcoholismo}
                  onValueChange={(value: string) => 
                    setAntecedentesNoPatologicos({ ...antecedentesNoPatologicos, alcoholismo: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="alcohol-si" />
                    <Label htmlFor="alcohol-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="alcohol-no" />
                    <Label htmlFor="alcohol-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Uso de otras sustancias (Drogas) */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Uso de otras sustancias (Drogas)</Label>
                <RadioGroup
                  value={antecedentesNoPatologicos.drogas}
                  onValueChange={(value: string) => 
                    setAntecedentesNoPatologicos({ ...antecedentesNoPatologicos, drogas: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="drogas-si" />
                    <Label htmlFor="drogas-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="drogas-no" />
                    <Label htmlFor="drogas-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Vacuna o Inmunización reciente */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Vacuna o Inmunización reciente</Label>
                <RadioGroup
                  value={antecedentesNoPatologicos.vacunaReciente}
                  onValueChange={(value: string) => 
                    setAntecedentesNoPatologicos({ ...antecedentesNoPatologicos, vacunaReciente: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="vacuna-rec-si" />
                    <Label htmlFor="vacuna-rec-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="vacuna-rec-no" />
                    <Label htmlFor="vacuna-rec-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Otros */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm text-gray-700">Otros</Label>
                <RadioGroup
                  value={antecedentesNoPatologicos.otros}
                  onValueChange={(value: string) => 
                    setAntecedentesNoPatologicos({ ...antecedentesNoPatologicos, otros: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="otros-nopat-si" />
                    <Label htmlFor="otros-nopat-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="otros-nopat-no" />
                    <Label htmlFor="otros-nopat-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesNoPatologicos}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes Heredofamiliares */}
        <AccordionItem value="antecedentes-heredofamiliares" className="border rounded-lg px-4 bg-purple-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes Heredofamiliares</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Diabetes */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Diabetes</Label>
                <RadioGroup
                  value={antecedentesHeredofamiliares.diabetes}
                  onValueChange={(value: string) => 
                    setAntecedentesHeredofamiliares({ ...antecedentesHeredofamiliares, diabetes: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="diab-her-si" />
                    <Label htmlFor="diab-her-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="diab-her-no" />
                    <Label htmlFor="diab-her-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cardiopatias */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cardiopatias</Label>
                <RadioGroup
                  value={antecedentesHeredofamiliares.cardiopatias}
                  onValueChange={(value: string) => 
                    setAntecedentesHeredofamiliares({ ...antecedentesHeredofamiliares, cardiopatias: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cardio-her-si" />
                    <Label htmlFor="cardio-her-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cardio-her-no" />
                    <Label htmlFor="cardio-her-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Hipertensión Arterial */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Hipertensión Arterial</Label>
                <RadioGroup
                  value={antecedentesHeredofamiliares.hipertension}
                  onValueChange={(value: string) => 
                    setAntecedentesHeredofamiliares({ ...antecedentesHeredofamiliares, hipertension: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="hiper-her-si" />
                    <Label htmlFor="hiper-her-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hiper-her-no" />
                    <Label htmlFor="hiper-her-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Enfermedades Tiroideas */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Enfermedades Tiroideas</Label>
                <RadioGroup
                  value={antecedentesHeredofamiliares.tiroideas}
                  onValueChange={(value: string) => 
                    setAntecedentesHeredofamiliares({ ...antecedentesHeredofamiliares, tiroideas: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="tiro-her-si" />
                    <Label htmlFor="tiro-her-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tiro-her-no" />
                    <Label htmlFor="tiro-her-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Enfermedad Renal Crónica */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Enfermedad Renal Crónica</Label>
                <RadioGroup
                  value={antecedentesHeredofamiliares.renalCronica}
                  onValueChange={(value: string) => 
                    setAntecedentesHeredofamiliares({ ...antecedentesHeredofamiliares, renalCronica: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="renal-her-si" />
                    <Label htmlFor="renal-her-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="renal-her-no" />
                    <Label htmlFor="renal-her-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Otros */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm text-gray-700">Otros</Label>
                <RadioGroup
                  value={antecedentesHeredofamiliares.otros}
                  onValueChange={(value: string) => 
                    setAntecedentesHeredofamiliares({ ...antecedentesHeredofamiliares, otros: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="otros-her-si" />
                    <Label htmlFor="otros-her-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="otros-her-no" />
                    <Label htmlFor="otros-her-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesHeredofamiliares}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes Gineco-Obstétricos */}
        <AccordionItem value="antecedentes-gineco" className="border rounded-lg px-4 bg-pink-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes Gineco-Obstétricos</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-6">
              {/* Primera Menstruación */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Primera Menstruación</Label>
                <Input
                  type="date"
                  value={antecedentesGineco.primeraMenstruacion}
                  onChange={(e) => setAntecedentesGineco({ ...antecedentesGineco, primeraMenstruacion: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Última Menstruación */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Última Menstruación</Label>
                <Input
                  type="date"
                  value={antecedentesGineco.ultimaMenstruacion}
                  onChange={(e) => setAntecedentesGineco({ ...antecedentesGineco, ultimaMenstruacion: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Características de la Menstruación */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Características de la Menstruación</Label>
                <Textarea
                  placeholder="Escribir las características de la menstruación..."
                  value={antecedentesGineco.caracteristicasMenstruacion}
                  onChange={(e) => setAntecedentesGineco({ ...antecedentesGineco, caracteristicasMenstruacion: e.target.value })}
                  className="w-full min-h-[120px] resize-none"
                />
              </div>

              {/* Embarazos */}
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <Label className="text-sm text-gray-700">Embarazos</Label>
                <RadioGroup
                  value={antecedentesGineco.embarazos}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, embarazos: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="embarazos-si" />
                    <Label htmlFor="embarazos-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="embarazos-no" />
                    <Label htmlFor="embarazos-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cáncer Cérvico */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cáncer Cérvico</Label>
                <RadioGroup
                  value={antecedentesGineco.cancerCervico}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, cancerCervico: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cervico-si" />
                    <Label htmlFor="cervico-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cervico-no" />
                    <Label htmlFor="cervico-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cáncer Uterino */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cáncer Uterino</Label>
                <RadioGroup
                  value={antecedentesGineco.cancerUterino}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, cancerUterino: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="uterino-si" />
                    <Label htmlFor="uterino-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="uterino-no" />
                    <Label htmlFor="uterino-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cáncer de Mama */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cáncer de Mama</Label>
                <RadioGroup
                  value={antecedentesGineco.cancerMama}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, cancerMama: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="mama-si" />
                    <Label htmlFor="mama-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="mama-no" />
                    <Label htmlFor="mama-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Actividad sexual del paciente */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Actividad sexual del paciente</Label>
                <RadioGroup
                  value={antecedentesGineco.actividadSexual}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, actividadSexual: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="activ-sexual-si" />
                    <Label htmlFor="activ-sexual-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="activ-sexual-no" />
                    <Label htmlFor="activ-sexual-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Método de Planificación Familiar */}
              <div className="space-y-2 pt-4">
                <Label className="text-sm text-gray-700">Método de Planificación Familiar</Label>
                <Input
                  type="text"
                  placeholder="Escribir método de planificación..."
                  value={antecedentesGineco.metodoPlanificacion}
                  onChange={(e) => setAntecedentesGineco({ ...antecedentesGineco, metodoPlanificacion: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Terapia de reemplazo hormonal */}
              <div className="flex items-center justify-between py-2 border-b pt-4">
                <Label className="text-sm text-gray-700">Terapia de reemplazo hormonal</Label>
                <RadioGroup
                  value={antecedentesGineco.terapiaHormonal}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, terapiaHormonal: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="terapia-si" />
                    <Label htmlFor="terapia-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="terapia-no" />
                    <Label htmlFor="terapia-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Último Papanicolau */}
              <div className="space-y-2 pt-4">
                <Label className="text-sm text-gray-700">Último Papanicolau</Label>
                <Input
                  type="date"
                  value={antecedentesGineco.ultimoPapanicolau}
                  onChange={(e) => setAntecedentesGineco({ ...antecedentesGineco, ultimoPapanicolau: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Última Mastografía */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Última Mastografía</Label>
                <Input
                  type="date"
                  value={antecedentesGineco.ultimaMastografia}
                  onChange={(e) => setAntecedentesGineco({ ...antecedentesGineco, ultimaMastografia: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Otros */}
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <Label className="text-sm text-gray-700">Otros</Label>
                <RadioGroup
                  value={antecedentesGineco.otros}
                  onValueChange={(value: string) => 
                    setAntecedentesGineco({ ...antecedentesGineco, otros: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="otros-gineco-si" />
                    <Label htmlFor="otros-gineco-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="otros-gineco-no" />
                    <Label htmlFor="otros-gineco-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesGineco}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes Perinatales */}
        <AccordionItem value="antecedentes-perinatales" className="border rounded-lg px-4 bg-indigo-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes Perinatales</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Último Ciclo Menstrual */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Último Ciclo Menstrual</Label>
                <Input
                  type="date"
                  value={antecedentesperinatales.ultimoCicloMenstrual}
                  onChange={(e) => setAntecedentesperinatales({ ...antecedentesperinatales, ultimoCicloMenstrual: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Duración del Ciclo */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Duración del Ciclo</Label>
                <Input
                  type="text"
                  placeholder="Escribir duración del ciclo..."
                  value={antecedentesperinatales.duracionCiclo}
                  onChange={(e) => setAntecedentesperinatales({ ...antecedentesperinatales, duracionCiclo: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Último Método Anticonceptivo */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Último Método Anticonceptivo</Label>
                <Input
                  type="text"
                  placeholder="Escribir último método anticonceptivo..."
                  value={antecedentesperinatales.ultimoMetodoAnticonceptivo}
                  onChange={(e) => setAntecedentesperinatales({ ...antecedentesperinatales, ultimoMetodoAnticonceptivo: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Concepción Asistida */}
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <Label className="text-sm text-gray-700">Concepción Asistida</Label>
                <RadioGroup
                  value={antecedentesperinatales.concepcionAsistida}
                  onValueChange={(value: string) => 
                    setAntecedentesperinatales({ ...antecedentesperinatales, concepcionAsistida: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="concepcion-si" />
                    <Label htmlFor="concepcion-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="concepcion-no" />
                    <Label htmlFor="concepcion-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Fecha Probable de Parto */}
              <div className="space-y-2 pt-4">
                <Label className="text-sm text-gray-700">Fecha Probable de Parto</Label>
                <Input
                  type="date"
                  value={antecedentesperinatales.fechaProbableParto}
                  onChange={(e) => setAntecedentesperinatales({ ...antecedentesperinatales, fechaProbableParto: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* FPP Final */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">FPP Final</Label>
                <Input
                  type="date"
                  value={antecedentesperinatales.fppFinal}
                  onChange={(e) => setAntecedentesperinatales({ ...antecedentesperinatales, fppFinal: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Notas del Embarazo */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Notas del Embarazo</Label>
                <Textarea
                  placeholder="Escribir notas del embarazo..."
                  value={antecedentesperinatales.notasEmbarazo}
                  onChange={(e) => setAntecedentesperinatales({ ...antecedentesperinatales, notasEmbarazo: e.target.value })}
                  className="w-full min-h-[120px] resize-none"
                />
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesperinatales}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes Postnatales */}
        <AccordionItem value="antecedentes-postnatales" className="border rounded-lg px-4 bg-yellow-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes Postnatales</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-6">
              {/* Detalles del parto */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Detalles del parto</Label>
                <Textarea
                  placeholder="Escribir detalles del parto..."
                  value={antecedentesPostnatales.detallesParto}
                  onChange={(e) => setAntecedentesPostnatales({ ...antecedentesPostnatales, detallesParto: e.target.value })}
                  className="w-full min-h-[120px] resize-none"
                />
              </div>

              {/* Nombre del bebé */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Nombre del bebé</Label>
                <Input
                  type="text"
                  placeholder="Escribir nombre del bebé..."
                  value={antecedentesPostnatales.nombreBebe}
                  onChange={(e) => setAntecedentesPostnatales({ ...antecedentesPostnatales, nombreBebe: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Peso al nacer */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Peso al nacer</Label>
                <Input
                  type="text"
                  placeholder="Ej: 3.5 kg"
                  value={antecedentesPostnatales.pesoNacer}
                  onChange={(e) => setAntecedentesPostnatales({ ...antecedentesPostnatales, pesoNacer: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Salud del bebé */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Salud del bebé</Label>
                <Textarea
                  placeholder="Escribir información sobre la salud del bebé..."
                  value={antecedentesPostnatales.saludBebe}
                  onChange={(e) => setAntecedentesPostnatales({ ...antecedentesPostnatales, saludBebe: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Alimentación del bebé */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Alimentación del bebé</Label>
                <RadioGroup
                  value={antecedentesPostnatales.alimentacionBebe}
                  onValueChange={(value: string) => 
                    setAntecedentesPostnatales({ ...antecedentesPostnatales, alimentacionBebe: value })
                  }
                  className="flex flex-col gap-3 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo-pecho" id="alim-pecho" />
                    <Label htmlFor="alim-pecho" className="text-sm cursor-pointer">Sólo pecho</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo-formula" id="alim-formula" />
                    <Label htmlFor="alim-formula" className="text-sm cursor-pointer">Sólo formula</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pecho-formula" id="alim-mixta" />
                    <Label htmlFor="alim-mixta" className="text-sm cursor-pointer">Pecho y Formula</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Estado emocional */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Estado emocional</Label>
                <Textarea
                  placeholder="Escribir información sobre el estado emocional..."
                  value={antecedentesPostnatales.estadoEmocional}
                  onChange={(e) => setAntecedentesPostnatales({ ...antecedentesPostnatales, estadoEmocional: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesPostnatales}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Antecedentes Psiquiátricos */}
        <AccordionItem value="antecedentes-psiquiatricos" className="border rounded-lg px-4 bg-teal-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Antecedentes Psiquiátricos</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-6">
              {/* Historia Familiar */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Historia Familiar</Label>
                <Textarea
                  placeholder="Escribir historia familiar psiquiátrica..."
                  value={antecedentesPsiquiatricos.historiaFamiliar}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, historiaFamiliar: e.target.value })}
                  className="w-full min-h-[120px] resize-none"
                />
              </div>

              {/* Conciencia de enfermedad */}
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <Label className="text-sm text-gray-700">Conciencia de enfermedad</Label>
                <RadioGroup
                  value={antecedentesPsiquiatricos.concienciaEnfermedad}
                  onValueChange={(value: string) => 
                    setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, concienciaEnfermedad: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="conciencia-si" />
                    <Label htmlFor="conciencia-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="conciencia-no" />
                    <Label htmlFor="conciencia-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Áreas afectadas por la enfermedad */}
              <div className="space-y-2 pt-4">
                <Label className="text-sm text-gray-700">Áreas afectadas por la enfermedad</Label>
                <Textarea
                  placeholder="Escribir áreas afectadas..."
                  value={antecedentesPsiquiatricos.areasAfectadas}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, areasAfectadas: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Tratamientos pasados y actuales */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Tratamientos pasados y actuales</Label>
                <Textarea
                  placeholder="Escribir tratamientos..."
                  value={antecedentesPsiquiatricos.tratamientos}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, tratamientos: e.target.value })}
                  className="w-full min-h-[120px] resize-none"
                />
              </div>

              {/* Apoyo del grupo familiar o social */}
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <Label className="text-sm text-gray-700">Apoyo del grupo familiar o social</Label>
                <RadioGroup
                  value={antecedentesPsiquiatricos.apoyoGrupoFamiliar}
                  onValueChange={(value: string) => 
                    setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, apoyoGrupoFamiliar: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="apoyo-si" />
                    <Label htmlFor="apoyo-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="apoyo-no" />
                    <Label htmlFor="apoyo-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Grupo familiar del paciente */}
              <div className="space-y-2 pt-4">
                <Label className="text-sm text-gray-700">Grupo familiar del paciente</Label>
                <Textarea
                  placeholder="Describir grupo familiar..."
                  value={antecedentesPsiquiatricos.grupoFamiliar}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, grupoFamiliar: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Aspectos de la vida social */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Aspectos de la vida social</Label>
                <Textarea
                  placeholder="Escribir aspectos de la vida social..."
                  value={antecedentesPsiquiatricos.aspectosVidaSocial}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, aspectosVidaSocial: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Aspectos de la vida laboral */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Aspectos de la vida laboral</Label>
                <Textarea
                  placeholder="Escribir aspectos de la vida laboral..."
                  value={antecedentesPsiquiatricos.aspectosVidaLaboral}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, aspectosVidaLaboral: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Relación con la autoridad */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Relación con la autoridad</Label>
                <Textarea
                  placeholder="Escribir sobre la relación con la autoridad..."
                  value={antecedentesPsiquiatricos.relacionAutoridad}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, relacionAutoridad: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Control de Impulsos */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Control de Impulsos</Label>
                <Textarea
                  placeholder="Escribir sobre el control de impulsos..."
                  value={antecedentesPsiquiatricos.controlImpulsos}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, controlImpulsos: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Manejo de frustración en su vida */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Manejo de frustración en su vida</Label>
                <Textarea
                  placeholder="Escribir sobre el manejo de frustración..."
                  value={antecedentesPsiquiatricos.manejoFrustracion}
                  onChange={(e) => setAntecedentesPsiquiatricos({ ...antecedentesPsiquiatricos, manejoFrustracion: e.target.value })}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarAntecedentesPsiquiatricos}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Vacunas */}
        <AccordionItem value="vacunas" className="border rounded-lg px-4 bg-cyan-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Vacunas</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Campo para agregar nueva vacuna */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Escribir vacuna..."
                  value={nuevaVacuna}
                  onChange={(e) => setNuevaVacuna(e.target.value)}
                  onKeyPress={handleKeyPressVacuna}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddVacuna}
                  disabled={!nuevaVacuna.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="size-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {/* Listado de vacunas */}
              {vacunas.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Vacunas registradas:</Label>
                  <div className="space-y-2">
                    {vacunas.map((vacuna, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">{vacuna}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveVacuna(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">No hay vacunas registradas</p>
              )}

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarVacunas}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Medicamentos Activos */}
        <AccordionItem value="medicamentos-activos" className="border rounded-lg px-4 bg-violet-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Medicamentos Activos</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-3">
              {/* Campo para agregar nuevo medicamento */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Escribir medicamento y dosis..."
                  value={nuevoMedicamento}
                  onChange={(e) => setNuevoMedicamento(e.target.value)}
                  onKeyPress={handleKeyPressMedicamento}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddMedicamento}
                  disabled={!nuevoMedicamento.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="size-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {/* Listado de medicamentos */}
              {medicamentos.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Medicamentos registrados:</Label>
                  <div className="space-y-2">
                    {medicamentos.map((medicamento, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">{medicamento}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveMedicamento(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">No hay medicamentos registrados</p>
              )}

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarMedicamentos}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dieta Nutriológica */}
        <AccordionItem value="dieta-nutriologica" className="border rounded-lg px-4 bg-orange-50">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-gray-900">Dieta Nutriológica</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-4">
              {/* Desayuno */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Desayuno</Label>
                <RadioGroup
                  value={dietaNutriologica.desayuno === null ? '' : dietaNutriologica.desayuno ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    desayuno: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="desayuno-si" />
                    <Label htmlFor="desayuno-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="desayuno-no" />
                    <Label htmlFor="desayuno-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Colación en la mañana */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Colación en la mañana</Label>
                <RadioGroup
                  value={dietaNutriologica.colacionManana === null ? '' : dietaNutriologica.colacionManana ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    colacionManana: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="colacion-manana-si" />
                    <Label htmlFor="colacion-manana-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="colacion-manana-no" />
                    <Label htmlFor="colacion-manana-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Comida */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Comida</Label>
                <RadioGroup
                  value={dietaNutriologica.comida === null ? '' : dietaNutriologica.comida ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    comida: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="comida-si" />
                    <Label htmlFor="comida-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="comida-no" />
                    <Label htmlFor="comida-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Colación en la tarde */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Colación en la tarde</Label>
                <RadioGroup
                  value={dietaNutriologica.colacionTarde === null ? '' : dietaNutriologica.colacionTarde ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    colacionTarde: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="colacion-tarde-si" />
                    <Label htmlFor="colacion-tarde-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="colacion-tarde-no" />
                    <Label htmlFor="colacion-tarde-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Cena */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Cena</Label>
                <RadioGroup
                  value={dietaNutriologica.cena === null ? '' : dietaNutriologica.cena ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    cena: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cena-si" />
                    <Label htmlFor="cena-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cena-no" />
                    <Label htmlFor="cena-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* ¿Alimentos preparados en casa? */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">¿Alimentos preparados en casa?</Label>
                <RadioGroup
                  value={dietaNutriologica.alimentosPreparadosCasa === null ? '' : dietaNutriologica.alimentosPreparadosCasa ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    alimentosPreparadosCasa: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="alimentos-casa-si" />
                    <Label htmlFor="alimentos-casa-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="alimentos-casa-no" />
                    <Label htmlFor="alimentos-casa-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Nivel de apetito */}
              <div className="space-y-2 py-2 border-b">
                <Label className="text-sm text-gray-700">Nivel de apetito</Label>
                <RadioGroup
                  value={dietaNutriologica.nivelApetito}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    nivelApetito: value as any
                  })}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excesivo" id="apetito-excesivo" />
                    <Label htmlFor="apetito-excesivo" className="text-sm cursor-pointer">Excesivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bueno" id="apetito-bueno" />
                    <Label htmlFor="apetito-bueno" className="text-sm cursor-pointer">Bueno</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="apetito-regular" />
                    <Label htmlFor="apetito-regular" className="text-sm cursor-pointer">Regular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poco" id="apetito-poco" />
                    <Label htmlFor="apetito-poco" className="text-sm cursor-pointer">Poco</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nulo" id="apetito-nulo" />
                    <Label htmlFor="apetito-nulo" className="text-sm cursor-pointer">Nulo</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Presencia de hambre-saciedad */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Presencia de hambre-saciedad</Label>
                <RadioGroup
                  value={dietaNutriologica.presenciaHambreSaciedad === null ? '' : dietaNutriologica.presenciaHambreSaciedad ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    presenciaHambreSaciedad: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="hambre-si" />
                    <Label htmlFor="hambre-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hambre-no" />
                    <Label htmlFor="hambre-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Vasos de agua al día */}
              <div className="space-y-2 py-2 border-b">
                <Label className="text-sm text-gray-700">Vasos de agua al día</Label>
                <RadioGroup
                  value={dietaNutriologica.vasosAguaDia}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    vasosAguaDia: value as any
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-menos" id="agua-1menos" />
                    <Label htmlFor="agua-1menos" className="text-sm cursor-pointer">1 ó menos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-3" id="agua-2-3" />
                    <Label htmlFor="agua-2-3" className="text-sm cursor-pointer">2 a 3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4-mas" id="agua-4mas" />
                    <Label htmlFor="agua-4mas" className="text-sm cursor-pointer">4 ó más</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Preferencias de alimentos */}
              <div className="space-y-2 py-2 border-b">
                <Label className="text-sm text-gray-700">Preferencias de alimentos</Label>
                <Textarea
                  placeholder="Escribir preferencias alimentarias..."
                  value={dietaNutriologica.preferenciasAlimentos}
                  onChange={(e) => setDietaNutriologica({
                    ...dietaNutriologica,
                    preferenciasAlimentos: e.target.value
                  })}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Malestares por alimentos */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Malestares por alimentos</Label>
                <RadioGroup
                  value={dietaNutriologica.malestaresPorAlimentos === null ? '' : dietaNutriologica.malestaresPorAlimentos ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    malestaresPorAlimentos: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="malestares-si" />
                    <Label htmlFor="malestares-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="malestares-no" />
                    <Label htmlFor="malestares-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Medicamentos, complementos o suplementos */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Medicamentos, complementos o suplementos</Label>
                <RadioGroup
                  value={dietaNutriologica.medicamentosComplementos === null ? '' : dietaNutriologica.medicamentosComplementos ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    medicamentosComplementos: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="medicamentos-comp-si" />
                    <Label htmlFor="medicamentos-comp-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="medicamentos-comp-no" />
                    <Label htmlFor="medicamentos-comp-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Otras dietas realizadas */}
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="text-sm text-gray-700">Otras dietas realizadas</Label>
                <RadioGroup
                  value={dietaNutriologica.otrasDietas === null ? '' : dietaNutriologica.otrasDietas ? 'si' : 'no'}
                  onValueChange={(value: string) => setDietaNutriologica({
                    ...dietaNutriologica,
                    otrasDietas: value === 'si' ? true : value === 'no' ? false : null
                  })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="otras-dietas-si" />
                    <Label htmlFor="otras-dietas-si" className="text-sm cursor-pointer">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="otras-dietas-no" />
                    <Label htmlFor="otras-dietas-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Peso ideal */}
              <div className="space-y-2 py-2">
                <Label className="text-sm text-gray-700">Peso ideal</Label>
                <Input
                  type="text"
                  placeholder="Escribir peso ideal..."
                  value={dietaNutriologica.pesoIdeal}
                  onChange={(e) => setDietaNutriologica({
                    ...dietaNutriologica,
                    pesoIdeal: e.target.value
                  })}
                  className="w-full"
                />
              </div>

              {/* Botón de Guardar */}
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleGuardarDietaNutriologica}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="size-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}