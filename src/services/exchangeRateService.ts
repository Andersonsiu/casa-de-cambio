
// Servicio de tipos de cambio con Web Scraping

import { scrapeMultipleCurrencies, convertScrapedDataToExchangeRate } from './webScrapingService';

// Interfaz para los datos de tipo de cambio
export interface ExchangeRateData {
  currency: string;
  buyRate: number;
  sellRate: number;
  lastUpdated: Date;
  marketRate?: number;
  change?: number;
  changePercent?: number;
}

// Función principal para obtener tipos de cambio usando web scraping
export const fetchExchangeRates = async (): Promise<ExchangeRateData[]> => {
  try {
    console.log('Obteniendo tipos de cambio desde Google Finance...');
    
    // Intentar obtener datos mediante web scraping
    const scrapedData = await scrapeMultipleCurrencies();
    
    if (scrapedData.length > 0) {
      console.log('Datos obtenidos exitosamente desde Google Finance');
      return scrapedData.map(convertScrapedDataToExchangeRate);
    }
    
    // Fallback a datos simulados si el scraping falla
    console.log('Usando datos simulados como fallback...');
    return getFallbackRates();
    
  } catch (error) {
    console.error('Error al obtener tipos de cambio:', error);
    return getFallbackRates();
  }
};

// Función de respaldo con datos simulados
const getFallbackRates = (): ExchangeRateData[] => {
  const usdBuyRate = 3.45 + Math.random() * 0.1;
  const usdSellRate = usdBuyRate + 0.05 + Math.random() * 0.05;
  
  const eurBuyRate = 3.80 + Math.random() * 0.1;
  const eurSellRate = eurBuyRate + 0.05 + Math.random() * 0.05;
  
  return [
    {
      currency: 'USD',
      buyRate: parseFloat(usdBuyRate.toFixed(4)),
      sellRate: parseFloat(usdSellRate.toFixed(4)),
      lastUpdated: new Date(),
      marketRate: parseFloat((usdBuyRate + 0.025).toFixed(4)),
      change: parseFloat(((Math.random() - 0.5) * 0.01).toFixed(4)),
      changePercent: parseFloat(((Math.random() - 0.5) * 0.5).toFixed(3))
    },
    {
      currency: 'EUR',
      buyRate: parseFloat(eurBuyRate.toFixed(4)),
      sellRate: parseFloat(eurSellRate.toFixed(4)),
      lastUpdated: new Date(),
      marketRate: parseFloat((eurBuyRate + 0.025).toFixed(4)),
      change: parseFloat(((Math.random() - 0.5) * 0.01).toFixed(4)),
      changePercent: parseFloat(((Math.random() - 0.5) * 0.5).toFixed(3))
    }
  ];
};

// Esta función se usaría con la API real de Bloomberg
export const fetchBloombergRates = async (): Promise<ExchangeRateData[]> => {
  try {
    // Aquí iría el código para conectar con la API de Bloomberg
    // Ejemplo:
    // const response = await fetch('https://api.bloomberg.com/exchange-rates', {
    //   headers: {
    //     'Authorization': 'Bearer YOUR_API_KEY',
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const data = await response.json();
    
    // Procesamiento de los datos obtenidos de Bloomberg
    // return data.map(item => ({
    //   currency: item.currencyCode,
    //   buyRate: item.buyRate,
    //   sellRate: item.sellRate,
    //   lastUpdated: new Date(item.timestamp)
    // }));
    
    // Por ahora, usamos los datos simulados
    return fetchExchangeRates();
  } catch (error) {
    console.error('Error al obtener datos de Bloomberg:', error);
    // En caso de error, caemos de vuelta a los datos simulados
    return fetchExchangeRates();
  }
};
