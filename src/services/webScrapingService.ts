// Servicio de Web Scraping para obtener tipos de cambio de Google Finance

export interface ScrapedExchangeRate {
  currency: string;
  currentRate: number;
  previousClose: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export const scrapeGoogleFinance = async (fromCurrency: string, toCurrency: string): Promise<ScrapedExchangeRate | null> => {
  try {
    const url = `https://www.google.com/finance/quote/${fromCurrency}-${toCurrency}`;
    
    // En un entorno real, esto requeriría un proxy o API de scraping
    // Por ahora, simularemos el scraping con datos realistas
    console.log(`Scraping ${url}...`);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Datos simulados basados en rangos realistas del tipo de cambio USD-PEN
    const baseRate = 3.48 + Math.random() * 0.02; // Entre 3.48 y 3.50
    const change = (Math.random() - 0.5) * 0.01; // Cambio de -0.005 a +0.005
    const previousClose = baseRate - change;
    const changePercent = (change / previousClose) * 100;
    
    return {
      currency: `${fromCurrency}/${toCurrency}`,
      currentRate: parseFloat(baseRate.toFixed(4)),
      previousClose: parseFloat(previousClose.toFixed(4)),
      change: parseFloat(change.toFixed(4)),
      changePercent: parseFloat(changePercent.toFixed(3)),
      lastUpdated: new Date()
    };
    
  } catch (error) {
    console.error(`Error scraping ${fromCurrency}-${toCurrency}:`, error);
    return null;
  }
};

export const scrapeMultipleCurrencies = async (): Promise<ScrapedExchangeRate[]> => {
  try {
    // Scrapeamos múltiples pares de divisas
    const currencies = [
      { from: 'USD', to: 'PEN' },
      { from: 'EUR', to: 'PEN' }
    ];
    
    const promises = currencies.map(({ from, to }) => scrapeGoogleFinance(from, to));
    const results = await Promise.all(promises);
    
    return results.filter(result => result !== null) as ScrapedExchangeRate[];
  } catch (error) {
    console.error('Error scraping multiple currencies:', error);
    return [];
  }
};

// Función para convertir datos scrapeados al formato de la aplicación
export const convertScrapedDataToExchangeRate = (scrapedData: ScrapedExchangeRate) => {
  const currencyCode = scrapedData.currency.split('/')[0];
  
  // Calculamos tasas de compra y venta con un margen típico de 0.02-0.05
  const margin = 0.03 + Math.random() * 0.02; // Entre 0.03 y 0.05
  const buyRate = scrapedData.currentRate - (margin / 2);
  const sellRate = scrapedData.currentRate + (margin / 2);
  
  return {
    currency: currencyCode,
    buyRate: parseFloat(buyRate.toFixed(4)),
    sellRate: parseFloat(sellRate.toFixed(4)),
    lastUpdated: scrapedData.lastUpdated,
    marketRate: scrapedData.currentRate,
    change: scrapedData.change,
    changePercent: scrapedData.changePercent
  };
};