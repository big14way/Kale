import React, { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import type { Portfolio } from './hooks/useContract';
import CONFIG from './utils/config';

// Ultra-modern gradient button component
const GradientButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}> = ({ children, onClick, disabled, variant = 'primary', size = 'md', loading }) => {
  const variants = {
    primary: 'from-purple-600 via-purple-700 to-blue-800',
    secondary: 'from-gray-500 via-gray-600 to-gray-700', 
    danger: 'from-red-500 via-red-600 to-red-700',
    success: 'from-green-500 via-green-600 to-green-700'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden bg-gradient-to-r ${variants[variant]}
        ${sizes[size]} text-white font-semibold rounded-xl
        transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-4 focus:ring-purple-300
        group
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                      transition-transform duration-700"></div>
      <div className="relative flex items-center justify-center space-x-2">
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
        <span>{children}</span>
      </div>
    </button>
  );
};

// Glass morphism card component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`
      bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20
      shadow-xl hover:shadow-2xl transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};

// Modern stats card
const StatsCard: React.FC<{
  title: string;
  value: string;
  change?: string;
  icon: string;
  color: string;
}> = ({ title, value, change, icon, color }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {change && (
            <p className="text-green-400 text-sm mt-1">↗ {change}</p>
          )}
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </GlassCard>
  );
};

// Enhanced portfolio display
const ModernPortfolioDisplay: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [prices, setPrices] = useState<{ KALE_USD: number; BTC_USD: number }>({ KALE_USD: 0, BTC_USD: 0 });
  const { getPortfolio, getPrice, isLoading } = useContract();
  const { address } = useWallet();

  const fetchData = async () => {
    if (!address) return;
    
    try {
      const [portfolioData, kalePrice, btcPrice] = await Promise.all([
        getPortfolio(address),
        getPrice('KALE_USD'),
        getPrice('BTC_USD'),
      ]);

      setPortfolio(portfolioData);
      setPrices({ KALE_USD: kalePrice, BTC_USD: btcPrice });
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address, onRefresh]);

  const totalValue = portfolio ? (
    portfolio.kale_balance * prices.KALE_USD +
    portfolio.usdc_balance * 1.0 +
    portfolio.btc_balance * prices.BTC_USD
  ) : 0;

  const getRiskProfile = (level: number) => {
    switch (level) {
      case 1: return { name: 'Conservative', color: 'text-blue-400', emoji: '🛡️' };
      case 2: return { name: 'Moderate', color: 'text-yellow-400', emoji: '⚖️' };
      case 3: return { name: 'Aggressive', color: 'text-red-400', emoji: '🚀' };
      default: return { name: 'Unknown', color: 'text-gray-400', emoji: '❓' };
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-8 animate-pulse">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white"></div>
          <p className="text-white text-lg">Loading portfolio...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>📊</span>
            <span>Portfolio Overview</span>
          </h2>
          <GradientButton 
            onClick={fetchData} 
            size="sm" 
            variant="secondary"
            loading={isLoading}
          >
            🔄 Refresh
          </GradientButton>
        </div>

        {portfolio && portfolio.kale_balance > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Total Portfolio Value"
              value={`$${totalValue.toFixed(2)}`}
              icon="💰"
              color="text-green-400"
            />
            <StatsCard
              title="Risk Profile"
              value={getRiskProfile(portfolio.risk_level).name}
              icon={getRiskProfile(portfolio.risk_level).emoji}
              color={getRiskProfile(portfolio.risk_level).color}
            />
            <StatsCard
              title="Assets"
              value="3 Tokens"
              icon="🏦"
              color="text-blue-400"
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Portfolio Yet</h3>
            <p className="text-white/70">Make your first deposit to start growing your pension fund</p>
          </div>
        )}

        {/* Asset Breakdown */}
        {portfolio && portfolio.kale_balance > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4">Asset Breakdown</h3>
            
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  🌿
                </div>
                <div>
                  <p className="text-white font-medium">KALE Token</p>
                  <p className="text-white/60 text-sm">{portfolio.kale_balance.toFixed(4)} KALE</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${(portfolio.kale_balance * prices.KALE_USD).toFixed(2)}</p>
                <p className="text-green-400 text-sm">${prices.KALE_USD.toFixed(4)}/KALE</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  💵
                </div>
                <div>
                  <p className="text-white font-medium">USD Coin</p>
                  <p className="text-white/60 text-sm">{portfolio.usdc_balance.toFixed(4)} USDC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${portfolio.usdc_balance.toFixed(2)}</p>
                <p className="text-blue-400 text-sm">$1.00/USDC</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  ₿
                </div>
                <div>
                  <p className="text-white font-medium">Bitcoin</p>
                  <p className="text-white/60 text-sm">{portfolio.btc_balance.toFixed(8)} BTC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${(portfolio.btc_balance * prices.BTC_USD).toFixed(2)}</p>
                <p className="text-orange-400 text-sm">${prices.BTC_USD.toFixed(0)}/BTC</p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Live Market Data */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <span>📈</span>
          <span>Live Market Data</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🌿</div>
            <p className="text-white/70 text-sm">KALE Price</p>
            <p className="text-green-400 font-bold text-lg">${prices.KALE_USD.toFixed(4)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">₿</div>
            <p className="text-white/70 text-sm">BTC Price</p>
            <p className="text-orange-400 font-bold text-lg">${prices.BTC_USD.toFixed(0)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💵</div>
            <p className="text-white/70 text-sm">USDC Price</p>
            <p className="text-blue-400 font-bold text-lg">$1.00</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// Enhanced deposit form
const ModernDepositForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const { deposit, isLoading, error } = useContract();
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    try {
      setSuccess(null);
      const txHash = await deposit(Number(amount));
      setSuccess('Deposit successful! Your KALE tokens have been added to your pension fund.');
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
        <span>💰</span>
        <span>Deposit KALE</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Amount (KALE Tokens)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.0000001"
              disabled={isLoading}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                       placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400
                       focus:border-transparent transition-all duration-200"
            />
            <div className="absolute right-3 top-3 text-white/60 font-medium">
              KALE
            </div>
          </div>
        </div>
        
        <GradientButton
          onClick={handleSubmit}
          disabled={isLoading || !amount}
          loading={isLoading}
          size="lg"
          variant="success"
        >
          {isLoading ? 'Processing Deposit...' : 'Deposit KALE Tokens'}
        </GradientButton>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-200 text-sm">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
          <p className="text-green-200 text-sm">✅ {success}</p>
        </div>
      )}
    </GlassCard>
  );
};

// Enhanced wallet connection
const ModernWalletConnection: React.FC = () => {
  const { isConnected, address, connect, disconnect, isLoading, error } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </div>
        <GradientButton onClick={disconnect} size="sm" variant="secondary">
          Disconnect
        </GradientButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GradientButton 
        onClick={connect} 
        loading={isLoading}
        size="lg"
        variant="primary"
      >
        {isLoading ? 'Connecting...' : '🔗 Connect Wallet'}
      </GradientButton>
      
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-200 text-sm text-center">❌ {error}</p>
        </div>
      )}
    </div>
  );
};

// Ultra-modern main app
const UltraModernApp: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const { isConnected, address } = useWallet();
  const { getPortfolio } = useContract();

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (isConnected && address) {
      const fetchPortfolio = async () => {
        try {
          const portfolioData = await getPortfolio(address);
          setPortfolio(portfolioData);
        } catch (error) {
          console.error('Failed to fetch portfolio:', error);
        }
      };
      fetchPortfolio();
    }
  }, [address, isConnected, refreshTrigger, getPortfolio]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              🌿 <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                KALE Pension Fund
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Decentralized pension investing powered by Stellar blockchain
            </p>
            <div className="flex items-center justify-center space-x-2 text-white/60 text-sm mb-6">
              <span>🏦 Contract:</span>
              <a 
                href={CONFIG.CONTRACT_EXPLORER} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-300 transition-colors duration-200"
              >
                {CONFIG.CONTRACT_ADDRESS.slice(0, 8)}...{CONFIG.CONTRACT_ADDRESS.slice(-8)}
              </a>
            </div>
            <ModernWalletConnection />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {isConnected ? (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <GlassCard className="p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to Your Pension Dashboard
                </h2>
                <p className="text-white/80">
                  Connected as: <span className="font-mono bg-white/10 px-2 py-1 rounded">
                    {address?.slice(0, 8)}...{address?.slice(-8)}
                  </span>
                </p>
              </GlassCard>

              {/* Main Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ModernPortfolioDisplay key={refreshTrigger} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
                </div>
                <div>
                  <ModernDepositForm onSuccess={handleSuccess} />
                </div>
              </div>
            </div>
          ) : (
            /* Welcome Screen */
            <div className="text-center space-y-12">
              <GlassCard className="p-12 max-w-4xl mx-auto">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Welcome to the Future of Pension Investing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                  <div className="text-center">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Risk-Based</h3>
                    <p className="text-white/70 text-sm">Choose your investment strategy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🔄</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Auto-Rebalancing</h3>
                    <p className="text-white/70 text-sm">Smart portfolio optimization</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🏦</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Diversified</h3>
                    <p className="text-white/70 text-sm">Multi-asset allocation</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Stellar-Powered</h3>
                    <p className="text-white/70 text-sm">Fast & secure blockchain</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UltraModernApp;