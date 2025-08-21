import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { encryptValue } from '@/utils/fhe';
import { useAccount } from 'wagmi';

const ZAMA_LEND_ABI = [
  'function stake(bytes32 encryptedAmount, bytes calldata proof) external',
  'function borrow(bytes32 encryptedAmount, bytes calldata proof) external',
  'function repay(bytes32 encryptedAmount, bytes calldata proof) external',
  'function withdraw(bytes32 encryptedAmount, bytes calldata proof) external',
  'function getStakedAmount(address user) external view returns (bytes32)',
  'function getBorrowedAmount(address user) external view returns (bytes32)',
  'function getAvailableToBorrow(address user) external view returns (bytes32)',
] as const;

const TOKEN_ABI = [
  'function balanceOf(address account) external view returns (bytes32)',
  'function approve(address spender, bytes32 encryptedAmount, bytes calldata proof) external',
  'function allowance(address owner, address spender) external view returns (bytes32)',
] as const;

export function useContracts() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const stakeTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);
    
    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND,
      abi: ZAMA_LEND_ABI,
      functionName: 'stake',
      args: [encrypted.handles[0], encrypted.inputProof],
    });
  };

  const borrowTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);
    
    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND,
      abi: ZAMA_LEND_ABI,
      functionName: 'borrow',
      args: [encrypted.handles[0], encrypted.inputProof],
    });
  };

  const repayTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);
    
    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND,
      abi: ZAMA_LEND_ABI,
      functionName: 'repay',
      args: [encrypted.handles[0], encrypted.inputProof],
    });
  };

  const withdrawTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);
    
    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND,
      abi: ZAMA_LEND_ABI,
      functionName: 'withdraw',
      args: [encrypted.handles[0], encrypted.inputProof],
    });
  };

  const approveToken = async (tokenAddress: string, amount: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    const encrypted = await encryptValue(amount, tokenAddress, address);
    
    return writeContract({
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.ZAMA_LEND, encrypted.handles[0], encrypted.inputProof],
    });
  };

  return {
    stakeTokens,
    borrowTokens,
    repayTokens,
    withdrawTokens,
    approveToken,
  };
}

export function useBalances() {
  const { address } = useAccount();

  const { data: cDogeBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CDOGE,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: cUSDTBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CUSDT,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: stakedAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.ZAMA_LEND,
    abi: ZAMA_LEND_ABI,
    functionName: 'getStakedAmount',
    args: address ? [address] : undefined,
  });

  const { data: borrowedAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.ZAMA_LEND,
    abi: ZAMA_LEND_ABI,
    functionName: 'getBorrowedAmount',
    args: address ? [address] : undefined,
  });

  const { data: availableToBorrow } = useReadContract({
    address: CONTRACT_ADDRESSES.ZAMA_LEND,
    abi: ZAMA_LEND_ABI,
    functionName: 'getAvailableToBorrow',
    args: address ? [address] : undefined,
  });

  return {
    cDogeBalance: cDogeBalance as string | undefined,
    cUSDTBalance: cUSDTBalance as string | undefined,
    stakedAmount: stakedAmount as string | undefined,
    borrowedAmount: borrowedAmount as string | undefined,
    availableToBorrow: availableToBorrow as string | undefined,
  };
}