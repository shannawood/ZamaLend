import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

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
    return fhevmInstance;
  }


  try {
    await initSDK();
    
    const config = {
      ...SepoliaConfig,
      network: window.ethereum,
    };
    
    fhevmInstance = await createInstance(config);
    console.log("fhe init finish");
    return fhevmInstance;
  } catch (error) {
    console.error('Failed to initialize FHEVM:', error);
    throw error;
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

export async function decryptBalance(
  ciphertext: string,
  contractAddress: string,
  userAddress: string,
  signer: any
): Promise<string | null> {
  try {
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
    
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );
    
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