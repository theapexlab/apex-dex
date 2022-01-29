// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./interfaces/IApexERC20.sol";

// Define a contract named ApexERC20 as per the ERC20 token standards
contract ApexERC20 is ERC20Permit {
  string private constant _contractName = "Apex ERC20 Liquidity";

  constructor() ERC20(_contractName, "APX") ERC20Permit(_contractName) {}
}
