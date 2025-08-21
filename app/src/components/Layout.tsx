import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';
import { useFHE } from '@/contexts/FHEContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isInitialized, isInitializing, error, initFHE, resetError } = useFHE();

  const navItems = [
    { path: '/', label: '钱包' },
    { path: '/stake', label: '质押' },
    { path: '/assets', label: '资产' },
    { path: '/repay', label: '还款' },
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2rem', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ZamaLend
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* FHE Status and Init Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isInitialized ? (
              <span style={{ 
                color: '#4ade80', 
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#4ade80', 
                  borderRadius: '50%' 
                }} />
                FHE已初始化
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  color: isInitializing ? '#fbbf24' : '#f87171', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: isInitializing ? '#fbbf24' : '#f87171', 
                    borderRadius: '50%' 
                  }} />
                  {isInitializing ? 'FHE初始化中...' : 'FHE未初始化'}
                </span>
                <button
                  onClick={initFHE}
                  disabled={isInitializing}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    backgroundColor: isInitializing ? '#6b7280' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isInitializing ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isInitializing) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isInitializing) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  {isInitializing ? '初始化中...' : 'Init FHE'}
                </button>
              </div>
            )}
          </div>
          
          <ConnectButton />
        </div>
      </header>

      {/* FHE Error Display */}
      {error && (
        <div style={{
          margin: '0 2rem 1rem 2rem',
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>FHE初始化失败</h4>
            <p style={{ margin: '0', color: '#fca5a5', fontSize: '0.875rem' }}>
              {error}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={initFHE}
              disabled={isInitializing}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              重试
            </button>
            <button
              onClick={resetError}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      <nav className="nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main>
        {children}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        marginTop: '4rem',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <p>基于 Zama FHE 技术的隐私借贷协议</p>
      </footer>
    </div>
  );
}