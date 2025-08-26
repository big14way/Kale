import React, { useState, useEffect } from 'react';
import { stellarUtils } from '../utils/stellar-simple';
import CONFIG, { RiskProfile as RiskProfileType } from '../utils/config';

interface RiskProfileProps {
  walletAddress: string | null;
  currentRiskLevel: number | null;
  onSuccess?: () => void;
}

const RiskProfile: React.FC<RiskProfileProps> = ({ 
  walletAddress, 
  currentRiskLevel, 
  onSuccess 
}) => {
  const [selectedRisk, setSelectedRisk] = useState<number>(currentRiskLevel || 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentRiskLevel) {
      setSelectedRisk(currentRiskLevel);
    }
  }, [currentRiskLevel]);

  const handleRiskChange = async (): Promise<void> => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (selectedRisk === currentRiskLevel) {
      setError('Please select a different risk level');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await stellarUtils.setRisk(walletAddress, selectedRisk);
      
      if (result.status === 'SUCCESS') {
        const riskName = CONFIG.RISK_PROFILES[selectedRisk].name;
        setSuccess(`Risk profile updated to ${riskName}!`);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Risk profile update failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to update risk profile');
    } finally {
      setLoading(false);
    }
  };

  const getRiskProfileCard = (riskLevel: number): React.JSX.Element => {
    const profile: RiskProfileType = CONFIG.RISK_PROFILES[riskLevel];
    const isSelected = selectedRisk === riskLevel;
    const isCurrent = currentRiskLevel === riskLevel;

    return (
      <div 
        key={riskLevel}
        className={`risk-card ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
        onClick={() => setSelectedRisk(riskLevel)}
      >
        <div className="risk-header">
          <h4>{profile.name}</h4>
          {isCurrent && <span className="current-badge">Current</span>}
        </div>
        
        <div className="allocation-chart">
          <div className="allocation-bar">
            <div 
              className="allocation-segment usdc"
              style={{ width: `${profile.allocation.usdc}%` }}
              title={`USDC: ${profile.allocation.usdc}%`}
            />
            <div 
              className="allocation-segment btc"
              style={{ width: `${profile.allocation.btc}%` }}
              title={`BTC: ${profile.allocation.btc}%`}
            />
            <div 
              className="allocation-segment kale"
              style={{ width: `${profile.allocation.kale}%` }}
              title={`KALE: ${profile.allocation.kale}%`}
            />
          </div>
        </div>

        <div className="allocation-details">
          <div className="allocation-item">
            <span className="asset-color usdc"></span>
            <span>USDC: {profile.allocation.usdc}%</span>
          </div>
          <div className="allocation-item">
            <span className="asset-color btc"></span>
            <span>BTC: {profile.allocation.btc}%</span>
          </div>
          <div className="allocation-item">
            <span className="asset-color kale"></span>
            <span>KALE: {profile.allocation.kale}%</span>
          </div>
        </div>

        <div className="risk-description">
          {riskLevel === 1 && (
            <p>Lower volatility, stable returns. Ideal for preserving capital.</p>
          )}
          {riskLevel === 2 && (
            <p>Balanced approach with moderate risk and potential returns.</p>
          )}
          {riskLevel === 3 && (
            <p>Higher risk, higher potential returns. For experienced investors.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="risk-profile-section">
      <h3>⚖️ Risk Profile</h3>
      
      <div className="risk-profiles">
        {[1, 2, 3].map(getRiskProfileCard)}
      </div>

      {selectedRisk !== currentRiskLevel && (
        <button 
          className="update-risk-btn"
          onClick={handleRiskChange}
          disabled={loading || !walletAddress}
        >
          {loading ? (
            <span>
              <span className="spinner">⟳</span> Updating...
            </span>
          ) : (
            `Update to ${CONFIG.RISK_PROFILES[selectedRisk].name}`
          )}
        </button>
      )}

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
          <span>ℹ️ Connect your wallet to change risk profile</span>
        </div>
      )}

      <div className="risk-info">
        <h4>How Risk Profiles Work</h4>
        <ul>
          <li><strong>Conservative:</strong> Focus on stability with majority in USDC</li>
          <li><strong>Moderate:</strong> Balanced allocation across all assets</li>
          <li><strong>Aggressive:</strong> Higher exposure to volatile assets like BTC and KALE</li>
        </ul>
        <p>The system will automatically rebalance when KALE price moves more than 10% from the 7-day average.</p>
      </div>
    </div>
  );
};

export default RiskProfile;