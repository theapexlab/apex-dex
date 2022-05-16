import {Contract, Wallet} from "ethers"
import {Web3Provider} from "@ethersproject/providers"
import {deployContract} from "ethereum-waffle"

import TestERC20 from "../../artifacts/contracts/core/test/ERC20.sol/TestERC20.json"
import ApexFactory from "../../artifacts/contracts/core/Factory.sol/Factory.json"
import Pair from "../../artifacts/contracts/core/Pair.sol/Pair.json"
import {expandTo18Decimals} from "../utils"

interface FactoryFixture {
  factory: Contract
}

const overrides = {
  gasLimit: 9999999,
}

interface PairFixture extends FactoryFixture {
  token0: Contract
  token1: Contract
  pair: Contract
}

export async function factoryFixture([wallet]: Wallet[], _: Web3Provider): Promise<FactoryFixture> {
  const factory = await deployContract(wallet, ApexFactory, undefined, overrides)
  return {factory}
}

export async function pairFixture([wallet]: Wallet[], provider: Web3Provider): Promise<PairFixture> {
  const {factory} = await factoryFixture([wallet], provider)

  const tokenA = await deployContract(wallet, TestERC20, [expandTo18Decimals(10000)], overrides)
  const tokenB = await deployContract(wallet, TestERC20, [expandTo18Decimals(10000)], overrides)

  await factory.createPair(tokenA.address, tokenB.address, overrides)
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(Pair.abi), provider).connect(wallet)

  const token0Address = (await pair.token0()).address
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  return {factory, token0, token1, pair}
}
