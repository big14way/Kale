// Real price fetching service using external APIs
// This provides backup price data when the Reflector oracle isn't available

interface PriceData {
  [key: string]: number;
}

export class RealPriceService {
  private static cache: { [key: string]: { price: number; timestamp: number } } = {};
  private static readonly CACHE_DURATION = 60000; // 1 minute

  // Fetch real BTC price from CoinGecko API
  static async getBTCPrice(): Promise<number> {
    try {
      const cacheKey = 'BTC_USD';
      const now = Date.now();
      
      // Check cache first
      if (this.cache[cacheKey] && (now - this.cache[cacheKey].timestamp) < this.CACHE_DURATION) {
        return this.cache[cacheKey].price;
      }

      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      
      const price = data.bitcoin?.usd || 111235; // Fallback to current market price ~$111,235
      
      // Cache the result
      this.cache[cacheKey] = { price, timestamp: now };
      
      console.log('💰 Real BTC price fetched:', price);
      return price;
    } catch (error) {
      console.warn('⚠️ Failed to fetch real BTC price, using fallback:', error);
      return 111235; // Fallback to current market price
    }
  }

  // Fetch real KALE price (mock for now, can be replaced with real source)
  static async getKALEPrice(): Promise<number> {
    try {
      const cacheKey = 'KALE_USD';
      const now = Date.now();
      
      // Check cache first
      if (this.cache[cacheKey] && (now - this.cache[cacheKey].timestamp) < this.CACHE_DURATION) {
        return this.cache[cacheKey].price;
      }

      // For now, use a mock price with slight variation to simulate real updates
      const basePrice = 0.12;
      const variation = (Math.random() - 0.5) * 0.01; // ±0.5% variation
      const price = Math.max(0.08, Math.min(0.20, basePrice + variation));
      
      // Cache the result
      this.cache[cacheKey] = { price, timestamp: now };
      
      console.log('💰 KALE price (simulated):', price);
      return price;
    } catch (error) {
      console.warn('⚠️ Failed to generate KALE price, using fallback:', error);
      return 0.12; // Fallback price
    }
  }

  // Get USDC price (always $1.00 for stablecoins)
  static async getUSDCPrice(): Promise<number> {
    return 1.0;
  }

  // Main price fetching method
  static async getPrice(pair: string): Promise<number> {
    switch (pair.toUpperCase()) {
      case 'BTC_USD':
      case 'BTC_USDC':
        return await this.getBTCPrice();
      
      case 'KALE_USD':
      case 'KALE_USDC':
        return await this.getKALEPrice();
      
      case 'USDC_USD':
        return await this.getUSDCPrice();
      
      default:
        console.warn(`⚠️ Unsupported price pair: ${pair}`);
        return 1.0; // Default fallback
    }
  }

  // Convert price to contract format (7 decimal places)
  static toContractFormat(price: number): number {
    return Math.floor(price * 10_000_000);
  }

  // Convert price from contract format
  static fromContractFormat(contractPrice: number): number {
    return contractPrice / 10_000_000;
  }
}