
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon, Download, BarChart, PieChart, LineChart } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart, 
  Pie, Cell, Legend 
} from 'recharts';

// Datos simulados para gráficos
const transactionData = [
  { name: 'Lun', compras: 4000, ventas: 2400 },
  { name: 'Mar', compras: 3000, ventas: 1398 },
  { name: 'Mie', compras: 2000, ventas: 9800 },
  { name: 'Jue', compras: 2780, ventas: 3908 },
  { name: 'Vie', compras: 1890, ventas: 4800 },
  { name: 'Sab', compras: 2390, ventas: 3800 },
  { name: 'Dom', compras: 3490, ventas: 4300 },
];

const currencyData = [
  { name: 'USD', value: 70 },
  { name: 'EUR', value: 30 },
];

const COLORS = ['#0088FE', '#00C49F'];

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('ganancias');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState('1000');
  
  const generateReport = () => {
    // En una aplicación real, aquí se procesarían los datos y se generaría el reporte
    console.log('Generando reporte:', { reportType, startDate, endDate, initialBalance });
  };
  
  const downloadReport = () => {
    // En una aplicación real, aquí se descargaría el reporte en formato Excel
    alert('Esta función descargaría un informe en Excel en una aplicación completa.');
  };
  
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reportes Financieros</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración del Reporte</CardTitle>
            <CardDescription>Seleccione los parámetros para generar su reporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tipo de Reporte</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de reporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ganancias">Ganancias</SelectItem>
                    <SelectItem value="margenes">Márgenes</SelectItem>
                    <SelectItem value="volumen">Volumen de Transacciones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fecha Inicial</label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        date && setStartDate(date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fecha Final</label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        date && setEndDate(date);
                        setEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Saldo Inicial (S/)</label>
                <Input 
                  type="number" 
                  value={initialBalance} 
                  onChange={e => setInitialBalance(e.target.value)} 
                  placeholder="Ingrese el saldo inicial"
                />
              </div>
              
              <Button onClick={generateReport} className="w-full">Generar Reporte</Button>
              
              <Button 
                variant="outline" 
                onClick={downloadReport} 
                className="w-full flex items-center justify-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Resumen del Periodo</CardTitle>
              <CardDescription>
                {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <BarChart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <LineChart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={transactionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="compras" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribución por Moneda</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <RePieChart>
                  <Pie
                    data={currencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {currencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Métricas Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Total Transacciones</div>
                <div className="text-2xl font-bold mt-1">124</div>
                <div className="text-xs text-blue-500 mt-1">+15% vs. periodo anterior</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Ganancia Total</div>
                <div className="text-2xl font-bold mt-1">S/ 5,280.45</div>
                <div className="text-xs text-green-500 mt-1">+8% vs. periodo anterior</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Margen Promedio</div>
                <div className="text-2xl font-bold mt-1">4.2%</div>
                <div className="text-xs text-purple-500 mt-1">+0.3% vs. periodo anterior</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Volumen Negociado</div>
                <div className="text-2xl font-bold mt-1">$ 125,430</div>
                <div className="text-xs text-orange-500 mt-1">+12% vs. periodo anterior</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reports;
