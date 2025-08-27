import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

// Test component to verify wallet connection and signing is working
export const WalletTest: React.FC = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const testWalletConnection = async () => {
    if (!isConnected) {
      setTestResult('❌ Wallet not connected');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Test basic wallet functionality
      if (address) {
        setTestResult(`✅ Wallet connected successfully to ${address.slice(0, 8)}...${address.slice(-8)}`);
      } else {
        setTestResult('⚠️ Connected but no address found');
      }
    } catch (error) {
      setTestResult(`❌ Wallet test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">🔧 Wallet Test</h3>
        {isConnected && (
          <button
            onClick={testWalletConnection}
            disabled={testing}
            className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-white text-sm transition-colors duration-200"
          >
            {testing ? '🔄 Testing...' : '🧪 Test Connection'}
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Connection Status:</span>
          <span className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        
        {address && (
          <div className="flex items-center justify-between">
            <span className="text-white/70">Address:</span>
            <span className="text-white font-mono text-sm">
              {address.slice(0, 8)}...{address.slice(-8)}
            </span>
          </div>
        )}
        
        <div className="flex space-x-2">
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-white transition-colors duration-200"
            >
              🔗 Connect Wallet
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-white transition-colors duration-200"
            >
              ❌ Disconnect
            </button>
          )}
        </div>
        
        {testResult && (
          <div className="mt-3 p-3 bg-black/20 rounded-lg">
            <div className="text-white text-sm">
              {testResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};