import {getAddress, keccak256, solidityPack} from "ethers/lib/utils"

export function getCreate2Address(factoryAddress: string, [tokenA, tokenB]: [string, string], bytecode: string): string {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
  const create2Inputs = ["0xff", factoryAddress, keccak256(solidityPack(["address", "address"], [token0, token1])), keccak256(bytecode)]
  const sanitizedInputs = `0x${create2Inputs.map((i) => i.slice(2)).join("")}`
  return getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`)
}
