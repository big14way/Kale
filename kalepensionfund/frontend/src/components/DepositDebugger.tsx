import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import CONFIG from '../utils/config';
import { sorobanService } from '../utils/soroban-service';

interface DebugInfo {
  walletAddress: string | null;
  expectedKaleToken: string;
  walletKaleBalance: number;
  contractInitialized: boolean;
  contractKaleToken: string | null;
  contractStatus: string | null;
  lastError: string | null;
}

export const DepositDebugger: React.FC = () => {
  const { address, isConnected, ensureConnection, signTransaction } = useWallet();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    walletAddress: null,
    expectedKaleToken: CONFIG.TOKENS.KALE,
    walletKaleBalance: 0,
    contractInitialized: false,
    contractKaleToken: null,
    contractStatus: null,
    lastError: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkDebugInfo = async () => {
    if (!address) return;
    
    setIsChecking(true);
    try {
      // Check wallet KALE balance
      const response = await fetch(
        `${CONFIG.HORIZON_URL}/accounts/${address}`
      );
      const accountData = await response.json();
      
      let kaleBalance = 0;
      if (accountData.balances) {
        const kaleAsset = accountData.balances.find((balance: any) => 
          balance.asset_code === 'KALE' || 
          balance.asset_issuer === CONFIG.TOKENS.KALE ||
          balance.asset_type === 'credit_alphanum4'
        );
        if (kaleAsset) {
          kaleBalance = parseFloat(kaleAsset.balance);
        }
      }

      setDebugInfo(prev => ({
        ...prev,
        walletAddress: address,
        walletKaleBalance: kaleBalance,
        lastError: null
      }));

    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkDebugInfo();
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-white font-semibold mb-4">🔧 Deposit Debugger</h3>
        <p className="text-white/70">Connect your wallet to debug deposit issues</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">🔧 Deposit Debugger</h3>
        <button
          onClick={checkDebugInfo}
          disabled={isChecking}
          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-white text-sm transition-colors duration-200"
        >
          {isChecking ? '🔄' : '🔄 Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Wallet Info */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-blue-400 font-semibold mb-2">👛 Wallet Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Address:</span>
              <span className="text-white font-mono text-xs">
                {debugInfo.walletAddress?.slice(0, 8)}...{debugInfo.walletAddress?.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">KALE Balance:</span>
              <span className={`font-bold ${debugInfo.walletKaleBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.walletKaleBalance.toFixed(4)} KALE
              </span>
            </div>
          </div>
        </div>

        {/* Expected Token */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-purple-400 font-semibold mb-2">🎯 Expected KALE Token</h4>
          <div className="text-xs font-mono text-white/80 break-all">
            {debugInfo.expectedKaleToken}
          </div>
          <div className="mt-2 text-sm text-white/60">
            This is the KALE token address the contract expects
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">📊 Status Check</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Has KALE tokens:</span>
              <span className={`text-sm font-bold ${debugInfo.walletKaleBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.walletKaleBalance > 0 ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Contract status:</span>
              <span className={`text-sm font-bold ${debugInfo.contractInitialized ? 'text-green-400' : 'text-yellow-400'}`}>
                {debugInfo.contractStatus || '❓ UNKNOWN'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Minimum for deposit:</span>
              <span className="text-white/80 text-sm">0.0001 KALE</span>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        {debugInfo.walletKaleBalance === 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">❌ No KALE Tokens Found</h4>
            <div className="text-red-200 text-sm space-y-2">
              <p><strong>Possible solutions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Get KALE tokens from <a href="https://kalefarm.xyz" target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-100 underline">kalefarm.xyz</a></li>
                <li>Check if you have the correct KALE token in your wallet</li>
                <li>Make sure you're on Stellar testnet</li>
                <li>Try adding the KALE token manually to Freighter</li>
              </ul>
            </div>
          </div>
        )}

        {debugInfo.walletKaleBalance > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold mb-2">✅ KALE Tokens Detected</h4>
            <div className="text-green-200 text-sm">
              <p>You have {debugInfo.walletKaleBalance.toFixed(4)} KALE tokens. You should be able to deposit!</p>
              <p className="mt-2 text-green-300">
                <strong>If deposit still fails:</strong> Check the browser console for detailed error messages.
              </p>
            </div>
          </div>
        )}

        {/* Wallet Connection Test */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-orange-400 font-semibold mb-2">🔧 Wallet Connection Test</h4>
          <button
            onClick={async () => {
              try {
                setIsChecking(true);
                await ensureConnection();
                setDebugInfo(prev => ({ ...prev, lastError: null }));
                alert('✅ Wallet connection verified successfully!');
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Connection test failed';
                setDebugInfo(prev => ({ ...prev, lastError: errorMsg }));
                alert(`❌ Connection test failed: ${errorMsg}`);
              } finally {
                setIsChecking(false);
              }
            }}
            disabled={isChecking || !isConnected}
            className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded text-orange-300 disabled:text-gray-400 text-sm transition-colors duration-200"
          >
            {isChecking ? '🔄 Testing...' : '🧪 Test Wallet Connection'}
          </button>
          <div className="mt-2 text-xs text-white/60">
            This will verify your wallet is properly connected and ready for transactions
          </div>
        </div>

        {/* Contract Status Check */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-purple-400 font-semibold mb-2">🏗️ Contract Status Check</h4>
          <div className="space-y-2 mb-3">
            <button
              onClick={async () => {
                try {
                  setIsChecking(true);
                  const status = await sorobanService.checkContractStatus();
                  setDebugInfo(prev => ({
                    ...prev,
                    contractInitialized: status.isInitialized,
                    contractKaleToken: status.kaleToken || null,
                    contractStatus: status.isInitialized ? 'Initialized' : 'Not Initialized',
                    lastError: status.error || null
                  }));

                  if (status.isInitialized) {
                    alert(`✅ Contract is properly initialized!\nKALE Token: ${status.kaleToken?.slice(0, 8)}...${status.kaleToken?.slice(-8)}`);
                  } else {
                    alert(`❌ Contract not initialized: ${status.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : 'Status check failed';
                  setDebugInfo(prev => ({ ...prev, lastError: errorMsg, contractStatus: 'Check Failed' }));
                  alert(`❌ Contract status check failed: ${errorMsg}`);
                } finally {
                  setIsChecking(false);
                }
              }}
              disabled={isChecking}
              className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded text-purple-300 disabled:text-gray-400 text-sm transition-colors duration-200"
            >
              {isChecking ? '🔄 Checking...' : '🔍 Check Contract Status'}
            </button>

            <button
              onClick={async () => {
                if (!address) {
                  alert('❌ Please connect your wallet first');
                  return;
                }

                const confirmed = confirm('⚠️ This will attempt to initialize the contract with your wallet as admin. This should only be done once by the contract deployer. Continue?');
                if (!confirmed) return;

                try {
                  setIsChecking(true);
                  const result = await sorobanService.initializeContractTestnet(address, signTransaction);

                  if (result.status === 'SUCCESS') {
                    alert(`✅ Contract initialized successfully!\nTransaction: ${result.hash}`);
                    setDebugInfo(prev => ({
                      ...prev,
                      contractInitialized: true,
                      contractStatus: 'Initialized',
                      lastError: null
                    }));
                  } else {
                    alert(`❌ Contract initialization failed: ${result.error}`);
                    setDebugInfo(prev => ({ ...prev, lastError: result.error || 'Initialization failed' }));
                  }
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : 'Initialization failed';
                  setDebugInfo(prev => ({ ...prev, lastError: errorMsg }));
                  alert(`❌ Contract initialization failed: ${errorMsg}`);
                } finally {
                  setIsChecking(false);
                }
              }}
              disabled={isChecking || !isConnected}
              className="w-full px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded text-yellow-300 disabled:text-gray-400 text-sm transition-colors duration-200"
            >
              {isChecking ? '🔄 Initializing...' : '🚀 Initialize Contract (Admin)'}
            </button>
          </div>
          <div className="text-xs text-white/60">
            Check if the contract is properly initialized and ready for deposits
          </div>
        </div>

        {/* Token Approval Section */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-green-400 font-semibold mb-2">🔐 Token Approval</h4>
          <div className="space-y-2 mb-3">
            <button
              onClick={async () => {
                if (!address) {
                  alert('❌ Please connect your wallet first');
                  return;
                }

                const amountStr = prompt('Enter amount of KALE tokens to approve (e.g., 1000):');
                if (!amountStr) return;

                const amount = parseFloat(amountStr);
                if (isNaN(amount) || amount <= 0) {
                  alert('❌ Please enter a valid positive number');
                  return;
                }

                try {
                  setIsChecking(true);
                  const contractAmount = amount * 10_000_000; // Convert to 7 decimals
                  const result = await sorobanService.approveKaleTokens(address, contractAmount, signTransaction);

                  if (result.status === 'SUCCESS') {
                    alert(`✅ Token approval successful!\nTransaction: ${result.hash}\n\nYou can now deposit up to ${amount} KALE tokens.`);
                    setDebugInfo(prev => ({ ...prev, lastError: null }));
                  } else {
                    alert(`❌ Token approval failed: ${result.error}`);
                    setDebugInfo(prev => ({ ...prev, lastError: result.error || 'Approval failed' }));
                  }
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : 'Approval failed';
                  setDebugInfo(prev => ({ ...prev, lastError: errorMsg }));
                  alert(`❌ Token approval failed: ${errorMsg}`);
                } finally {
                  setIsChecking(false);
                }
              }}
              disabled={isChecking || !isConnected}
              className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded text-green-300 disabled:text-gray-400 text-sm transition-colors duration-200"
            >
              {isChecking ? '🔄 Approving...' : '✅ Approve KALE Tokens'}
            </button>
          </div>
          <div className="text-xs text-white/60">
            Approve the contract to spend your KALE tokens before depositing
          </div>
        </div>

        {/* Add Token to Wallet Button */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-cyan-400 font-semibold mb-2">🔗 Add KALE Token to Wallet</h4>
          <button
            onClick={() => {
              const tokenData = {
                asset_code: 'KALE',
                asset_issuer: CONFIG.TOKENS.KALE
              };
              navigator.clipboard.writeText(JSON.stringify(tokenData, null, 2));
              alert('KALE token info copied to clipboard! You can manually add this to Freighter.');
            }}
            className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-cyan-300 text-sm transition-colors duration-200"
          >
            📋 Copy KALE Token Info
          </button>
          <div className="mt-2 text-xs text-white/60">
            Click to copy token details, then manually add to Freighter wallet
          </div>
        </div>

        {debugInfo.lastError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">⚠️ Error</h4>
            <div className="text-red-200 text-sm font-mono">
              {debugInfo.lastError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
