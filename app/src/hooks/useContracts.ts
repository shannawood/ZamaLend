import { useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { encryptValue } from '@/utils/fhe';
import { useAccount } from 'wagmi';
import { useState, useEffect, useMemo } from 'react';

const ZAMA_LEND_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "repay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserPosition",
    "outputs": [
      {
        "internalType": "euint64",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "confidentialBalanceOf",
    "outputs": [
      {
        "internalType": "euint64",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "confidentialTransfer",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "confidentialTransferFrom",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint48",
        "name": "until",
        "type": "uint48"
      }
    ],
    "name": "setOperator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function useContracts() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const stakeTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');

    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);

    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND as `0x${string}`,
      abi: ZAMA_LEND_ABI,
      functionName: 'deposit',
      args: [encrypted.handles[0] as unknown as `0x${string}`, encrypted.inputProof as unknown as `0x${string}`],
    });
  };

  const borrowTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');

    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);

    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND as `0x${string}`,
      abi: ZAMA_LEND_ABI,
      functionName: 'borrow',
      args: [encrypted.handles[0] as unknown as `0x${string}`, encrypted.inputProof as unknown as `0x${string}`],
    });
  };

  const repayTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');

    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);

    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND as `0x${string}`,
      abi: ZAMA_LEND_ABI,
      functionName: 'repay',
      args: [encrypted.handles[0] as unknown as `0x${string}`, encrypted.inputProof as unknown as `0x${string}`],
    });
  };

  const withdrawTokens = async (amount: number) => {
    if (!address) throw new Error('Wallet not connected');

    const encrypted = await encryptValue(amount, CONTRACT_ADDRESSES.ZAMA_LEND, address);

    return writeContract({
      address: CONTRACT_ADDRESSES.ZAMA_LEND as `0x${string}`,
      abi: ZAMA_LEND_ABI,
      functionName: 'withdraw',
      args: [encrypted.handles[0] as unknown as `0x${string}`, encrypted.inputProof as unknown as `0x${string}`],
    });
  };

  const approveToken = async (tokenAddress: string, until: number = Math.floor(Date.now() / 1000) + 86400) => {
    if (!address) throw new Error('Wallet not connected');

    return writeContract({
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'setOperator',
      args: [CONTRACT_ADDRESSES.ZAMA_LEND as `0x${string}`, until],
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

// 细粒度的 hooks - 按需调用
export function useTokenBalances(tokens: ('cDoge' | 'cUSDT')[] = []) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [balances, setBalances] = useState<{
    cDogeBalance?: string;
    cUSDTBalance?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    cDoge?: Error | null;
    cUSDT?: Error | null;
  }>({});

  // 使用 useMemo 来稳定 tokens 数组的引用
  const stableTokens = useMemo(() => {
    return [...tokens].sort(); // 排序确保数组内容相同时引用相同
  }, [JSON.stringify(tokens)]);

  const needsCDoge = stableTokens.includes('cDoge');
  const needsCUSDT = stableTokens.includes('cUSDT');

  // 创建一个稳定的 key 来防止重复调用
  const fetchKey = useMemo(() => {
    if (!isConnected || !address) return null;
    return `${address}-${stableTokens.join(',')}`;
  }, [isConnected, address, stableTokens.join(',')]);

  // console.log("useTokenBalances", tokens, "fetchKey:", fetchKey);

  useEffect(() => {
    if (!fetchKey || !publicClient) return;
    if (!needsCDoge && !needsCUSDT) {
      setBalances({});
      setErrors({});
      return;
    }

    let isCancelled = false;

    const fetchBalances = async () => {
      if (isCancelled) return;

      setIsLoading(true);
      const newBalances: typeof balances = {};
      const newErrors: typeof errors = {};

      try {
        if (needsCDoge && !isCancelled) {
          try {
            console.log("readContract doge");
            const result = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.CDOGE as `0x${string}`,
              abi: TOKEN_ABI,
              functionName: 'confidentialBalanceOf',
              args: [address as `0x${string}`],
            });
            console.log("doge:", result);

            if (!isCancelled) {
              newBalances.cDogeBalance = result as string;
            }
          } catch (error) {
            console.error('cDoge balance error:', error);
            if (!isCancelled) {
              newErrors.cDoge = error as Error;
            }
          }
        }

        if (needsCUSDT && !isCancelled) {
          try {
            console.log("readContract usdt");
            const result = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.CUSDT as `0x${string}`,
              abi: TOKEN_ABI,
              functionName: 'confidentialBalanceOf',
              args: [address as `0x${string}`],
            });
            console.log("usdt:", result);

            if (!isCancelled) {
              newBalances.cUSDTBalance = result as string;
            }
          } catch (error) {
            console.error('cUSDT balance error:', error);
            if (!isCancelled) {
              newErrors.cUSDT = error as Error;
            }
          }
        }

        if (!isCancelled) {
          setBalances(newBalances);
          setErrors(newErrors);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchBalances();

    // 清理函数
    return () => {
      isCancelled = true;
    };
  }, [fetchKey]); // 只依赖稳定的 fetchKey

  return {
    cDogeBalance: balances.cDogeBalance,
    cUSDTBalance: balances.cUSDTBalance,
    isLoading,
    errors,
  };
}

export function useLendingData(dataTypes: ('staked' | 'borrowed' | 'available')[] = []) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [data, setData] = useState<{
    stakedAmount?: string;
    borrowedAmount?: string;
    availableToBorrow?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    staked?: Error | null;
    borrowed?: Error | null;
    available?: Error | null;
  }>({});

  const needsStaked = dataTypes.includes('staked');
  const needsBorrowed = dataTypes.includes('borrowed');
  const needsAvailable = dataTypes.includes('available');

  useEffect(() => {
    if (!isConnected || !address || !publicClient) return;
    if (!needsStaked && !needsBorrowed && !needsAvailable) return;

    const fetchLendingData = async () => {
      setIsLoading(true);
      const newData: typeof data = {};
      const newErrors: typeof errors = {};

      try {
        // 获取用户位置信息
        const userPosition = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.ZAMA_LEND as `0x${string}`,
          abi: ZAMA_LEND_ABI,
          functionName: 'getUserPosition',
          args: [address as `0x${string}`],
        }) as [string, string];

        if (needsStaked) {
          newData.stakedAmount = userPosition[0];
        }
        if (needsBorrowed) {
          newData.borrowedAmount = userPosition[1];
        }
        if (needsAvailable) {
          // 计算可借贷额度需要额外逻辑，这里先设为占位符
          newData.availableToBorrow = "0x0000000000000000000000000000000000000000000000000000000000000000";
        }

        setData(newData);
        setErrors(newErrors);
      } catch (error) {
        console.error('Lending data fetch error:', error);
        if (needsStaked) newErrors.staked = error as Error;
        if (needsBorrowed) newErrors.borrowed = error as Error;
        if (needsAvailable) newErrors.available = error as Error;
        setErrors(newErrors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLendingData();
  }, [isConnected, address, publicClient, needsStaked, needsBorrowed, needsAvailable]);

  return {
    stakedAmount: data.stakedAmount,
    borrowedAmount: data.borrowedAmount,
    availableToBorrow: data.availableToBorrow,
    isLoading,
    errors,
  };
}

// 向后兼容的组合 hook
export function useBalances() {
  const tokenBalances = useTokenBalances(['cDoge', 'cUSDT']);
  const lendingData = useLendingData(['staked', 'borrowed', 'available']);

  return {
    ...tokenBalances,
    ...lendingData,
    isLoading: tokenBalances.isLoading || lendingData.isLoading,
    errors: {
      ...tokenBalances.errors,
      ...lendingData.errors,
    },
  };
}