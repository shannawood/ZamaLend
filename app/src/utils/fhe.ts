import { createInstance, initSDK } from '@zama-fhe/relayer-sdk/bundle';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';
import { SEPOLIA_CONFIG } from '@/constants/contracts';

// declare global {
//   interface Window {
//     fhevm: {
//       initSDK: () => Promise<void>;
//       createInstance: (config: any) => Promise<FhevmInstance>;
//     };
//   }
// }

let fhevmInstance: FhevmInstance | null = null;

export async function initializeFHEVM(): Promise<FhevmInstance> {
  if (fhevmInstance) {
    console.log("FHEVM already initialized, returning existing instance");
    return fhevmInstance;
  }

  console.log("Initializing FHEVM SDK...");

  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
    }

    console.log("Loading TFHE WASM...");
    await initSDK();
    console.log("TFHE WASM loaded successfully");

    const config = {
      ...SEPOLIA_CONFIG,
      network: window.ethereum,
    };

    console.log("Creating FHEVM instance with config:", config);
    fhevmInstance = await createInstance(config);
    console.log("FHEVM initialized successfully");

    return fhevmInstance;
  } catch (error) {
    console.error('Failed to initialize FHEVM:', error);

    // Reset instance so we can retry
    fhevmInstance = null;

    if (error instanceof Error) {
      throw new Error(`FHEVM initialization failed: ${error.message}`);
    } else {
      throw new Error('FHEVM initialization failed with unknown error');
    }
  }
}

export function getFHEVMInstance(): FhevmInstance {
  if (!fhevmInstance) {
    throw new Error('FHEVM not initialized. Call initializeFHEVM() first.');
  }
  return fhevmInstance;
}

export async function encryptValue(value: number | bigint, contractAddress: string, userAddress: string) {
  const instance = getFHEVMInstance();
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  if (typeof value === 'bigint') {
    input.add64(value);
  } else {
    input.add32(value);
  }

  return await input.encrypt();
}
//  await decryptBalance(ciphertext, contractAddress, address, walletClient);
export async function decryptBalance(
  ciphertext: string,
  contractAddress: string,
  userAddress: string,
  walletClient: any
): Promise<string | null> {
  try {
    console.log("decryptBalance:", ciphertext, contractAddress, userAddress, walletClient);

    const instance = getFHEVMInstance();
    const keypair = instance.generateKeypair();

    const handleContractPairs = [{
      handle: ciphertext,
      contractAddress: contractAddress,
    }];

    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];

    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );
    const signature = await walletClient.signTypedData({
      domain: eip712.domain,
      types: {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      primaryType: 'UserDecryptRequestVerification',
      message: eip712.message,
    });

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );

    const decryptedValue = result[ciphertext];
    return decryptedValue?.toString() || null;
  } catch (error) {
    console.error('Failed to decrypt balance:', error);
    return null;
  }
}