import { useState, useEffect } from 'react';
import { getArchivosByPaciente, createArchivoMedico, deleteArchivoMedico, type ArchivoMedico } from '../lib/pacientesService';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Paperclip, Upload, X, Eye, Download, Search, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ArchivosMedicosSectionProps {
  pacienteId: number;
}

export function ArchivosMedicosSection({ pacienteId }: ArchivosMedicosSectionProps) {
  const [archivos, setArchivos] = useState<ArchivoMedico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filtroArchivos, setFiltroArchivos] = useState('');
  const [archivoVisualizando, setArchivoVisualizando] = useState<ArchivoMedico | null>(null);
  
  // Formulario de nuevo archivo
  const [nuevoArchivo, setNuevoArchivo] = useState({
    nombre: '',
    tipo: 'laboratorio' as 'laboratorio' | 'imagen' | 'receta' | 'informe' | 'otro',
    descripcion: '',
    url_archivo: '',
    tamano_bytes: 0
  });

  // Cargar archivos del paciente
  useEffect(() => {
    cargarArchivos();
  }, [pacienteId]);

  const cargarArchivos = async () => {
    setIsLoading(true);
    const data = await getArchivosByPaciente(pacienteId);
    setArchivos(data);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setNuevoArchivo({
          ...nuevoArchivo,
          nombre: file.name,
          url_archivo: base64,
          tamano_bytes: file.size
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarArchivo = async () => {
    if (!nuevoArchivo.nombre || !nuevoArchivo.url_archivo) {
      toast.error('Por favor seleccione un archivo');
      return;
    }

    const archivo = await createArchivoMedico({
      id_paciente: pacienteId,
      nombre_archivo: nuevoArchivo.nombre,
      tipo_archivo: nuevoArchivo.tipo,
      descripcion: nuevoArchivo.descripcion || null,
      url_archivo: nuevoArchivo.url_archivo,
      fecha_carga: new Date().toISOString().split('T')[0]
    });

    if (archivo) {
      toast.success('Archivo cargado exitosamente');
      setIsUploadDialogOpen(false);
      setNuevoArchivo({
        nombre: '',
        tipo: 'laboratorio',
        descripcion: '',
        url_archivo: '',
        tamano_bytes: 0
      });
      await cargarArchivos();
    } else {
      toast.error('Error al cargar el archivo');
    }
  };

  const handleEliminarArchivo = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este archivo?')) {
      const success = await deleteArchivoMedico(id);
      if (success) {
        toast.success('Archivo eliminado');
        await cargarArchivos();
      } else {
        toast.error('Error al eliminar el archivo');
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo.includes('image') || tipo === 'imagen') return <ImageIcon className="size-4" />;
    return <FileText className="size-4" />;
  };

  const archivosFiltrados = archivos.filter(archivo => {
    const searchTerm = filtroArchivos.toLowerCase();
    return archivo.nombre_archivo.toLowerCase().includes(searchTerm) ||
           archivo.descripcion?.toLowerCase().includes(searchTerm) ||
           archivo.tipo_archivo.toLowerCase().includes(searchTerm);
  });

  return (
    <>
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="font-medium flex items-center gap-2">
            <Paperclip className="size-4" />
            Archivos Médicos ({archivos.length})
          </Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="size-4 mr-2" />
            Cargar Archivo
          </Button>
        </div>

        {/* Buscador de archivos */}
        {archivos.length > 0 && (
          <div className="relative mb-3">
            <Search className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, tipo o descripción..."
              value={filtroArchivos}
              onChange={(e) => setFiltroArchivos(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        )}
        
        {/* Lista de archivos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-blue-600" />
          </div>
        ) : archivosFiltrados.length === 0 ? (
          <p className="text-center py-4 text-gray-500 text-sm">
            {filtroArchivos ? 'No se encontraron archivos' : 'No hay archivos adjuntos'}
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {archivosFiltrados.map((archivo) => (
              <Card key={archivo.id_archivo} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {getTipoIcon(archivo.tipo_archivo)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{archivo.nombre_archivo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {archivo.tipo_archivo}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatBytes((archivo as any).tamano_bytes || 0)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(archivo.fecha_carga).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {archivo.descripcion && (
                        <p className="text-xs text-gray-600 mt-1">{archivo.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setArchivoVisualizando(archivo)}
                      title="Ver archivo"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = archivo.url_archivo || '';
                        link.download = archivo.nombre_archivo;
                        link.click();
                      }}
                      title="Descargar"
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleEliminarArchivo(archivo.id_archivo)}
                      title="Eliminar"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para cargar archivo */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cargar Archivo Médico</DialogTitle>
            <DialogDescription>
              Seleccione un archivo (PDF, imagen, etc.) para el paciente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo *</Label>
              <Input
                id="archivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              {nuevoArchivo.nombre && (
                <p className="text-sm text-gray-600">
                  {nuevoArchivo.nombre} ({formatBytes(nuevoArchivo.tamano_bytes)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Archivo *</Label>
              <select
                id="tipo"
                className="w-full px-3 py-2 border rounded-md"
                value={nuevoArchivo.tipo}
                onChange={(e) => setNuevoArchivo({ ...nuevoArchivo, tipo: e.target.value as any })}
              >
                <option value="laboratorio">Laboratorio</option>
                <option value="imagen">Imagen / Radiografía</option>
                <option value="receta">Receta Médica</option>
                <option value="informe">Informe Médico</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                placeholder="Descripción del archivo..."
                value={nuevoArchivo.descripcion}
                onChange={(e) => setNuevoArchivo({ ...nuevoArchivo, descripcion: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarArchivo} disabled={!nuevoArchivo.url_archivo}>
              <Upload className="size-4 mr-2" />
              Cargar Archivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar archivo */}
      <Dialog open={!!archivoVisualizando} onOpenChange={() => setArchivoVisualizando(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{archivoVisualizando?.nombre_archivo}</DialogTitle>
            <DialogDescription>
              {archivoVisualizando?.descripcion || 'Vista previa del archivo'}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh]">
            {archivoVisualizando?.url_archivo && (
              <>
                {archivoVisualizando.url_archivo.includes('application/pdf') ? (
                  <iframe
                    src={archivoVisualizando.url_archivo}
                    className="w-full h-[600px] border rounded"
                    title="Vista previa PDF"
                  />
                ) : archivoVisualizando.url_archivo.includes('image') ? (
                  <img
                    src={archivoVisualizando.url_archivo}
                    alt={archivoVisualizando.nombre_archivo}
                    className="w-full h-auto rounded"
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="size-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Vista previa no disponible</p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = archivoVisualizando.url_archivo || '';
                        link.download = archivoVisualizando.nombre_archivo;
                        link.click();
                      }}
                    >
                      <Download className="size-4 mr-2" />
                      Descargar Archivo
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setArchivoVisualizando(null)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                if (archivoVisualizando) {
                  const link = document.createElement('a');
                  link.href = archivoVisualizando.url_archivo || '';
                  link.download = archivoVisualizando.nombre_archivo;
                  link.click();
                }
              }}
            >
              <Download className="size-4 mr-2" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
