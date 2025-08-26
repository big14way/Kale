import React, { useState, useEffect } from 'react';
import { stellarUtils } from '../utils/stellar-simple';

interface WalletConnectProps {
  onWalletConnect: (publicKey: string | null) => void;
  connectedWallet: string | null;
  setConnectedWallet: (wallet: string | null) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onWalletConnect, 
  connectedWallet, 
  setConnectedWallet 
}) => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async (): Promise<void> => {
    try {
      const isConnected = await stellarUtils.checkFreighter();
      if (isConnected) {
        const publicKey = await stellarUtils.getPublicKey();
        setConnectedWallet(publicKey);
        onWalletConnect(publicKey);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const connectWallet = async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      const publicKey = await stellarUtils.connectWallet();
      setConnectedWallet(publicKey);
      onWalletConnect(publicKey);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = (): void => {
    setConnectedWallet(null);
    onWalletConnect(null);
  };

  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connectedWallet) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🔗</span>
          <span className="wallet-address">{formatAddress(connectedWallet)}</span>
          <button 
            className="disconnect-btn"
            onClick={disconnectWallet}
            title="Disconnect Wallet"
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
        onClick={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
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
        <div className="error-message">
          <span>❌ {error}</span>
          <p>Please make sure Freighter wallet is installed and try again.</p>
        </div>
      )}
      
      {!(window as any).freighter && (
        <div className="install-freighter">
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

export default WalletConnect;