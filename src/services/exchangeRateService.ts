
// Simulación de API de tipo de cambio

// Interfaz para los datos de tipo de cambio
export interface ExchangeRateData {
  currency: string;
  buyRate: number;
  sellRate: number;
  lastUpdated: Date;
}

// Función que simula la obtención de datos de una API externa
export const fetchExchangeRates = async (): Promise<ExchangeRateData[]> => {
  // Aquí es donde conectarías con la API de Bloomberg o similar
  // Por ahora, retornamos datos simulados
  
  // Simular un pequeño retraso como en una API real
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generar tipos de cambio aleatorios dentro de rangos realistas
  const usdBuyRate = 3.60 + Math.random() * 0.1; // Entre 3.60 y 3.70
  const usdSellRate = usdBuyRate + 0.05 + Math.random() * 0.05; // Margen entre 0.05 y 0.10
  
  const eurBuyRate = 3.95 + Math.random() * 0.1; // Entre 3.95 y 4.05
  const eurSellRate = eurBuyRate + 0.05 + Math.random() * 0.05; // Margen entre 0.05 y 0.10
  
  return [
    {
      currency: 'USD',
      buyRate: parseFloat(usdBuyRate.toFixed(2)),
      sellRate: parseFloat(usdSellRate.toFixed(2)),
      lastUpdated: new Date()
    },
    {
      currency: 'EUR',
      buyRate: parseFloat(eurBuyRate.toFixed(2)),
      sellRate: parseFloat(eurSellRate.toFixed(2)),
      lastUpdated: new Date()
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
