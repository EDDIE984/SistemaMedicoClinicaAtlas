// Hooks personalizados para configuraciones del sistema
import { useState, useEffect } from 'react';
import {
  getAllCompanias,
  createCompania,
  updateCompania,
  deleteCompania,
  getAllSucursales,
  getSucursalesByCompania,
  createSucursal,
  updateSucursal,
  deleteSucursal,
  getAllConsultorios,
  getConsultoriosBySucursal,
  createConsultorio,
  updateConsultorio,
  deleteConsultorio,
  getAllUsuarios,
  getUsuariosByTipo,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getAllUsuarioSucursales,
  getUsuarioSucursalesByUsuario,
  createUsuarioSucursal,
  updateUsuarioSucursal,
  deleteUsuarioSucursal,
  getAllPreciosBase,
  createPrecioBase,
  updatePrecioBase,
  deletePrecioBase,
  getAllPreciosUsuario,
  createPrecioUsuario,
  updatePrecioUsuario,
  deletePrecioUsuario,
  getAllAsignacionesConsultorio,
  getAsignacionesByUsuarioSucursal,
  createAsignacionConsultorio,
  updateAsignacionConsultorio,
  deleteAsignacionConsultorio,
  type Compania,
  type Sucursal,
  type Consultorio,
  type Usuario,
  type TipoUsuario,
  type UsuarioSucursal,
  type PrecioBase,
  type PrecioUsuario,
  type AsignacionConsultorio
} from '../lib/configuracionesService';

// ========================================
// HOOK: COMPAÑÍAS
// ========================================

export function useCompanias() {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanias();
  }, []);

  const loadCompanias = async () => {
    setIsLoading(true);
    setError(null);
    const data = await getAllCompanias();
    setCompanias(data);
    setIsLoading(false);
  };

  const agregarCompania = async (compania: Omit<Compania, 'id_compania' | 'created_at'>) => {
    const nueva = await createCompania(compania);
    if (nueva) {
      await loadCompanias();
      return nueva;
    }
    return null;
  };

  const actualizarCompania = async (id: number, updates: Partial<Compania>) => {
    const success = await updateCompania(id, updates);
    if (success) {
      await loadCompanias();
    }
    return success;
  };

  const eliminarCompania = async (id: number) => {
    const success = await deleteCompania(id);
    if (success) {
      await loadCompanias();
    }
    return success;
  };

  return {
    companias,
    isLoading,
    error,
    loadCompanias,
    agregarCompania,
    actualizarCompania,
    eliminarCompania
  };
}

// ========================================
// HOOK: SUCURSALES
// ========================================

export function useSucursales(idCompania?: number) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSucursales();
  }, [idCompania]);

  const loadSucursales = async () => {
    setIsLoading(true);
    const data = idCompania 
      ? await getSucursalesByCompania(idCompania)
      : await getAllSucursales();
    setSucursales(data);
    setIsLoading(false);
  };

  const agregarSucursal = async (sucursal: Omit<Sucursal, 'id_sucursal' | 'created_at'>) => {
    const nueva = await createSucursal(sucursal);
    if (nueva) {
      await loadSucursales();
      return nueva;
    }
    return null;
  };

  const actualizarSucursal = async (id: number, updates: Partial<Sucursal>) => {
    const success = await updateSucursal(id, updates);
    if (success) {
      await loadSucursales();
    }
    return success;
  };

  const eliminarSucursal = async (id: number) => {
    const success = await deleteSucursal(id);
    if (success) {
      await loadSucursales();
    }
    return success;
  };

  return {
    sucursales,
    isLoading,
    loadSucursales,
    agregarSucursal,
    actualizarSucursal,
    eliminarSucursal
  };
}

// ========================================
// HOOK: CONSULTORIOS
// ========================================

export function useConsultorios(idSucursal?: number) {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConsultorios();
  }, [idSucursal]);

  const loadConsultorios = async () => {
    setIsLoading(true);
    const data = idSucursal
      ? await getConsultoriosBySucursal(idSucursal)
      : await getAllConsultorios();
    setConsultorios(data);
    setIsLoading(false);
  };

  const agregarConsultorio = async (consultorio: Omit<Consultorio, 'id_consultorio' | 'created_at'>) => {
    const nuevo = await createConsultorio(consultorio);
    if (nuevo) {
      await loadConsultorios();
      return nuevo;
    }
    return null;
  };

  const actualizarConsultorio = async (id: number, updates: Partial<Consultorio>) => {
    const success = await updateConsultorio(id, updates);
    if (success) {
      await loadConsultorios();
    }
    return success;
  };

  const eliminarConsultorio = async (id: number) => {
    const success = await deleteConsultorio(id);
    if (success) {
      await loadConsultorios();
    }
    return success;
  };

  return {
    consultorios,
    isLoading,
    loadConsultorios,
    agregarConsultorio,
    actualizarConsultorio,
    eliminarConsultorio
  };
}

// ========================================
// HOOK: USUARIOS
// ========================================

export function useUsuarios(tipoUsuario?: TipoUsuario) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, [tipoUsuario]);

  const loadUsuarios = async () => {
    setIsLoading(true);
    const data = tipoUsuario
      ? await getUsuariosByTipo(tipoUsuario)
      : await getAllUsuarios();
    setUsuarios(data);
    setIsLoading(false);
  };

  const agregarUsuario = async (usuario: Omit<Usuario, 'id_usuario' | 'created_at'>) => {
    try {
      const nuevo = await createUsuario(usuario);
      await loadUsuarios();
      return nuevo;
    } catch (error: any) {
      // Re-lanzar el error para que el componente lo maneje
      throw error;
    }
  };

  const actualizarUsuario = async (id: number, updates: Partial<Usuario>) => {
    const success = await updateUsuario(id, updates);
    if (success) {
      await loadUsuarios();
    }
    return success;
  };

  const eliminarUsuario = async (id: number) => {
    const success = await deleteUsuario(id);
    if (success) {
      await loadUsuarios();
    }
    return success;
  };

  return {
    usuarios,
    isLoading,
    loadUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario
  };
}

// ========================================
// HOOK: USUARIO-SUCURSAL (Asignaciones)
// ========================================

export function useUsuarioSucursales(idUsuario?: number) {
  const [asignaciones, setAsignaciones] = useState<UsuarioSucursal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAsignaciones();
  }, [idUsuario]);

  const loadAsignaciones = async () => {
    setIsLoading(true);
    const data = idUsuario
      ? await getUsuarioSucursalesByUsuario(idUsuario)
      : await getAllUsuarioSucursales();
    setAsignaciones(data);
    setIsLoading(false);
  };

  const agregarAsignacion = async (asignacion: Omit<UsuarioSucursal, 'id_usuario_sucursal' | 'created_at'>) => {
    const nueva = await createUsuarioSucursal(asignacion);
    if (nueva) {
      await loadAsignaciones();
      return nueva;
    }
    return null;
  };

  const actualizarAsignacion = async (id: number, updates: Partial<UsuarioSucursal>) => {
    const success = await updateUsuarioSucursal(id, updates);
    if (success) {
      await loadAsignaciones();
    }
    return success;
  };

  const eliminarAsignacion = async (id: number) => {
    const success = await deleteUsuarioSucursal(id);
    if (success) {
      await loadAsignaciones();
    }
    return success;
  };

  return {
    asignaciones,
    isLoading,
    loadAsignaciones,
    agregarAsignacion,
    actualizarAsignacion,
    eliminarAsignacion
  };
}

// ========================================
// HOOK: PRECIOS BASE
// ========================================

export function usePreciosBase() {
  const [preciosBase, setPreciosBase] = useState<PrecioBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreciosBase();
  }, []);

  const loadPreciosBase = async () => {
    setIsLoading(true);
    const data = await getAllPreciosBase();
    setPreciosBase(data);
    setIsLoading(false);
  };

  const agregarPrecioBase = async (precio: Omit<PrecioBase, 'id_precio_base' | 'created_at'>) => {
    const nuevo = await createPrecioBase(precio);
    if (nuevo) {
      await loadPreciosBase();
      return nuevo;
    }
    return null;
  };

  const actualizarPrecioBase = async (id: number, updates: Partial<PrecioBase>) => {
    const success = await updatePrecioBase(id, updates);
    if (success) {
      await loadPreciosBase();
    }
    return success;
  };

  const eliminarPrecioBase = async (id: number) => {
    const success = await deletePrecioBase(id);
    if (success) {
      await loadPreciosBase();
    }
    return success;
  };

  return {
    preciosBase,
    isLoading,
    loadPreciosBase,
    agregarPrecioBase,
    actualizarPrecioBase,
    eliminarPrecioBase
  };
}

// ========================================
// HOOK: PRECIOS USUARIO
// ========================================

export function usePreciosUsuario() {
  const [preciosUsuario, setPreciosUsuario] = useState<PrecioUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreciosUsuario();
  }, []);

  const loadPreciosUsuario = async () => {
    setIsLoading(true);
    const data = await getAllPreciosUsuario();
    setPreciosUsuario(data);
    setIsLoading(false);
  };

  const agregarPrecioUsuario = async (precio: Omit<PrecioUsuario, 'id_precio_usuario' | 'created_at'>) => {
    const nuevo = await createPrecioUsuario(precio);
    if (nuevo) {
      await loadPreciosUsuario();
      return nuevo;
    }
    return null;
  };

  const actualizarPrecioUsuario = async (id: number, updates: Partial<PrecioUsuario>) => {
    const success = await updatePrecioUsuario(id, updates);
    if (success) {
      await loadPreciosUsuario();
    }
    return success;
  };

  const eliminarPrecioUsuario = async (id: number) => {
    const success = await deletePrecioUsuario(id);
    if (success) {
      await loadPreciosUsuario();
    }
    return success;
  };

  return {
    preciosUsuario,
    isLoading,
    loadPreciosUsuario,
    agregarPrecioUsuario,
    actualizarPrecioUsuario,
    eliminarPrecioUsuario
  };
}

// ========================================
// HOOK: ASIGNACIONES CONSULTORIO
// ========================================

export function useAsignacionesConsultorio(idUsuarioSucursal?: number) {
  const [asignaciones, setAsignaciones] = useState<AsignacionConsultorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAsignaciones();
  }, [idUsuarioSucursal]);

  const loadAsignaciones = async () => {
    setIsLoading(true);
    const data = idUsuarioSucursal
      ? await getAsignacionesByUsuarioSucursal(idUsuarioSucursal)
      : await getAllAsignacionesConsultorio();
    setAsignaciones(data);
    setIsLoading(false);
  };

  const agregarAsignacion = async (asignacion: Omit<AsignacionConsultorio, 'id_asignacion' | 'created_at'>) => {
    const nueva = await createAsignacionConsultorio(asignacion);
    if (nueva) {
      await loadAsignaciones();
      return nueva;
    }
    return null;
  };

  const actualizarAsignacion = async (id: number, updates: Partial<AsignacionConsultorio>) => {
    const success = await updateAsignacionConsultorio(id, updates);
    if (success) {
      await loadAsignaciones();
    }
    return success;
  };

  const eliminarAsignacion = async (id: number) => {
    const success = await deleteAsignacionConsultorio(id);
    if (success) {
      await loadAsignaciones();
    }
    return success;
  };

  return {
    asignaciones,
    isLoading,
    loadAsignaciones,
    agregarAsignacion,
    actualizarAsignacion,
    eliminarAsignacion
  };
}

// Exportar funciones auxiliares
export {
  formatearTipoUsuario,
  formatearDiaSemana,
  formatearMoneda
} from '../lib/configuracionesService';