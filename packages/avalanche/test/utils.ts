import {BigNumber, Contract, providers} from "ethers"
import {ethers} from "hardhat"

export async function getTokenContract(tokenAddress: string): Promise<Contract> {
  return await ethers.getContractAt("ApexERC20", tokenAddress)
}

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export async function mineBlock(provider: providers.Web3Provider, timestamp: number): Promise<void> {
  await new Promise(async (resolve, reject) => {
    ;(provider.provider.sendAsync as any)({jsonrpc: "2.0", method: "evm_mine", params: [timestamp]}, (error: any, result: any): void => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return [reserve1.mul(BigNumber.from(2).pow(112)).div(reserve0), reserve0.mul(BigNumber.from(2).pow(112)).div(reserve1)]
}
