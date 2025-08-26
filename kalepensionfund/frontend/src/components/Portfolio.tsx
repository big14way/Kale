import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { stellarUtils, Portfolio as PortfolioType } from '../utils/stellar-simple';
import CONFIG from '../utils/config';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioProps {
  walletAddress: string | null;
  refreshTrigger: number;
}

interface Prices {
  KALE_USD: number;
  BTC_USD: number;
  USDC_USD: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

const Portfolio: React.FC<PortfolioProps> = ({ walletAddress, refreshTrigger }) => {
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Prices>({
    KALE_USD: 0,
    BTC_USD: 0,
    USDC_USD: 0
  });

  useEffect(() => {
    if (walletAddress) {
      fetchPortfolio();
      fetchPrices();
    }
  }, [walletAddress, refreshTrigger]);

  const fetchPortfolio = async (): Promise<void> => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);

    try {
      const portfolioData = await stellarUtils.getPortfolio(walletAddress);
      setPortfolio(portfolioData);
    } catch (error) {
      setError('Failed to fetch portfolio');
      console.error('Portfolio fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async (): Promise<void> => {
    try {
      const [kalePrice, btcPrice] = await Promise.all([
        stellarUtils.getPrice('KALE_USD'),
        stellarUtils.getPrice('BTC_USD')
      ]);

      setPrices({
        KALE_USD: kalePrice,
        BTC_USD: btcPrice,
        USDC_USD: 1000000000 // 1 USDC = 1 USD (7 decimals)
      });
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      // Set default prices
      setPrices({
        KALE_USD: 120000000,
        BTC_USD: 45000000000000,
        USDC_USD: 1000000000
      });
    }
  };

  const calculatePortfolioValue = (): number => {
    if (!portfolio || !prices.KALE_USD) return 0;

    const kaleValue = (portfolio.kale_balance * prices.KALE_USD) / 1e14; // 7 decimals each
    const usdcValue = (portfolio.usdc_balance * prices.USDC_USD) / 1e14;
    const btcValue = (portfolio.btc_balance * prices.BTC_USD) / 1e14;

    return kaleValue + usdcValue + btcValue;
  };

  const getChartData = (): ChartData | null => {
    if (!portfolio || !prices.KALE_USD) return null;

    const kaleValue = (portfolio.kale_balance * prices.KALE_USD) / 1e14;
    const usdcValue = (portfolio.usdc_balance * prices.USDC_USD) / 1e14;
    const btcValue = (portfolio.btc_balance * prices.BTC_USD) / 1e14;

    return {
      labels: ['KALE', 'USDC', 'BTC'],
      datasets: [
        {
          data: [kaleValue, usdcValue, btcValue],
          backgroundColor: [
            '#4CAF50', // Green for KALE
            '#2196F3', // Blue for USDC
            '#FF9800', // Orange for BTC
          ],
          borderColor: [
            '#45a049',
            '#1976D2',
            '#F57C00',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getRiskProfileName = (level: number): string => {
    return CONFIG.RISK_PROFILES[level]?.name || 'Unknown';
  };

  const formatBalance = (balance: number, decimals: number = 7): string => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(4);
  };

  const formatPrice = (price: number, decimals: number = 7): string => {
    return (Number(price) / Math.pow(10, decimals)).toFixed(4);
  };

  if (!walletAddress) {
    return (
      <div className="portfolio-placeholder">
        <p>Connect your wallet to view portfolio</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="spinner">⟳</div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-error">
        <p>❌ {error}</p>
        <button onClick={fetchPortfolio} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!portfolio || portfolio.kale_balance === 0) {
    return (
      <div className="portfolio-empty">
        <h3>📊 Your Portfolio</h3>
        <p>No investments yet. Make your first deposit to get started!</p>
      </div>
    );
  }

  const chartData = getChartData();
  const totalValue = calculatePortfolioValue();

  return (
    <div className="portfolio">
      <h3>📊 Your Portfolio</h3>
      
      <div className="portfolio-summary">
        <div className="total-value">
          <h4>Total Value: ${totalValue.toFixed(2)}</h4>
          <p>Risk Profile: {getRiskProfileName(portfolio.risk_level)}</p>
        </div>
      </div>

      <div className="portfolio-content">
        <div className="portfolio-chart">
          {chartData && (
            <Doughnut 
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const percentage = ((value / totalValue) * 100).toFixed(1);
                        return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                      }
                    }
                  }
                },
              }}
            />
          )}
        </div>

        <div className="portfolio-details">
          <div className="asset-list">
            <div className="asset-item">
              <span className="asset-name">🌿 KALE</span>
              <span className="asset-balance">{formatBalance(portfolio.kale_balance)}</span>
              <span className="asset-value">${((portfolio.kale_balance * prices.KALE_USD) / 1e14).toFixed(2)}</span>
            </div>
            
            <div className="asset-item">
              <span className="asset-name">💵 USDC</span>
              <span className="asset-balance">{formatBalance(portfolio.usdc_balance)}</span>
              <span className="asset-value">${((portfolio.usdc_balance * prices.USDC_USD) / 1e14).toFixed(2)}</span>
            </div>
            
            <div className="asset-item">
              <span className="asset-name">₿ BTC</span>
              <span className="asset-balance">{formatBalance(portfolio.btc_balance, 8)}</span>
              <span className="asset-value">${((portfolio.btc_balance * prices.BTC_USD) / 1e14).toFixed(2)}</span>
            </div>
          </div>

          <div className="price-info">
            <h4>Current Prices</h4>
            <div className="price-item">
              <span>KALE/USD: ${formatPrice(prices.KALE_USD)}</span>
            </div>
            <div className="price-item">
              <span>BTC/USD: ${formatPrice(prices.BTC_USD)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;