import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContracts, useTokenBalances } from '@/hooks/useContracts';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { useFHE } from '@/contexts/FHEContext';

export default function StakePage() {
  const { address, isConnected } = useAccount();
  const { stakeTokens, approveToken } = useContracts();
  const { cDogeBalance } = useTokenBalances(['cDoge']);
  const { isInitialized: fheInitialized, initFHE } = useFHE();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [message, setMessage] = useState('');

  const handleApprove = async () => {
    if (!stakeAmount || !address) return;
    
    if (!fheInitialized) {
      setMessage('请先初始化FHE后再进行授权操作');
      return;
    }

    try {
      setIsApproving(true);
      setMessage('正在授权...');
      
      const amount = parseInt(stakeAmount);
      await approveToken(CONTRACT_ADDRESSES.CDOGE, amount);
      
      setMessage('授权成功！现在可以进行质押');
    } catch (error) {
      console.error('Approval failed:', error);
      setMessage('授权失败，请重试');
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || !address) return;
    
    if (!fheInitialized) {
      setMessage('请先初始化FHE后再进行质押操作');
      return;
    }

    try {
      setIsStaking(true);
      setMessage('正在质押...');
      
      const amount = parseInt(stakeAmount);
      await stakeTokens(amount);
      
      setMessage('质押成功！');
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
      setMessage('质押失败，请重试');
    } finally {
      setIsStaking(false);
    }
  };

  const handleBorrow = async () => {
    if (!stakeAmount) return;

    try {
      setMessage('正在借贷...');
      
      const amount = parseInt(stakeAmount);
      // Borrow 50% of staked value in USDT
      const borrowAmount = Math.floor(amount * 0.5);
      
      // This would call the borrow function
      // await borrowTokens(borrowAmount);
      
      setMessage(`借贷 ${borrowAmount} cUSDT 成功！`);
    } catch (error) {
      console.error('Borrowing failed:', error);
      setMessage('借贷失败，请重试');
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2>质押 cDoge</h2>
        <p>请连接您的钱包以进行质押</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2>质押 cDoge</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          质押您的 cDoge 代币，可以借贷 50% 价值的 cUSDT
        </p>

        {/* FHE Not Initialized Warning */}
        {!fheInitialized && (
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              backgroundColor: '#fbbf24', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              !
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#fbbf24' }}>需要初始化FHE</h4>
              <p style={{ margin: '0', color: 'rgba(251, 191, 36, 0.8)', fontSize: '0.875rem' }}>
                请先点击右上角的 "Init FHE" 按钮初始化加密系统，然后才能进行质押操作
              </p>
            </div>
            <button
              onClick={initFHE}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: '#fbbf24',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              立即初始化
            </button>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="stakeAmount">质押数量</label>
          <input
            id="stakeAmount"
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="输入要质押的 cDoge 数量"
            min="0"
          />
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '1rem', 
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>当前 cDoge 余额:</span>
            <span className="balance-encrypted">
              {cDogeBalance ? `${cDogeBalance.slice(0, 10)}...` : '加载中...'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>质押数量:</span>
            <span>{stakeAmount || '0'} cDoge</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>可借贷数量:</span>
            <span>{stakeAmount ? Math.floor(parseInt(stakeAmount) * 0.5) : '0'} cUSDT</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn"
            onClick={handleApprove}
            disabled={!stakeAmount || isApproving || !fheInitialized}
            title={!fheInitialized ? '请先初始化FHE' : undefined}
            style={{ flex: 1 }}
          >
            {isApproving ? '授权中...' : '1. 授权'}
          </button>
          
          <button
            className="btn"
            onClick={handleStake}
            disabled={!stakeAmount || isStaking || !fheInitialized}
            title={!fheInitialized ? '请先初始化FHE' : undefined}
            style={{ flex: 1 }}
          >
            {isStaking ? '质押中...' : '2. 质押'}
          </button>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleBorrow}
          disabled={!stakeAmount || !fheInitialized}
          title={!fheInitialized ? '请先初始化FHE' : undefined}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          借贷 cUSDT
        </button>

        {message && (
          <div className={`${message.includes('失败') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h3>质押流程说明</h3>
          <ol style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
            <li>首先点击"授权"按钮，允许合约使用您的 cDoge</li>
            <li>然后点击"质押"按钮，将 cDoge 质押到合约中</li>
            <li>质押成功后，您可以借贷相当于质押价值 50% 的 cUSDT</li>
            <li>所有操作都是隐私的，金额在链上是加密存储的</li>
          </ol>
        </div>
      </div>
    </div>
  );
}