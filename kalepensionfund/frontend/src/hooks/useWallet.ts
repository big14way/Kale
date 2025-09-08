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
  ensureConnection: () => Promise<void>;
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

  // Check if wallet is already connected on mount and properly restore wallet kit state
  useEffect(() => {
    const checkConnection = async () => {
      if (!walletKit) return; // Wait for wallet kit to be initialized

      try {
        const storedWallet = localStorage.getItem('stellar-wallet');
        if (storedWallet) {
          const walletData = JSON.parse(storedWallet);

          // IMPORTANT: Re-set the wallet in the wallet kit
          try {
            walletKit.setWallet(walletData.wallet.id);
            console.log('🔄 Restored wallet connection:', walletData.wallet.id);
          } catch (error) {
            console.warn('⚠️ Failed to restore wallet in kit, clearing stored data:', error);
            localStorage.removeItem('stellar-wallet');
            return;
          }

          setState(prev => ({
            ...prev,
            isConnected: true,
            address: walletData.address,
            wallet: walletData.wallet,
          }));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        // Clear corrupted data
        localStorage.removeItem('stellar-wallet');
      }
    };

    checkConnection();
  }, [walletKit]); // Depend on walletKit being initialized

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

  // Ensure wallet connection is properly established
  const ensureConnection = useCallback(async () => {
    if (!state.isConnected || !state.address) {
      console.log('🔄 Wallet not connected, attempting to connect...');
      await connect();
      return;
    }

    // If we have a connection but wallet kit isn't set up properly, fix it
    if (walletKit && state.wallet) {
      try {
        walletKit.setWallet(state.wallet.id);
        console.log('✅ Wallet connection verified');
      } catch (error) {
        console.warn('⚠️ Wallet kit setup failed, reconnecting...', error);
        await connect();
      }
    }
  }, [state.isConnected, state.address, state.wallet, walletKit, connect]);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!state.isConnected || !state.address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Ensure wallet is set in the kit before signing
      if (walletKit && state.wallet) {
        try {
          // Make sure the wallet is properly set
          walletKit.setWallet(state.wallet.id);
          console.log('🔐 Signing with wallet kit:', state.wallet.id);

          const { signedTxXdr } = await walletKit.signTransaction(xdr, {
            address: state.address,
            networkPassphrase: 'Test SDF Network ; September 2015',
          });
          return signedTxXdr;
        } catch (walletKitError) {
          console.warn('⚠️ Wallet kit signing failed, trying direct Freighter:', walletKitError);
          // Fall through to direct Freighter
        }
      }

      // Fallback to direct Freighter integration
      console.log('🔄 Using direct Freighter integration...');
      const { WalletHelper } = await import('../utils/wallet-helper');
      return await WalletHelper.signTransaction(xdr, state.address);
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to sign transaction'
      );
    }
  }, [state.isConnected, state.address, state.wallet, walletKit]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    ensureConnection,
  };
};