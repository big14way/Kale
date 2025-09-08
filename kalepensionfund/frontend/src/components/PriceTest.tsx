import React, { useState, useEffect } from 'react';
import { RealPriceService } from '../utils/real-prices';

// Test component to verify real price fetching is working
export const PriceTest: React.FC = () => {
  const [prices, setPrices] = useState({
    BTC: 0,
    KALE: 0,
    USDC: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const [btcPrice, kalePrice, usdcPrice] = await Promise.all([
        RealPriceService.getPrice('BTC_USD'),
        RealPriceService.getPrice('KALE_USD'),
        RealPriceService.getPrice('USDC_USD')
      ]);

      setPrices({
        BTC: btcPrice,
        KALE: kalePrice,
        USDC: usdcPrice
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">🔧 Price Test (Real API)</h3>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-white text-sm transition-colors duration-200"
        >
          {loading ? '🔄' : '🔄 Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl mb-1">₿</div>
          <div className="text-white/70 text-sm">Bitcoin</div>
          <div className="text-orange-400 font-bold">
            ${prices.BTC.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-1">🌿</div>
          <div className="text-white/70 text-sm">KALE</div>
          <div className="text-green-400 font-bold">
            ${prices.KALE.toFixed(4)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-1">💵</div>
          <div className="text-white/70 text-sm">USDC</div>
          <div className="text-blue-400 font-bold">
            ${prices.USDC.toFixed(2)}
          </div>
        </div>
      </div>
      
      {lastUpdated && (
        <div className="text-center mt-3 text-white/50 text-xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};