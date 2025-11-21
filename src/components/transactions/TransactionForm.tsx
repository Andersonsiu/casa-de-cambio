import React, { useState, useEffect } from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw, DollarSign, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';
import { supabase } from '@/integrations/supabase/client';

interface TransactionFormProps {
  transaction?: {
    id: string;
    type: 'compra' | 'venta';
    currency: 'USD' | 'EUR';
    amount: number;
    rate: number;
    date: Date;
    dni: string;
    full_name: string;
  };
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSuccess }) => {
  const [type, setType] = useState<'compra' | 'venta'>(transaction?.type || 'compra');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>(transaction?.currency || 'USD');
  const [amount, setAmount] = useState<string>(transaction?.amount.toString() || '');
  const [rate, setRate] = useState<string>(transaction?.rate.toString() || '');
  const [date, setDate] = useState<Date>(transaction?.date || new Date());
  const [dni, setDni] = useState<string>(transaction?.dni || '');
  const [fullName, setFullName] = useState<string>(transaction?.full_name || '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rates, setRates] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await fetchExchangeRates();
      setRates(data);
      
      if (!transaction) {
        const selectedCurrencyRate = data.find(r => r.currency === currency);
        if (selectedCurrencyRate) {
          const newRate = type === 'compra' 
            ? selectedCurrencyRate.buyRate 
            : selectedCurrencyRate.sellRate;
          setRate(newRate.toString());
        }
      }
      
      toast.success('Tipos de cambio actualizados');
    } catch (error) {
      console.error('Error al cargar tipos de cambio:', error);
      toast.error('Error al cargar tipos de cambio');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!transaction) {
      loadRates();
    }
  }, []);
  
  useEffect(() => {
    if (rates.length > 0 && !transaction) {
      const selectedCurrencyRate = rates.find(r => r.currency === currency);
      if (selectedCurrencyRate) {
        const newRate = type === 'compra' 
          ? selectedCurrencyRate.buyRate 
          : selectedCurrencyRate.sellRate;
        setRate(newRate.toString());
      }
    }
  }, [type, currency, rates, transaction]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !rate || !dni || !fullName) {
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

    if (dni.length < 8) {
      toast.error('El DNI debe tener al menos 8 dígitos');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Debe iniciar sesión para registrar transacciones');
        return;
      }

      const total = amountNum * rateNum;
      const transactionData = {
        user_id: user.id,
        dni,
        full_name: fullName,
        type,
        currency,
        amount: amountNum,
        rate: rateNum,
        total,
        transaction_date: format(date, 'yyyy-MM-dd')
      };

      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;
        toast.success('Transacción actualizada exitosamente');
      } else {
        // Insert new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;
        toast.success('Transacción registrada exitosamente');
      }
      
      // Reset form if it's a new transaction
      if (!transaction) {
        setAmount('');
        setDni('');
        setFullName('');
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error al guardar transacción:', error);
      toast.error(error.message || 'Error al guardar transacción');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border shadow-soft">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>DNI</Label>
          <Input 
            type="text" 
            value={dni}
            onChange={e => setDni(e.target.value)}
            placeholder="Ingrese el DNI"
            maxLength={12}
            className="border-input focus:border-accent transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Nombre Completo</Label>
          <Input 
            type="text" 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Ingrese nombre y apellidos"
            className="border-input focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <EnhancedButton 
          type="button"
          variant={type === 'compra' ? 'success' : 'outline'} 
          className="flex-1"
          onClick={() => setType('compra')}
        >
          Compra
        </EnhancedButton>
        <EnhancedButton 
          type="button"
          variant={type === 'venta' ? 'destructive' : 'outline'} 
          className="flex-1"
          onClick={() => setType('venta')}
        >
          Venta
        </EnhancedButton>
      </div>
      
      <div className="space-y-2">
        <Label>Moneda</Label>
        <div className="flex space-x-3">
          <EnhancedButton 
            type="button"
            variant={currency === 'USD' ? 'usd' : 'outline'} 
            className="flex-1"
            onClick={() => setCurrency('USD')}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            USD
          </EnhancedButton>
          <EnhancedButton 
            type="button"
            variant={currency === 'EUR' ? 'eur' : 'outline'} 
            className="flex-1"
            onClick={() => setCurrency('EUR')}
          >
            <Euro className="mr-2 h-4 w-4" />
            EUR
          </EnhancedButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Tasa de Cambio</Label>
          {!transaction && (
            <EnhancedButton 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={loadRates}
              loading={loading}
              className="h-8 px-3 text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Actualizar
            </EnhancedButton>
          )}
        </div>
        <Input 
          type="number" 
          step="0.0001"
          value={rate} 
          onChange={e => setRate(e.target.value)} 
          placeholder="Ingrese la tasa de cambio"
          className="border-input focus:border-accent transition-colors"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Cantidad</Label>
        <Input 
          type="number" 
          step="0.01"
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          placeholder="Ingrese la cantidad"
          className="border-input focus:border-accent transition-colors"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Fecha</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <EnhancedButton
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'PPP')}
            </EnhancedButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-strong">
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
      
      <EnhancedButton 
        type="submit" 
        className="w-full" 
        size="lg"
        loading={loading}
      >
        {transaction ? 'Actualizar Transacción' : 'Registrar Transacción'}
      </EnhancedButton>
    </form>
  );
};

export default TransactionForm;
