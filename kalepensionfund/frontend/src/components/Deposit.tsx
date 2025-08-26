import React, { useState } from 'react';
import { stellarUtils } from '../utils/stellar-simple';

interface DepositProps {
  walletAddress: string | null;
  onSuccess?: () => void;
}

const Deposit: React.FC<DepositProps> = ({ walletAddress, onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeposit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert amount to contract format (7 decimals)
      const amountInStroops = stellarUtils.parseAmount(amount);
      
      // Submit deposit transaction
      const result = await stellarUtils.deposit(walletAddress, amountInStroops);
      
      if (result.status === 'SUCCESS') {
        setSuccess(`Successfully deposited ${amount} KALE tokens!`);
        setAmount('');
        
        // Notify parent component to refresh
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to deposit tokens');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = (): void => {
    setError(null);
    setSuccess(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
    clearMessages();
  };

  return (
    <div className="deposit-section">
      <h3>💰 Deposit KALE Tokens</h3>
      
      <form onSubmit={handleDeposit} className="deposit-form">
        <div className="input-group">
          <label htmlFor="amount">Amount (KALE)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount to deposit"
            min="0"
            step="0.0000001"
            disabled={loading || !walletAddress}
          />
        </div>

        <button 
          type="submit" 
          className="deposit-btn"
          disabled={loading || !walletAddress || !amount}
        >
          {loading ? (
            <span>
              <span className="spinner">⟳</span> Depositing...
            </span>
          ) : (
            'Deposit KALE'
          )}
        </button>
      </form>

      {error && (
        <div className="message error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <span>✅ {success}</span>
        </div>
      )}

      {!walletAddress && (
        <div className="message info-message">
          <span>ℹ️ Connect your wallet to deposit tokens</span>
        </div>
      )}

      <div className="deposit-info">
        <h4>About Deposits</h4>
        <ul>
          <li>Deposit your mined KALE tokens to start investing</li>
          <li>Tokens will be allocated based on your risk profile</li>
          <li>You can deposit additional tokens anytime</li>
          <li>All deposits are secured by the smart contract</li>
        </ul>
      </div>
    </div>
  );
};

export default Deposit;