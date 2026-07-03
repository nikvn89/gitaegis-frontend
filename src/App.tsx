import { useState } from 'react';
import './index.css';

function App() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || 'Contract Address Not Found';

  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState('');
  
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState('');
  const [claimError, setClaimError] = useState(false);

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult('');
    
    // Simulate Blockchain Network Delay (2s)
    setTimeout(() => {
      setCreateLoading(false);
      setCreateResult('Success! Bounty ID: #1 has been created on GenLayer.');
    }, 2000);
  };

  const handleClaimBounty = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimResult('');
    setClaimError(false);
    
    // Simulate GenLayer AI Validator Delay (4s)
    setTimeout(() => {
      setClaimLoading(false);
      // Simulate AI Result
      const isSuccess = Math.random() > 0.3; // 70% success rate
      
      if (isSuccess) {
        setClaimResult('Success: Funds disbursed! (AI: "High-quality code, correctly resolves the requested Issue. Score: 8.5/10")');
      } else {
        setClaimError(true);
        setClaimResult('Failed: Requirements not met. (AI: "Pull Request does not address the core of the Issue. Score: 4.0/10")');
      }
    }, 4000);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>GitAegis</h1>
        <p>Intelligent Bounty System on GenLayer</p>
        <div className="contract-badge">
          Contract: {contractAddress}
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="panel-title"><span>✦</span> Create Bounty</h2>
        <form onSubmit={handleCreateBounty}>
          <div className="input-group">
            <label>Maintainer Address</label>
            <input type="text" placeholder="0x..." required defaultValue="0xAdmin" />
          </div>
          <div className="input-group">
            <label>GitHub Issue URL</label>
            <input type="url" placeholder="https://github.com/..." required defaultValue="https://github.com/facebook/react/issues/28795" />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Reward Amount (Tokens)</label>
              <input type="number" placeholder="1000" required defaultValue="1000" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Min Quality Score (1-10)</label>
              <input type="number" step="0.1" placeholder="7.5" required defaultValue="7.5" />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={createLoading}>
            {createLoading ? <div className="loader"></div> : 'Create Bounty'}
          </button>
        </form>
        {createResult && (
          <div className="result-box">
            {createResult}
          </div>
        )}
      </div>

      <div className="glass-panel">
        <h2 className="panel-title"><span>🤖</span> Claim Bounty (AI Evaluation)</h2>
        <form onSubmit={handleClaimBounty}>
          <div className="input-group">
            <label>Bounty ID</label>
            <input type="text" placeholder="1" required defaultValue="1" />
          </div>
          <div className="input-group">
            <label>GitHub Pull Request URL</label>
            <input type="url" placeholder="https://github.com/..." required defaultValue="https://github.com/facebook/react/pull/28796" />
          </div>
          <div className="input-group">
            <label>Contributor Address</label>
            <input type="text" placeholder="0x..." required defaultValue="0xDev" />
          </div>
          <button type="submit" className="btn-primary" disabled={claimLoading}>
            {claimLoading ? <div className="loader"></div> : 'Submit Code & Await AI Evaluation'}
          </button>
        </form>
        {claimResult && (
          <div className={`result-box ${claimError ? 'error' : ''}`}>
            {claimResult}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
