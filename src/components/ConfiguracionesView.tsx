import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CompaniaTab } from './config/CompaniaTab';
import { SucursalTab } from './config/SucursalTab';
import { UsuarioTab } from './config/UsuarioTab';
import { UsuarioSucursalTab } from './config/UsuarioSucursalTab';
import { PrecioBaseTab } from './config/PrecioBaseTab';
import { PrecioUsuarioTab } from './config/PrecioUsuarioTab';
import { ConsultorioTab } from './config/ConsultorioTab';
import { AsignacionConsultorioTab } from './config/AsignacionConsultorioTab';
import { Building2, MapPin, Users, UserCog, DollarSign, Tag, DoorOpen, CalendarClock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function ConfiguracionesView() {
  const [tabActiva, setTabActiva] = useState('compania');

  const tabs = [
    { value: 'compania', label: 'Compañía', icon: Building2 },
    { value: 'sucursal', label: 'Sucursales', icon: MapPin },
    { value: 'consultorio', label: 'Consultorios', icon: DoorOpen },
    { value: 'usuario', label: 'Usuarios', icon: Users },
    { value: 'usuario-sucursal', label: 'Asignaciones Usuario', icon: UserCog },
    { value: 'asignacion-consultorio', label: 'Horarios y Consultorios', icon: CalendarClock },
    { value: 'precio-base', label: 'Precios Base', icon: Tag },
    { value: 'precio-usuario', label: 'Precios Usuario', icon: DollarSign },
  ];

  const tabActual = tabs.find(t => t.value === tabActiva);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="mb-2">Configuraciones del Sistema</h1>
        <p className="text-sm md:text-base text-gray-600">
          Gestiona la información de compañías, sucursales, consultorios, usuarios, horarios y precios
        </p>
      </div>

      <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
        {/* Vista Desktop - Tabs horizontales */}
        <TabsList className="hidden md:grid w-full grid-cols-8 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Vista Móvil - Selector dropdown */}
        <div className="md:hidden mb-4">
          <Select value={tabActiva} onValueChange={setTabActiva}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {tabActual && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = tabActual.icon;
                      return <Icon className="size-4" />;
                    })()}
                    <span>{tabActual.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="compania">
          <CompaniaTab />
        </TabsContent>

        <TabsContent value="sucursal">
          <SucursalTab />
        </TabsContent>

        <TabsContent value="consultorio">
          <ConsultorioTab />
        </TabsContent>

        <TabsContent value="usuario">
          <UsuarioTab />
        </TabsContent>

        <TabsContent value="usuario-sucursal">
          <UsuarioSucursalTab />
        </TabsContent>

        <TabsContent value="asignacion-consultorio">
          <AsignacionConsultorioTab />
        </TabsContent>

        <TabsContent value="precio-base">
          <PrecioBaseTab />
        </TabsContent>

        <TabsContent value="precio-usuario">
          <PrecioUsuarioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}