// Hook personalizado para gestión de pacientes con Supabase
import { useState, useEffect } from 'react';
import {
  getAllPacientes,
  getPacientesByCompania,
  getPacienteById,
  getPacienteByCedula,
  searchPacientes,
  searchPacientesByCompania,
  createPaciente,
  updatePaciente,
  deletePaciente,
  getSignosVitalesByPaciente,
  createSignoVital,
  getAntecedentesByPaciente,
  createAntecedente,
  updateAntecedente,
  getArchivosByPaciente,
  createArchivoMedico,
  deleteArchivoMedico,
  calcularIMC,
  calcularEdad,
  getIniciales,
  type Paciente,
  type SignoVital,
  type Antecedente,
  type ArchivoMedico
} from '../lib/pacientesService';

export function usePacientes(idCompania?: number, options: { initialLoad?: boolean } = { initialLoad: true }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los pacientes al montar el componente si initialLoad es true
  useEffect(() => {
    if (options.initialLoad) {
      loadPacientes();
    } else {
      setIsLoading(false);
    }
  }, [idCompania, options.initialLoad]);

  const loadPacientes = async () => {
    setIsLoading(true);
    setError(null);

    // Si hay idCompania, filtrar por compañía
    const data = idCompania
      ? await getPacientesByCompania(idCompania)
      : await getAllPacientes();

    if (data) {
      setPacientes(data);
    } else {
      setError('Error al cargar pacientes');
    }

    setIsLoading(false);
  };

  const buscarPacientes = async (query: string) => {
    if (!query.trim()) {
      if (options.initialLoad) {
        await loadPacientes();
      } else {
        setPacientes([]);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    // Si hay idCompania, buscar solo en esa compañía
    const data = idCompania
      ? await searchPacientesByCompania(query, idCompania)
      : await searchPacientes(query);

    setPacientes(data);
    setIsLoading(false);
  };

  const obtenerPaciente = async (id: number) => {
    return await getPacienteById(id);
  };

  const crearPaciente = async (paciente: Omit<Paciente, 'id_paciente' | 'created_at' | 'activo'>) => {
    try {
      const nuevoPaciente = await createPaciente(paciente);

      if (nuevoPaciente) {
        await loadPacientes(); // Recargar lista
        return nuevoPaciente;
      }

      return null;
    } catch (error) {
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  };

  const actualizarPaciente = async (id: number, updates: Partial<Paciente>) => {
    const success = await updatePaciente(id, updates);

    if (success) {
      await loadPacientes(); // Recargar lista
    }

    return success;
  };

  const eliminarPaciente = async (id: number) => {
    const success = await deletePaciente(id);

    if (success) {
      await loadPacientes(); // Recargar lista
    }

    return success;
  };

  const buscarPacientePorCedula = async (cedula: string) => {
    return await getPacienteByCedula(cedula, idCompania);
  };

  const clearPacientes = () => {
    setPacientes([]);
  };

  return {
    pacientes,
    isLoading,
    error,
    loadPacientes,
    buscarPacientes,
    buscarPacientePorCedula,
    obtenerPaciente,
    crearPaciente,
    actualizarPaciente,
    eliminarPaciente,
    clearPacientes
  };
}

export function useSignosVitales(idPaciente: number | null) {
  const [signosVitales, setSignosVitales] = useState<SignoVital[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (idPaciente) {
      loadSignosVitales();
    }
  }, [idPaciente]);

  const loadSignosVitales = async () => {
    if (!idPaciente) return;

    setIsLoading(true);
    const data = await getSignosVitalesByPaciente(idPaciente);
    setSignosVitales(data);
    setIsLoading(false);
  };

  const guardarSignoVital = async (signo: Omit<SignoVital, 'id_signo_vital' | 'created_at'>) => {
    const nuevoSigno = await createSignoVital(signo);

    if (nuevoSigno) {
      await loadSignosVitales(); // Recargar lista
      return nuevoSigno;
    }

    return null;
  };

  return {
    signosVitales,
    isLoading,
    loadSignosVitales,
    guardarSignoVital
  };
}

export function useAntecedentes(idPaciente: number | null) {
  const [antecedentes, setAntecedentes] = useState<Antecedente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (idPaciente) {
      loadAntecedentes();
    }
  }, [idPaciente]);

  const loadAntecedentes = async () => {
    if (!idPaciente) return;

    setIsLoading(true);
    const data = await getAntecedentesByPaciente(idPaciente);
    setAntecedentes(data);
    setIsLoading(false);
  };

  const guardarAntecedente = async (antecedente: Omit<Antecedente, 'id_antecedente' | 'created_at' | 'activo'>) => {
    const nuevoAntecedente = await createAntecedente(antecedente);

    if (nuevoAntecedente) {
      await loadAntecedentes(); // Recargar lista
      return nuevoAntecedente;
    }

    return null;
  };

  const actualizarAntecedenteItem = async (id: number, updates: Partial<Antecedente>) => {
    const success = await updateAntecedente(id, updates);

    if (success) {
      await loadAntecedentes(); // Recargar lista
    }

    return success;
  };

  return {
    antecedentes,
    isLoading,
    loadAntecedentes,
    guardarAntecedente,
    actualizarAntecedenteItem
  };
}

export function useArchivos(idPaciente: number | null) {
  const [archivos, setArchivos] = useState<ArchivoMedico[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (idPaciente) {
      loadArchivos();
    }
  }, [idPaciente]);

  const loadArchivos = async () => {
    if (!idPaciente) return;

    setIsLoading(true);
    const data = await getArchivosByPaciente(idPaciente);
    setArchivos(data);
    setIsLoading(false);
  };

  const guardarArchivo = async (archivo: Omit<ArchivoMedico, 'id_archivo' | 'created_at'>) => {
    const nuevoArchivo = await createArchivoMedico(archivo);

    if (nuevoArchivo) {
      await loadArchivos(); // Recargar lista
      return nuevoArchivo;
    }

    return null;
  };

  const eliminarArchivo = async (id: number) => {
    const success = await deleteArchivoMedico(id);

    if (success) {
      await loadArchivos(); // Recargar lista
    }

    return success;
  };

  return {
    archivos,
    isLoading,
    loadArchivos,
    guardarArchivo,
    eliminarArchivo
  };
}

// Exportar funciones auxiliares
export { calcularIMC, calcularEdad, getIniciales };