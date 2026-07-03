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
    
    // Giả lập độ trễ mạng lưới Blockchain (2s)
    setTimeout(() => {
      setCreateLoading(false);
      setCreateResult('Thành công! Bounty ID: #1 đã được tạo trên GenLayer.');
    }, 2000);
  };

  const handleClaimBounty = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimResult('');
    setClaimError(false);
    
    // Giả lập độ trễ gọi AI Validator của GenLayer (8s)
    setTimeout(() => {
      setClaimLoading(false);
      // Giả lập kết quả trả về từ AI
      const isSuccess = Math.random() > 0.3; // 70% tỉ lệ thành công
      
      if (isSuccess) {
        setClaimResult('Success: Đã giải ngân! (AI: "Code chất lượng tốt, xử lý đúng Issue yêu cầu. Điểm: 8.5/10")');
      } else {
        setClaimError(true);
        setClaimResult('Failed: Chưa đạt yêu cầu. (AI: "Pull Request không giải quyết đúng trọng tâm của Issue. Điểm: 4.0/10")');
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
            {createLoading ? <div className="loader"></div> : 'Tạo Bounty'}
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
            {claimLoading ? <div className="loader"></div> : 'Nộp Code & Chờ AI Chấm'}
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
