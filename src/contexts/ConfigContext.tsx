import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  consultorios as initialConsultorios,
  asignacionesConsultorio as initialAsignaciones,
  usuarios as initialUsuarios,
  usuariosSucursales as initialUsuariosSucursales,
  type Consultorio, 
  type AsignacionConsultorio,
  type Usuario,
  type UsuarioSucursal,
  type EstadoConsultorio
} from '../data/mockData';
import { sincronizarAsignacionesConsultorio } from '../utils/consultorioSync';
import { sincronizarAsignacionesUsuario } from '../utils/usuarioSync';

interface ConfigContextType {
  // Consultorios
  consultorios: Consultorio[];
  setConsultorios: (consultorios: Consultorio[]) => void;
  updateConsultorio: (consultorio: Consultorio) => void;
  addConsultorio: (consultorio: Consultorio) => void;
  deleteConsultorio: (id: number) => void;
  
  // Usuarios
  usuarios: Usuario[];
  setUsuarios: (usuarios: Usuario[]) => void;
  updateUsuario: (usuario: Usuario) => void;
  addUsuario: (usuario: Usuario) => void;
  deleteUsuario: (id: number) => void;
  
  // Usuarios Sucursales
  usuariosSucursales: UsuarioSucursal[];
  setUsuariosSucursales: (usuariosSucursales: UsuarioSucursal[]) => void;
  updateUsuarioSucursal: (usuarioSucursal: UsuarioSucursal) => void;
  addUsuarioSucursal: (usuarioSucursal: UsuarioSucursal) => void;
  deleteUsuarioSucursal: (id: number) => void;
  
  // Asignaciones
  asignaciones: AsignacionConsultorio[];
  setAsignaciones: (asignaciones: AsignacionConsultorio[]) => void;
  addAsignacion: (asignacion: AsignacionConsultorio) => void;
  updateAsignacion: (asignacion: AsignacionConsultorio) => void;
  deleteAsignacion: (id: number) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([...initialConsultorios]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([...initialUsuarios]);
  const [usuariosSucursales, setUsuariosSucursales] = useState<UsuarioSucursal[]>([...initialUsuariosSucursales]);
  const [asignaciones, setAsignaciones] = useState<AsignacionConsultorio[]>([...initialAsignaciones]);

  const updateConsultorio = (consultorio: Consultorio) => {
    setConsultorios(prev => {
      const oldConsultorio = prev.find(c => c.id_consultorio === consultorio.id_consultorio);
      
      // Si el estado cambió, sincronizar asignaciones
      if (oldConsultorio && oldConsultorio.estado !== consultorio.estado) {
        const asignacionesActualizadas = sincronizarAsignacionesConsultorio(
          consultorio.id_consultorio,
          consultorio.estado,
          asignaciones
        );
        setAsignaciones(asignacionesActualizadas);
      }
      
      return prev.map(c => 
        c.id_consultorio === consultorio.id_consultorio ? consultorio : c
      );
    });
  };

  const addConsultorio = (consultorio: Consultorio) => {
    setConsultorios(prev => [...prev, consultorio]);
  };

  const deleteConsultorio = (id: number) => {
    setConsultorios(prev => prev.filter(c => c.id_consultorio !== id));
    // También eliminar las asignaciones asociadas
    setAsignaciones(prev => prev.filter(a => a.id_consultorio !== id));
  };

  const addAsignacion = (asignacion: AsignacionConsultorio) => {
    setAsignaciones(prev => [...prev, asignacion]);
  };

  const updateAsignacion = (asignacion: AsignacionConsultorio) => {
    setAsignaciones(prev => 
      prev.map(a => 
        a.id_asignacion === asignacion.id_asignacion ? asignacion : a
      )
    );
  };

  const deleteAsignacion = (id: number) => {
    setAsignaciones(prev => prev.filter(a => a.id_asignacion !== id));
  };

  const updateUsuario = (usuario: Usuario) => {
    setUsuarios(prev => {
      const oldUsuario = prev.find(u => u.id_usuario === usuario.id_usuario);
      
      // Si el estado cambió, sincronizar asignaciones
      if (oldUsuario && oldUsuario.estado !== usuario.estado) {
        const asignacionesActualizadas = sincronizarAsignacionesUsuario(
          usuario.id_usuario,
          usuario.estado,
          asignaciones,
          usuariosSucursales
        );
        setAsignaciones(asignacionesActualizadas);
      }
      
      return prev.map(u => 
        u.id_usuario === usuario.id_usuario ? usuario : u
      );
    });
  };

  const addUsuario = (usuario: Usuario) => {
    setUsuarios(prev => [...prev, usuario]);
  };

  const deleteUsuario = (id: number) => {
    setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
    // También eliminar los usuarios-sucursales asociados
    setUsuariosSucursales(prev => prev.filter(us => us.id_usuario !== id));
    // Eliminar asignaciones de este usuario
    const usuarioSucursalesIds = usuariosSucursales
      .filter(us => us.id_usuario === id)
      .map(us => us.id_usuario_sucursal);
    setAsignaciones(prev => prev.filter(a => !usuarioSucursalesIds.includes(a.id_usuario_sucursal)));
  };

  const updateUsuarioSucursal = (usuarioSucursal: UsuarioSucursal) => {
    setUsuariosSucursales(prev => {
      const oldUsuarioSucursal = prev.find(us => us.id_usuario_sucursal === usuarioSucursal.id_usuario_sucursal);
      
      // Si el estado cambió, sincronizar asignaciones
      if (oldUsuarioSucursal && oldUsuarioSucursal.estado !== usuarioSucursal.estado) {
        const asignacionesActualizadas = sincronizarAsignacionesUsuario(
          usuarioSucursal.id_usuario,
          usuarioSucursal.estado,
          asignaciones,
          [...prev.map(us => us.id_usuario_sucursal === usuarioSucursal.id_usuario_sucursal ? usuarioSucursal : us)]
        );
        setAsignaciones(asignacionesActualizadas);
      }
      
      return prev.map(us => 
        us.id_usuario_sucursal === usuarioSucursal.id_usuario_sucursal ? usuarioSucursal : us
      );
    });
  };

  const addUsuarioSucursal = (usuarioSucursal: UsuarioSucursal) => {
    setUsuariosSucursales(prev => [...prev, usuarioSucursal]);
  };

  const deleteUsuarioSucursal = (id: number) => {
    setUsuariosSucursales(prev => prev.filter(us => us.id_usuario_sucursal !== id));
    // También eliminar las asignaciones asociadas
    setAsignaciones(prev => prev.filter(a => a.id_usuario_sucursal !== id));
  };

  return (
    <ConfigContext.Provider
      value={{
        consultorios,
        setConsultorios,
        updateConsultorio,
        addConsultorio,
        deleteConsultorio,
        usuarios,
        setUsuarios,
        updateUsuario,
        addUsuario,
        deleteUsuario,
        usuariosSucursales,
        setUsuariosSucursales,
        updateUsuarioSucursal,
        addUsuarioSucursal,
        deleteUsuarioSucursal,
        asignaciones,
        setAsignaciones,
        addAsignacion,
        updateAsignacion,
        deleteAsignacion,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}