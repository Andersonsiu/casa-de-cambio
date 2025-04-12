
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw, DollarSign, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';

interface TransactionFormProps {
  onTransactionSubmit: (transaction: {
    type: 'compra' | 'venta';
    currency: 'USD' | 'EUR';
    amount: number;
    rate: number;
    date: Date;
  }) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionSubmit }) => {
  const [type, setType] = useState<'compra' | 'venta'>('compra');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
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
    
    onTransactionSubmit({
      type,
      currency,
      amount: amountNum,
      rate: rateNum,
      date: new Date(date)
    });
    
    // Reset form
    setAmount('');
  };
  
  return (
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
  );
};

export default TransactionForm;
