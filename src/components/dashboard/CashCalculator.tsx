import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Calculator, DollarSign, Euro, TrendingUp, AlertCircle, Info, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { db, auth } from '@/integrations/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CashCalculation {
  // USD
  cajaDolaresCompraOrigen: number;
  cajaDolaresVentaOrigen: number;
  cajaDolaresCompraDestino: number;
  cajaDolaresVentaDestino: number;
  margenCompraDolares: number;
  margenVentaDolares: number;
  diferenciaMargenDolares: number;
  gananciaSolesDolares: number;
  gananciaDolares: number;
  gananciaDolaresDespuesGastos: number;
  cajaFinalDolares: number;
  
  // EUR
  cajaEurosCompraOrigen: number;
  cajaEurosVentaOrigen: number;
  cajaEurosCompraDestino: number;
  cajaEurosVentaDestino: number;
  margenCompraEuros: number;
  margenVentaEuros: number;
  diferenciaMargenEuros: number;
  gananciaSolesEuros: number;
  gananciaEuros: number;
  gananciaEurosDespuesGastos: number;
  cajaFinalEuros: number;
  
  gastos: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  rate: number;
  transaction_date: string;
  total: number;
}

const CashCalculator: React.FC = () => {
  const [initialCashUSD, setInitialCashUSD] = useState<string>('0.00');
  const [initialCashEUR, setInitialCashEUR] = useState<string>('0.00');
  const [expenses, setExpenses] = useState<string>('0.00');
  const [results, setResults] = useState<CashCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Tipo de reporte
  const [reportType, setReportType] = useState<string>('diario');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));

  const isDateRangeValid = reportType !== 'semanal' || !startDate || !endDate || startDate <= endDate;
  const dateError = !isDateRangeValid ? "La fecha fin no puede ser menor a la fecha inicio" : "";

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      let dateStart: string;
      let dateEnd: string;

      if (reportType === 'diario') {
        dateStart = selectedDate;
        dateEnd = selectedDate;
      } else if (reportType === 'semanal') {
        if (!startDate || !endDate) {
          setTransactions([]);
          setLoading(false);
          return;
        }
        dateStart = startDate;
        dateEnd = endDate;
      } else {
        // Mensual
        const year = new Date().getFullYear();
        const month = parseInt(selectedMonth);
        dateStart = `${year}-${selectedMonth}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        dateEnd = `${year}-${selectedMonth}-${lastDay.toString().padStart(2, '0')}`;
      }

      // Consultar Firestore
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('transaction_date', '>=', dateStart),
        where('transaction_date', '<=', dateEnd)
      );

      const querySnapshot = await getDocs(q);
      const fetchedTransactions: Transaction[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        amount: doc.data().amount || 0,
        currency: doc.data().currency || 'USD',
        type: doc.data().type || 'compra',
        rate: doc.data().rate || 0,
        transaction_date: doc.data().transaction_date || '',
        total: doc.data().total || 0,
      }));

      setTransactions(fetchedTransactions);
      console.log(`Transacciones encontradas: ${fetchedTransactions.length}`, fetchedTransactions);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDateRangeValid) {
      fetchTransactions();
    }
  }, [reportType, selectedDate, startDate, endDate, selectedMonth]);

  const calculateCash = async () => {
    if (!isDateRangeValid) {
      toast.error('Corrija el rango de fechas antes de calcular');
      return;
    }

    setLoading(true);

    try {
      const cajaInicialDolares = parseFloat(initialCashUSD) || 0;
      const cajaInicialEuros = parseFloat(initialCashEUR) || 0;
      const gastosAmount = parseFloat(expenses) || 0;

      // Inicializar contadores
      let cajaDolaresCompraOrigen = 0;
      let cajaDolaresVentaOrigen = 0;
      let cajaDolaresCompraDestino = 0;
      let cajaDolaresVentaDestino = 0;

      let cajaEurosCompraOrigen = 0;
      let cajaEurosVentaOrigen = 0;
      let cajaEurosCompraDestino = 0;
      let cajaEurosVentaDestino = 0;

      // Procesar transacciones USD
      const transaccionesDolares = transactions.filter(t => t.currency === 'USD');
      transaccionesDolares.forEach(transaccion => {
        if (transaccion.type === 'compra') {
          cajaDolaresCompraOrigen += transaccion.amount;
          cajaDolaresCompraDestino += transaccion.total;
        } else {
          cajaDolaresVentaOrigen += transaccion.amount;
          cajaDolaresVentaDestino += transaccion.total;
        }
      });

      // Procesar transacciones EUR
      const transaccionesEuros = transactions.filter(t => t.currency === 'EUR');
      transaccionesEuros.forEach(transaccion => {
        if (transaccion.type === 'compra') {
          cajaEurosCompraOrigen += transaccion.amount;
          cajaEurosCompraDestino += transaccion.total;
        } else {
          cajaEurosVentaOrigen += transaccion.amount;
          cajaEurosVentaDestino += transaccion.total;
        }
      });

      // Calcular márgenes de compra y venta
      let margenCompraDolares = 0;
      let margenVentaDolares = 0;
      let margenCompraEuros = 0;
      let margenVentaEuros = 0;

      if (cajaDolaresCompraOrigen !== 0) {
        margenCompraDolares = cajaDolaresCompraDestino / cajaDolaresCompraOrigen;
      }
      if (cajaDolaresVentaOrigen !== 0) {
        margenVentaDolares = cajaDolaresVentaDestino / cajaDolaresVentaOrigen;
      }

      if (cajaEurosCompraOrigen !== 0) {
        margenCompraEuros = cajaEurosCompraDestino / cajaEurosCompraOrigen;
      }
      if (cajaEurosVentaOrigen !== 0) {
        margenVentaEuros = cajaEurosVentaDestino / cajaEurosVentaOrigen;
      }

      // Calcular diferencia de márgenes
      const diferenciaMargenDolares = margenVentaDolares - margenCompraDolares;
      const diferenciaMargenEuros = margenVentaEuros - margenCompraEuros;

      // Calcular ganancia en soles
      const gananciaSolesDolares = cajaDolaresCompraOrigen * diferenciaMargenDolares;
      const gananciaSolesEuros = cajaEurosCompraOrigen * diferenciaMargenEuros;

      // Calcular ganancia en dólares/euros
      let gananciaDolares = 0;
      let gananciaEuros = 0;

      if (margenVentaDolares !== 0) {
        gananciaDolares = gananciaSolesDolares / margenVentaDolares;
      }
      if (margenVentaEuros !== 0) {
        gananciaEuros = gananciaSolesEuros / margenVentaEuros;
      }

      // Ganancia después de gastos (distribuyendo gastos proporcionalmente)
      const totalGananciaSoles = gananciaSolesDolares + gananciaSolesEuros;
      const proporcionDolares = totalGananciaSoles > 0 ? gananciaSolesDolares / totalGananciaSoles : 0.5;
      const proporcionEuros = totalGananciaSoles > 0 ? gananciaSolesEuros / totalGananciaSoles : 0.5;

      const gastosDolares = gastosAmount * proporcionDolares;
      const gastosEuros = gastosAmount * proporcionEuros;

      const gananciaDolaresDespuesGastos = gananciaDolares - (margenVentaDolares !== 0 ? gastosDolares / margenVentaDolares : 0);
      const gananciaEurosDespuesGastos = gananciaEuros - (margenVentaEuros !== 0 ? gastosEuros / margenVentaEuros : 0);

      // Calcular caja final
      const cajaFinalDolares = cajaInicialDolares + gananciaDolaresDespuesGastos;
      const cajaFinalEuros = cajaInicialEuros + gananciaEurosDespuesGastos;

      const calculation: CashCalculation = {
        cajaDolaresCompraOrigen,
        cajaDolaresVentaOrigen,
        cajaDolaresCompraDestino,
        cajaDolaresVentaDestino,
        margenCompraDolares,
        margenVentaDolares,
        diferenciaMargenDolares,
        gananciaSolesDolares,
        gananciaDolares,
        gananciaDolaresDespuesGastos,
        cajaFinalDolares,
        
        cajaEurosCompraOrigen,
        cajaEurosVentaOrigen,
        cajaEurosCompraDestino,
        cajaEurosVentaDestino,
        margenCompraEuros,
        margenVentaEuros,
        diferenciaMargenEuros,
        gananciaSolesEuros,
        gananciaEuros,
        gananciaEurosDespuesGastos,
        cajaFinalEuros,
        
        gastos: gastosAmount,
      };

      setResults(calculation);
      toast.success('Cálculo de caja realizado exitosamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al realizar el cálculo');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <Calculator className="h-6 w-6 text-primary" />
            Calculadora de Caja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de reporte */}
          <div className="space-y-2">
            <Label className="text-foreground">Tipo de Reporte</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros de fecha según tipo */}
          {reportType === 'diario' && (
            <div className="space-y-2">
              <Label className="text-foreground">Fecha</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {reportType === 'semanal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={!isDateRangeValid ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Fin</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={!isDateRangeValid ? "border-destructive" : ""}
                />
              </div>
            </div>
          )}

          {reportType === 'mensual' && (
            <div className="space-y-2">
              <Label className="text-foreground">Mes</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {dateError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{dateError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial-usd" className="flex items-center gap-2 text-foreground">
                <DollarSign className="h-4 w-4 text-green-600" />
                Caja Inicial USD
              </Label>
              <Input
                id="initial-usd"
                type="number"
                step="0.01"
                value={initialCashUSD}
                onChange={(e) => setInitialCashUSD(e.target.value)}
                className="transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-eur" className="flex items-center gap-2 text-foreground">
                <Euro className="h-4 w-4 text-blue-600" />
                Caja Inicial EUR
              </Label>
              <Input
                id="initial-eur"
                type="number"
                step="0.01"
                value={initialCashEUR}
                onChange={(e) => setInitialCashEUR(e.target.value)}
                className="transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses" className="flex items-center gap-2 text-foreground">
                <Wallet className="h-4 w-4 text-orange-600" />
                Gastos (S/)
              </Label>
              <Input
                id="expenses"
                type="number"
                step="0.01"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="transition-all duration-200"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Transacciones encontradas</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">USD: {transactions.filter(t => t.currency === 'USD').length} | EUR: {transactions.filter(t => t.currency === 'EUR').length}</div>
              <div className="text-sm text-muted-foreground">
                Compras: {transactions.filter(t => t.type === 'compra').length} | Ventas: {transactions.filter(t => t.type === 'venta').length}
              </div>
            </div>
          </div>

          <EnhancedButton 
            onClick={calculateCash} 
            loading={loading}
            disabled={!isDateRangeValid}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            size="lg"
          >
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? 'Calculando...' : 'Calcular Caja'}
          </EnhancedButton>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resultados del Análisis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Resultados USD */}
            <Card className="border-0 shadow-soft bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Análisis USD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Compra Origen:</span>
                    <span className="font-medium text-foreground">${results.cajaDolaresCompraOrigen.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Compra Destino:</span>
                    <span className="font-medium text-foreground">S/ {results.cajaDolaresCompraDestino.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Venta Origen:</span>
                    <span className="font-medium text-foreground">${results.cajaDolaresVentaOrigen.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Venta Destino:</span>
                    <span className="font-medium text-foreground">S/ {results.cajaDolaresVentaDestino.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margen Compra:</span>
                    <span className="font-medium text-foreground">{results.margenCompraDolares.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margen Venta:</span>
                    <span className="font-medium text-foreground">{results.margenVentaDolares.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diferencia Margen:</span>
                    <span className={`font-medium ${results.diferenciaMargenDolares >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.diferenciaMargenDolares.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ganancia Soles:</span>
                    <span className={`font-bold ${results.gananciaSolesDolares >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      S/ {results.gananciaSolesDolares.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ganancia USD:</span>
                    <span className={`font-bold ${results.gananciaDolaresDespuesGastos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${results.gananciaDolaresDespuesGastos.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-green-100 p-2 rounded">
                    <span className="font-medium text-foreground">Caja Final:</span>
                    <span className="font-bold text-foreground">${results.cajaFinalDolares.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultados EUR */}
            <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Euro className="h-5 w-5 text-blue-600" />
                  Análisis EUR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Compra Origen:</span>
                    <span className="font-medium text-foreground">€{results.cajaEurosCompraOrigen.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Compra Destino:</span>
                    <span className="font-medium text-foreground">S/ {results.cajaEurosCompraDestino.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Venta Origen:</span>
                    <span className="font-medium text-foreground">€{results.cajaEurosVentaOrigen.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground block">Venta Destino:</span>
                    <span className="font-medium text-foreground">S/ {results.cajaEurosVentaDestino.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margen Compra:</span>
                    <span className="font-medium text-foreground">{results.margenCompraEuros.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margen Venta:</span>
                    <span className="font-medium text-foreground">{results.margenVentaEuros.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diferencia Margen:</span>
                    <span className={`font-medium ${results.diferenciaMargenEuros >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.diferenciaMargenEuros.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ganancia Soles:</span>
                    <span className={`font-bold ${results.gananciaSolesEuros >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      S/ {results.gananciaSolesEuros.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ganancia EUR:</span>
                    <span className={`font-bold ${results.gananciaEurosDespuesGastos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{results.gananciaEurosDespuesGastos.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-blue-100 p-2 rounded">
                    <span className="font-medium text-foreground">Caja Final:</span>
                    <span className="font-bold text-foreground">€{results.cajaFinalEuros.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen Total */}
          <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Resumen Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white/50 rounded-lg text-center">
                  <span className="text-muted-foreground block text-sm">Gastos</span>
                  <span className="font-bold text-lg text-foreground">S/ {results.gastos.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-white/50 rounded-lg text-center">
                  <span className="text-muted-foreground block text-sm">Ganancia Total Soles</span>
                  <span className={`font-bold text-lg ${(results.gananciaSolesDolares + results.gananciaSolesEuros) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    S/ {(results.gananciaSolesDolares + results.gananciaSolesEuros - results.gastos).toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-green-100 rounded-lg text-center">
                  <span className="text-muted-foreground block text-sm">Caja Final USD</span>
                  <span className="font-bold text-lg text-foreground">${results.cajaFinalDolares.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-center">
                  <span className="text-muted-foreground block text-sm">Caja Final EUR</span>
                  <span className="font-bold text-lg text-foreground">€{results.cajaFinalEuros.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CashCalculator;
