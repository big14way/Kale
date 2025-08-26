import { 
  SorobanRpc, 
  TransactionBuilder, 
  BASE_FEE,
  Contract,
  scValToNative,
  nativeToScVal,
  Address,
  Account
} from '@stellar/stellar-sdk';
import * as freighter from '@stellar/freighter-api';
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

export interface HorizonAccount {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  balances: Array<{
    balance: string;
    limit?: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
  signers: Array<{
    weight: number;
    key: string;
    type: string;
  }>;
  data: Record<string, string>;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
  };
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
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
      const result = await freighter.isConnected();
      return result.isConnected;
    } catch (error) {
      console.error('Freighter not available:', error);
      return false;
    }
  }

  // Connect to Freighter wallet
  async connectWallet(): Promise<string> {
    try {
      const accessGranted = await freighter.requestAccess();
      if (accessGranted) {
        const publicKey = await freighter.getPublicKey();
        return publicKey;
      }
      throw new Error('Access denied');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Get user's public key
  async getPublicKey(): Promise<string> {
    try {
      return await freighter.getPublicKey();
    } catch (error) {
      console.error('Failed to get public key:', error);
      throw error;
    }
  }

  // Get account information
  async getAccount(publicKey: string): Promise<Account> {
    try {
      const response = await fetch(`${CONFIG.HORIZON_URL}/accounts/${publicKey}`);
      if (!response.ok) {
        throw new Error('Account not found');
      }
      const accountData: HorizonAccount = await response.json();
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

      // Simulate transaction
      const simulated = await this.server.simulateTransaction(transaction);
      
      if (simulated.error) {
        throw new Error(simulated.error);
      }

      // Prepare transaction for signing
      const prepared = await this.server.prepareTransaction(transaction);

      // Sign with Freighter
      const signedXDR = await freighter.signTransaction(prepared.toXDR(), {
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
        address: publicKey,
      });

      // Submit transaction
      const transactionFromXDR = TransactionBuilder.fromXDR(signedXDR.signedTxXdr, CONFIG.NETWORK_PASSPHRASE);
      const result = await this.server.sendTransaction(transactionFromXDR);

      return {
        status: 'SUCCESS',
        hash: result.hash
      };
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
    const operation = this.contract.call(
      'deposit',
      nativeToScVal(Address.fromString(publicKey), { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' })
    );

    return await this.submitTransaction(operation, publicKey);
  }

  async setRisk(publicKey: string, riskLevel: number): Promise<TransactionResult> {
    const operation = this.contract.call(
      'set_risk',
      nativeToScVal(Address.fromString(publicKey), { type: 'address' }),
      nativeToScVal(riskLevel, { type: 'u32' })
    );

    return await this.submitTransaction(operation, publicKey);
  }

  async rebalance(publicKey: string): Promise<TransactionResult> {
    const operation = this.contract.call(
      'rebalance',
      nativeToScVal(Address.fromString(publicKey), { type: 'address' })
    );

    return await this.submitTransaction(operation, publicKey);
  }

  async withdraw(publicKey: string): Promise<TransactionResult> {
    const operation = this.contract.call(
      'withdraw',
      nativeToScVal(Address.fromString(publicKey), { type: 'address' })
    );

    return await this.submitTransaction(operation, publicKey);
  }

  async getPortfolio(publicKey: string): Promise<Portfolio | null> {
    try {
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
        throw new Error(simulated.error);
      }

      // Parse the result
      const result = simulated.result?.retval;
      if (result) {
        return scValToNative(result) as Portfolio;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get portfolio:', error);
      throw error;
    }
  }

  async getPrice(pair: string): Promise<number> {
    try {
      const operation = this.contract.call(
        'get_price',
        nativeToScVal(pair, { type: 'symbol' })
      );

      // Create a dummy account for simulation
      const dummyAccount = await this.getAccount(await this.getPublicKey());
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      
      if (simulated.error) {
        throw new Error(simulated.error);
      }

      const result = simulated.result?.retval;
      if (result) {
        return scValToNative(result) as number;
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get price:', error);
      // Return mock prices for development
      const mockPrices: Record<string, number> = {
        'KALE_USD': 120000000, // 0.12 USD
        'BTC_USD': 45000000000000 // $45,000
      };
      return mockPrices[pair] || 0;
    }
  }

  // Format amount with proper decimals
  formatAmount(amount: number, decimals: number = 7): string {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals);
  }

  // Parse amount to contract format
  parseAmount(amount: string | number, decimals: number = 7): number {
    return Math.floor(Number(amount) * Math.pow(10, decimals));
  }
}

// Export singleton instance
export const stellarUtils = new StellarUtils();
export default stellarUtils;