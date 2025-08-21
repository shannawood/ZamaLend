import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StakePage from './pages/StakePage';
import AssetsPage from './pages/AssetsPage';
import RepayPage from './pages/RepayPage';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function App() {
  // useEffect(() => {
  //   const initFHE = async () => {
  //     try {
  //       await initializeFHEVM();
  //       setFheInitialized(true);
  //       console.log('FHEVM initialized successfully');
  //     } catch (error) {
  //       console.error('Failed to initialize FHEVM:', error);
  //       setFheError(error instanceof Error ? error.message : 'Unknown error');
  //     }
  //   };

  //   initFHE();
  // }, []);


  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stake" element={<StakePage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/repay" element={<RepayPage />} />
              </Routes>
            </Layout>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;