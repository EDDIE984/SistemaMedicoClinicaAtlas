// Servicio de autenticación con Supabase
import { supabase } from './supabase';

// Interfaz de Usuario (exportada para uso en toda la app)
export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  tipo_usuario: 'medico' | 'administrativo' | 'enfermera' | 'secretaria';
  telefono: string;
  cedula_profesional: string;
  estado: 'activo' | 'inactivo';
  created_at?: string;
}

// Interfaz de Asignación Completa (exportada para uso en toda la app)
export interface AsignacionCompleta {
  id_usuario_sucursal: number;
  id_usuario: number;
  id_sucursal: number;
  especialidad: string;
  estado: 'activo' | 'inactivo';
  usuario?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    tipo_usuario: string;
  };
  sucursal: {
    id_sucursal: number;
    nombre: string;
    direccion: string;
    telefono: string;
    id_compania: number;
    estado: 'activo' | 'inactivo';
  };
  compania: {
    id_compania: number;
    nombre: string;
    direccion: string;
    telefono: string;
    estado: 'activo' | 'inactivo';
  };
}

// Interfaz de respuesta del usuario desde Supabase
interface UsuarioSupabase {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  tipo_usuario: 'medico' | 'recepcionista' | 'administrador';
  telefono: string | null;
  cedula_profesional: string | null;
  activo: boolean;
  created_at: string;
}

// Interfaz de asignación desde Supabase
interface AsignacionSupabase {
  id_usuario_sucursal: number;
  id_usuario: number;
  id_sucursal: number;
  especialidad: string | null;
  activo: boolean;
  sucursal: {
    id_sucursal: number;
    nombre: string;
    direccion: string;
    telefono: string | null;
    id_compania: number;
    activo: boolean;
    compania: {
      id_compania: number;
      nombre: string;
      direccion: string;
      telefono: string | null;
      activo: boolean;
    };
  };
}

/**
 * Buscar usuario por email en Supabase
 */
export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  try {

    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .eq('estado', 'activo')
      .maybeSingle();

    if (error) {
      return null;
    }

    if (!data) {
      console.log('❌ Usuario no encontrado');
      return null;
    }


    // Convertir a formato esperado por la aplicación
    const usuario: Usuario = {
      id_usuario: data.id_usuario,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password: data.password,
      tipo_usuario: data.tipo_usuario,
      telefono: data.telefono || '',
      cedula_profesional: data.cedula || '',
      estado: data.estado,
      created_at: data.created_at
    };

    return usuario;
  } catch (error) {
    console.error('❌ Error inesperado al buscar usuario:', error);
    return null;
  }
}

/**
 * Obtener todas las asignaciones completas de un usuario
 */
export async function getAsignacionesCompletasByUsuario(
  id_usuario: number
): Promise<AsignacionCompleta[]> {
  try {
    console.log('🔍 Buscando asignaciones para usuario ID:', id_usuario);

    const { data, error } = await supabase
      .from('usuario_sucursal')
      .select(`
        id_usuario_sucursal,
        id_usuario,
        id_sucursal,
        especialidad,
        estado,
        sucursal:sucursal!inner (
          id_sucursal,
          nombre,
          direccion,
          telefono,
          id_compania,
          estado,
          compania:compania!inner (
            id_compania,
            nombre,
            direccion,
            telefono,
            estado
          )
        )
      `)
      .eq('id_usuario', id_usuario)
      .eq('estado', 'activo');

    if (error) {
      console.error('❌ Error al buscar asignaciones:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron asignaciones para el usuario');
      return [];
    }

    console.log(`✅ Se encontraron ${data.length} asignaciones`);

    // Convertir al formato esperado
    const asignaciones: AsignacionCompleta[] = data.map((asig: any) => ({
      id_usuario_sucursal: asig.id_usuario_sucursal,
      id_usuario: asig.id_usuario,
      id_sucursal: asig.id_sucursal,
      especialidad: asig.especialidad || 'Sin especialidad',
      estado: asig.estado,
      sucursal: {
        id_sucursal: asig.sucursal.id_sucursal,
        nombre: asig.sucursal.nombre,
        direccion: asig.sucursal.direccion,
        telefono: asig.sucursal.telefono || '',
        id_compania: asig.sucursal.id_compania,
        estado: asig.sucursal.estado
      },
      compania: {
        id_compania: asig.sucursal.compania.id_compania,
        nombre: asig.sucursal.compania.nombre,
        direccion: asig.sucursal.compania.direccion,
        telefono: asig.sucursal.compania.telefono || '',
        estado: asig.sucursal.compania.estado
      }
    }));

    return asignaciones;
  } catch (error) {
    console.error('❌ Error inesperado al buscar asignaciones:', error);
    return [];
  }
}

/**
 * Validar credenciales de usuario
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; usuario?: Usuario; message?: string }> {
  try {
    // Buscar usuario
    const usuario = await getUsuarioByEmail(email);

    if (!usuario) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    // Validar contraseña (en producción deberías usar hash)
    if (usuario.password !== password) {
      return {
        success: false,
        message: 'Contraseña incorrecta'
      };
    }

    return {
      success: true,
      usuario
    };
  } catch (error) {
    console.error('❌ Error al validar credenciales:', error);
    return {
      success: false,
      message: 'Error al validar credenciales'
    };
  }
}

/**
 * Obtener todas las sucursales de una compañía
 */
export async function getSucursalesByCompania(id_compania: number) {
  try {
    console.log('🔍 Buscando sucursales para compañía ID:', id_compania);

    const { data, error } = await supabase
      .from('sucursal')
      .select('*')
      .eq('id_compania', id_compania)
      .eq('estado', 'activo')
      .order('nombre');

    if (error) {
      console.error('❌ Error al buscar sucursales:', error);
      return [];
    }

    console.log(`✅ Se encontraron ${data?.length || 0} sucursales`);
    return data || [];
  } catch (error) {
    console.error('❌ Error inesperado al buscar sucursales:', error);
    return [];
  }
}

/**
 * Obtener médicos (usuarios con asignaciones) de una sucursal específica
 */
export async function getMedicosBySucursal(id_sucursal: number): Promise<AsignacionCompleta[]> {
  try {
    console.log('🔍 Buscando médicos para sucursal ID:', id_sucursal);

    const { data, error } = await supabase
      .from('usuario_sucursal')
      .select(`
        id_usuario_sucursal,
        id_usuario,
        id_sucursal,
        especialidad,
        estado,
        usuario:usuario!inner (
          id_usuario,
          nombre,
          apellido,
          email,
          tipo_usuario,
          telefono,
          cedula,
          estado
        ),
        sucursal:sucursal!inner (
          id_sucursal,
          nombre,
          direccion,
          telefono,
          id_compania,
          estado,
          compania:compania!inner (
            id_compania,
            nombre,
            direccion,
            telefono,
            estado
          )
        )
      `)
      .eq('id_sucursal', id_sucursal)
      .eq('estado', 'activo')
      .eq('usuario.tipo_usuario', 'medico')
      .eq('usuario.estado', 'activo');

    if (error) {
      console.error('❌ Error al buscar médicos:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron médicos para la sucursal');
      return [];
    }

    console.log(`✅ Se encontraron ${data.length} médicos`);

    // Convertir al formato esperado
    const medicos: AsignacionCompleta[] = data.map((asig: any) => ({
      id_usuario_sucursal: asig.id_usuario_sucursal,
      id_usuario: asig.id_usuario,
      id_sucursal: asig.id_sucursal,
      especialidad: asig.especialidad || 'Sin especialidad',
      estado: asig.estado,
      usuario: {
        id_usuario: asig.usuario.id_usuario,
        nombre: asig.usuario.nombre,
        apellido: asig.usuario.apellido,
        email: asig.usuario.email,
        tipo_usuario: asig.usuario.tipo_usuario
      },
      sucursal: {
        id_sucursal: asig.sucursal.id_sucursal,
        nombre: asig.sucursal.nombre,
        direccion: asig.sucursal.direccion,
        telefono: asig.sucursal.telefono || '',
        id_compania: asig.sucursal.id_compania,
        estado: asig.sucursal.estado
      },
      compania: {
        id_compania: asig.sucursal.compania.id_compania,
        nombre: asig.sucursal.compania.nombre,
        direccion: asig.sucursal.compania.direccion,
        telefono: asig.sucursal.compania.telefono || '',
        estado: asig.sucursal.compania.estado
      }
    }));

    return medicos;
  } catch (error) {
    console.error('❌ Error inesperado al buscar médicos:', error);
    return [];
  }
}