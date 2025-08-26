import React, { useState } from 'react';
import { stellarUtils } from './utils/stellar-real';
import './App.css';

// Real deposit form component
const DepositForm: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert amount to contract format (7 decimals)
      const amountInStroops = stellarUtils.parseAmount(amount);
      
      // Submit real deposit transaction to smart contract
      console.log(`Depositing ${amount} KALE (${amountInStroops} stroops) from ${walletAddress}`);
      const result = await stellarUtils.deposit(walletAddress, amountInStroops);
      
      if (result.status === 'SUCCESS') {
        setSuccess(`Successfully deposited ${amount} KALE tokens! Tx: ${result.hash}`);
        setAmount('');
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to deposit tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="deposit-btn"
          disabled={loading || !amount}
        >
          {loading ? (
            <span>
              <span className="spinner">⟳</span> Depositing...
            </span>
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

      <div className="deposit-info">
        <h4>About Deposits</h4>
        <ul>
          <li>Deposit your mined KALE tokens to start investing</li>
          <li>Tokens will be allocated based on your risk profile</li>
          <li>You can deposit additional tokens anytime</li>
          <li>All deposits are secured by the smart contract</li>
        </ul>
      </div>
    </>
  );
};

// Real wallet connection component
const WalletConnect: React.FC<{ onConnect: (address: string) => void; connectedWallet: string | null }> = ({ onConnect, connectedWallet }) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Check if Freighter is available
      if (!await stellarUtils.checkFreighter()) {
        throw new Error('Freighter wallet not found. Please install Freighter extension.');
      }

      // Connect to real Freighter wallet
      const publicKey = await stellarUtils.connectWallet();
      console.log('Connected to Freighter:', publicKey);
      onConnect(publicKey);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  if (connectedWallet) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🔗</span>
          <span className="wallet-address">
            {connectedWallet.slice(0, 4)}...{connectedWallet.slice(-4)}
          </span>
          <button 
            className="disconnect-btn"
            onClick={() => onConnect('')}
          >
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
        onClick={handleConnect}
        disabled={connecting}
      >
        {connecting ? (
          <span>
            <span className="spinner">⟳</span> Connecting...
          </span>
        ) : (
          <span>
            <span className="wallet-icon">👛</span> Connect Freighter
          </span>
        )}
      </button>
      
      {error && (
        <div className="message error-message" style={{ marginTop: '10px' }}>
          <span>❌ {error}</span>
        </div>
      )}
      
      {!(window as any).freighter && (
        <div className="install-freighter" style={{ marginTop: '10px', textAlign: 'center' }}>
          <p>Freighter wallet not detected.</p>
          <a 
            href="https://www.freighter.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-link"
          >
            Install Freighter Wallet
          </a>
        </div>
      )}
    </div>
  );
};

// Real portfolio component
const Portfolio: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [prices, setPrices] = useState<any>({});

  React.useEffect(() => {
    fetchData();
  }, [walletAddress]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch portfolio and prices concurrently
      const [portfolioData, kalePrice, btcPrice] = await Promise.all([
        stellarUtils.getPortfolio(walletAddress),
        stellarUtils.getPrice('KALE_USD'),
        stellarUtils.getPrice('BTC_USD')
      ]);

      setPortfolio(portfolioData);
      setPrices({
        KALE_USD: kalePrice,
        BTC_USD: btcPrice,
        USDC_USD: 1000000000 // 1 USDC = 1 USD (7 decimals)
      });
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="portfolio-empty">
          <p>No investments yet. Make your first deposit to get started!</p>
        </div>
      </div>
    );
  }

  const formatBalance = (balance: number, decimals: number = 7) => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(4);
  };

  const calculateValue = (balance: number, price: number, decimals: number = 7) => {
    return ((balance * price) / Math.pow(10, decimals * 2)).toFixed(2);
  };

  const totalValue = (
    (portfolio.kale_balance * prices.KALE_USD) / 1e14 +
    (portfolio.usdc_balance * prices.USDC_USD) / 1e14 +
    (portfolio.btc_balance * prices.BTC_USD) / 1e14
  );

  return (
    <div className="portfolio">
      <h3>📊 Your Portfolio</h3>
      <div className="portfolio-summary">
        <div className="total-value">
          <h4>Total Value: ${totalValue.toFixed(2)}</h4>
          <p>Risk Profile: {portfolio.risk_level === 1 ? 'Conservative' : portfolio.risk_level === 2 ? 'Moderate' : 'Aggressive'}</p>
        </div>
      </div>
      <div className="asset-list">
        <div className="asset-item">
          <span className="asset-name">🌿 KALE</span>
          <span className="asset-balance">{formatBalance(portfolio.kale_balance)}</span>
          <span className="asset-value">${calculateValue(portfolio.kale_balance, prices.KALE_USD)}</span>
        </div>
        <div className="asset-item">
          <span className="asset-name">💵 USDC</span>
          <span className="asset-balance">{formatBalance(portfolio.usdc_balance)}</span>
          <span className="asset-value">${calculateValue(portfolio.usdc_balance, prices.USDC_USD)}</span>
        </div>
        <div className="asset-item">
          <span className="asset-name">₿ BTC</span>
          <span className="asset-balance">{formatBalance(portfolio.btc_balance, 8)}</span>
          <span className="asset-value">${calculateValue(portfolio.btc_balance, prices.BTC_USD, 8)}</span>
        </div>
      </div>
      <button onClick={fetchData} className="retry-btn" style={{ marginTop: '10px' }}>
        Refresh Portfolio
      </button>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address || null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 KALE Pension Fund</h1>
        <p>Decentralized pension fund investing for your KALE mining rewards</p>
        <WalletConnect
          onConnect={handleWalletConnect}
          connectedWallet={walletAddress}
        />
      </header>

      <main className="app-main">
        {walletAddress ? (
          <div className="dashboard">
            <div className="dashboard-grid">
              <section className="portfolio-section">
                <Portfolio walletAddress={walletAddress} />
              </section>

              <section className="deposit-section">
                <div className="deposit-section">
                  <h3>💰 Deposit KALE Tokens</h3>
                  <DepositForm walletAddress={walletAddress!} />
                </div>
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
                  <p>Automatic portfolio rebalancing when KALE price moves &gt;10% from 7-day average</p>
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
              <p className="connect-prompt">Connect your Freighter wallet to get started</p>
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
              <li>Reflector Oracle</li>
              <li>Soroswap DEX</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 KALE Pension Fund. Built on Stellar.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;