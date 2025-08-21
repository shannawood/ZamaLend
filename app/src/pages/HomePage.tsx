import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useTokenBalances } from '@/hooks/useContracts';
import { decryptBalance } from '@/utils/fhe';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { useFHE } from '@/contexts/FHEContext';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { isInitialized: fheInitialized, initFHE } = useFHE();
  const { cDogeBalance, cUSDTBalance, isLoading, errors } = useTokenBalances(['cDoge', 'cUSDT']);
  
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
    
    if (!fheInitialized) {
      alert('请先初始化FHE后再进行解密操作');
      return;
    }
    
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
      alert(`解密${tokenType}余额失败，请确保FHE已正确初始化`);
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
              {decryptedBalances.cDoge !== undefined && (
                <div className="balance-decrypted">
                  解密: {decryptedBalances.cDoge || '解密失败'}
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptBalance('cDoge')}
              disabled={!cDogeBalance || decryptingBalances.cDoge || isLoading || !fheInitialized}
              title={!fheInitialized ? '请先初始化FHE' : undefined}
            >
              {decryptingBalances.cDoge ? '解密中...' : '解密'}
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
              {decryptedBalances.cUSDT !== undefined && (
                <div className="balance-decrypted">
                  解密: {decryptedBalances.cUSDT || '解密失败'}
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleDecryptBalance('cUSDT')}
              disabled={!cUSDTBalance || decryptingBalances.cUSDT || isLoading || !fheInitialized}
              title={!fheInitialized ? '请先初始化FHE' : undefined}
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