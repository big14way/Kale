import React, { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import type { Portfolio } from './hooks/useContract';
import CONFIG from './utils/config';
import './App.css';

// Modern deposit component using the contract hook
const DepositForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
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
      const explorerUrl = `${CONFIG.TESTNET_EXPLORER}/tx/${txHash}`;
      setSuccess(`Successfully deposited ${amount} KALE! View: ${explorerUrl}`);
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  return (
    <div className="deposit-form-container">
      <h3>💰 Deposit KALE Tokens</h3>
      <form onSubmit={handleSubmit} className="deposit-form">
        <div className="input-group">
          <label htmlFor="amount">Amount (KALE)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to deposit"
            min="0"
            step="0.0000001"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="deposit-btn"
          disabled={isLoading || !amount}
        >
          {isLoading ? (
            <span><span className="spinner">⟳</span> Depositing...</span>
          ) : (
            'Deposit KALE'
          )}
        </button>
      </form>

      {error && (
        <div className="message error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <span>✅ {success}</span>
        </div>
      )}
    </div>
  );
};

// Modern portfolio component
const PortfolioDisplay: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
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

  if (isLoading) {
    return (
      <div className="portfolio">
        <h3>📊 Your Portfolio</h3>
        <div className="portfolio-loading">
          <div className="spinner">⟳</div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio || portfolio.kale_balance === 0) {
    return (
      <div className="portfolio">
        <h3>📊 Your Portfolio</h3>
        <div className="portfolio-summary">
          <div className="total-value">
            <h4>Live Market Prices</h4>
            <p>📈 KALE Price: ${prices.KALE_USD.toFixed(4)}</p>
            <p>₿ BTC Price: ${prices.BTC_USD.toFixed(0)}</p>
            <p>💵 USDC Price: $1.00</p>
          </div>
        </div>
        <div className="portfolio-empty">
          <p>No investments yet. Make your first deposit to get started!</p>
          <button onClick={fetchData} className="retry-btn">
            🔄 Refresh Prices
          </button>
        </div>
      </div>
    );
  }

  const totalValue = (
    portfolio.kale_balance * prices.KALE_USD +
    portfolio.usdc_balance * 1.0 +
    portfolio.btc_balance * prices.BTC_USD
  );

  const getRiskProfileName = (level: number) => {
    switch (level) {
      case 1: return 'Conservative';
      case 2: return 'Moderate';
      case 3: return 'Aggressive';
      default: return 'Unknown';
    }
  };

  return (
    <div className="portfolio">
      <h3>📊 Your Portfolio</h3>
      <div className="portfolio-summary">
        <div className="total-value">
          <h4>Total Value: ${totalValue.toFixed(2)}</h4>
          <p>Risk Profile: {getRiskProfileName(portfolio.risk_level)}</p>
          <p>📈 KALE Price: ${prices.KALE_USD.toFixed(4)}</p>
          <p>₿ BTC Price: ${prices.BTC_USD.toFixed(0)}</p>
        </div>
      </div>
      <div className="asset-list">
        <div className="asset-item">
          <span className="asset-name">🌿 KALE</span>
          <span className="asset-balance">{portfolio.kale_balance.toFixed(4)}</span>
          <span className="asset-value">${(portfolio.kale_balance * prices.KALE_USD).toFixed(2)}</span>
        </div>
        <div className="asset-item">
          <span className="asset-name">💵 USDC</span>
          <span className="asset-balance">{portfolio.usdc_balance.toFixed(4)}</span>
          <span className="asset-value">${portfolio.usdc_balance.toFixed(2)}</span>
        </div>
        <div className="asset-item">
          <span className="asset-name">₿ BTC</span>
          <span className="asset-balance">{portfolio.btc_balance.toFixed(8)}</span>
          <span className="asset-value">${(portfolio.btc_balance * prices.BTC_USD).toFixed(2)}</span>
        </div>
      </div>
      <button onClick={fetchData} className="retry-btn">
        🔄 Refresh Portfolio
      </button>
    </div>
  );
};

// Modern wallet connection component
const WalletConnection: React.FC = () => {
  const { isConnected, address, connect, disconnect, isLoading, error } = useWallet();

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🔗</span>
          <span className="wallet-address">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
          <button className="disconnect-btn" onClick={disconnect}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button 
        className="connect-btn"
        onClick={connect}
        disabled={isLoading}
      >
        {isLoading ? (
          <span><span className="spinner">⟳</span> Connecting...</span>
        ) : (
          <span><span className="wallet-icon">👛</span> Connect Wallet</span>
        )}
      </button>
      
      {error && (
        <div className="message error-message">
          <span>❌ {error}</span>
        </div>
      )}
    </div>
  );
};

// Risk profile manager component
const RiskProfileManager: React.FC<{ currentRiskLevel: number | null; onSuccess: () => void }> = ({ 
  currentRiskLevel, 
  onSuccess 
}) => {
  const [selectedRisk, setSelectedRisk] = useState<1 | 2 | 3>(currentRiskLevel as 1 | 2 | 3 || 1);
  const [success, setSuccess] = useState<string | null>(null);
  const { setRiskLevel, isLoading, error } = useContract();

  const handleRiskUpdate = async () => {
    if (selectedRisk === currentRiskLevel) return;

    try {
      setSuccess(null);
      const txHash = await setRiskLevel(selectedRisk);
      const explorerUrl = `${CONFIG.TESTNET_EXPLORER}/tx/${txHash}`;
      setSuccess(`Risk profile updated! View: ${explorerUrl}`);
      onSuccess();
    } catch (error) {
      console.error('Risk profile update failed:', error);
    }
  };

  return (
    <div className="risk-profile-manager">
      <h3>⚖️ Risk Profile Management</h3>
      <p>Current: {currentRiskLevel ? (currentRiskLevel === 1 ? 'Conservative' : currentRiskLevel === 2 ? 'Moderate' : 'Aggressive') : 'None'}</p>
      
      <div className="risk-options">
        <label>
          <input
            type="radio"
            value={1}
            checked={selectedRisk === 1}
            onChange={(e) => setSelectedRisk(Number(e.target.value) as 1)}
            disabled={isLoading}
          />
          Conservative (70% USDC, 20% BTC, 10% KALE)
        </label>
        <label>
          <input
            type="radio"
            value={2}
            checked={selectedRisk === 2}
            onChange={(e) => setSelectedRisk(Number(e.target.value) as 2)}
            disabled={isLoading}
          />
          Moderate (50% USDC, 30% BTC, 20% KALE)
        </label>
        <label>
          <input
            type="radio"
            value={3}
            checked={selectedRisk === 3}
            onChange={(e) => setSelectedRisk(Number(e.target.value) as 3)}
            disabled={isLoading}
          />
          Aggressive (30% USDC, 40% BTC, 30% KALE)
        </label>
      </div>

      <button
        onClick={handleRiskUpdate}
        disabled={isLoading || selectedRisk === currentRiskLevel}
        className="risk-update-btn"
      >
        {isLoading ? 'Updating...' : 'Update Risk Profile'}
      </button>

      {error && <div className="message error-message"><span>❌ {error}</span></div>}
      {success && <div className="message success-message"><span>✅ {success}</span></div>}
    </div>
  );
};

// Portfolio actions component
const PortfolioActions: React.FC<{ hasPortfolio: boolean; onSuccess: () => void }> = ({ 
  hasPortfolio, 
  onSuccess 
}) => {
  const [success, setSuccess] = useState<string | null>(null);
  const { rebalance, withdraw, isLoading, error } = useContract();

  const handleRebalance = async () => {
    try {
      setSuccess(null);
      const txHash = await rebalance();
      const explorerUrl = `${CONFIG.TESTNET_EXPLORER}/tx/${txHash}`;
      setSuccess(`Portfolio rebalanced! View: ${explorerUrl}`);
      onSuccess();
    } catch (error) {
      console.error('Rebalance failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      setSuccess(null);
      const txHash = await withdraw();
      const explorerUrl = `${CONFIG.TESTNET_EXPLORER}/tx/${txHash}`;
      setSuccess(`Withdrawal successful! View: ${explorerUrl}`);
      onSuccess();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  if (!hasPortfolio) {
    return (
      <div className="portfolio-actions">
        <h3>🔧 Portfolio Actions</h3>
        <p>Make your first deposit to access portfolio management features.</p>
      </div>
    );
  }

  return (
    <div className="portfolio-actions">
      <h3>🔧 Portfolio Actions</h3>
      
      <div className="action-section">
        <h4>🔄 Rebalance Portfolio</h4>
        <p>Rebalance your portfolio according to your risk profile based on current market prices.</p>
        <button
          onClick={handleRebalance}
          disabled={isLoading}
          className="rebalance-btn"
        >
          {isLoading ? 'Rebalancing...' : '🔄 Rebalance Now'}
        </button>
      </div>

      <div className="action-section">
        <h4>💳 Withdraw All Funds</h4>
        <p>Withdraw all funds from your portfolio back to your wallet.</p>
        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="withdraw-btn"
        >
          {isLoading ? 'Processing...' : '💳 Withdraw All'}
        </button>
      </div>

      {error && <div className="message error-message"><span>❌ {error}</span></div>}
      {success && <div className="message success-message"><span>✅ {success}</span></div>}
    </div>
  );
};

// Main modernized App component
const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const { isConnected, address } = useWallet();
  const { getPortfolio } = useContract();

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch portfolio data when wallet connects or refresh is triggered
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

  const hasPortfolio = portfolio && portfolio.kale_balance > 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 KALE Pension Fund</h1>
        <p>Decentralized pension fund investing for your KALE mining rewards</p>
        <div className="header-info">
          <p>🔗 Contract: <a href={CONFIG.CONTRACT_EXPLORER} target="_blank" rel="noopener noreferrer">
            {CONFIG.CONTRACT_ADDRESS.slice(0, 8)}...{CONFIG.CONTRACT_ADDRESS.slice(-8)}
          </a></p>
        </div>
        <WalletConnection />
      </header>

      <main className="app-main">
        {isConnected ? (
          <div className="dashboard">
            <div className="dashboard-grid">
              <section className="portfolio-section full-width">
                <PortfolioDisplay key={refreshTrigger} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
              </section>

              <section className="deposit-section">
                <DepositForm onSuccess={handleSuccess} />
              </section>

              <section className="risk-section">
                <RiskProfileManager 
                  currentRiskLevel={portfolio?.risk_level || null}
                  onSuccess={handleSuccess}
                />
              </section>

              <section className="actions-section">
                <PortfolioActions
                  hasPortfolio={Boolean(hasPortfolio)}
                  onSuccess={handleSuccess}
                />
              </section>
            </div>
          </div>
        ) : (
          <div className="welcome-section">
            <div className="welcome-content">
              <h2>Welcome to KALE Pension Fund</h2>
              <div className="features">
                <div className="feature">
                  <h3>🎯 Risk-Based Investing</h3>
                  <p>Choose from Conservative, Moderate, or Aggressive investment strategies</p>
                </div>
                <div className="feature">
                  <h3>🔄 Auto-Rebalancing</h3>
                  <p>Automatic portfolio rebalancing with oracle price feeds</p>
                </div>
                <div className="feature">
                  <h3>🏦 Diversified Portfolio</h3>
                  <p>Invest across KALE, USDC, and BTC based on your risk tolerance</p>
                </div>
                <div className="feature">
                  <h3>⚡ Stellar-Powered</h3>
                  <p>Built on Stellar blockchain with Soroban smart contracts</p>
                </div>
              </div>
              <p className="connect-prompt">Connect your wallet to get started</p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About KALE Pension Fund</h4>
            <p>A decentralized pension fund that automatically invests your KALE mining rewards across multiple assets based on your risk profile.</p>
          </div>
          <div className="footer-section">
            <h4>Powered By</h4>
            <ul>
              <li>Stellar Blockchain</li>
              <li>Soroban Smart Contracts</li>
              <li>Reflector Oracle (SEP-40)</li>
              <li>TypeScript Bindings</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024-2025 KALE Pension Fund. Built on Stellar Testnet.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;