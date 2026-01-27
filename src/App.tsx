import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { ConfigProvider } from './contexts/ConfigContext';
import type { Usuario, AsignacionCompleta } from './lib/authService';

interface SessionData {
  usuario: Usuario;
  asignacion: AsignacionCompleta;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const handleLogin = (usuario: Usuario, asignacion: AsignacionCompleta) => {
    setSessionData({ usuario, asignacion });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSessionData(null);
  };

  // Preparar datos del usuario para el Dashboard
  const currentUser = sessionData ? {
    name: `${sessionData.usuario.tipo_usuario === 'medico' ? 'Dr. ' : ''}${sessionData.usuario.nombre} ${sessionData.usuario.apellido}`,
    email: sessionData.usuario.email,
    compania: sessionData.asignacion.compania.nombre,
    sucursal: sessionData.asignacion.sucursal.nombre,
    especialidad: sessionData.asignacion.especialidad,
    tipo_usuario: sessionData.usuario.tipo_usuario
  } : null;

  return (
    <ConfigProvider>
      <div className="min-h-screen">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Dashboard onLogout={handleLogout} currentUser={currentUser} />
        )}
        <Toaster />
      </div>
    </ConfigProvider>
  );
}