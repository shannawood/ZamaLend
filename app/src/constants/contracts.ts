export const CONTRACT_ADDRESSES = {
  ZAMA_LEND: "0x242ecc3f2915202D7695064FeFE97c2ed7dA17B1",
  CDOGE: "0x53501cfc7fa82c600DBF8747d47Fb89cf35eA6A8",
  CUSDT: "0x63cbfcb50b074B96a8c0145CfbC1f19c050678Df",
} as const;

export const SEPOLIA_CONFIG = {
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
  inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
  verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
  chainId: 11155111,
  gatewayChainId: 55815,
  relayerUrl: "https://relayer.testnet.zama.cloud",
} as const;

export const CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Sepolia Ether',
      symbol: 'SEP',
    },
    rpcUrls: {
      public: { http: ['https://rpc.sepolia.org'] },
      default: { http: ['https://rpc.sepolia.org'] },
    },
    blockExplorers: {
      etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
  },
} as const;