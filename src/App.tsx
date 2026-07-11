import { useState } from 'react';
import { createClient, createAccount } from 'genlayer-js';
import './index.css';

const account = createAccount('0x1111111111111111111111111111111111111111111111111111111111111111');
const client = createClient({
  endpoint: '/api/rpc',
  account: account,
});

function App() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x7A3d9650E630762e34687b69DA7452a4f3a0526E';

  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState('');
  
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState('');
  const [claimError, setClaimError] = useState(false);

  // Form states
  const [issueUrl, setIssueUrl] = useState('https://github.com/facebook/react/issues/28795');
  const [minScore, setMinScore] = useState(75);
  const [rewardAmount, setRewardAmount] = useState(1000);

  const [bountyId, setBountyId] = useState('1');
  const [prUrl, setPrUrl] = useState('https://github.com/facebook/react/pull/28796');
  const [contributor, setContributor] = useState('0x2222222222222222222222222222222222222222');

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult('Creating real bounty on GenLayer... (Funding 1000 Tokens)');
    
    try {
      const res = await client.writeContract({
        address: contractAddress,
        functionName: 'create_bounty',
        args: [issueUrl, minScore],
        value: BigInt(rewardAmount)
      });
      setCreateResult(`Success! Bounty created on GenLayer. (Tx: ${res.result})`);
    } catch (err: any) {
      setCreateResult(`Error: ${err.message}`);
    }
    setCreateLoading(false);
  };

  const handleClaimBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimResult('Triggering GenVM AI to evaluate code. Please wait (15-30s)...');
    setClaimError(false);
    
    try {
      const res = await client.writeContract({
        address: contractAddress,
        functionName: 'claim_bounty',
        args: [bountyId, prUrl, contributor]
      });
      setClaimResult(`Evaluation Complete! If score passed, funds were transferred via gl.transfer(). Tx: ${res.result}`);
    } catch (err: any) {
      setClaimError(true);
      setClaimResult(`Error: ${err.message}`);
    }
    setClaimLoading(false);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>GitAegis (Real dApp)</h1>
        <p>Intelligent Bounty System on GenLayer</p>
        <div className="contract-badge">
          Contract: {contractAddress}
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="panel-title"><span>✦</span> Create Bounty (Lock Funds)</h2>
        <form onSubmit={handleCreateBounty}>
          <div className="input-group">
            <label>GitHub Issue URL</label>
            <input type="url" required value={issueUrl} onChange={e => setIssueUrl(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Reward Amount (Tokens)</label>
              <input type="number" required value={rewardAmount} onChange={e => setRewardAmount(Number(e.target.value))} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Min Quality Score (1-100)</label>
              <input type="number" step="1" required value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={createLoading}>
            {createLoading ? <div className="loader"></div> : 'Create Bounty & Lock Funds'}
          </button>
        </form>
        {createResult && (
          <div className="result-box">
            {createResult}
          </div>
        )}
      </div>

      <div className="glass-panel">
        <h2 className="panel-title"><span>🤖</span> Claim Bounty (AI Code Review)</h2>
        <form onSubmit={handleClaimBounty}>
          <div className="input-group">
            <label>Bounty ID</label>
            <input type="text" required value={bountyId} onChange={e => setBountyId(e.target.value)} />
          </div>
          <div className="input-group">
            <label>GitHub Pull Request URL</label>
            <input type="url" required value={prUrl} onChange={e => setPrUrl(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Contributor Address</label>
            <input type="text" required value={contributor} onChange={e => setContributor(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={claimLoading}>
            {claimLoading ? <div className="loader"></div> : 'Submit Code & Trigger AI Payout'}
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
