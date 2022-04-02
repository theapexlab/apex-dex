// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Define a contract named ApexERC20 as per the ERC20 token standards
contract ApexERC20 is ERC20, ERC20Permit {
  string private constant _contractName = "Apex ERC20 Liquidity";

  // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
  bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

  constructor() ERC20(_contractName, "APX") ERC20Permit(_contractName) {}
}
