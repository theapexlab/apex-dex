// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IPair.sol";
import "./ApexERC20.sol";
import "./interfaces/IApexERC20.sol";
import "../libraries/Math.sol";
import "../libraries/UQ112x112.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/ICallee.sol";

contract Pair is IPair, ApexERC20 {
  using SafeMath for uint256;
  using UQ112x112 for uint224;

  uint256 public constant override MINIMUM_LIQUIDITY = 10**3;
  bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));

  address public override factory;
  address public override token0;
  address public override token1;

  uint112 private reserve0; // uses single storage slot, accessible via getReserves
  uint112 private reserve1; // uses single storage slot, accessible via getReserves
  uint32 private blockTimestampLast; // uses single storage slot, accessible via getReserves

  uint256 public override price0CumulativeLast;
  uint256 public override price1CumulativeLast;
  uint256 public override kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

  uint256 private unlocked = 1;
  modifier lock() {
    require(unlocked == 1, "LOCKED");
    unlocked = 0;
    _;
    unlocked = 1;
  }

  function getReserves()
    public
    view
    override
    returns (
      uint112 _reserve0,
      uint112 _reserve1,
      uint32 _blockTimestampLast
    )
  {
    _reserve0 = reserve0;
    _reserve1 = reserve1;
    _blockTimestampLast = blockTimestampLast;
  }

  function _safeTransfer(
    address token,
    address to,
    uint256 value
  ) private {
    (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
    require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed!");
  }

  event Mint(address indexed sender, uint256 amount0, uint256 amount1);
  event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
  event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to);
  event Sync(uint112 reserve0, uint112 reserve1);

  constructor() {
    factory = msg.sender;
  }

  // called once by the factory at time of deployment
  function initialize(address _token0, address _token1) external override {
    require(msg.sender == factory, "Forbidden initialize"); // sufficient check

    token0 = _token0;
    token1 = _token1;
  }

  // update reserves and, on the first call per block, price accumulators
  function _update(
    uint256 balance0,
    uint256 balance1,
    uint112 _reserve0,
    uint112 _reserve1
  ) private {
    require(balance0 <= type(uint128).max && balance1 <= type(uint128).max, "Insufficient amount");

    uint32 blockTimestamp = uint32(block.timestamp % 2**32);
    uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
    if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
      // * never overflows, and + overflow is desired
      price0CumulativeLast += uint256(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
      price1CumulativeLast += uint256(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
    }

    blockTimestampLast = blockTimestamp;
    emit Sync(uint112(balance0), uint112(balance1));
  }

  // this low-level function should be called from a contract which performs important safety checks
  function mint(address to) external override lock returns (uint256 liquidity) {
    (uint112 _reserve0, uint112 _reserve1, ) = this.getReserves(); // gas savings
    uint256 balance0 = IERC20(token0).balanceOf(address(this));
    uint256 balance1 = IERC20(token1).balanceOf(address(this));
    uint256 amount0 = balance0.sub(_reserve0);
    uint256 amount1 = balance1.sub(_reserve1);

    uint256 _totalSupply = this.totalSupply(); // gas savings
    if (_totalSupply == 0) {
      liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
      _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
    } else {
      liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
    }
    require(liquidity > 0, "Insufficient liquidity minted!");
    _mint(to, liquidity);

    _update(balance0, balance1, _reserve0, _reserve1);
    emit Mint(msg.sender, amount0, amount1);
  }

  // this low-level function should be called from a contract which performs important safety checks
  function burn(address to) external override lock returns (uint256 amount0, uint256 amount1) {
    (uint112 _reserve0, uint112 _reserve1, ) = this.getReserves(); // gas savings
    address _token0 = token0; // gas savings
    address _token1 = token1; // gas savings
    uint256 balance0 = IERC20(_token0).balanceOf(address(this));
    uint256 balance1 = IERC20(_token1).balanceOf(address(this));
    uint256 liquidity = this.balanceOf(address(this));

    uint256 _totalSupply = this.totalSupply(); // gas savings
    amount0 = liquidity.mul(balance0) / _totalSupply; // using balances ensures pro-rata distribution
    amount1 = liquidity.mul(balance1) / _totalSupply; // using balances ensures pro-rata distribution
    require(amount0 > 0 && amount1 > 0, "Insufficient liquidity burned");
    _burn(address(this), liquidity);
    _safeTransfer(_token0, to, amount0);
    _safeTransfer(_token1, to, amount1);
    balance0 = IERC20(_token0).balanceOf(address(this));
    balance1 = IERC20(_token1).balanceOf(address(this));

    _update(balance0, balance1, _reserve0, _reserve1);
    emit Burn(msg.sender, amount0, amount1, to);
  }

  // this low-level function should be called from a contract which performs important safety checks
  function swap(
    uint256 amount0Out,
    uint256 amount1Out,
    address to,
    bytes calldata data
  ) external override lock {
    require(amount0Out > 0 || amount1Out > 0, "Insufficient output amount!");

    (uint112 _reserve0, uint112 _reserve1, ) = getReserves(); // gas savings

    require(amount0Out < _reserve0 && amount1Out < _reserve1, "Insufficient liquidity!");

    uint256 balance0;
    uint256 balance1;
    {
      // scope for _token{0,1}, avoids stack too deep errors
      address _token0 = token0;
      address _token1 = token1;
      require(to != _token0 && to != _token1, "Invalid to");
      if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
      if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
      if (data.length > 0) ICallee(to).call(msg.sender, amount0Out, amount1Out, data);
      balance0 = IERC20(_token0).balanceOf(address(this));
      balance1 = IERC20(_token1).balanceOf(address(this));
    }
    uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
    uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
    require(amount0In > 0 || amount1In > 0, "Insufficient input amount!");
    {
      // scope for reserve{0,1}Adjusted, avoids stack too deep errors
      uint256 balance0Adjusted = balance0.mul(1000).sub(amount0In.mul(3));
      uint256 balance1Adjusted = balance1.mul(1000).sub(amount1In.mul(3));
      require(balance0Adjusted.mul(balance1Adjusted) >= uint256(_reserve0).mul(_reserve1).mul(1000**2), "K");
    }

    _update(balance0, balance1, _reserve0, _reserve1);
    emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
  }

  // force balances to match reserves
  function skim(address to) external override lock {
    _safeTransfer(token0, to, IERC20(token0).balanceOf(address(this)).sub(reserve0));
    _safeTransfer(token1, to, IERC20(token1).balanceOf(address(this)).sub(reserve1));
  }

  // force reserves to match balances
  function sync() external override lock {
    _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
  }
}
