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
    { path: '/assets', label: '资产' },
    { path: '/stake', label: '质押' },
    { path: '/lending', label: '借贷' },
    { path: '/repay', label: '还款' },
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem',
        background: 'var(--surface-primary)',
        backdropFilter: 'blur(20px)',
        marginBottom: '2rem'
      }}>
        <h1 className="app-title"
          style={{ 
            margin: 0, 
            fontSize: '2rem', 
            fontWeight: '700'
          }}>
          ZamaLend
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* FHE Status and Init Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isInitialized ? (
              <span style={{ 
                color: 'var(--color-success)', 
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--color-success)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
                }} />
                FHE已初始化
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  color: isInitializing ? 'var(--color-warning)' : 'var(--color-danger)', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: isInitializing ? 'var(--color-warning)' : 'var(--color-danger)', 
                    borderRadius: '50%',
                    boxShadow: isInitializing ? '0 0 8px rgba(245, 158, 11, 0.4)' : '0 0 8px rgba(239, 68, 68, 0.4)'
                  }} />
                  {isInitializing ? 'FHE初始化中...' : 'FHE未初始化'}
                </span>
                <button
                  onClick={initFHE}
                  disabled={isInitializing}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    backgroundColor: isInitializing ? 'var(--surface-secondary)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isInitializing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isInitializing ? 'none' : '0 2px 8px rgba(14, 165, 233, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isInitializing) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(14, 165, 233, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isInitializing) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.2)';
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
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-danger)' }}>FHE初始化失败</h4>
            <p style={{ margin: '0', color: 'rgba(239, 68, 68, 0.8)', fontSize: '0.875rem' }}>
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
                backgroundColor: 'var(--color-danger)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
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
                color: 'rgba(239, 68, 68, 0.8)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(71, 85, 105, 0.2)'
      }}>
        <p>基于 Zama FHE 技术的隐私借贷协议</p>
      </footer>
    </div>
  );
}