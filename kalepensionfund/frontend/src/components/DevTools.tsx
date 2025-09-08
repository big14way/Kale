import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

// Development tools for testing the pension fund
export const DevTools: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [showDevTools, setShowDevTools] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production' || !isConnected) {
    return null;
  }

  const addToLocalStorage = (key: string, amount: number) => {
    const current = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (current + amount).toString());
    window.location.reload(); // Simple way to refresh balances
  };

  return (
    <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🛠️</span>
          <h3 className="text-white font-semibold">Development Tools</h3>
        </div>
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-white text-sm transition-colors duration-200"
        >
          {showDevTools ? 'Hide Tools' : 'Show Tools'}
        </button>
      </div>

      {showDevTools && (
        <div className="space-y-4">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-3">⚠️ Test Token Generator</h4>
            <p className="text-white/70 text-sm mb-4">
              For development testing only. This adds mock balances to localStorage.
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => addToLocalStorage(`test_kale_balance_${address}`, 1000)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 text-sm transition-colors duration-200"
              >
                + 1000 KALE
              </button>
              
              <button
                onClick={() => addToLocalStorage(`test_usdc_balance_${address}`, 500)}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 text-sm transition-colors duration-200"
              >
                + 500 USDC
              </button>
              
              <button
                onClick={() => addToLocalStorage(`test_btc_balance_${address}`, 0.01)}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded text-orange-300 text-sm transition-colors duration-200"
              >
                + 0.01 BTC
              </button>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  localStorage.removeItem(`test_kale_balance_${address}`);
                  localStorage.removeItem(`test_usdc_balance_${address}`);
                  localStorage.removeItem(`test_btc_balance_${address}`);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded text-gray-300 text-sm transition-colors duration-200"
              >
                🗑️ Clear Test Balances
              </button>
              
              <button
                onClick={() => {
                  const kale = localStorage.getItem(`test_kale_balance_${address}`) || '0';
                  const usdc = localStorage.getItem(`test_usdc_balance_${address}`) || '0';
                  const btc = localStorage.getItem(`test_btc_balance_${address}`) || '0';
                  alert(`Test Balances:\nKALE: ${kale}\nUSDC: ${usdc}\nBTC: ${btc}`);
                }}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 text-sm transition-colors duration-200"
              >
                👀 View Test Balances
              </button>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400">⚠️</span>
              <div className="text-yellow-200 text-sm">
                <strong>Development Mode Only:</strong> These are mock balances for UI testing. 
                In production, you need real KALE tokens from the farming contract.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};