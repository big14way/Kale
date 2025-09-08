import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import CONFIG from '../utils/config';
import { Contract, SorobanRpc, Address } from '@stellar/stellar-sdk';

// Component to check user's token balances before deposit
export const BalanceChecker: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [balances, setBalances] = useState({
    KALE: 0,
    USDC: 0,
    BTC: 0
  });
  const [isTestMode, setIsTestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBalances = async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for test balances first (development mode)
      const testKaleBalance = parseFloat(localStorage.getItem(`test_kale_balance_${address}`) || '0');
      const testUsdcBalance = parseFloat(localStorage.getItem(`test_usdc_balance_${address}`) || '0');
      const testBtcBalance = parseFloat(localStorage.getItem(`test_btc_balance_${address}`) || '0');

      if (testKaleBalance > 0 || testUsdcBalance > 0 || testBtcBalance > 0) {
        console.log('🧪 Using test balances for development');
        setBalances({
          KALE: testKaleBalance,
          USDC: testUsdcBalance,
          BTC: testBtcBalance
        });
        setIsTestMode(true);
        return;
      }

      // Try to check real balances from blockchain
      console.log('🔍 Checking real blockchain balances for:', address);
      
      // For now, real balance checking is complex due to Stellar Asset Contracts
      // We'll implement this properly later, for now use fallback
      setBalances({
        KALE: 0,
        USDC: 0, 
        BTC: 0
      });

      console.log('💰 Real balances (fallback to 0 for now):', { KALE: 0, USDC: 0, BTC: 0 });
      
    } catch (error) {
      console.error('Balance check failed:', error);
      setError('Failed to check balances: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkBalances();
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 mb-6">
        <h3 className="text-white font-semibold mb-2">💰 Token Balances</h3>
        <p className="text-white/70">Connect your wallet to check token balances</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">💰 Your Token Balances</h3>
        <button
          onClick={checkBalances}
          disabled={loading}
          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded text-white text-sm transition-colors duration-200"
        >
          {loading ? '🔄' : '🔍 Check Balances'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-200 text-sm">❌ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl mb-1">🌿</div>
          <div className="text-white/70 text-sm">KALE</div>
          <div className={`font-bold ${balances.KALE > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {balances.KALE.toFixed(4)}
          </div>
          {balances.KALE === 0 && (
            <div className="text-yellow-400 text-xs mt-1">
              ⚠️ Need to farm KALE first
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-1">💵</div>
          <div className="text-white/70 text-sm">USDC</div>
          <div className={`font-bold ${balances.USDC > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
            {balances.USDC.toFixed(2)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-1">₿</div>
          <div className="text-white/70 text-sm">BTC</div>
          <div className={`font-bold ${balances.BTC > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
            {balances.BTC.toFixed(8)}
          </div>
        </div>
      </div>

      {balances.KALE === 0 && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
          <div className="text-yellow-200 text-sm">
            <strong>💡 Why can't I deposit?</strong><br/>
            You need KALE tokens to deposit into the pension fund. KALE tokens must be farmed from the KALE farming contract first.
            <br/><br/>
            <strong>Next steps:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Farm KALE tokens at <a href="https://kalefarm.xyz" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-100">kalefarm.xyz</a></li>
              <li>Or get test KALE tokens from the testnet faucet</li>
              <li>Then return here to deposit into your pension fund</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};