import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

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
        <ConnectButton />
      </header>

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