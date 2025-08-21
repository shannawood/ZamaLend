import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useTokenBalances, useLendingData, useContracts } from '@/hooks/useContracts';
import { decryptBalance } from '@/utils/fhe';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';

export default function RepayPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { cUSDTBalance } = useTokenBalances(['cUSDT']);
  const { borrowedAmount } = useLendingData(['borrowed']);
  const { repayTokens, approveToken } = useContracts();
  
  const [decryptedAmounts, setDecryptedAmounts] = useState<{
    borrowed?: string | null;
    balance?: string | null;
  }>({});
  
  const [decryptingAmounts, setDecryptingAmounts] = useState<{
    borrowed?: boolean;
    balance?: boolean;
  }>({});

  const [repayAmount, setRepayAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [message, setMessage] = useState('');

  const handleDecryptAmount = async (type: 'borrowed' | 'balance') => {
    if (!address || !walletClient) return;
    
    let ciphertext: string | undefined;
    let contractAddress: string;
    
    switch (type) {
      case 'borrowed':
        ciphertext = borrowedAmount;
        contractAddress = CONTRACT_ADDRESSES.ZAMA_LEND;
        break;
      case 'balance':
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
    } finally {
      setDecryptingAmounts(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleApprove = async () => {
    if (!repayAmount || !address) return;

    try {
      setIsApproving(true);
      setMessage('正在授权...');
      
      const amount = parseInt(repayAmount);
      await approveToken(CONTRACT_ADDRESSES.CUSDT, amount);
      
      setMessage('授权成功！现在可以进行还款');
    } catch (error) {
      console.error('Approval failed:', error);
      setMessage('授权失败，请重试');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRepay = async () => {
    if (!repayAmount || !address) return;

    try {
      setIsRepaying(true);
      setMessage('正在还款...');
      
      const amount = parseInt(repayAmount);
      await repayTokens(amount);
      
      setMessage('还款成功！');
      setRepayAmount('');
    } catch (error) {
      console.error('Repayment failed:', error);
      setMessage('还款失败，请重试');
    } finally {
      setIsRepaying(false);
    }
  };

  const handleRepayAll = () => {
    if (decryptedAmounts.borrowed) {
      setRepayAmount(decryptedAmounts.borrowed);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2>还款 cUSDT</h2>
        <p>请连接您的钱包以进行还款</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2>还款 cUSDT</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          偿还您借贷的 cUSDT，释放质押的 cDoge
        </p>

        {/* Current Status */}
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '2rem' }}>
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

          <div className="stat-card">
            <h3>cUSDT 余额</h3>
            <div className="balance-encrypted">
              加密: {cUSDTBalance ? `${cUSDTBalance.slice(0, 10)}...` : '加载中...'}
            </div>
            {decryptedAmounts.balance !== undefined && (
              <div className="stat-value">
                {decryptedAmounts.balance || '解密失败'}
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptAmount('balance')}
              disabled={!cUSDTBalance || decryptingAmounts.balance}
              style={{ marginTop: '1rem' }}
            >
              {decryptingAmounts.balance ? '解密中...' : '解密'}
            </button>
          </div>
        </div>

        {/* Repayment Form */}
        <div className="input-group">
          <label htmlFor="repayAmount">还款数量</label>
          <input
            id="repayAmount"
            type="number"
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.target.value)}
            placeholder="输入要还款的 cUSDT 数量"
            min="0"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleRepayAll}
            disabled={!decryptedAmounts.borrowed}
            style={{ flex: 1 }}
          >
            全部还清
          </button>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '1rem', 
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>当前借贷:</span>
            <span>{decryptedAmounts.borrowed || '请先解密'} cUSDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>还款数量:</span>
            <span>{repayAmount || '0'} cUSDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>剩余借贷:</span>
            <span>
              {decryptedAmounts.borrowed && repayAmount 
                ? Math.max(0, parseInt(decryptedAmounts.borrowed) - parseInt(repayAmount))
                : '计算中...'} cUSDT
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn"
            onClick={handleApprove}
            disabled={!repayAmount || isApproving}
            style={{ flex: 1 }}
          >
            {isApproving ? '授权中...' : '1. 授权'}
          </button>
          
          <button
            className="btn"
            onClick={handleRepay}
            disabled={!repayAmount || isRepaying}
            style={{ flex: 1 }}
          >
            {isRepaying ? '还款中...' : '2. 还款'}
          </button>
        </div>

        {message && (
          <div className={`${message.includes('失败') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h3>还款流程说明</h3>
          <ol style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
            <li>首先解密查看您当前的借贷金额和 cUSDT 余额</li>
            <li>输入要还款的 cUSDT 数量</li>
            <li>点击"授权"按钮，允许合约使用您的 cUSDT</li>
            <li>点击"还款"按钮完成还款</li>
            <li>还款后将释放相应的质押资产</li>
            <li>可以选择"全部还清"一次性还清所有借贷</li>
          </ol>
        </div>
      </div>
    </div>
  );
}