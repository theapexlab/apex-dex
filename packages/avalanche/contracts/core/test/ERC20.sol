// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../ApexERC20.sol";

contract TestERC20 is ApexERC20 {
  constructor(uint256 _totalSupply) {
    _mint(msg.sender, _totalSupply);
  }
}
