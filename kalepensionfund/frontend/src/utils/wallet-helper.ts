// Simplified wallet helper for direct Freighter integration
// This provides a more direct connection to wallets for testing

export interface WalletInfo {
  address: string;
  network: string;
}

export class WalletHelper {
  // Check if Freighter is installed
  static isFreighterInstalled(): boolean {
    return typeof window !== 'undefined' && 'freighter' in window;
  }

  // Connect to Freighter wallet directly
  static async connectFreighter(): Promise<WalletInfo> {
    if (!this.isFreighterInstalled()) {
      throw new Error('Freighter wallet is not installed. Please install it from https://freighter.app/');
    }

    try {
      // Request access to the wallet
      const { address } = await (window as any).freighter.requestAccess();
      
      // Get network info
      const network = await (window as any).freighter.getNetwork();
      
      console.log('🔗 Freighter connected:', { address, network });
      
      return {
        address,
        network: network || 'testnet'
      };
    } catch (error) {
      console.error('❌ Failed to connect to Freighter:', error);
      throw new Error('Failed to connect to Freighter wallet');
    }
  }

  // Sign transaction with Freighter
  static async signTransaction(xdr: string, address: string): Promise<string> {
    if (!this.isFreighterInstalled()) {
      throw new Error('Freighter wallet is not installed');
    }

    try {
      console.log('🔐 Signing transaction with Freighter...');
      
      const result = await (window as any).freighter.signTransaction(xdr, {
        address,
        networkPassphrase: 'Test SDF Network ; September 2015'
      });
      
      console.log('✅ Transaction signed successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      throw new Error('Failed to sign transaction with Freighter');
    }
  }

  // Get current connected address (if any)
  static async getCurrentAddress(): Promise<string | null> {
    if (!this.isFreighterInstalled()) {
      return null;
    }

    try {
      const { address } = await (window as any).freighter.requestAccess();
      return address;
    } catch (error) {
      console.warn('⚠️ Could not get current address:', error);
      return null;
    }
  }

  // Check if wallet is connected
  static async isConnected(): Promise<boolean> {
    const address = await this.getCurrentAddress();
    return address !== null;
  }
}

// Type definitions for Freighter API
declare global {
  interface Window {
    freighter?: {
      requestAccess(): Promise<{ address: string }>;
      signTransaction(xdr: string, options: { address: string; networkPassphrase: string }): Promise<string>;
      getNetwork(): Promise<string>;
      isConnected(): Promise<boolean>;
    };
  }
}