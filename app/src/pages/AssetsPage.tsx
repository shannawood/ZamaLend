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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Wallet Balance Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>钱包余额</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          您的加密代币余额，点击解密按钮查看明文余额
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
                请先点击右上角的 "Init FHE" 按钮初始化加密系统，然后才能解密查看余额明文
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
        
        {/* Show loading state */}
        {isLoading && (
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
            <p>正在加载余额...</p>
          </div>
        )}

        {/* Show errors if any */}
        {(errors.cDoge || errors.cUSDT) && (
          <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ff4444' }}>加载错误</h4>
            {errors.cDoge && <p style={{ margin: '0.25rem 0', color: '#ff8888' }}>cDoge: {errors.cDoge.message}</p>}
            {errors.cUSDT && <p style={{ margin: '0.25rem 0', color: '#ff8888' }}>cUSDT: {errors.cUSDT.message}</p>}
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* cDoge Balance */}
          <div className="balance-item">
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>cDoge 余额</h3>
              <div className="balance-encrypted">
                加密: {
                  cDogeBalance 
                    ? `${cDogeBalance.slice(0, 10)}...` 
                    : isLoading 
                      ? '加载中...' 
                      : errors.cDoge 
                        ? '加载失败' 
                        : '无余额'
                }
              </div>
              {decryptedAmounts.cDoge !== undefined && (
                <div className="balance-decrypted">
                  解密: {decryptedAmounts.cDoge || '解密失败'}
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptAmount('cDoge')}
              disabled={!cDogeBalance || decryptingAmounts.cDoge || isLoading || !fheInitialized}
              title={!fheInitialized ? '请先初始化FHE' : undefined}
            >
              {decryptingAmounts.cDoge ? '解密中...' : '解密'}
            </button>
          </div>

          {/* cUSDT Balance */}
          <div className="balance-item">
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>cUSDT 余额</h3>
              <div className="balance-encrypted">
                加密: {
                  cUSDTBalance 
                    ? `${cUSDTBalance.slice(0, 10)}...` 
                    : isLoading 
                      ? '加载中...' 
                      : errors.cUSDT 
                        ? '加载失败' 
                        : '无余额'
                }
              </div>
              {decryptedAmounts.cUSDT !== undefined && (
                <div className="balance-decrypted">
                  解密: {decryptedAmounts.cUSDT || '解密失败'}
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptAmount('cUSDT')}
              disabled={!cUSDTBalance || decryptingAmounts.cUSDT || isLoading || !fheInitialized}
              title={!fheInitialized ? '请先初始化FHE' : undefined}
            >
              {decryptingAmounts.cUSDT ? '解密中...' : '解密'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            💡 提示：您的余额在区块链上是加密存储的，只有您可以解密查看
          </p>
        </div>
      </div>

      {/* Assets Overview Section */}
      <div className="card">
        <h2>资产概览</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          查看您的质押资产和借贷情况
        </p>

        <div className="stats-grid">
          {/* Staked Amount */}
          <div className="stat-card">
            <h3>质押的 cDoge</h3>
            <div className="balance-encrypted">
              加密: {stakedAmount ? `${stakedAmount.slice(0, 10)}...` : '加载中...'}
            </div>
            {decryptedAmounts.staked !== undefined && (
              <div className="stat-value">
                {decryptedAmounts.staked || '解密失败'}
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptAmount('staked')}
              disabled={!stakedAmount || decryptingAmounts.staked}
              style={{ marginTop: '1rem' }}
            >
              {decryptingAmounts.staked ? '解密中...' : '解密'}
            </button>
          </div>

          {/* Borrowed Amount */}
          <div className="stat-card">
            <h3>借贷的 cUSDT</h3>
            <div className="balance-encrypted">
              加密: {borrowedAmount ? `${borrowedAmount.slice(0, 10)}...` : '加载中...'}
            </div>
            {decryptedAmounts.borrowed !== undefined && (
              <div className="stat-value">
                {decryptedAmounts.borrowed || '解密失败'}
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptAmount('borrowed')}
              disabled={!borrowedAmount || decryptingAmounts.borrowed}
              style={{ marginTop: '1rem' }}
            >
              {decryptingAmounts.borrowed ? '解密中...' : '解密'}
            </button>
          </div>

          {/* Available to Borrow */}
          <div className="stat-card">
            <h3>可借贷额度</h3>
            <div className="balance-encrypted">
              加密: {availableToBorrow ? `${availableToBorrow.slice(0, 10)}...` : '加载中...'}
            </div>
            {decryptedAmounts.available !== undefined && (
              <div className="stat-value">
                {decryptedAmounts.available || '解密失败'} cUSDT
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptAmount('available')}
              disabled={!availableToBorrow || decryptingAmounts.available}
              style={{ marginTop: '1rem' }}
            >
              {decryptingAmounts.available ? '解密中...' : '解密'}
            </button>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(255, 255, 255, 0.05)' }}>
          <h3>取款 cDoge</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            从质押中取出您的 cDoge 代币
          </p>

          <div className="input-group">
            <label htmlFor="withdrawAmount">取款数量</label>
            <input
              id="withdrawAmount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="输入要取款的 cDoge 数量"
              min="0"
            />
          </div>

          <button
            className="btn"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || isWithdrawing}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isWithdrawing ? '取款中...' : '取款'}
          </button>

          {message && (
            <div className={`${message.includes('失败') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h3>功能说明</h3>
          <ul style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
            <li><strong>钱包余额</strong>：显示您在钱包中的 cDoge 和 cUSDT 加密余额</li>
            <li><strong>质押的 cDoge</strong>：您已质押到协议中的 cDoge 数量</li>
            <li><strong>借贷的 cUSDT</strong>：您当前借贷的 cUSDT 数量</li>
            <li><strong>可借贷额度</strong>：基于您质押资产计算的剩余借贷额度</li>
            <li>取款时需要确保借贷比例不超过 50%</li>
            <li>所有金额都是加密存储的，只有您可以解密查看</li>
          </ul>
        </div>
      </div>
    </div>
  );
}