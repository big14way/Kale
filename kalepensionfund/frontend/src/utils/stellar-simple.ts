// Simple Stellar integration for KALE Pension Fund
// This is a simplified version that avoids complex SDK imports

export interface Portfolio {
  user: string;
  kale_balance: number;
  usdc_balance: number;
  btc_balance: number;
  risk_level: number;
}

export interface TransactionResult {
  status: string;
  hash?: string;
  error?: string;
}

// Simplified Stellar utilities
export class StellarUtils {
  
  // Debug function to inspect browser state
  debugBrowserState() {
    console.log('=== FREIGHTER DEBUG INFO ===');
    console.log('window.freighter:', (window as any).freighter);
    console.log('typeof window.freighter:', typeof (window as any).freighter);
    console.log('freighter in window:', 'freighter' in window);
    console.log('document.readyState:', document.readyState);
    console.log('navigator.userAgent:', navigator.userAgent);
    
    // Check for all possible Freighter-related properties
    const freighterKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('freighter') || 
      key.toLowerCase().includes('stellar')
    );
    console.log('Freighter-related keys:', freighterKeys);
    
    // Check for extension-related properties
    const extensionKeys = Object.keys(window).filter(key => 
      key.includes('extension') || 
      key.includes('chrome') ||
      key.includes('webkit')
    );
    console.log('Extension-related keys:', extensionKeys.slice(0, 10)); // Limit output
    
    // Check if we're in an iframe or special context
    console.log('window.top === window:', window.top === window);
    console.log('window.parent === window:', window.parent === window);
    
    console.log('=== END DEBUG INFO ===');
  }
  
  // Check if Freighter is available with comprehensive detection
  async checkFreighter(): Promise<boolean> {
    try {
      // Method 1: Direct window.freighter check
      if (typeof (window as any).freighter !== 'undefined') {
        console.log('Freighter found via window.freighter');
        return true;
      }

      // Method 2: Check for freighter in window object keys
      if ('freighter' in window) {
        console.log('Freighter found via window keys');
        return true;
      }

      // Method 3: Check document ready state and wait for DOM
      if (document.readyState !== 'complete') {
        console.log('Document not ready, waiting...');
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(void 0);
          } else {
            window.addEventListener('load', () => resolve(void 0));
          }
        });
      }

      // Method 4: Extended polling with longer timeout for slower systems
      console.log('Polling for Freighter extension...');
      for (let i = 0; i < 50; i++) { // Increased to 5 seconds
        // Check multiple ways
        if ((window as any).freighter || 
            'freighter' in window ||
            (window as any).FreighterApi) {
          console.log(`Freighter detected after ${i * 100}ms`);
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Method 5: Check for content script injection
      const freighterScript = document.querySelector('script[src*="freighter"]');
      if (freighterScript) {
        console.log('Freighter script detected, waiting for initialization...');
        // Give it more time to initialize
        for (let i = 0; i < 20; i++) {
          if ((window as any).freighter) {
            console.log(`Freighter initialized after script detection: ${i * 250}ms`);
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }

      console.warn('Freighter extension not found after comprehensive detection');
      console.log('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('freighter')));
      
      // Show helpful troubleshooting information
      console.log('=== TROUBLESHOOTING FREIGHTER ===');
      console.log('1. Ensure Freighter extension is installed and enabled');
      console.log('2. Check if Freighter has permission to access localhost');
      console.log('3. Try refreshing the page or restarting your browser');
      console.log('4. In Chrome: Extensions → Freighter → Details → Allow access to file URLs (if needed)');
      console.log('5. Try accessing the app via 127.0.0.1:5174 instead of localhost:5174');
      
      return false;
    } catch (error) {
      console.error('Error checking Freighter:', error);
      return false;
    }
  }

  // Connect to Freighter wallet with robust error handling
  async connectWallet(): Promise<string> {
    try {
      // Ensure Freighter is available
      const isAvailable = await this.checkFreighter();
      if (!isAvailable) {
        throw new Error('Freighter wallet extension not found. Please install and enable Freighter.');
      }

      const freighter = (window as any).freighter;
      
      // Verify Freighter API methods exist
      if (!freighter.requestAccess || !freighter.getPublicKey) {
        throw new Error('Freighter wallet API not properly loaded. Please refresh the page.');
      }

      console.log('Requesting wallet access...');
      const accessGranted = await freighter.requestAccess();
      
      if (!accessGranted) {
        throw new Error('Wallet access denied by user. Please approve the connection request.');
      }

      console.log('Getting public key...');
      const publicKey = await freighter.getPublicKey();
      
      if (!publicKey) {
        throw new Error('Failed to get public key from wallet. Please try again.');
      }

      console.log('Successfully connected to wallet:', publicKey);
      return publicKey;
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('User declined')) {
          throw new Error('Connection cancelled by user. Please try again and approve the request.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Connection timed out. Please try again.');
        }
        throw error;
      }
      
      throw new Error('Unknown error connecting to wallet. Please try again.');
    }
  }

  // Simulate deposit for now (will be replaced with real contract calls)
  async deposit(publicKey: string, amount: number): Promise<TransactionResult> {
    try {
      console.log(`Simulating deposit: ${amount} from ${publicKey}`);
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        status: 'SUCCESS',
        hash: 'simulation_' + Math.random().toString(36).substring(7)
      };
    } catch (error) {
      console.error('Deposit failed:', error);
      return {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Deposit failed'
      };
    }
  }

  // Simulate portfolio fetch
  async getPortfolio(publicKey: string): Promise<Portfolio | null> {
    try {
      console.log(`Fetching portfolio for ${publicKey}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock portfolio data
      return {
        user: publicKey,
        kale_balance: 1000000000000, // 100 KALE (7 decimals)
        usdc_balance: 5000000000000, // 500 USDC (7 decimals) 
        btc_balance: 163000000, // 0.0163 BTC (8 decimals)
        risk_level: 2
      };
    } catch (error) {
      console.error('Failed to get portfolio:', error);
      return null;
    }
  }

  // Simulate price fetch
  async getPrice(pair: string): Promise<number> {
    try {
      console.log(`Fetching price for ${pair}`);
      
      const mockPrices: Record<string, number> = {
        'KALE_USD': 120000000, // $0.12 (7 decimals)
        'BTC_USD': 45000000000000 // $45,000 (7 decimals)
      };
      
      return mockPrices[pair] || 0;
    } catch (error) {
      console.error('Failed to get price:', error);
      return 0;
    }
  }

  // Format amount with proper decimals
  formatAmount(amount: number, decimals: number = 7): string {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(4);
  }

  // Parse amount to contract format
  parseAmount(amount: string | number, decimals: number = 7): number {
    return Math.floor(Number(amount) * Math.pow(10, decimals));
  }
}

// Export singleton instance
export const stellarUtils = new StellarUtils();
export default stellarUtils;