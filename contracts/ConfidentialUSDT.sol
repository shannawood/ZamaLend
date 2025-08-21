// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ConfidentialFungibleToken} from "@openzeppelin/confidential-contracts/token/ConfidentialFungibleToken.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialUSDT is ConfidentialFungibleToken, SepoliaConfig {
    address public owner;
    euint64 public totalSupply;

    event SupplyMinted(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() ConfidentialFungibleToken("cUSDT", "cUSDT", "") {
        owner = msg.sender;
        totalSupply = FHE.asEuint64(0);
        FHE.allowThis(totalSupply);
    }

    function mint(address to, uint64 amount) public onlyOwner {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _mint(to, encryptedAmount);
        totalSupply = FHE.add(totalSupply, encryptedAmount);
        FHE.allowThis(totalSupply);
        emit SupplyMinted(to, amount);
    }

    function getTotalSupply() public view returns (euint64) {
        return totalSupply;
    }
}
