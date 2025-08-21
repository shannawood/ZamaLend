import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { CHAINS } from '@/constants/contracts';

export const config = getDefaultConfig({
  appName: 'ZamaLend',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [CHAINS.sepolia],
  ssr: false,
});