import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useLendingData, useContracts, useTokenBalances } from '@/hooks/useContracts';
import { decryptBalance } from '@/utils/fhe';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { useFHE } from '@/contexts/FHEContext';

export default function AssetsPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { isInitialized: fheInitialized, initFHE } = useFHE();
  const { stakedAmount, borrowedAmount, availableToBorrow } = useLendingData(['staked', 'borrowed', 'available']);
  const { cDogeBalance, cUSDTBalance, isLoading, errors } = useTokenBalances(['cDoge', 'cUSDT']);
  const { withdrawTokens } = useContracts();
  
  const [decryptedAmounts, setDecryptedAmounts] = useState<{
    staked?: string | null;
    borrowed?: string | null;
    available?: string | null;
    cDoge?: string | null;
    cUSDT?: string | null;
  }>({});
  
  const [decryptingAmounts, setDecryptingAmounts] = useState<{
    staked?: boolean;
    borrowed?: boolean;
    available?: boolean;
    cDoge?: boolean;
    cUSDT?: boolean;
  }>({});

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [message, setMessage] = useState('');

  const handleDecryptAmount = async (type: 'staked' | 'borrowed' | 'available' | 'cDoge' | 'cUSDT') => {
    if (!address || !walletClient) return;
    
    if (!fheInitialized) {
      alert('请先初始化FHE后再进行解密操作');
      return;
    }
    
    let ciphertext: string | undefined;
    let contractAddress: string;
    
    switch (type) {
      case 'staked':
        ciphertext = stakedAmount;
        contractAddress = CONTRACT_ADDRESSES.ZAMA_LEND;
        break;
      case 'borrowed':
        ciphertext = borrowedAmount;
        contractAddress = CONTRACT_ADDRESSES.ZAMA_LEND;
        break;
      case 'available':
        ciphertext = availableToBorrow;
        contractAddress = CONTRACT_ADDRESSES.ZAMA_LEND;
        break;
      case 'cDoge':
        ciphertext = cDogeBalance;
        contractAddress = CONTRACT_ADDRESSES.CDOGE;
        break;
      case 'cUSDT':
        ciphertext = cUSDTBalance;
        contractAddress = CONTRACT_ADDRESSES.CUSDT;
        break;
    }
    
    if (!ciphertext) return;

    setDecryptingAmounts(prev => ({ ...prev, [type]: true }));
    
    try {
      const decrypted = await decryptBalance(ciphertext, contractAddress, address, walletClient);
      setDecryptedAmounts(prev => ({ ...prev, [type]: decrypted }));
    } catch (error) {
      console.error(`Failed to decrypt ${type} amount:`, error);
      alert(`解密${type}余额失败，请确保FHE已正确初始化`);
    } finally {
      setDecryptingAmounts(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !address) return;

    try {
      setIsWithdrawing(true);
      setMessage('正在取款...');
      
      const amount = parseInt(withdrawAmount);
      await withdrawTokens(amount);
      
      setMessage('取款成功！');
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setMessage('取款失败，请重试');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2>我的资产</h2>
        <p>请连接您的钱包以查看资产和钱包余额</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Left Column - Wallet Balance */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div className="card" style={{ height: 'fit-content', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#4ade80' }}>💰 钱包余额</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              您的加密代币余额，点击解密查看明文
            </p>
        
            {/* FHE Not Initialized Warning */}
            {!fheInitialized && (
              <div style={{
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '4px',
                padding: '0.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: '#fbbf24', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  !
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#fbbf24', fontSize: '0.8rem' }}>需要初始化FHE</h4>
                  <p style={{ margin: '0', color: 'rgba(251, 191, 36, 0.8)', fontSize: '0.7rem' }}>
                    请先初始化加密系统，然后才能解密查看余额明文
                  </p>
                </div>
                <button
                  onClick={initFHE}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    backgroundColor: '#fbbf24',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  初始化
                </button>
              </div>
            )}
        
            {/* Show loading state */}
            {isLoading && (
              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                <p>正在加载余额...</p>
              </div>
            )}

            {/* Show errors if any */}
            {(errors.cDoge || errors.cUSDT) && (
              <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#ff4444', fontSize: '0.8rem' }}>加载错误</h4>
                {errors.cDoge && <p style={{ margin: '0.125rem 0', color: '#ff8888', fontSize: '0.7rem' }}>cDoge: {errors.cDoge.message}</p>}
                {errors.cUSDT && <p style={{ margin: '0.125rem 0', color: '#ff8888', fontSize: '0.7rem' }}>cUSDT: {errors.cUSDT.message}</p>}
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {/* cDoge Balance */}
              <div className="balance-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#fbbf24' }}>🟡 cDoge</h3>
                  <div className="balance-encrypted" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {cDogeBalance 
                      ? `${cDogeBalance.slice(0, 10)}...` 
                      : isLoading 
                        ? '加载中...' 
                        : errors.cDoge 
                          ? '加载失败' 
                          : '无余额'
                    }
                  </div>
                  {decryptedAmounts.cDoge !== undefined && (
                    <div className="balance-decrypted" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4ade80', marginTop: '0.25rem' }}>
                      💰 {decryptedAmounts.cDoge || '解密失败'}
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDecryptAmount('cDoge')}
                  disabled={!cDogeBalance || decryptingAmounts.cDoge || isLoading || !fheInitialized}
                  title={!fheInitialized ? '请先初始化FHE' : undefined}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', minWidth: '60px' }}
                >
                  {decryptingAmounts.cDoge ? '...' : '解密'}
                </button>
              </div>

              {/* cUSDT Balance */}
              <div className="balance-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#22d3ee' }}>🔵 cUSDT</h3>
                  <div className="balance-encrypted" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {cUSDTBalance 
                      ? `${cUSDTBalance.slice(0, 10)}...` 
                      : isLoading 
                        ? '加载中...' 
                        : errors.cUSDT 
                          ? '加载失败' 
                          : '无余额'
                    }
                  </div>
                  {decryptedAmounts.cUSDT !== undefined && (
                    <div className="balance-decrypted" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4ade80', marginTop: '0.25rem' }}>
                      💰 {decryptedAmounts.cUSDT || '解密失败'}
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDecryptAmount('cUSDT')}
                  disabled={!cUSDTBalance || decryptingAmounts.cUSDT || isLoading || !fheInitialized}
                  title={!fheInitialized ? '请先初始化FHE' : undefined}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', minWidth: '60px' }}
                >
                  {decryptingAmounts.cUSDT ? '...' : '解密'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Assets Overview */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#a78bfa' }}>📊 资产概览</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              质押、借贷和可用额度
            </p>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {/* Staked Amount */}
              <div className="stat-card" style={{ 
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', color: '#fbbf24' }}>🔒 质押的 cDoge</h3>
                  <div className="balance-encrypted" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {stakedAmount ? `${stakedAmount.slice(0, 10)}...` : '加载中...'}
                  </div>
                  {decryptedAmounts.staked !== undefined && (
                    <div className="stat-value" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4ade80', marginTop: '0.25rem' }}>
                      📈 {decryptedAmounts.staked || '解密失败'}
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDecryptAmount('staked')}
                  disabled={!stakedAmount || decryptingAmounts.staked}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', minWidth: '60px' }}
                >
                  {decryptingAmounts.staked ? '...' : '解密'}
                </button>
              </div>

              {/* Borrowed Amount */}
              <div className="stat-card" style={{ 
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', color: '#ef4444' }}>💳 借贷的 cUSDT</h3>
                  <div className="balance-encrypted" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {borrowedAmount ? `${borrowedAmount.slice(0, 10)}...` : '加载中...'}
                  </div>
                  {decryptedAmounts.borrowed !== undefined && (
                    <div className="stat-value" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4ade80', marginTop: '0.25rem' }}>
                      📉 {decryptedAmounts.borrowed || '解密失败'}
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDecryptAmount('borrowed')}
                  disabled={!borrowedAmount || decryptingAmounts.borrowed}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', minWidth: '60px' }}
                >
                  {decryptingAmounts.borrowed ? '...' : '解密'}
                </button>
              </div>

              {/* Available to Borrow */}
              {/* <div className="stat-card" style={{ 
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', color: '#22d3ee' }}>💎 可借贷额度</h3>
                  <div className="balance-encrypted" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {availableToBorrow ? `${availableToBorrow.slice(0, 10)}...` : '加载中...'}
                  </div>
                  {decryptedAmounts.available !== undefined && (
                    <div className="stat-value" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4ade80', marginTop: '0.25rem' }}>
                      🎯 {decryptedAmounts.available || '解密失败'} cUSDT
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDecryptAmount('available')}
                  disabled={!availableToBorrow || decryptingAmounts.available}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', minWidth: '60px' }}
                >
                  {decryptingAmounts.available ? '...' : '解密'}
                </button>
              </div> */}
            </div>

            {/* Withdrawal Section */}
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem',
              background: 'rgba(34, 211, 238, 0.1)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              borderRadius: '8px'
            }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#22d3ee' }}>💸 取款 cDoge</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                从质押中取出代币
              </p>

              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="输入要取款的数量"
                  min="0"
                  style={{ 
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white'
                  }}
                />
              </div>

              <button
                className="btn"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || isWithdrawing}
                style={{ 
                  width: '100%', 
                  fontSize: '0.85rem',
                  padding: '0.6rem',
                  backgroundColor: '#22d3ee',
                  color: '#0f172a'
                }}
              >
                {isWithdrawing ? '取款中...' : '确认取款'}
              </button>

              {message && (
                <div className={`${message.includes('失败') ? 'error' : 'success'}`} style={{ 
                  marginTop: '0.5rem',
                  fontSize: '0.8rem'
                }}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Info Panel */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ fontSize: '0.9rem', color: '#a78bfa', marginBottom: '0.5rem' }}>ℹ️ 功能说明</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div>• <strong>钱包余额</strong>：您的 cDoge 和 cUSDT 加密余额</div>
          <div>• <strong>质押资产</strong>：已质押到协议中的 cDoge 数量</div>
          <div>• <strong>借贷金额</strong>：当前借贷的 cUSDT 数量</div>
          <div>• <strong>可借贷额度</strong>：基于质押资产的剩余借贷额度</div>
          <div>• <strong>安全规则</strong>：取款时确保借贷比例不超过 50%</div>
          <div>• <strong>隐私保护</strong>：所有金额都是加密存储的</div>
        </div>
      </div>
    </div>
  );
}