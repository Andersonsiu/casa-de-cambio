
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface ApiConfigSettingsProps {
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  apiEndpoint: string;
  setApiEndpoint: React.Dispatch<React.SetStateAction<string>>;
}

const ApiConfigSettings: React.FC<ApiConfigSettingsProps> = ({
  apiKey,
  setApiKey,
  apiEndpoint,
  setApiEndpoint
}) => {
  const saveAPIConfig = () => {
    toast.success('Configuración de API guardada');
    // Aquí se guardaría la configuración de la API
    // En una aplicación real, esto se almacenaría en una base de datos
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de API Externa</CardTitle>
        <CardDescription>
          Configure la conexión con la API de Bloomberg u otra fuente de tipos de cambio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL de la API</Label>
            <Input 
              id="api-url"
              value={apiEndpoint} 
              onChange={(e) => setApiEndpoint(e.target.value)} 
              placeholder="https://api.bloomberg.com/market-data/exchange-rates"
            />
            <p className="text-sm text-gray-500">
              URL del endpoint de la API de tipos de cambio
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">Clave de API</Label>
            <Input 
              id="api-key"
              type="password"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="Ingrese su clave de API de Bloomberg"
            />
            <p className="text-sm text-gray-500">
              Clave secreta para autenticarse con la API
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-update">Actualización Automática</Label>
            <Select defaultValue="30">
              <SelectTrigger id="api-update">
                <SelectValue placeholder="Frecuencia de actualización" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Cada 15 minutos</SelectItem>
                <SelectItem value="30">Cada 30 minutos</SelectItem>
                <SelectItem value="60">Cada hora</SelectItem>
                <SelectItem value="manual">Manual solamente</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Frecuencia con la que se actualizarán los datos desde la API
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveAPIConfig} className="ml-auto">
          <Save className="mr-2 h-4 w-4" />
          Guardar Configuración de API
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiConfigSettings;
