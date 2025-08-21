import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useBalances, useContracts } from '@/hooks/useContracts';
import { decryptBalance } from '@/utils/fhe';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';

export default function AssetsPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { stakedAmount, borrowedAmount, availableToBorrow } = useBalances();
  const { withdrawTokens } = useContracts();
  
  const [decryptedAmounts, setDecryptedAmounts] = useState<{
    staked?: string | null;
    borrowed?: string | null;
    available?: string | null;
  }>({});
  
  const [decryptingAmounts, setDecryptingAmounts] = useState<{
    staked?: boolean;
    borrowed?: boolean;
    available?: boolean;
  }>({});

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [message, setMessage] = useState('');

  const handleDecryptAmount = async (type: 'staked' | 'borrowed' | 'available') => {
    if (!address || !walletClient) return;
    
    let ciphertext: string | undefined;
    switch (type) {
      case 'staked':
        ciphertext = stakedAmount;
        break;
      case 'borrowed':
        ciphertext = borrowedAmount;
        break;
      case 'available':
        ciphertext = availableToBorrow;
        break;
    }
    
    if (!ciphertext) return;

    setDecryptingAmounts(prev => ({ ...prev, [type]: true }));
    
    try {
      const decrypted = await decryptBalance(
        ciphertext, 
        CONTRACT_ADDRESSES.ZAMA_LEND, 
        address, 
        walletClient
      );
      setDecryptedAmounts(prev => ({ ...prev, [type]: decrypted }));
    } catch (error) {
      console.error(`Failed to decrypt ${type} amount:`, error);
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
        <p>请连接您的钱包以查看资产</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2>我的资产</h2>
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
          <h3>资产说明</h3>
          <ul style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
            <li>质押的 cDoge: 您已质押到协议中的 cDoge 数量</li>
            <li>借贷的 cUSDT: 您当前借贷的 cUSDT 数量</li>
            <li>可借贷额度: 基于您质押资产计算的剩余借贷额度</li>
            <li>取款时需要确保借贷比例不超过 50%</li>
            <li>所有金额都是加密存储的，只有您可以解密查看</li>
          </ul>
        </div>
      </div>
    </div>
  );
}