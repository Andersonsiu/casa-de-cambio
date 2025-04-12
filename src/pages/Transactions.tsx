
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, RefreshCw, DollarSign, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';

interface Transaction {
  id: number;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  date: Date;
}

const Transactions: React.FC = () => {
  const [type, setType] = useState<'compra' | 'venta'>('compra');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rates, setRates] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await fetchExchangeRates();
      setRates(data);
      
      // Actualizar automáticamente la tasa de cambio en el formulario
      const selectedCurrencyRate = data.find(r => r.currency === currency);
      if (selectedCurrencyRate) {
        const newRate = type === 'compra' 
          ? selectedCurrencyRate.buyRate 
          : selectedCurrencyRate.sellRate;
        setRate(newRate.toString());
      }
      
      toast.success('Tipos de cambio actualizados');
    } catch (error) {
      console.error('Error al cargar tipos de cambio:', error);
      toast.error('Error al cargar tipos de cambio');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar las tasas al iniciar y cuando cambie el tipo o moneda
  useEffect(() => {
    loadRates();
  }, []);
  
  useEffect(() => {
    if (rates.length > 0) {
      const selectedCurrencyRate = rates.find(r => r.currency === currency);
      if (selectedCurrencyRate) {
        const newRate = type === 'compra' 
          ? selectedCurrencyRate.buyRate 
          : selectedCurrencyRate.sellRate;
        setRate(newRate.toString());
      }
    }
  }, [type, currency, rates]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !rate) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    
    const amountNum = parseFloat(amount);
    const rateNum = parseFloat(rate);
    
    if (isNaN(amountNum) || isNaN(rateNum)) {
      toast.error('Los montos deben ser números válidos');
      return;
    }
    
    if (amountNum <= 0 || rateNum <= 0) {
      toast.error('Los montos deben ser positivos');
      return;
    }
    
    const total = amountNum * rateNum;
    
    const newTransaction: Transaction = {
      id: Date.now(),
      type,
      currency,
      amount: amountNum,
      rate: rateNum,
      total,
      date: new Date(date)
    };
    
    setTransactions([...transactions, newTransaction]);
    toast.success('Transacción registrada exitosamente');
    
    // Reset form
    setAmount('');
  };
  
  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('Transacción eliminada');
  };
  
  const clearAllTransactions = () => {
    setTransactions([]);
    toast.success('Todas las transacciones han sido eliminadas');
  };
  
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Registrar Transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  type="button"
                  variant={type === 'compra' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setType('compra')}
                >
                  Compra
                </Button>
                <Button 
                  type="button"
                  variant={type === 'venta' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setType('venta')}
                >
                  Venta
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Moneda</label>
                <div className="flex space-x-4">
                  <Button 
                    type="button"
                    variant={currency === 'USD' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setCurrency('USD')}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    USD
                  </Button>
                  <Button 
                    type="button"
                    variant={currency === 'EUR' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setCurrency('EUR')}
                  >
                    <Euro className="mr-2 h-4 w-4" />
                    EUR
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Tasa de Cambio</label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadRates}
                    disabled={loading}
                    className="h-8 px-2 text-xs"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar Tasa
                  </Button>
                </div>
                <Input 
                  type="number" 
                  step="0.01"
                  value={rate} 
                  onChange={e => setRate(e.target.value)} 
                  placeholder="Ingrese la tasa de cambio"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Cantidad</label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="Ingrese la cantidad"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fecha</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        date && setDate(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button type="submit" className="w-full">Registrar Transacción</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transacciones Recientes</CardTitle>
            {transactions.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllTransactions}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Borrar Todo
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tasa</TableHead>
                    <TableHead>Total (S/)</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(-5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>S/ {transaction.rate.toFixed(2)}</TableCell>
                      <TableCell>S/ {transaction.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay transacciones registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {transactions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Historial Completo</CardTitle>
            <div className="text-sm text-gray-500">
              Total: {transactions.length} transacciones
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tasa</TableHead>
                  <TableHead>Total (S/)</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>S/ {transaction.rate.toFixed(2)}</TableCell>
                    <TableCell>S/ {transaction.total.toFixed(2)}</TableCell>
                    <TableCell>{format(transaction.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default Transactions;
