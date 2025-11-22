// src/pages/Reports.tsx
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Download,
  DollarSign,
  Euro,
  TrendingUp,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

// Firebase
import { db } from '@/integrations/firebase/client';
import {
  collection,
  getDocs,
} from 'firebase/firestore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface Transaction {
  id: string;
  dni: string;
  full_name: string;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  transaction_date: string;
  created_at: string;
}

interface ReportMetrics {
  totalTransactions: number;
  totalVolume: number;
  totalProfit: number;
  averageMargin: number;
  usdVolume: number;
  eurVolume: number;
  comprasCount: number;
  ventasCount: number;
  dailyData: { date: string; compras: number; ventas: number }[];
  currencyDistribution: { name: string; value: number }[];
}

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Filtros
  const [searchNombre, setSearchNombre] = useState('');
  const [searchDNI, setSearchDNI] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterCurrency, setFilterCurrency] = useState<string>('todos');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalTransactions: 0,
    totalVolume: 0,
    totalProfit: 0,
    averageMargin: 0,
    usdVolume: 0,
    eurVolume: 0,
    comprasCount: 0,
    ventasCount: 0,
    dailyData: [],
    currencyDistribution: []
  });

  // Calcular métricas basadas en las transacciones
  const calculateMetrics = (transactions: Transaction[]): ReportMetrics => {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalVolume: 0,
        totalProfit: 0,
        averageMargin: 0,
        usdVolume: 0,
        eurVolume: 0,
        comprasCount: 0,
        ventasCount: 0,
        dailyData: [],
        currencyDistribution: []
      };
    }

    // Agrupar por día
    const dailyDataMap = new Map<string, { compras: number; ventas: number }>();
    
    // Métricas básicas
    let totalVolume = 0;
    let usdVolume = 0;
    let eurVolume = 0;
    let comprasCount = 0;
    let ventasCount = 0;
    
    // Para cálculo de ganancias (simplificado)
    const buyRates = { USD: 3.75, EUR: 4.10 };
    const sellRates = { USD: 3.78, EUR: 4.15 };
    let totalProfit = 0;

    transactions.forEach(transaction => {
      const date = transaction.transaction_date;
      const amount = Number(transaction.amount) || 0;
      const total = Number(transaction.total) || 0;
      
      // Inicializar día si no existe
      if (!dailyDataMap.has(date)) {
        dailyDataMap.set(date, { compras: 0, ventas: 0 });
      }
      
      const dayData = dailyDataMap.get(date)!;
      
      if (transaction.type === 'compra') {
        dayData.compras += total;
        comprasCount++;
      } else if (transaction.type === 'venta') {
        dayData.ventas += total;
        ventasCount++;
        
        // Calcular ganancia estimada para ventas
        const currency = transaction.currency;
        const estimatedCost = amount * buyRates[currency];
        const revenue = total;
        const profit = revenue - estimatedCost;
        totalProfit += profit;
      }
      
      totalVolume += total;
      
      if (transaction.currency === 'USD') {
        usdVolume += total;
      } else if (transaction.currency === 'EUR') {
        eurVolume += total;
      }
    });

    // Convertir dailyDataMap a array para el gráfico
    const dailyData = Array.from(dailyDataMap.entries())
      .map(([date, data]) => ({
        date: format(new Date(date), 'dd/MM'),
        compras: data.compras,
        ventas: data.ventas
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Distribución por moneda
    const currencyDistribution = [
      { name: 'USD', value: usdVolume },
      { name: 'EUR', value: eurVolume }
    ].filter(item => item.value > 0);

    const averageMargin = totalVolume > 0 ? (totalProfit / totalVolume) * 100 : 0;

    return {
      totalTransactions: transactions.length,
      totalVolume,
      totalProfit,
      averageMargin,
      usdVolume,
      eurVolume,
      comprasCount,
      ventasCount,
      dailyData,
      currencyDistribution
    };
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      const transactionsRef = collection(db, 'transactions');
      const querySnapshot = await getDocs(transactionsRef);
      const allTransactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      // Filtrar por fecha en el cliente
      const filteredByDate = allTransactions.filter(transaction => {
        const transactionDate = transaction.transaction_date;
        return transactionDate >= startStr && transactionDate <= endStr;
      });

      setTransactions(filteredByDate);
      
      // Aplicar filtros adicionales
      applyFilters(filteredByDate);

    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (transactionsToFilter: Transaction[]) => {
    let filtered = transactionsToFilter;

    // Filtrar por nombre
    if (searchNombre) {
      filtered = filtered.filter(t => 
        (t.full_name ?? '').toLowerCase().includes(searchNombre.toLowerCase())
      );
    }

    // Filtrar por DNI
    if (searchDNI) {
      filtered = filtered.filter(t => 
        (t.dni ?? '').includes(searchDNI)
      );
    }

    // Filtrar por tipo
    if (filterType !== 'todos') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtrar por moneda
    if (filterCurrency !== 'todos') {
      filtered = filtered.filter(t => t.currency === filterCurrency);
    }

    setFilteredTransactions(filtered);
    
    // Calcular métricas para transacciones filtradas
    const calculatedMetrics = calculateMetrics(filtered);
    setMetrics(calculatedMetrics);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Aplicar filtros cuando cambien los valores
  useEffect(() => {
    applyFilters(transactions);
  }, [searchNombre, searchDNI, filterType, filterCurrency, transactions]);

  const generateReport = () => {
    fetchTransactions();
    toast.success('Reporte actualizado');
  };

  const downloadReport = async () => {
    try {
      const XLSX = await import('xlsx');

      // Preparar datos para Excel
      const reportData = [
        ['ROJAS - Casa de Cambio - Histórico de Transacciones'],
        [
          'Periodo:',
          `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        ],
        ['Fecha de generación:', format(new Date(), 'dd/MM/yyyy HH:mm')],
        ['Total de transacciones:', filteredTransactions.length],
        [],
        ['DETALLE DE TRANSACCIONES'],
        [
          'Fecha',
          'DNI',
          'Nombre',
          'Tipo',
          'Moneda',
          'Cantidad',
          'Tasa',
          'Total (S/)',
        ],
        ...filteredTransactions.map((t) => [
          t.transaction_date ? format(new Date(t.transaction_date), 'dd/MM/yyyy') : '',
          t.dni ?? '',
          t.full_name ?? '',
          (t.type ?? '').toString().toUpperCase(),
          t.currency ?? '',
          t.amount ?? 0,
          t.rate ?? 0,
          t.total ?? 0,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

      const fileName = `Historico_Transacciones_${format(new Date(), 'ddMMyyyy_HHmm')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Histórico exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el histórico');
    }
  };

  const clearFilters = () => {
    setSearchNombre('');
    setSearchDNI('');
    setFilterType('todos');
    setFilterCurrency('todos');
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reportes y Análisis</h1>
        <div className="text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </div>
      </div>

      {/* Filtros Horizontales */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtre las transacciones según sus criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nombre</label>
              <Input
                type="text"
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
                placeholder="Buscar por nombre"
                className="w-full"
              />
            </div>

            {/* DNI */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">DNI</label>
              <Input
                type="text"
                value={searchDNI}
                onChange={(e) => setSearchDNI(e.target.value)}
                placeholder="Buscar por DNI"
                className="w-full"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Moneda</label>
              <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fechas */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Fecha Inicial</label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'dd/MM/yy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) setStartDate(date);
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
                    {format(endDate, 'dd/MM/yy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Buscando...' : 'Buscar Transacciones'}
            </Button>

            <Button
              variant="outline"
              onClick={downloadReport}
              disabled={filteredTransactions.length === 0}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Histórico
            </Button>

            <Button
              variant="ghost"
              onClick={clearFilters}
              className="w-32"
            >
              Limpiar
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center mt-4">
            {filteredTransactions.length} transacciones encontradas
          </div>
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
                <div className="text-sm text-muted-foreground">Total Transacciones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">S/ {metrics.totalVolume.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Volumen Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">S/ {metrics.totalProfit.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Ganancia Estimada</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Euro className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{metrics.averageMargin.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Margen Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compras vs Ventas por Día</CardTitle>
            <CardDescription>Evolución diaria del volumen</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.dailyData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <ReBarChart
                    data={metrics.dailyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, 'Monto']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="compras" 
                      name="Compras" 
                      fill="#8884d8" 
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="ventas" 
                      name="Ventas" 
                      fill="#82ca9d" 
                      radius={[2, 2, 0, 0]}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay datos para el período seleccionado
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Moneda</CardTitle>
            <CardDescription>Volumen por tipo de moneda</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.currencyDistribution.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <RePieChart>
                    <Pie
                      data={metrics.currencyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {metrics.currencyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, 'Volumen']} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay datos de monedas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reports;