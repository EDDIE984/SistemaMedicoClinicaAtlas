import { type AsignacionConsultorio, type EstadoUsuario, type UsuarioSucursal } from '../data/mockData';

/**
 * Sincroniza el estado de las asignaciones cuando un usuario cambia de estado
 * 
 * @param id_usuario - ID del usuario que cambió de estado
 * @param nuevoEstadoUsuario - Nuevo estado del usuario
 * @param asignaciones - Lista actual de asignaciones
 * @param usuariosSucursales - Lista de usuarios-sucursales para mapear
 * @returns Lista actualizada de asignaciones
 */
export function sincronizarAsignacionesUsuario(
  id_usuario: number,
  nuevoEstadoUsuario: EstadoUsuario,
  asignaciones: AsignacionConsultorio[],
  usuariosSucursales?: UsuarioSucursal[]
): AsignacionConsultorio[] {
  return asignaciones.map(asignacion => {
    // Si tenemos la lista de usuariosSucursales, verificar por id_usuario_sucursal
    if (usuariosSucursales) {
      const usuarioSucursal = usuariosSucursales.find(
        us => us.id_usuario_sucursal === asignacion.id_usuario_sucursal
      );
      
      // Solo actualizar si el usuario de esta asignación coincide
      if (!usuarioSucursal || usuarioSucursal.id_usuario !== id_usuario) {
        return asignacion;
      }
    }

    // Si el usuario pasa a inactivo, desactivar asignaciones
    if (nuevoEstadoUsuario === 'inactivo') {
      return {
        ...asignacion,
        estado: 'inactivo'
      };
    }

    // Si el usuario vuelve a estar activo, reactivar asignaciones
    if (nuevoEstadoUsuario === 'activo') {
      return {
        ...asignacion,
        estado: 'activo'
      };
    }

    return asignacion;
  });
}

/**
 * Sincroniza asignaciones cuando un usuario-sucursal cambia de estado
 * 
 * @param id_usuario_sucursal - ID del usuario-sucursal que cambió
 * @param nuevoEstado - Nuevo estado
 * @param asignaciones - Lista de asignaciones
 * @returns Lista actualizada de asignaciones
 */
export function sincronizarAsignacionesUsuarioSucursal(
  id_usuario_sucursal: number,
  nuevoEstado: EstadoUsuario,
  asignaciones: AsignacionConsultorio[]
): AsignacionConsultorio[] {
  return asignaciones.map(asignacion => {
    // Solo actualizar asignaciones del usuario-sucursal específico
    if (asignacion.id_usuario_sucursal !== id_usuario_sucursal) {
      return asignacion;
    }

    // Si el usuario-sucursal pasa a inactivo, desactivar asignaciones
    if (nuevoEstado === 'inactivo') {
      return {
        ...asignacion,
        estado: 'inactivo'
      };
    }

    // Si el usuario-sucursal vuelve a estar activo, reactivar asignaciones
    if (nuevoEstado === 'activo') {
      return {
        ...asignacion,
        estado: 'activo'
      };
    }

    return asignacion;
  });
}

/**
 * Valida si un usuario está disponible para asignaciones
 * 
 * @param id_usuario - ID del usuario a validar
 * @param usuarios - Lista de usuarios disponibles
 * @returns true si el usuario está activo, false en caso contrario
 */
export function validarUsuarioDisponible(
  id_usuario: number,
  usuarios: Array<{ id_usuario: number; estado: EstadoUsuario }>
): { disponible: boolean; mensaje: string } {
  const usuario = usuarios.find(u => u.id_usuario === id_usuario);
  
  if (!usuario) {
    return {
      disponible: false,
      mensaje: 'Usuario no encontrado'
    };
  }

  if (usuario.estado !== 'activo') {
    return {
      disponible: false,
      mensaje: 'Solo se pueden asignar usuarios activos'
    };
  }

  return {
    disponible: true,
    mensaje: 'Usuario disponible'
  };
}

/**
 * Valida si un usuario-sucursal está disponible para asignaciones
 * 
 * @param id_usuario_sucursal - ID del usuario-sucursal a validar
 * @param usuariosSucursales - Lista de usuarios-sucursales
 * @returns true si está activo, false en caso contrario
 */
export function validarUsuarioSucursalDisponible(
  id_usuario_sucursal: number,
  usuariosSucursales: Array<{ id_usuario_sucursal: number; estado: EstadoUsuario }>
): { disponible: boolean; mensaje: string } {
  const usuarioSucursal = usuariosSucursales.find(us => us.id_usuario_sucursal === id_usuario_sucursal);
  
  if (!usuarioSucursal) {
    return {
      disponible: false,
      mensaje: 'Usuario-Sucursal no encontrado'
    };
  }

  if (usuarioSucursal.estado !== 'activo') {
    return {
      disponible: false,
      mensaje: 'Solo se pueden asignar usuarios-sucursales activos'
    };
  }

  return {
    disponible: true,
    mensaje: 'Usuario-Sucursal disponible'
  };
}

/**
 * Obtiene el número de asignaciones afectadas por un cambio de estado del usuario
 * 
 * @param id_usuario - ID del usuario
 * @param asignaciones - Lista de asignaciones
 * @param usuariosSucursales - Lista de usuarios-sucursales para mapeo
 * @returns Número de asignaciones activas que serían afectadas
 */
export function contarAsignacionesAfectadasUsuario(
  id_usuario: number,
  asignaciones: AsignacionConsultorio[],
  usuariosSucursales: UsuarioSucursal[]
): number {
  return asignaciones.filter(asignacion => {
    const usuarioSucursal = usuariosSucursales.find(
      us => us.id_usuario_sucursal === asignacion.id_usuario_sucursal
    );
    return usuarioSucursal?.id_usuario === id_usuario && asignacion.estado === 'activo';
  }).length;
}

/**
 * Obtiene el número de asignaciones afectadas por un cambio de usuario-sucursal
 * 
 * @param id_usuario_sucursal - ID del usuario-sucursal
 * @param asignaciones - Lista de asignaciones
 * @returns Número de asignaciones activas que serían afectadas
 */
export function contarAsignacionesAfectadasUsuarioSucursal(
  id_usuario_sucursal: number,
  asignaciones: AsignacionConsultorio[]
): number {
  return asignaciones.filter(
    a => a.id_usuario_sucursal === id_usuario_sucursal && a.estado === 'activo'
  ).length;
}
