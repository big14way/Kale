import React, { useState } from 'react';
import { stellarUtils } from '../utils/stellar-simple';

interface ActionsProps {
  walletAddress: string | null;
  hasPortfolio: boolean;
  onSuccess?: () => void;
}

const Actions: React.FC<ActionsProps> = ({ walletAddress, hasPortfolio, onSuccess }) => {
  const [rebalanceLoading, setRebalanceLoading] = useState<boolean>(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState<boolean>(false);

  const handleRebalance = async (): Promise<void> => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setRebalanceLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await stellarUtils.rebalance(walletAddress);
      
      if (result.status === 'SUCCESS') {
        setSuccess('Portfolio rebalanced successfully!');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Rebalance failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to rebalance portfolio');
    } finally {
      setRebalanceLoading(false);
    }
  };

  const handleWithdraw = async (): Promise<void> => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setWithdrawLoading(true);
    setError(null);
    setSuccess(null);
    setShowWithdrawConfirm(false);

    try {
      const result = await stellarUtils.withdraw(walletAddress);
      
      if (result.status === 'SUCCESS') {
        setSuccess('All assets withdrawn successfully!');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Withdraw failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to withdraw assets');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const clearMessages = (): void => {
    setError(null);
    setSuccess(null);
  };

  if (!hasPortfolio) {
    return (
      <div className="actions-section">
        <h3>🔧 Portfolio Actions</h3>
        <div className="message info-message">
          <span>ℹ️ Deposit KALE tokens first to enable portfolio actions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="actions-section">
      <h3>🔧 Portfolio Actions</h3>
      
      <div className="actions-grid">
        <div className="action-card">
          <h4>🔄 Rebalance Portfolio</h4>
          <p>Manually trigger portfolio rebalancing based on current market conditions and your risk profile.</p>
          
          <button 
            className="action-btn rebalance-btn"
            onClick={handleRebalance}
            disabled={rebalanceLoading || !walletAddress}
          >
            {rebalanceLoading ? (
              <span>
                <span className="spinner">⟳</span> Rebalancing...
              </span>
            ) : (
              'Rebalance Now'
            )}
          </button>
          
          <div className="action-info">
            <small>
              ⚠️ Rebalancing will adjust your asset allocation according to your risk profile and current market prices.
            </small>
          </div>
        </div>

        <div className="action-card">
          <h4>💸 Withdraw All Assets</h4>
          <p>Withdraw all your assets (KALE, USDC, and BTC) back to your wallet and close your portfolio.</p>
          
          {!showWithdrawConfirm ? (
            <button 
              className="action-btn withdraw-btn"
              onClick={() => setShowWithdrawConfirm(true)}
              disabled={withdrawLoading || !walletAddress}
            >
              Withdraw All
            </button>
          ) : (
            <div className="withdraw-confirm">
              <p className="confirm-text">
                ⚠️ This will withdraw ALL assets and close your portfolio. Are you sure?
              </p>
              <div className="confirm-buttons">
                <button 
                  className="action-btn confirm-btn"
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                >
                  {withdrawLoading ? (
                    <span>
                      <span className="spinner">⟳</span> Withdrawing...
                    </span>
                  ) : (
                    'Yes, Withdraw All'
                  )}
                </button>
                <button 
                  className="action-btn cancel-btn"
                  onClick={() => setShowWithdrawConfirm(false)}
                  disabled={withdrawLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="action-info">
            <small>
              ⚠️ This action cannot be undone. You will need to deposit again to restart investing.
            </small>
          </div>
        </div>
      </div>

      {error && (
        <div className="message error-message">
          <span>❌ {error}</span>
          <button className="clear-btn" onClick={clearMessages}>×</button>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <span>✅ {success}</span>
          <button className="clear-btn" onClick={clearMessages}>×</button>
        </div>
      )}

      {!walletAddress && (
        <div className="message info-message">
          <span>ℹ️ Connect your wallet to perform actions</span>
        </div>
      )}

      <div className="actions-info">
        <h4>About Portfolio Actions</h4>
        <ul>
          <li><strong>Automatic Rebalancing:</strong> The system monitors KALE prices and rebalances when price moves &gt;10% from 7-day average</li>
          <li><strong>Manual Rebalancing:</strong> You can trigger rebalancing anytime to optimize your allocation</li>
          <li><strong>Withdrawal:</strong> All assets are returned to your wallet immediately</li>
          <li><strong>Soroswap Integration:</strong> Asset swaps are executed through Soroswap for best liquidity</li>
        </ul>
      </div>
    </div>
  );
};

export default Actions;