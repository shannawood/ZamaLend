import { task } from "hardhat/config";
import type { ConfidentialDoge, ConfidentialUSDT } from "../types";

task("mint-test-tokens", "Mint test tokens for development")
  .addParam("to", "Address to mint tokens to")
  .addOptionalParam("cdogeAmount", "Amount of cDoge to mint", "1000")
  .addOptionalParam("cusdtAmount", "Amount of cUSDT to mint", "10000")
  .setAction(async (taskArgs, hre) => {
    const { to, cdogeAmount, cusdtAmount } = taskArgs;
    
    console.log("Getting contracts...");
    
    const cDogeContract: ConfidentialDoge = await hre.ethers.getContractAt(
      "ConfidentialDoge", 
      "0x53501cfc7fa82c600DBF8747d47Fb89cf35eA6A8"
    );
    
    const cUSDTContract: ConfidentialUSDT = await hre.ethers.getContractAt(
      "ConfidentialUSDT",
      "0x63cbfcb50b074B96a8c0145CfbC1f19c050678Df"
    );
    
    console.log("Minting cDoge...");
    const cDogeTx = await cDogeContract.mint(to, cdogeAmount);
    await cDogeTx.wait();
    console.log(`Minted ${cdogeAmount} cDoge to ${to}: ${cDogeTx.hash}`);
    
    console.log("Minting cUSDT...");
    const cUSDTTx = await cUSDTContract.mint(to, cusdtAmount);
    await cUSDTTx.wait();
    console.log(`Minted ${cusdtAmount} cUSDT to ${to}: ${cUSDTTx.hash}`);
    
    console.log("Done!");
  });