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
  'function confidentialBalanceOf(address account) external view returns (bytes32)',
  'function confidentialTransfer(address to, bytes32 encryptedAmount, bytes calldata inputProof) external returns (bytes32)',
  'function confidentialTransferFrom(address from, address to, bytes32 encryptedAmount, bytes calldata inputProof) external returns (bytes32)',
  'function setOperator(address operator, uint48 until) external',
  'function isOperator(address holder, address spender) external view returns (bool)',
  'function name() external view returns (string memory)',
  'function symbol() external view returns (string memory)',
  'function decimals() external view returns (uint8)',
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

  const approveToken = async (tokenAddress: string, until: number = Math.floor(Date.now() / 1000) + 86400) => {
    if (!address) throw new Error('Wallet not connected');
    
    return writeContract({
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'setOperator',
      args: [CONTRACT_ADDRESSES.ZAMA_LEND, until],
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
  console.log("useBalances");
  console.log("",CONTRACT_ADDRESSES.CDOGE,address);
  
  const { data: cDogeBalance, error: cDogeError, isLoading: cDogeLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.CDOGE,
    abi: TOKEN_ABI,
    functionName: 'confidentialBalanceOf',
    args: address ? [address] : undefined
  });

  const { data: cUSDTBalance, error: cUSDTError, isLoading: cUSDTLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.CUSDT,
    abi: TOKEN_ABI,
    functionName: 'confidentialBalanceOf',
    args: address ? [address] : undefined
  });

  const { data: stakedAmount, error: stakedError } = useReadContract({
    address: CONTRACT_ADDRESSES.ZAMA_LEND,
    abi: ZAMA_LEND_ABI,
    functionName: 'getStakedAmount',
    args: address ? [address] : undefined
  });

  const { data: borrowedAmount, error: borrowedError } = useReadContract({
    address: CONTRACT_ADDRESSES.ZAMA_LEND,
    abi: ZAMA_LEND_ABI,
    functionName: 'getBorrowedAmount',
    args: address ? [address] : undefined
  });

  const { data: availableToBorrow, error: availableError } = useReadContract({
    address: CONTRACT_ADDRESSES.ZAMA_LEND,
    abi: ZAMA_LEND_ABI,
    functionName: 'getAvailableToBorrow',
    args: address ? [address] : undefined
  });

  // Log errors for debugging
  if (cDogeError) console.error('cDoge balance error:', cDogeError);
  if (cUSDTError) console.error('cUSDT balance error:', cUSDTError);
  if (stakedError) console.error('Staked amount error:', stakedError);
  if (borrowedError) console.error('Borrowed amount error:', borrowedError);
  if (availableError) console.error('Available to borrow error:', availableError);

  // Log successful data
  if (cDogeBalance) console.log('cDoge balance:', cDogeBalance);
  if (cUSDTBalance) console.log('cUSDT balance:', cUSDTBalance);

  return {
    cDogeBalance: cDogeBalance as string | undefined,
    cUSDTBalance: cUSDTBalance as string | undefined,
    stakedAmount: stakedAmount as string | undefined,
    borrowedAmount: borrowedAmount as string | undefined,
    availableToBorrow: availableToBorrow as string | undefined,
    isLoading: cDogeLoading || cUSDTLoading,
    errors: {
      cDoge: cDogeError,
      cUSDT: cUSDTError,
      staked: stakedError,
      borrowed: borrowedError,
      available: availableError,
    },
  };
}