import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useFractionalTokenContract } from '../../hooks/useFractionalTokenContract';
import { useContractAddresses } from '../../hooks/useContractAddresses';
import '../UserTools/UserTools.css';

const Assets: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { addresses } = useContractAddresses();
  const fractionalToken = useFractionalTokenContract();

  const [assetIdInput, setAssetIdInput] = React.useState('1');
  const [balance, setBalance] = React.useState<bigint | null>(null);
  const [totalShares, setTotalShares] = React.useState<bigint | null>(null);
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  const loadAssetData = async () => {
    if (!address) return;

    if (!addresses.fractionalToken) {
      setError('Fractional token address is not configured. Set it in Admin first.');
      return;
    }

    const parsedId = Number(assetIdInput);
    if (!Number.isInteger(parsedId) || parsedId < 0) {
      setError('Asset ID must be a valid non-negative number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [userBalance, shares] = await Promise.all([
        fractionalToken.balanceOf(address, parsedId),
        fractionalToken.totalShares(parsedId),
      ]);
      setBalance(userBalance);
      setTotalShares(shares);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch token balances. Verify contract address and network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-tools-page">
      <header className="user-tools-header">
        <div className="user-tools-header-container">
          <h1 className="user-tools-title">Your Assets</h1>
          <div className="user-tools-nav">
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </header>

      <main className="user-tools-main">
        <section className="user-tools-card">
          <h2>Check Fractional Ownership</h2>

          <div className="user-tools-form">
            <input
              type="number"
              min="0"
              value={assetIdInput}
              onChange={(e) => setAssetIdInput(e.target.value)}
              placeholder="Enter asset ID"
            />
            <button onClick={loadAssetData} disabled={loading}>
              {loading ? 'Loading...' : 'Load Balances'}
            </button>
          </div>

          <div className="tool-grid">
            <div className="tool-stat">
              <span className="tool-label">Wallet</span>
              <span className="tool-value">{address || 'Not connected'}</span>
            </div>
            <div className="tool-stat">
              <span className="tool-label">Owned Shares</span>
              <span className="tool-value">{balance !== null ? balance.toString() : '-'}</span>
            </div>
            <div className="tool-stat">
              <span className="tool-label">Total Shares</span>
              <span className="tool-value">{totalShares !== null ? totalShares.toString() : '-'}</span>
            </div>
          </div>

          {error && <p className="tool-error">{error}</p>}
          <p className="tool-note">
            This view reads directly from the FractionalToken contract for the selected asset ID.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Assets;