import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContracts, useLendingData } from '@/hooks/useContracts';
import { useFHE } from '@/contexts/FHEContext';

export default function LendingPage() {
  const { address, isConnected } = useAccount();
  const { borrowTokens } = useContracts();
  const { availableToBorrow } = useLendingData(['available']);
  const { isInitialized: fheInitialized, initFHE } = useFHE();
  
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [message, setMessage] = useState('');

  const handleBorrow = async () => {
    if (!borrowAmount || !address) return;
    
    if (!fheInitialized) {
      setMessage('请先初始化FHE后再进行借贷操作');
      return;
    }

    try {
      setIsBorrowing(true);
      setMessage('正在借贷...');
      
      const amount = parseInt(borrowAmount) * 1000000;
      await borrowTokens(amount);
      
      setMessage(`借贷 ${borrowAmount} cUSDT 成功！`);
      setBorrowAmount('');
    } catch (error) {
      console.error('Borrowing failed:', error);
      setMessage(`借贷失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsBorrowing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2>借贷 cUSDT</h2>
        <p>请连接您的钱包以进行借贷</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2>借贷 cUSDT</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          基于您的质押资产借贷 cUSDT，最多可借贷质押价值的 50%
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
                请先点击右上角的 "Init FHE" 按钮初始化加密系统，然后才能进行借贷操作
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

        {/* Available to Borrow Display */}
        <div style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#22c55e' }}>可借贷额度</h3>
          <div className="balance-encrypted" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            加密余额: {availableToBorrow ? `${availableToBorrow.slice(0, 10)}...` : '加载中...'}
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'rgba(34, 197, 94, 0.8)' }}>
            💡 这是基于您的质押资产计算出的最大可借贷金额
          </p>
        </div>

        <div className="input-group">
          <label htmlFor="borrowAmount">借贷数量</label>
          <input
            id="borrowAmount"
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="输入要借贷的 cUSDT 数量"
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
            <span>借贷数量:</span>
            <span>{borrowAmount || '0'} cUSDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>借贷利率:</span>
            <span style={{ color: '#22c55e' }}>0% (测试版)</span>
          </div>
        </div>

        <button
          className="btn"
          onClick={handleBorrow}
          disabled={!borrowAmount || isBorrowing || !fheInitialized}
          title={!fheInitialized ? '请先初始化FHE' : undefined}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          {isBorrowing ? '借贷中...' : '借贷 cUSDT'}
        </button>

        {message && (
          <div className={`${message.includes('失败') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h3>借贷说明</h3>
          <ul style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
            <li>您最多可以借贷质押资产价值的 50%</li>
            <li>借贷的 cUSDT 会直接发送到您的钱包</li>
            <li>当前测试版本无需支付利息</li>
            <li>请确保您已经质押了足够的 cDoge 作为抵押</li>
            <li>借贷金额是加密的，只有您可以查看具体数量</li>
            <li>您可以在还款页面随时还款 cUSDT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}