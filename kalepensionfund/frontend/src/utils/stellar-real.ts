// Real Stellar SDK integration for KALE Pension Fund

import { 
  SorobanRpc, 
  TransactionBuilder, 
  BASE_FEE,
  Contract,
  scValToNative,
  nativeToScVal,
  Address,
  Account,
  Keypair
} from '@stellar/stellar-sdk';

import CONFIG from './config';

// Type definitions
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

// Initialize Soroban RPC server
const server = new SorobanRpc.Server(CONFIG.SOROBAN_RPC_URL);

// Utility class for Stellar/Soroban interactions
export class StellarUtils {
  private server: SorobanRpc.Server;
  private contract: Contract;

  constructor() {
    this.server = server;
    this.contract = new Contract(CONFIG.CONTRACT_ADDRESS);
  }

  // Check if Freighter is installed and connected
  async checkFreighter(): Promise<boolean> {
    try {
      return typeof (window as any).freighter !== 'undefined';
    } catch (error) {
      console.error('Freighter not available:', error);
      return false;
    }
  }

  // Connect to Freighter wallet
  async connectWallet(): Promise<string> {
    try {
      if (!(window as any).freighter) {
        throw new Error('Freighter wallet not found. Please install Freighter.');
      }

      const { requestAccess, getPublicKey } = (window as any).freighter;
      const accessGranted = await requestAccess();
      
      if (accessGranted) {
        const publicKey = await getPublicKey();
        console.log('Connected to wallet:', publicKey);
        return publicKey;
      }
      throw new Error('Access denied by user');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Get user's public key
  async getPublicKey(): Promise<string> {
    try {
      if (!(window as any).freighter) {
        throw new Error('Freighter wallet not found');
      }
      const { getPublicKey } = (window as any).freighter;
      return await getPublicKey();
    } catch (error) {
      console.error('Failed to get public key:', error);
      throw error;
    }
  }

  // Get account information from Horizon
  async getAccount(publicKey: string): Promise<any> {
    try {
      const response = await fetch(`${CONFIG.HORIZON_URL}/accounts/${publicKey}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Account not found. Make sure your account is funded on Stellar testnet.');
        }
        throw new Error(`Failed to fetch account: ${response.status}`);
      }
      const accountData = await response.json();
      return new Account(accountData.account_id, accountData.sequence);
    } catch (error) {
      console.error('Failed to get account:', error);
      throw error;
    }
  }

  // Build and submit a contract transaction
  async submitTransaction(operation: any, publicKey: string): Promise<TransactionResult> {
    try {
      // Get account
      const account = await this.getAccount(publicKey);
      
      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(CONFIG.TRANSACTION_TIMEOUT / 1000)
        .build();

      // Simulate transaction first
      console.log('Simulating transaction...');
      const simulated = await this.server.simulateTransaction(transaction);
      
      if (simulated.error) {
        console.error('Simulation error:', simulated.error);
        throw new Error(`Simulation failed: ${simulated.error}`);
      }

      // Prepare transaction for signing
      const prepared = await this.server.prepareTransaction(transaction);

      // Sign with Freighter
      console.log('Signing transaction...');
      const { signTransaction } = (window as any).freighter;
      const signedXDR = await signTransaction(prepared.toXDR(), {
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
        address: publicKey,
      });

      // Submit transaction
      console.log('Submitting transaction...');
      const transactionFromXDR = TransactionBuilder.fromXDR(signedXDR.signedTxXdr, CONFIG.NETWORK_PASSPHRASE);
      const result = await this.server.sendTransaction(transactionFromXDR);

      if (result.status === 'SUCCESS') {
        console.log('Transaction successful:', result.hash);
        return {
          status: 'SUCCESS',
          hash: result.hash
        };
      } else {
        console.error('Transaction failed:', result);
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      return {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Contract interaction methods
  async deposit(publicKey: string, amount: number): Promise<TransactionResult> {
    try {
      console.log(`Depositing ${amount} to contract for ${publicKey}`);
      
      const operation = this.contract.call(
        'deposit',
        nativeToScVal(Address.fromString(publicKey), { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' })
      );

      return await this.submitTransaction(operation, publicKey);
    } catch (error) {
      console.error('Deposit failed:', error);
      return {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Deposit failed'
      };
    }
  }

  async setRisk(publicKey: string, riskLevel: number): Promise<TransactionResult> {
    try {
      console.log(`Setting risk level ${riskLevel} for ${publicKey}`);
      
      const operation = this.contract.call(
        'set_risk',
        nativeToScVal(Address.fromString(publicKey), { type: 'address' }),
        nativeToScVal(riskLevel, { type: 'u32' })
      );

      return await this.submitTransaction(operation, publicKey);
    } catch (error) {
      console.error('Set risk failed:', error);
      return {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Failed to set risk level'
      };
    }
  }

  async rebalance(publicKey: string): Promise<TransactionResult> {
    try {
      console.log(`Rebalancing portfolio for ${publicKey}`);
      
      const operation = this.contract.call(
        'rebalance',
        nativeToScVal(Address.fromString(publicKey), { type: 'address' })
      );

      return await this.submitTransaction(operation, publicKey);
    } catch (error) {
      console.error('Rebalance failed:', error);
      return {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Rebalance failed'
      };
    }
  }

  async withdraw(publicKey: string): Promise<TransactionResult> {
    try {
      console.log(`Withdrawing all assets for ${publicKey}`);
      
      const operation = this.contract.call(
        'withdraw',
        nativeToScVal(Address.fromString(publicKey), { type: 'address' })
      );

      return await this.submitTransaction(operation, publicKey);
    } catch (error) {
      console.error('Withdraw failed:', error);
      return {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Withdraw failed'
      };
    }
  }

  async getPortfolio(publicKey: string): Promise<Portfolio | null> {
    try {
      console.log(`Fetching portfolio for ${publicKey}`);
      
      const operation = this.contract.call(
        'get_portfolio',
        nativeToScVal(Address.fromString(publicKey), { type: 'address' })
      );

      // For read operations, we simulate instead of submit
      const account = await this.getAccount(publicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      
      if (simulated.error) {
        console.log('Portfolio not found or empty for user:', publicKey);
        return null;
      }

      // Parse the result
      const result = simulated.result?.retval;
      if (result) {
        const portfolio = scValToNative(result) as Portfolio;
        console.log('Portfolio found:', portfolio);
        return portfolio;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get portfolio:', error);
      return null;
    }
  }

  async getPrice(pair: string): Promise<number> {
    try {
      console.log(`Fetching price for ${pair}`);
      
      const operation = this.contract.call(
        'get_price',
        nativeToScVal(pair, { type: 'symbol' })
      );

      // Use a funded account to simulate price queries
      const dummyKeypair = Keypair.random();
      const dummyAccount = new Account(dummyKeypair.publicKey(), '0');
      
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      
      if (simulated.error) {
        console.warn(`Price fetch failed for ${pair}, using fallback prices`);
        // Return fallback prices
        const fallbackPrices: Record<string, number> = {
          'KALE_USD': 120000000, // $0.12 (7 decimals)
          'BTC_USD': 45000000000000 // $45,000 (7 decimals)
        };
        return fallbackPrices[pair] || 0;
      }

      const result = simulated.result?.retval;
      if (result) {
        const price = scValToNative(result) as number;
        console.log(`Price for ${pair}:`, price);
        return price;
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get price:', error);
      // Return fallback prices on error
      const fallbackPrices: Record<string, number> = {
        'KALE_USD': 120000000, // $0.12 (7 decimals)
        'BTC_USD': 45000000000000 // $45,000 (7 decimals)
      };
      return fallbackPrices[pair] || 0;
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