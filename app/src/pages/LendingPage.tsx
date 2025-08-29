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
      setMessage('Please initialize FHE before borrowing');
      return;
    }

    try {
      setIsBorrowing(true);
      setMessage('Borrowing...');
      
      const amount = parseInt(borrowAmount) * 1000000;
      await borrowTokens(amount);
      
      setMessage(`Successfully borrowed ${borrowAmount} cUSDT!`);
      setBorrowAmount('');
    } catch (error) {
      console.error('Borrowing failed:', error);
      setMessage(`Borrowing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBorrowing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2>Borrow cUSDT</h2>
        <p>Please connect your wallet to borrow</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2>Borrow cUSDT</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          Borrow cUSDT based on your staked assets, up to 50% of staked value
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
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#fbbf24' }}>FHE Initialization Required</h4>
              <p style={{ margin: '0', color: 'rgba(251, 191, 36, 0.8)', fontSize: '0.875rem' }}>
                Please click the "Init FHE" button in the top right corner to initialize the encryption system before borrowing
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
              Initialize Now
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
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#22c55e' }}>Available Credit</h3>
          <div className="balance-encrypted" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Encrypted balance: {availableToBorrow ? `${availableToBorrow.slice(0, 10)}...` : 'Loading...'}
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'rgba(34, 197, 94, 0.8)' }}>
            💡 This is the maximum borrowable amount calculated based on your staked assets
          </p>
        </div>

        <div className="input-group">
          <label htmlFor="borrowAmount">Borrow Amount</label>
          <input
            id="borrowAmount"
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="Enter cUSDT amount to borrow"
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
            <span>Borrow Amount:</span>
            <span>{borrowAmount || '0'} cUSDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
            <span>Interest Rate:</span>
            <span style={{ color: '#22c55e' }}>0% (Beta)</span>
          </div>
        </div>

        <button
          className="btn"
          onClick={handleBorrow}
          disabled={!borrowAmount || isBorrowing || !fheInitialized}
          title={!fheInitialized ? 'Please initialize FHE first' : undefined}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          {isBorrowing ? 'Borrowing...' : 'Borrow cUSDT'}
        </button>

        {message && (
          <div className={`${message.includes('failed') || message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

       
      </div>
    </div>
  );
}