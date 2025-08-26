import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import Portfolio from './components/Portfolio';
import Deposit from './components/Deposit';
import RiskProfile from './components/RiskProfile';
import Actions from './components/Actions';
import { stellarUtils, Portfolio as PortfolioType } from './utils/stellar-simple';
import './App.css';

// Simple debug function to test if React is rendering
console.log('App.tsx loaded successfully');

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleWalletConnect = (address: string | null): void => {
    setWalletAddress(address);
    if (address) {
      fetchUserData(address);
    } else {
      setPortfolio(null);
    }
  };

  const fetchUserData = async (address: string): Promise<void> => {
    setLoading(true);
    try {
      const portfolioData = await stellarUtils.getPortfolio(address);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (): void => {
    // Refresh data after successful transactions
    setRefreshTrigger(prev => prev + 1);
    if (walletAddress) {
      fetchUserData(walletAddress);
    }
  };

  const hasPortfolio = portfolio && portfolio.kale_balance > 0;

  console.log('App rendering, walletAddress:', walletAddress);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 KALE Pension Fund</h1>
        <p>Decentralized pension fund investing for your KALE mining rewards</p>
        <WalletConnect
          onWalletConnect={handleWalletConnect}
          connectedWallet={walletAddress}
          setConnectedWallet={setWalletAddress}
        />
      </header>

      <main className="app-main">
        {walletAddress ? (
          <>
            {loading ? (
              <div className="loading-section">
                <div className="spinner">⟳</div>
                <p>Loading your portfolio...</p>
              </div>
            ) : (
              <div className="dashboard">
                <div className="dashboard-grid">
                  <section className="portfolio-section">
                    <Portfolio
                      walletAddress={walletAddress}
                      refreshTrigger={refreshTrigger}
                    />
                  </section>

                  <section className="deposit-section">
                    <Deposit
                      walletAddress={walletAddress}
                      onSuccess={handleSuccess}
                    />
                  </section>

                  <section className="risk-section">
                    <RiskProfile
                      walletAddress={walletAddress}
                      currentRiskLevel={portfolio?.risk_level || null}
                      onSuccess={handleSuccess}
                    />
                  </section>

                  <section className="actions-section">
                    <Actions
                      walletAddress={walletAddress}
                      hasPortfolio={Boolean(hasPortfolio)}
                      onSuccess={handleSuccess}
                    />
                  </section>
                </div>
              </div>
            )}
          </>
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
          <div className="footer-section">
            <h4>Security</h4>
            <p>All funds are secured by smart contracts on the Stellar network. Your private keys never leave your wallet.</p>
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