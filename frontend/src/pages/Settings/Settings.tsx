import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import '../UserTools/UserTools.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address, chainId, user, switchToHederaTestnet, disconnectWallet } = useWallet();
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setMessage('Wallet address copied to clipboard.');
      setError('');
    } catch {
      setError('Could not copy address. Browser clipboard access may be restricted.');
      setMessage('');
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      setError('');
      setMessage('Switching network in wallet...');
      await switchToHederaTestnet();
      setMessage('Network switch request sent. Confirm it in MetaMask if prompted.');
    } catch {
      setError('Failed to switch network. Please switch to Hedera Testnet manually in wallet.');
      setMessage('');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  return (
    <div className="user-tools-page">
      <header className="user-tools-header">
        <div className="user-tools-header-container">
          <h1 className="user-tools-title">Settings</h1>
          <div className="user-tools-nav">
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </header>

      <main className="user-tools-main">
        <section className="user-tools-card">
          <h2>Wallet Preferences</h2>

          <div className="tool-grid">
            <div className="tool-stat">
              <span className="tool-label">Wallet Address</span>
              <span className="tool-value">{address || '-'}</span>
            </div>
            <div className="tool-stat">
              <span className="tool-label">Chain ID</span>
              <span className="tool-value">{chainId ?? '-'}</span>
            </div>
            <div className="tool-stat">
              <span className="tool-label">Connected At</span>
              <span className="tool-value">
                {user?.connectedAt ? new Date(user.connectedAt).toLocaleString() : '-'}
              </span>
            </div>
          </div>

          <div className="user-tools-actions">
            <button onClick={copyAddress}>Copy Address</button>
            <button onClick={handleSwitchNetwork}>Switch to Hedera Testnet</button>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>

          {message && <p className="tool-note">{message}</p>}
          {error && <p className="tool-error">{error}</p>}
        </section>
      </main>
    </div>
  );
};

export default Settings;