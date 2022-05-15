// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IFactory.sol";
import "./Pair.sol";

contract Factory is IFactory {
  address public override feeTo;

  mapping(address => mapping(address => address)) public override getPair;
  address[] public override allPairs;

  event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

  function allPairsLength() external view override returns (uint256) {
    return allPairs.length;
  }

  function createPair(address tokenA, address tokenB) external override returns (address pair) {
    require(tokenA != tokenB, "The addresses have to be identical!");

    (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

    require(token0 != address(0), "Zero address");
    require(getPair[token0][token1] == address(0), "The pairs already exist"); // single check is sufficient

    bytes memory bytecode = type(Pair).creationCode;
    bytes32 salt = keccak256(abi.encodePacked(token0, token1));
    assembly {
      pair := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
    }

    IPair(pair).initialize(token0, token1);
    getPair[token0][token1] = pair;
    getPair[token1][token0] = pair; // populate mapping in the reverse direction
    allPairs.push(pair);
    emit PairCreated(token0, token1, pair, allPairs.length);

    return pair;
  }
}
