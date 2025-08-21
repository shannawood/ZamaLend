import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContracts, useTokenBalances } from '@/hooks/useContracts';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { useFHE } from '@/contexts/FHEContext';
import { encryptValue } from '@/utils/fhe';

export default function StakePage() {
  const { address, isConnected, status } = useAccount();
  const { stakeTokens, borrowTokens, approveToken } = useContracts();
  const { cDogeBalance } = useTokenBalances(['cDoge']);
  const { isInitialized: fheInitialized, initFHE, error: fheError, isInitializing } = useFHE();
  
  console.log('🔍 StakePage render:', { 
    address, 
    isConnected, 
    status, 
    fheInitialized, 
    fheError,
    isInitializing
  });
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [message, setMessage] = useState('');
  const [testingEncryption, setTestingEncryption] = useState(false);

  const handleApprove = async () => {
    if (!stakeAmount || !address) return;
    
    if (!fheInitialized) {
      setMessage('请先初始化FHE后再进行授权操作');
      return;
    }

    try {
      setIsApproving(true);
      setMessage('正在授权...');
      
      // const amount = parseInt(stakeAmount);
      await approveToken(CONTRACT_ADDRESSES.CDOGE);
      
      setMessage('授权成功！现在可以进行质押');
    } catch (error) {
      console.error('Approval failed:', error);
      setMessage('授权失败，请重试');
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    console.log('🎯 handleStake called');
    
    if (!stakeAmount || !address) {
      console.log('❌ Missing stakeAmount or address:', { stakeAmount, address });
      return;
    }
    
    if (!fheInitialized) {
      console.log('❌ FHE not initialized');
      setMessage('请先初始化FHE后再进行质押操作');
      return;
    }

    console.log('✅ Starting stake process with amount:', stakeAmount);

    try {
      setIsStaking(true);
      setMessage('正在质押...');
      
      const amount = parseInt(stakeAmount)*1000000;
      console.log('📊 Parsed amount:', amount);
      console.log('🔐 About to call stakeTokens function...');
      
      const result = await stakeTokens(amount);
      console.log('✅ stakeTokens result:', result);
      
      setMessage('质押成功！');
      setStakeAmount('');
      console.log('✅ Staking completed successfully');
    } catch (error) {
      console.error('❌ Staking failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      setMessage(`质押失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsStaking(false);
      console.log('🏁 handleStake completed');
    }
  };

  const handleBorrow = async () => {
    if (!stakeAmount) return;
    
    if (!fheInitialized) {
      setMessage('请先初始化FHE后再进行借贷操作');
      return;
    }

    try {
      setMessage('正在借贷...');
      
      const amount = parseInt(stakeAmount);
      // Borrow 50% of staked value in USDT
      const borrowAmount = Math.floor(amount * 0.5);
      
      await borrowTokens(borrowAmount);
      
      setMessage(`借贷 ${borrowAmount} cUSDT 成功！`);
    } catch (error) {
      console.error('Borrowing failed:', error);
      setMessage('借贷失败，请重试');
    }
  };

  const testEncryption = async () => {
    if (!address || !fheInitialized) {
      setMessage('请先连接钱包并初始化FHE');
      return;
    }

    setTestingEncryption(true);
    try {
      console.log('🧪 Testing encryption...');
      const testValue = 100;
      const encrypted = await encryptValue(testValue, CONTRACT_ADDRESSES.ZAMA_LEND, address);
      console.log('✅ Encryption test successful:', encrypted);
      setMessage(`加密测试成功！测试值: ${testValue}`);
    } catch (error) {
      console.error('❌ Encryption test failed:', error);
      setMessage(`加密测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTestingEncryption(false);
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
      {/* Debug Info Panel */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        fontFamily: 'monospace'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64b5f6' }}>🔍 调试信息</h4>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          <div>钱包状态: <span style={{ color: isConnected ? '#4caf50' : '#f44336' }}>{status}</span></div>
          <div>地址: <span style={{ color: '#64b5f6' }}>{address || 'None'}</span></div>
          <div>FHE初始化: <span style={{ color: fheInitialized ? '#4caf50' : '#f44336' }}>{fheInitialized ? '✅ 已完成' : (isInitializing ? '⏳ 进行中' : '❌ 未完成')}</span></div>
          {fheError && <div>FHE错误: <span style={{ color: '#f44336' }}>{fheError}</span></div>}
          <div>cDoge余额: <span style={{ color: '#ffb74d' }}>{cDogeBalance || 'Loading...'}</span></div>
        </div>
      </div>

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

        {/* Test Encryption Button */}
        <button
          className="btn"
          onClick={testEncryption}
          disabled={!fheInitialized || testingEncryption}
          style={{ 
            width: '100%', 
            marginTop: '0.5rem', 
            backgroundColor: '#ff9800',
            fontSize: '0.875rem'
          }}
        >
          {testingEncryption ? '🧪 测试中...' : '🧪 测试加密功能'}
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