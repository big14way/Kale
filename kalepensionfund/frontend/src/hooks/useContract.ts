import { useState, useCallback } from 'react';
import { sorobanService } from '../utils/soroban-service';
import { useWallet } from './useWallet';

// Modern contract interaction hook (2024/2025 best practices)
export interface Portfolio {
  user: string;
  kale_balance: number;
  usdc_balance: number;
  btc_balance: number;
  risk_level: number;
}

interface ContractState {
  isLoading: boolean;
  error: string | null;
  lastTransactionHash: string | null;
}

interface ContractActions {
  getPortfolio: (userAddress?: string) => Promise<Portfolio | null>;
  deposit: (amount: number) => Promise<string>;
  withdraw: () => Promise<string>;
  setRiskLevel: (level: 1 | 2 | 3) => Promise<string>;
  getPrice: (pair: string) => Promise<number>;
  rebalance: () => Promise<string>;
}

export const useContract = (): ContractState & ContractActions => {
  const [state, setState] = useState<ContractState>({
    isLoading: false,
    error: null,
    lastTransactionHash: null,
  });

  const { address: walletAddress, isConnected, signTransaction } = useWallet();

  const handleContractCall = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await operation();
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${operationName} failed`;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const getPortfolio = useCallback(async (userAddress?: string): Promise<Portfolio | null> => {
    const address = userAddress || walletAddress;
    if (!address) return null;

    return handleContractCall(async () => {
      const result = await sorobanService.getPortfolio(address);
      if (!result) return null;
      
      return {
        user: result.user,
        kale_balance: Number(result.kale_balance) / 10_000_000, // Convert from 7 decimals
        usdc_balance: Number(result.usdc_balance) / 10_000_000,
        btc_balance: Number(result.btc_balance) / 10_000_000,
        risk_level: Number(result.risk_level),
      };
    }, 'Get portfolio');
  }, [walletAddress, handleContractCall]);

  const deposit = useCallback(async (amount: number): Promise<string> => {
    if (!isConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    return handleContractCall(async () => {
      // Convert amount to contract units (7 decimal places)
      const contractAmount = amount * 10_000_000;
      
      // Use the soroban service with our wallet's signTransaction method
      const result = await sorobanService.depositWithWallet(
        walletAddress, 
        contractAmount, 
        signTransaction
      );
      
      if (result.status === 'SUCCESS' && result.hash) {
        setState(prev => ({ ...prev, lastTransactionHash: result.hash! }));
        return result.hash;
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    }, 'Deposit');
  }, [isConnected, walletAddress, signTransaction, handleContractCall]);

  const withdraw = useCallback(async (): Promise<string> => {
    if (!isConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    return handleContractCall(async () => {
      const result = await sorobanService.withdrawWithWallet(
        walletAddress, 
        0, // 0 means withdraw all
        signTransaction
      );
      
      if (result.status === 'SUCCESS' && result.hash) {
        setState(prev => ({ ...prev, lastTransactionHash: result.hash! }));
        return result.hash;
      } else {
        throw new Error(result.error || 'Withdrawal failed');
      }
    }, 'Withdraw');
  }, [isConnected, walletAddress, handleContractCall]);

  const setRiskLevel = useCallback(async (level: 1 | 2 | 3): Promise<string> => {
    if (!isConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    return handleContractCall(async () => {
      const result = await sorobanService.setRiskProfileWithWallet(
        walletAddress, 
        level, 
        signTransaction
      );
      
      if (result.status === 'SUCCESS' && result.hash) {
        setState(prev => ({ ...prev, lastTransactionHash: result.hash! }));
        return result.hash;
      } else {
        throw new Error(result.error || 'Failed to set risk level');
      }
    }, 'Set risk level');
  }, [isConnected, walletAddress, handleContractCall]);

  const getPrice = useCallback(async (pair: string): Promise<number> => {
    return handleContractCall(async () => {
      const result = await sorobanService.getPrice(pair);
      // Convert from contract units (7 decimal places) to regular number
      return result / 10_000_000;
    }, 'Get price');
  }, [handleContractCall]);

  const rebalance = useCallback(async (): Promise<string> => {
    if (!isConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    return handleContractCall(async () => {
      const result = await sorobanService.rebalanceWithWallet(
        walletAddress, 
        signTransaction
      );
      
      if (result.status === 'SUCCESS' && result.hash) {
        setState(prev => ({ ...prev, lastTransactionHash: result.hash! }));
        return result.hash;
      } else {
        throw new Error(result.error || 'Rebalance failed');
      }
    }, 'Rebalance');
  }, [isConnected, walletAddress, signTransaction, handleContractCall]);

  return {
    ...state,
    getPortfolio,
    deposit,
    withdraw,
    setRiskLevel,
    getPrice,
    rebalance,
  };
};