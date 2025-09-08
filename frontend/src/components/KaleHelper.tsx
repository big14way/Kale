import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

// Component to help users get KALE tokens for testing
export const KaleHelper: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [isExplaining, setIsExplaining] = useState(false);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌿</span>
          <h3 className="text-white font-semibold">Get KALE Tokens</h3>
        </div>
        <button
          onClick={() => setIsExplaining(!isExplaining)}
          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-white text-sm transition-colors duration-200"
        >
          {isExplaining ? '📖 Hide Guide' : '❓ How to get KALE?'}
        </button>
      </div>

      {isExplaining && (
        <div className="space-y-4 mb-6">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold mb-2">🧑‍🌾 KALE Farming Process</h4>
            <div className="space-y-2 text-white/80 text-sm">
              <p><strong>Step 1: Plant</strong> - Stake KALE tokens (can start with 0)</p>
              <p><strong>Step 2: Work</strong> - Submit proof-of-work hash with prefix zeros</p>
              <p><strong>Step 3: Harvest</strong> - Collect your farmed KALE tokens</p>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-2">🔗 KALE Token Addresses</h4>
            <div className="space-y-1 text-white/60 text-xs font-mono">
              <p>KALE Token: {`CAAVU2UQJLMZ3GUZFM56KVNHLPA3ZSSNR4VP2U53YBXFD2GI3QLIVHZZ`}</p>
              <p>Farm Contract: {`CDSWUUXGPWDZG76ISK6SUCVPZJMD5YUV66J2FXFXFGDX25XKZJIEITAO`}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">🎯 Option 1: Official KALE Farm</h4>
          <p className="text-white/70 text-sm mb-3">
            Use the official KALE farming interface to mine KALE tokens through proof-of-work.
          </p>
          <a
            href="https://kalefarm.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 text-sm transition-colors duration-200"
          >
            🌾 Farm KALE at kalefarm.xyz
          </a>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">⚡ Option 2: Testnet Faucet</h4>
          <p className="text-white/70 text-sm mb-3">
            For development/testing, you can get test KALE tokens from community faucets.
          </p>
          <div className="space-y-2">
            <a
              href="https://discord.gg/hSn6e3qGCN"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 text-sm transition-colors duration-200 text-center"
            >
              💬 Ask in KALE Discord
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(address || '');
                alert('Address copied! Share this in Discord to request test KALE tokens.');
              }}
              className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 text-sm transition-colors duration-200"
            >
              📋 Copy Address for Faucet
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-400 text-lg">💡</span>
          <div className="text-yellow-200 text-sm">
            <strong>Why do I need KALE tokens?</strong><br/>
            The KALE Pension Fund is designed to manage KALE tokens you've earned through farming. 
            You deposit your farmed KALE, and the fund automatically invests across KALE, USDC, and BTC based on your risk profile.
          </div>
        </div>
      </div>
    </div>
  );
};