import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useBalances } from '@/hooks/useContracts';
import { decryptBalance } from '@/utils/fhe';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { cDogeBalance, cUSDTBalance } = useBalances();
  
  const [decryptedBalances, setDecryptedBalances] = useState<{
    cDoge?: string | null;
    cUSDT?: string | null;
  }>({});
  
  const [decryptingBalances, setDecryptingBalances] = useState<{
    cDoge?: boolean;
    cUSDT?: boolean;
  }>({});

  const handleDecryptBalance = async (tokenType: 'cDoge' | 'cUSDT') => {
    if (!address || !walletClient) return;
    
    const ciphertext = tokenType === 'cDoge' ? cDogeBalance : cUSDTBalance;
    if (!ciphertext) return;

    const contractAddress = tokenType === 'cDoge' 
      ? CONTRACT_ADDRESSES.CDOGE 
      : CONTRACT_ADDRESSES.CUSDT;

    setDecryptingBalances(prev => ({ ...prev, [tokenType]: true }));
    
    try {
      const decrypted = await decryptBalance(ciphertext, contractAddress, address, walletClient);
      setDecryptedBalances(prev => ({ ...prev, [tokenType]: decrypted }));
    } catch (error) {
      console.error(`Failed to decrypt ${tokenType} balance:`, error);
    } finally {
      setDecryptingBalances(prev => ({ ...prev, [tokenType]: false }));
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2>欢迎使用 ZamaLend</h2>
        <p>请连接您的钱包以查看余额</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2>钱包余额</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          您的加密代币余额，点击解密按钮查看明文余额
        </p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* cDoge Balance */}
          <div className="balance-item">
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>cDoge 余额</h3>
              <div className="balance-encrypted">
                加密: {cDogeBalance ? `${cDogeBalance.slice(0, 10)}...` : '加载中...'}
              </div>
              {decryptedBalances.cDoge !== undefined && (
                <div className="balance-decrypted">
                  解密: {decryptedBalances.cDoge || '解密失败'}
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptBalance('cDoge')}
              disabled={!cDogeBalance || decryptingBalances.cDoge}
            >
              {decryptingBalances.cDoge ? '解密中...' : '解密'}
            </button>
          </div>

          {/* cUSDT Balance */}
          <div className="balance-item">
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>cUSDT 余额</h3>
              <div className="balance-encrypted">
                加密: {cUSDTBalance ? `${cUSDTBalance.slice(0, 10)}...` : '加载中...'}
              </div>
              {decryptedBalances.cUSDT !== undefined && (
                <div className="balance-decrypted">
                  解密: {decryptedBalances.cUSDT || '解密失败'}
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptBalance('cUSDT')}
              disabled={!cUSDTBalance || decryptingBalances.cUSDT}
            >
              {decryptingBalances.cUSDT ? '解密中...' : '解密'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            💡 提示：您的余额在区块链上是加密存储的，只有您可以解密查看
          </p>
        </div>
      </div>
    </div>
  );
}