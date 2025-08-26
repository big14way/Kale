import { useState, useCallback, useEffect } from 'react';
import { 
  StellarWalletsKit, 
  WalletNetwork,
  ISupportedWallet 
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter.module';

// Modern wallet state management hook (2024/2025 best practices)
interface WalletState {
  isConnected: boolean;
  address: string | null;
  wallet: ISupportedWallet | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export const useWallet = (): WalletState & WalletActions => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    wallet: null,
    isLoading: false,
    error: null,
  });

  // Initialize wallet kit with error handling
  const [walletKit, setWalletKit] = useState<StellarWalletsKit | null>(null);

  useEffect(() => {
    const initWallet = async () => {
      try {
        const kit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          modules: [new FreighterModule()], // Explicitly include Freighter module
        });
        setWalletKit(kit);
      } catch (error) {
        console.error('Failed to initialize wallet kit:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to initialize wallet system' 
        }));
      }
    };

    initWallet();
  }, []);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const storedWallet = localStorage.getItem('stellar-wallet');
        if (storedWallet) {
          const walletData = JSON.parse(storedWallet);
          setState(prev => ({
            ...prev,
            isConnected: true,
            address: walletData.address,
            wallet: walletData.wallet,
          }));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    if (!walletKit) {
      setState(prev => ({ ...prev, error: 'Wallet system not initialized' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get supported wallets and select the first available one (typically Freighter)
      const supportedWallets = await walletKit.getSupportedWallets();
      const availableWallet = supportedWallets.find(w => w.isAvailable);
      
      if (!availableWallet) {
        throw new Error('No compatible wallets found. Please install Freighter.');
      }

      // Set the wallet
      walletKit.setWallet(availableWallet.id);

      // Get wallet address
      const { address } = await walletKit.getAddress();
      
      // Store wallet info for persistence
      const walletData = { address, wallet: availableWallet };
      localStorage.setItem('stellar-wallet', JSON.stringify(walletData));

      setState({
        isConnected: true,
        address,
        wallet: availableWallet,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  }, [walletKit]);

  const disconnect = useCallback(() => {
    localStorage.removeItem('stellar-wallet');
    setState({
      isConnected: false,
      address: null,
      wallet: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!walletKit) {
      throw new Error('Wallet system not initialized');
    }
    
    if (!state.isConnected || !state.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const { signedTxXdr } = await walletKit.signTransaction(xdr, {
        address: state.address,
        networkPassphrase: 'Test SDF Network ; September 2015',
      });

      return signedTxXdr;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to sign transaction'
      );
    }
  }, [state.isConnected, state.address, walletKit]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
  };
};